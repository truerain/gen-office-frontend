// packages/gen-grid-crud/src/GenGridCrud.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { ColumnDef, ColumnFiltersState, RowSelectionState } from '@tanstack/react-table';

import { applyDiff } from './crud/applyDiff';
import { usePendingChanges } from './crud/usePendingChanges';
import type { CrudRowId } from './crud/types';
import type {
  GenGridCrudProps,
  CrudUiState,
  CrudPendingDiff,
  CrudActionApi,
  CrudCellPatch,
  CrudFieldErrorMap,
} from './GenGridCrud.types';
import { CrudActionBar } from './components/CrudActionBar';
import { exportAdditionalCrudExcel, exportCrudExcel } from './features/excel';
import {
  buildFieldErrorKey,
  validatePendingRows,
} from './validation/fieldValidation';
import styles from './GenGridCrud.module.css';

import { GenGrid } from '@gen-office/gen-grid';
import { AlertDialog } from '@gen-office/ui';

const CRUD_TEMP_ID_KEY = '__crud_temp_id__';

function withTempId<TData>(row: TData, tempId: CrudRowId): TData {
  const next = { ...(row as any) } as any;
  Object.defineProperty(next, CRUD_TEMP_ID_KEY, {
    value: tempId,
    // keep temp id on row copies (spread/clone) so created rows remain editable
    enumerable: true,
  });
  return next as TData;
}

function getCrudRowId<TData>(row: TData, fallback: (row: TData) => CrudRowId): CrudRowId {
  const tempId = (row as any)[CRUD_TEMP_ID_KEY] as CrudRowId | undefined;
  return tempId ?? fallback(row);
}

function generateTempId(): CrudRowId {
  return `tmp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}


/* Build shallow patch from editable keys */
function shallowDiffPatch<TData extends Record<string, any>>(
  prev: TData,
  next: TData,
  keys: readonly string[]
): Partial<TData> {
  const patch: Partial<TData> = {};
  let changed = false;

  for (const k of keys) {
    if (!Object.is(prev[k], next[k])) {
      (patch as any)[k] = next[k];
      changed = true;
    }
  }

  return changed ? patch : {};
}

/*
 * Extract editable keys from column accessorKey values.
 */
function getEditableKeysFromColumns<TData>(columns: readonly ColumnDef<TData, any>[]): string[] {
  const keys: string[] = [];
  for (const c of columns as any[]) {
    const k = c.accessorKey;
    if (typeof k === 'string') keys.push(k);
  }
  return keys;
}

function getFirstEditableColumnId<TData>(columns: readonly ColumnDef<TData, any>[]): string | null {
  for (const c of columns as any[]) {
    const k = c.accessorKey ?? c.id;
    if (typeof k === 'string') return k;
  }
  return null;
}

function resolveLeafColumnIds<TData>(columns: readonly ColumnDef<TData, any>[]): string[] {
  const ids: string[] = [];
  const walk = (defs: readonly ColumnDef<TData, any>[]) => {
    for (const def of defs as any[]) {
      const childColumns = Array.isArray(def?.columns) ? def.columns : null;
      if (childColumns && childColumns.length > 0) {
        walk(childColumns);
        continue;
      }
      const id = typeof def?.id === 'string'
        ? def.id
        : typeof def?.accessorKey === 'string'
          ? def.accessorKey
          : null;
      if (id) ids.push(id);
    }
  };
  walk(columns);
  return ids;
}

function buildInitialColumnOrder<TData>(args: {
  columns: readonly ColumnDef<TData, any>[];
  enableRowStatus?: boolean;
  checkboxSelection?: boolean;
  enableRowNumber?: boolean;
}): string[] {
  const systemIds: string[] = [];
  if (args.enableRowStatus) systemIds.push('__row_status__');
  if (args.checkboxSelection) systemIds.push('__select__');
  if (args.enableRowNumber) systemIds.push('__rowNumber__');
  return [...systemIds, ...resolveLeafColumnIds(args.columns)];
}

function buildPendingDiffFromPending<TData>(
  pending: { created: Map<CrudRowId, TData>; updated: Map<CrudRowId, Partial<TData>>; deleted: Set<CrudRowId> }
): CrudPendingDiff<TData> {
  const createdIds = new Set<CrudRowId>(pending.created.keys());
  const deletedIds = pending.deleted;

  const added: TData[] = [];
  for (const [id, row] of pending.created.entries()) {
    if (deletedIds.has(id)) continue;
    added.push(row);
  }

  const modified: { id: CrudRowId; patch: Partial<TData> }[] = [];
  for (const [id, patch] of pending.updated.entries()) {
    if (deletedIds.has(id)) continue;
    if (createdIds.has(id)) continue;
    modified.push({ id, patch });
  }

  const deleted: { id: CrudRowId }[] = [];
  for (const id of deletedIds) {
    if (createdIds.has(id)) continue;
    deleted.push({ id });
  }

  return { added, modified, deleted };
}

export function GenGridCrud<TData>(props: GenGridCrudProps<TData>) {
  const { t } = useTranslation('common');
  const {
    title,
    readonly: readonlyProp,
    data,
    columns,
    getRowId,

    createRow,
    // Map columnId/value to row patch.
    makePatch,
    deleteMode = 'selected',
    deletePolicy = 'all',

    onCommit,
    isCommitting: isCommittingControlled,
    onCommitSuccess,
    onCommitError,
    beforeCommit,

    actionBar,
    showActionBar = true,
    actionBarPosition = 'top',
    actionButtonStyle = 'text',

    rowSelection: rowSelectionControlledIds,
    onRowSelectionChange: onRowSelectionIdsChange,

    // active cell (?????
    activeCell: activeCellControlled,
    onActiveCellChange,
    onActiveRowChange,

    onStateChange,
    onCellEdit,
    excelExport,
    additionalExports,
    editorFactory,

    clearDirtyOnRevert = true,

    gridProps,
  } = props;

  const actionBarEnabled = actionBar?.enabled ?? showActionBar;
  const resolvedActionBarPosition = actionBar?.position ?? actionBarPosition;
  const resolvedActionBarWidthMode = actionBar?.widthMode ?? 'container';
  const resolvedActionBarShowTotalRows = actionBar?.showTotalRows ?? true;
  const resolvedActionButtonStyle = actionBar?.defaultStyle ?? actionButtonStyle;
  const includedBuiltInActions = actionBar?.includeBuiltIns;
  const hasColumnReorderBuiltIn = React.useMemo(() => {
    const defaults: readonly string[] = ['add', 'delete', 'save', 'columnReorder', 'filter'];
    return (includedBuiltInActions ?? defaults).includes('columnReorder');
  }, [includedBuiltInActions]);
  const customActions = actionBar?.customActions;
  const [deleteBlockedDialogOpen, setDeleteBlockedDialogOpen] = React.useState(false);
  const gridAreaRef = React.useRef<HTMLDivElement | null>(null);
  const [gridTableWidth, setGridTableWidth] = React.useState<number | null>(null);

  const [rowSelectionUncontrolled, setRowSelectionUncontrolled] = React.useState<readonly CrudRowId[]>([]);
  const rowSelectionIds = rowSelectionControlledIds ?? rowSelectionUncontrolled;

  const rowSelection = React.useMemo<RowSelectionState>(() => {
    const next: RowSelectionState = {};
    for (const id of rowSelectionIds) {
      next[String(id)] = true;
    }
    return next;
  }, [rowSelectionIds]);


  const setRowSelectionIds = React.useCallback(
    (next: readonly CrudRowId[]) => {
      onRowSelectionIdsChange?.(next);
      if (rowSelectionControlledIds == null) setRowSelectionUncontrolled(next);
    },
    [onRowSelectionIdsChange, rowSelectionControlledIds]
  );

  const [activeCellUncontrolled, setActiveCellUncontrolled] = React.useState<{ rowId: CrudRowId; columnId: string } | null>(null);
  const activeCell = activeCellControlled ?? activeCellUncontrolled;

  const setActiveCell = React.useCallback(
    (next: { rowId: CrudRowId; columnId: string } | null) => {
      onActiveCellChange?.(next);
      if (activeCellControlled == null) setActiveCellUncontrolled(next);
    },
    [onActiveCellChange, activeCellControlled]
  );

  const [filterEnabled, setFilterEnabled] = React.useState<boolean>(
    gridProps?.enableFiltering ?? false
  );

  React.useEffect(() => {
    if (!actionBarEnabled || resolvedActionBarWidthMode !== 'grid') {
      setGridTableWidth(null);
      return;
    }

    const gridAreaEl = gridAreaRef.current;
    if (!gridAreaEl) return;

    const resizeObserver = new ResizeObserver(() => {
      const tableEl = gridAreaEl.querySelector('table');
      if (!tableEl) {
        setGridTableWidth(null);
        return;
      }
      const nextWidth = Math.round(tableEl.getBoundingClientRect().width);
      setGridTableWidth(nextWidth > 0 ? nextWidth : null);
    });

    const mutationObserver = new MutationObserver(() => {
      const tableEl = gridAreaEl.querySelector('table');
      if (!tableEl) return;
      resizeObserver.observe(tableEl);
      const nextWidth = Math.round(tableEl.getBoundingClientRect().width);
      setGridTableWidth(nextWidth > 0 ? nextWidth : null);
    });

    const tableEl = gridAreaEl.querySelector('table');
    if (tableEl) {
      resizeObserver.observe(tableEl);
      const initialWidth = Math.round(tableEl.getBoundingClientRect().width);
      setGridTableWidth(initialWidth > 0 ? initialWidth : null);
    }

    resizeObserver.observe(gridAreaEl);
    mutationObserver.observe(gridAreaEl, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [actionBarEnabled, resolvedActionBarWidthMode]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const baseColumnOrder = React.useMemo(
    () =>
      buildInitialColumnOrder<TData>({
        columns,
        enableRowStatus: Boolean(gridProps?.enableRowStatus),
        checkboxSelection: Boolean(gridProps?.checkboxSelection),
        enableRowNumber: Boolean(gridProps?.enableRowNumber),
      }),
    [columns, gridProps?.enableRowNumber, gridProps?.enableRowStatus, gridProps?.checkboxSelection]
  );
  const initialColumnOrderRef = React.useRef<string[]>(baseColumnOrder);
  const [columnOrder, setColumnOrder] = React.useState<string[]>(baseColumnOrder);
  const [columnReorderEnabled, setColumnReorderEnabled] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (gridProps?.enableFiltering == null) return;
    setFilterEnabled(Boolean(gridProps.enableFiltering));
  }, [gridProps?.enableFiltering]);

  React.useEffect(() => {
    if (columnReorderEnabled) return;
    initialColumnOrderRef.current = baseColumnOrder;
    setColumnOrder(baseColumnOrder);
  }, [baseColumnOrder, columnReorderEnabled]);

  const handleRowSelectionChange = React.useCallback(
    (next: RowSelectionState) => {
      const nextIds = Object.keys(next).filter((k) => next[k]);
      setRowSelectionIds(nextIds);
    },
    [setRowSelectionIds]
  );

    // --- committing state
  const [isCommittingLocal, setIsCommittingLocal] = React.useState(false);
  const isCommitting = isCommittingControlled ?? isCommittingLocal;

  
  // --- pending changes
  const pendingApi = usePendingChanges<TData>();
  const [fieldErrors, setFieldErrors] = React.useState<CrudFieldErrorMap>({});

  // diffKeys: compare patch keys by editable accessors
  const diffKeys = React.useMemo(() => getEditableKeysFromColumns(columns), [columns]);
  const firstEditableColumnId = React.useMemo(() => getFirstEditableColumnId(columns), [columns]);

  const activeCellForGrid = React.useMemo(
    () => (activeCell ? { rowId: String(activeCell.rowId), columnId: activeCell.columnId } : null),
    [activeCell]
  );
  const publishStateRef = React.useRef<string>("__init__");

  const publishStateKey = React.useMemo(() => {
    const selectedKey = rowSelectionIds.join(",");
    const activeRowKey = activeCell?.rowId ?? "";
    const activeColKey = activeCell?.columnId ?? "";
    const changesKey = pendingApi.changes.map((c) => {
      if (c.type === "create") return `c:${String(c.tempId)}`;
      if (c.type === "update") return `u:${String(c.rowId)}:${Object.keys(c.patch ?? {}).join("|")}`;
      if (c.type === "delete") return `d:${String(c.rowId)}`;
      if (c.type === "undelete") return `ud:${String(c.rowId)}`;
      return "";
    }).join(",");
    return [
      String(gridProps?.dataVersion ?? ""),
      String(pendingApi.dirty),
      String(columnReorderEnabled),
      String(Object.keys(fieldErrors).length),
      selectedKey,
      `${activeRowKey}:${activeColKey}`,
      String(isCommitting),
      changesKey,
    ].join("||");
  }, [
    rowSelectionIds,
    activeCell?.rowId,
    activeCell?.columnId,
    pendingApi.changes,
    pendingApi.dirty,
    fieldErrors,
    columnReorderEnabled,
    gridProps?.dataVersion,
    isCommitting,
  ]);

  const diff = React.useMemo(
    () =>
      applyDiff({
        baseData: data,
        getRowId,
        pending: pendingApi.pending,
        insertCreated: { mode: 'end' },
        deletedVisibility: 'hide',
      }),
    [data, getRowId, pendingApi.pending]
  );

  const tableMeta = React.useMemo(() => {
    const baseMeta = (gridProps as any)?.tableMeta ?? {};
    return {
      ...baseMeta,
      genGridCrud: {
        deleteRow: (rowId: CrudRowId) => pendingApi.deleteRowIds([rowId]),
      },
    };
  }, [gridProps, pendingApi]);

  const pendingDiff = React.useMemo(
    () => buildPendingDiffFromPending<TData>(pendingApi.pending),
    [pendingApi.pending]
  );
  const latestSaveSnapshotRef = React.useRef({
    changes: pendingApi.changes,
    pending: pendingApi.pending,
    viewData: diff.viewData,
    pendingDiff,
    dirty: pendingApi.dirty,
    rowSelectionIds,
    activeCell,
    isCommitting,
    data,
  });
  latestSaveSnapshotRef.current = {
    changes: pendingApi.changes,
    pending: pendingApi.pending,
    viewData: diff.viewData,
    pendingDiff,
    dirty: pendingApi.dirty,
    rowSelectionIds,
    activeCell,
    isCommitting,
    data,
  };

  // GenGrid expects a mutable array instance.
  const gridData = React.useMemo<TData[]>(
    () => Array.from(diff.viewData),
    [diff.viewData]
  );

  // GenGrid getRowId must return string.
  // GenGrid getRowId: normalize to string
  const genGridGetRowId = React.useCallback(
    (row: TData) => {
      const id = getCrudRowId(row, (r) => getRowId(r, -1));
      return String(id);
    },
    [getRowId]
  );

  // Pending update row id may be number or string.
  const getPendingRowId = React.useCallback(
    (row: TData) => getCrudRowId(row, (r) => getRowId(r, -1)),
    [getRowId]
  );

  const pendingRowIdByGridId = React.useMemo(() => {
    const map = new Map<string, CrudRowId>();
    for (const row of gridData) {
      const pendingId = getPendingRowId(row);
      map.set(String(pendingId), pendingId);
    }
    return map;
  }, [gridData, getPendingRowId]);

  React.useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!pendingApi.dirty) {
        if (!cancelled) setFieldErrors({});
        return;
      }
      const next = await validatePendingRows({
        trigger: 'change',
        columns,
        pending: pendingApi.pending,
        viewData: diff.viewData,
        getRowId,
        includeAllRulesOnCommit: false,
      });
      if (!cancelled) setFieldErrors(next);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [columns, pendingApi.pending, pendingApi.dirty, diff.viewData, getRowId]);

  const prevActiveRowIdRef = React.useRef<CrudRowId | null>(null);
  React.useEffect(() => {
    const nextActiveRowId = activeCell?.rowId ?? null;
    if (Object.is(prevActiveRowIdRef.current, nextActiveRowId)) return;
    prevActiveRowIdRef.current = nextActiveRowId;

    let row: TData | null = null;
    let rowIndex = -1;

    if (nextActiveRowId != null) {
      rowIndex = gridData.findIndex(
        (r) => String(getPendingRowId(r)) === String(nextActiveRowId)
      );
      if (rowIndex >= 0) row = gridData[rowIndex] ?? null;
    }

    onActiveRowChange?.({
      rowId: nextActiveRowId,
      row,
      rowIndex,
    });
  }, [activeCell?.rowId, getPendingRowId, gridData, onActiveRowChange]);

  const baseRowById = React.useMemo(() => {
    const map = new Map<CrudRowId, TData>();
    for (let i = 0; i < data.length; i++) {
      const row = data[i]!;
      map.set(getRowId(row, i), row);
    }
    return map;
  }, [data, getRowId]);

  const skipNextOnDataChangeRef = React.useRef(false);


  // --- Action handlers
  const handleAdd = React.useCallback(() => {
    if (!createRow) return;
    const tempId = generateTempId();
    const row = withTempId(createRow(), tempId);
    pendingApi.addRow(row, { tempId });
    if (firstEditableColumnId) {
      setActiveCell({ rowId: tempId, columnId: firstEditableColumnId });
    }
  }, [createRow, pendingApi, firstEditableColumnId, onActiveCellChange]);

  // delete selected/active rows in pending state
  const handleDelete = React.useCallback(() => {
    let targets: readonly CrudRowId[] = [];

    if (deleteMode === 'selected') {
      targets = rowSelectionIds.map(
        (rowId) => pendingRowIdByGridId.get(String(rowId)) ?? rowId
      );
    } else if (deleteMode === 'activeRow') {
      const rowId = activeCell?.rowId;
      targets = rowId != null ? [rowId] : [];
    }

    const requestedCount = targets.length;
    if (deletePolicy === 'createdOnly') {
      targets = targets.filter((rowId) => {
        const pendingRowId = pendingRowIdByGridId.get(String(rowId)) ?? rowId;
        return pendingApi.getRowStatus(pendingRowId) === 'created';
      });
      if (requestedCount > 0 && targets.length === 0) {
        setDeleteBlockedDialogOpen(true);
        return;
      }
    }

    if (!targets.length) return;
    pendingApi.deleteRowIds(targets);
    setRowSelectionIds([]);
  }, [
    t,
    deletePolicy,
    deleteMode,
    rowSelectionIds,
    activeCell,
    activeCellControlled,
    pendingApi,
    pendingRowIdByGridId,
    setDeleteBlockedDialogOpen,
    setRowSelectionIds,
  ]);

  const handleReset = React.useCallback(() => {
    pendingApi.reset();
  }, [pendingApi]);

  const handleToggleFilter = React.useCallback(() => {
    setColumnFilters([]);
    setFilterEnabled((prev) => !prev);
  }, []);

  const handleToggleColumnReorder = React.useCallback(() => {
    setColumnReorderEnabled((prev) => {
      if (prev) {
        setColumnOrder(initialColumnOrderRef.current);
        return false;
      }
      initialColumnOrderRef.current = columnOrder;
      return true;
    });
  }, [columnOrder]);

  const flushActiveEditor = React.useCallback(async () => {
    if (typeof document === 'undefined') return;
    const active = document.activeElement as HTMLElement | null;
    if (!active) return;
    const isEditor = Boolean(active.closest('input,select,textarea,[contenteditable="true"]'));
    if (!isEditor) return;
    active.blur();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }, []);

  const handleSave = React.useCallback(async () => {
    await flushActiveEditor();

    const latest = latestSaveSnapshotRef.current;
    const changes = latest.changes;
    if (!changes.length) return;

    const commitFieldErrors = await validatePendingRows({
      trigger: 'commit',
      columns,
      pending: latest.pending,
      viewData: latest.viewData,
      getRowId,
      includeAllRulesOnCommit: true,
    });
    if (Object.keys(commitFieldErrors).length > 0) {
      setFieldErrors(commitFieldErrors);
      return;
    }

    const stateForGuard: CrudUiState<TData> = {
      baseData: latest.data,
      viewData: latest.viewData,
      changes,
      pendingDiff: latest.pendingDiff,
      dirty: latest.dirty,
      rowSelection: latest.rowSelectionIds,
      activeRowId: latest.activeCell?.rowId,
      activeColumnId: latest.activeCell?.columnId,
      deleteMode,
      deletePolicy,
      isCommitting: latest.isCommitting,
      fieldErrors: {},
      columnReorderEnabled,
    };

    const ok = await beforeCommit?.(stateForGuard);
    if (ok === false) return;

    try {
      if (isCommittingControlled == null) setIsCommittingLocal(true);

      const result = await onCommit({
        changes,
        ctx: { baseData: latest.data, viewData: latest.viewData },
      });

      if (result.ok) {
        pendingApi.reset();
        onCommitSuccess?.({ nextData: result.nextData });
      } else {
        onCommitError?.({ error: result.error, fieldErrors: result.fieldErrors });
      }
    } catch (e) {
      onCommitError?.({ error: e });
    } finally {
      if (isCommittingControlled == null) setIsCommittingLocal(false);
    }
  }, [
    pendingApi,
    onCommit,
    onCommitSuccess,
    onCommitError,
    beforeCommit,
    deleteMode,
    deletePolicy,
    data,
    columns,
    getRowId,
    flushActiveEditor,
    setFieldErrors,
    isCommittingControlled,
    columnReorderEnabled,
  ]);

  const handleExportExcel = React.useCallback(async () => {
    if (!excelExport) return;

    const stateForExport: CrudUiState<TData> = {
      baseData: data,
      viewData: diff.viewData,
      changes: pendingApi.changes,
      pendingDiff,
      dirty: pendingApi.dirty,
      rowSelection: rowSelectionIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      deleteMode,
      deletePolicy,
      isCommitting,
      fieldErrors,
      columnReorderEnabled,
    };

    await exportCrudExcel({
      excelExport,
      stateForExport,
      columns,
      title,
      viewData: diff.viewData,
      rowSelectionIds,
      getPendingRowId,
      gridProps,
      t,
      onCommitError,
    });
  }, [
    excelExport,
    data,
    diff.viewData,
    pendingApi.changes,
    pendingApi.dirty,
    pendingDiff,
    rowSelectionIds,
    activeCell?.rowId,
    activeCell?.columnId,
    deleteMode,
    deletePolicy,
    isCommitting,
    fieldErrors,
    columnReorderEnabled,
    title,
    columns,
    getPendingRowId,
    onCommitError,
    gridProps,
    t,
  ]);

  const handleExportAdditional = React.useCallback(
    async (key: string) => {
      const target = additionalExports?.find((item) => item.key === key);
      if (!target) {
        const error = new Error(
          `[GenGridCrud] additionalExports key not found: ${key}`
        );
        onCommitError?.({ error });
        // eslint-disable-next-line no-console
        console.error(error);
        return;
      }

      const stateForExport: CrudUiState<TData> = {
        baseData: data,
        viewData: diff.viewData,
        changes: pendingApi.changes,
        pendingDiff,
        dirty: pendingApi.dirty,
        rowSelection: rowSelectionIds,
        activeRowId: activeCell?.rowId,
        activeColumnId: activeCell?.columnId,
        deleteMode,
        deletePolicy,
        isCommitting,
        fieldErrors,
        columnReorderEnabled,
      };

      const source =
        typeof target.source === 'function'
          ? await target.source({ state: stateForExport, columns, title })
          : target.source;

      await exportAdditionalCrudExcel({
        fileName: target.fileName,
        sheetName: target.sheetName,
        defaultBorder: target.defaultBorder,
        rowHeight: target.rowHeight,
        columns: source.columns,
        data: source.data,
        getRowId: source.getRowId,
        title,
        t,
        onCommitError,
      });
    },
    [
      additionalExports,
      data,
      diff.viewData,
      pendingApi.changes,
      pendingApi.dirty,
      pendingDiff,
      rowSelectionIds,
      activeCell?.rowId,
      activeCell?.columnId,
      deleteMode,
      deletePolicy,
      isCommitting,
      fieldErrors,
      columnReorderEnabled,
      columns,
      title,
      t,
      onCommitError,
    ]
  );


  // Diff next viewData against current gridData and apply pending patches.
  const handleGridDataChange = React.useCallback(
    (nextViewData: TData[]) => {
      if (skipNextOnDataChangeRef.current) {
        skipNextOnDataChangeRef.current = false;
        return;
      }

      const prevById = new Map<CrudRowId, TData>();
      for (let i = 0; i < gridData.length; i++) {
        const r = gridData[i]!;
        prevById.set(getPendingRowId(r), r);
      }

      for (let i = 0; i < nextViewData.length; i++) {
        const nextRow = nextViewData[i]!;
        const rowId = getPendingRowId(nextRow);
        const prevRow = prevById.get(rowId);
        if (!prevRow) continue;

        if (diffKeys.length > 0 && typeof prevRow === 'object' && typeof nextRow === 'object') {
          const patch = shallowDiffPatch(prevRow as any, nextRow as any, diffKeys);
          if (Object.keys(patch).length) {
            pendingApi.updateRow(rowId, patch as any);
          }
        } else {
        }
      }

    },
    [gridData, getPendingRowId, pendingApi, diffKeys]
  );

  const handleCellValueChange = React.useCallback(
    (args: { rowId: string; columnId: string; value: unknown }) => {
      const applyPatch = (targetRowId: CrudRowId, patch: Partial<TData>) => {
        if (!patch || Object.keys(patch).length === 0) return;
        if (clearDirtyOnRevert) {
          const baseRow = baseRowById.get(targetRowId);
          if (!baseRow) {
            pendingApi.updateRow(targetRowId, patch);
            return;
          }

          const keys = Object.keys(patch);
          const keysToClear = keys.filter((k) => Object.is((baseRow as any)[k], (patch as any)[k]));
          const keysToSet = keys.filter((k) => !Object.is((baseRow as any)[k], (patch as any)[k]));

          if (keysToSet.length) {
            const nextPatch: Partial<TData> = {};
            for (const k of keysToSet) (nextPatch as any)[k] = (patch as any)[k];
            pendingApi.updateRow(targetRowId, nextPatch);
          }

          if (keysToClear.length) {
            pendingApi.clearPatchKeys(targetRowId, keysToClear);
          }
          return;
        }
        pendingApi.updateRow(targetRowId, patch);
      };

      const pendingRowId = pendingRowIdByGridId.get(args.rowId) ?? args.rowId;
      const rowIndex = gridData.findIndex(
        (row) => String(getPendingRowId(row)) === String(pendingRowId)
      );
      const row = rowIndex >= 0 ? gridData[rowIndex] : undefined;
      const prevValue = row ? (row as any)[args.columnId] : undefined;
      let additionalPatches: readonly CrudCellPatch<TData>[] = [];
      if (row && !Object.is(prevValue, args.value)) {
        additionalPatches =
          onCellEdit?.({
          rowId: args.rowId,
          columnId: args.columnId,
          rowIndex,
          prevValue,
          nextValue: args.value,
          row,
          viewData: gridData,
        }) ?? [];
      }
      skipNextOnDataChangeRef.current = true;
      const patch =
        makePatch?.({ rowId: pendingRowId, columnId: args.columnId, value: args.value }) ??
        ({ [args.columnId]: args.value } as any);
      applyPatch(pendingRowId, patch);

      for (const extra of additionalPatches) {
        const targetRowId = pendingRowIdByGridId.get(String(extra.rowId)) ?? extra.rowId;
        applyPatch(targetRowId, extra.patch);
      }
    },
    [
      gridData,
      getPendingRowId,
      makePatch,
      onCellEdit,
      pendingApi,
      pendingRowIdByGridId,
      clearDirtyOnRevert,
      baseRowById,
    ]
  );

  // --- state publish
  React.useEffect(() => {
    if (publishStateRef.current === publishStateKey) return;
    publishStateRef.current = publishStateKey;
    onStateChange?.({
      baseData: data,
      viewData: diff.viewData,
      changes: pendingApi.changes,
      pendingDiff,
      dirty: pendingApi.dirty,
      rowSelection: rowSelectionIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      deleteMode,
      deletePolicy,
      isCommitting,
      fieldErrors,
      columnReorderEnabled,
    });
  }, [
    onStateChange,
    data,
    pendingApi.changes,
    pendingApi.dirty,
    diff.viewData,
    pendingDiff,
    rowSelectionIds,
    activeCell, activeCellControlled,
    deleteMode,
    deletePolicy,
    fieldErrors,
    columnReorderEnabled,
    isCommitting,
  ]);

  const actionApi = React.useMemo<CrudActionApi>(
    () => ({
      add: createRow ? handleAdd : undefined,
      deleteSelected: handleDelete,
      save: handleSave,
      reset: handleReset,
      toggleFilter: handleToggleFilter,
      toggleColumnReorder: handleToggleColumnReorder,
      exportExcel: excelExport ? handleExportExcel : undefined,
      exportAdditional:
        additionalExports && additionalExports.length > 0
          ? handleExportAdditional
          : undefined,
    }),
    [
      createRow,
      handleAdd,
      handleDelete,
      handleSave,
      handleReset,
      handleToggleFilter,
      handleToggleColumnReorder,
      excelExport,
      handleExportExcel,
      additionalExports,
      handleExportAdditional,
    ]
  );

  const actionBarNode =
    actionBarEnabled ? (
      <div
        style={
          resolvedActionBarWidthMode === 'grid' && gridTableWidth != null
            ? { width: `${gridTableWidth}px`, minWidth: `${gridTableWidth}px` }
            : undefined
        }
      >
        <CrudActionBar<TData>
          className={resolvedActionBarWidthMode === 'grid' ? styles.actionBarGridWidth : undefined}
          title={title}
          showTotalRows={resolvedActionBarShowTotalRows}
          state={{
            baseData: data,
            viewData: diff.viewData,
            changes: pendingApi.changes,
            pendingDiff,
            dirty: pendingApi.dirty,
            rowSelection: rowSelectionIds,
            activeRowId: activeCell?.rowId,
            activeColumnId: activeCell?.columnId,
            deleteMode,
            deletePolicy,
            isCommitting,
            fieldErrors,
            columnReorderEnabled,
          }}
          actionApi={actionApi}
          totalRowCount={gridProps?.totalRowCount}
          filterEnabled={filterEnabled}
          actionButtonStyle={resolvedActionButtonStyle}
          includeBuiltIns={includedBuiltInActions}
          customActions={customActions}
        />
      </div>
    ) : null;

  const mergedGridProps = React.useMemo(
    () => ({
      ...gridProps,
      readonly: readonlyProp ?? (gridProps as any)?.readonly,
      enableFiltering: filterEnabled,
      columnFilters,
      onColumnFiltersChange: setColumnFilters,
      enableColumnReorder: hasColumnReorderBuiltIn
        ? columnReorderEnabled
        : gridProps?.enableColumnReorder,
      columnOrder: hasColumnReorderBuiltIn ? columnOrder : gridProps?.columnOrder,
      onColumnOrderChange: hasColumnReorderBuiltIn
        ? (next: string[]) => {
            setColumnOrder(next);
            gridProps?.onColumnOrderChange?.(next);
          }
        : gridProps?.onColumnOrderChange,
      getCellClassName: (args: {
        row: TData;
        rowId: string;
        rowIndex: number;
        columnId: string;
        value: unknown;
      }) => {
        const base = gridProps?.getCellClassName?.(args) ?? '';
        const hasError = Boolean(fieldErrors[buildFieldErrorKey(args.rowId, args.columnId)]);
        return [base, hasError ? styles.fieldErrorCell : ''].filter(Boolean).join(' ');
      },
      getCellTooltip: (args: {
        row: TData;
        rowId: string;
        rowIndex: number;
        columnId: string;
        value: unknown;
      }) => {
        const base = gridProps?.getCellTooltip?.(args);
        const err = fieldErrors[buildFieldErrorKey(args.rowId, args.columnId)];
        if (!err) return base;
        const fallback = err.defaultMessage ?? base;
        if (err.messageKey) {
          return t(err.messageKey, {
            defaultValue: fallback,
          });
        }
        return fallback;
      },
    }),
    [
      gridProps,
      readonlyProp,
      filterEnabled,
      columnFilters,
      hasColumnReorderBuiltIn,
      columnReorderEnabled,
      columnOrder,
      fieldErrors,
      t,
    ]
  );

  return (
    <div className={styles.root}>
      {(resolvedActionBarPosition === 'top' || resolvedActionBarPosition === 'both') && (
        <div className={styles.actionBarTop}>{actionBarNode}</div>
      )}

      <div className={styles.gridArea} ref={gridAreaRef}>
        <GenGrid<TData>
          data={gridData}
          onCellValueChange={handleCellValueChange}
          onDataChange={handleGridDataChange}
          dataVersion={gridProps?.dataVersion}
          columns={columns as ColumnDef<TData, any>[]}
          getRowId={genGridGetRowId}
          activeCell={activeCellForGrid}
          onActiveCellChange={(next) => setActiveCell(next)}
          rowStatusResolver={(rowId) => {
            const pendingRowId = pendingRowIdByGridId.get(String(rowId)) ?? rowId;
            return pendingApi.getRowStatus(pendingRowId);
          }}
          rowSelection={rowSelection}
          onRowSelectionChange={handleRowSelectionChange}
          {...mergedGridProps}
          tableMeta={tableMeta}
          editorFactory={editorFactory}
        />
      </div>

      {(resolvedActionBarPosition === 'bottom' || resolvedActionBarPosition === 'both') && (
        <div className={styles.actionBarBottom}>{actionBarNode}</div>
      )}

      <AlertDialog
        open={deleteBlockedDialogOpen}
        onOpenChange={setDeleteBlockedDialogOpen}
        title={t('crud.delete', { defaultValue: 'Delete' })}
        message={t('crud.delete_created_only', {
          defaultValue: 'Only newly created rows can be deleted.',
        })}
        confirmText={t('common.confirm', { defaultValue: 'Confirm' })}
        onConfirm={() => {}}
        hideCancelButton
        variant="warning"
      />
    </div>
  );
}
