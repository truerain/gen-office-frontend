// packages/gen-grid-crud/src/GenGridCrud.tsx
import * as React from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';

import { applyDiff } from './crud/applyDiff';
import { usePendingChanges } from './crud/usePendingChanges';
import type { CrudRowId } from './crud/types';
import type { GenGridCrudProps, CrudUiState } from './GenGridCrud.types';
import { CrudActionBar } from './components/CrudActionBar';

import { GenGrid } from '@gen-office/gen-grid';

const CRUD_TEMP_ID_KEY = '__crud_temp_id__';

function withTempId<TData>(row: TData, tempId: CrudRowId): TData {
  const next = { ...(row as any) } as any;
  Object.defineProperty(next, CRUD_TEMP_ID_KEY, {
    value: tempId,
    enumerable: false,
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


/* RowStatus/patch 관련 유틸 */
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

/**
 */
/*
 * columns에서 patch 비교에 사용할 key 추출:
 * - accessorKey(string) 우선 사용
 * - 없으면 빈 배열
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

export function GenGridCrud<TData>(props: GenGridCrudProps<TData>) {
  const {
    data,
    columns,
    getRowId,

    createRow,
    // columnId/value -> patch 매핑 함수 (accessorKey가 있으면 기본 동작으로도 충분)
    makePatch, // columnId/value를 patch로 변환하는 함수 (accessorKey가 있으면 기본 동작으로 충분)
    deleteMode = 'selected',

    onCommit,
    isCommitting: isCommittingControlled,
    onCommitSuccess,
    onCommitError,
    beforeCommit,

    showActionBar = true,
    actionBarPosition = 'top',

    selectedRowIds: selectedRowIdsControlled,
    onSelectedRowIdsChange,

    // active cell (옵션)
    activeCell: activeCellControlled,
    onActiveCellChange,

    onStateChange,

    gridProps,
  } = props;

  const [selectedRowIdsUncontrolled, setSelectedRowIdsUncontrolled] = React.useState<readonly CrudRowId[]>([]);
  const selectedRowIds = selectedRowIdsControlled ?? selectedRowIdsUncontrolled;

  const rowSelection = React.useMemo<RowSelectionState>(() => {
    const next: RowSelectionState = {};
    for (const id of selectedRowIds) {
      next[String(id)] = true;
    }
    return next;
  }, [selectedRowIds]);


  const setSelectedRowIds = React.useCallback(
    (next: readonly CrudRowId[]) => {
      onSelectedRowIdsChange?.(next);
      if (selectedRowIdsControlled == null) setSelectedRowIdsUncontrolled(next);
    },
    [onSelectedRowIdsChange, selectedRowIdsControlled]
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

  const handleRowSelectionChange = React.useCallback(
    (next: RowSelectionState) => {
      const nextIds = Object.keys(next).filter((k) => next[k]);
      setSelectedRowIds(nextIds);
    },
    [setSelectedRowIds]
  );

  // --- pending changes
  // --- pending changes
  const pendingApi = usePendingChanges<TData>();
  // 鍮꾧탳 湲곤옙?: accessorKey 湲곕컲 (湲곕낯)
  const diffKeys = React.useMemo(() => getEditableKeysFromColumns(columns), [columns]);
  const firstEditableColumnId = React.useMemo(() => getFirstEditableColumnId(columns), [columns]);
  const activeCellForGrid = React.useMemo(
    () => (activeCell ? { rowId: String(activeCell.rowId), columnId: activeCell.columnId } : null),
    [activeCell]
  );


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

  // GenGrid에 전달할 mutable array
  const gridData = React.useMemo<TData[]>(
    () => Array.from(diff.viewData),
    [diff.viewData]
  );

  // ??GenGrid getRowId??(row) => string
  // GenGrid는 rowId를 string으로 사용
  const genGridGetRowId = React.useCallback(
    (row: TData) => {
      const id = getCrudRowId(row, (r) => getRowId(r, -1));
      return String(id);
    },
    [getRowId]
  );

  // --- committing state
  const [isCommittingLocal, setIsCommittingLocal] = React.useState(false);
  const isCommitting = isCommittingControlled ?? isCommittingLocal;

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

  // 선택/활성 행 기준으로 pending delete 처리
  const handleDelete = React.useCallback(() => {
    let targets: readonly CrudRowId[] = [];

    if (deleteMode === 'selected') {
      targets = selectedRowIds;
    } else if (deleteMode === 'activeRow') {
      const rowId = activeCell?.rowId;
      targets = rowId != null ? [rowId] : [];
    }

    if (!targets.length) return;
    pendingApi.deleteRowIds(targets);
    setSelectedRowIds([]);
  }, [deleteMode, selectedRowIds, activeCell, activeCellControlled, pendingApi, setSelectedRowIds]);

  const handleReset = React.useCallback(() => {
    pendingApi.reset();
  }, [pendingApi]);

  const handleSave = React.useCallback(async () => {
    const changes = pendingApi.changes;
    if (!changes.length) return;

    const stateForGuard: CrudUiState<TData> = {
      baseData: data,
      viewData: diff.viewData,
      changes,
      dirty: pendingApi.dirty,
      selectedRowIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      isCommitting,
    };

    const ok = await beforeCommit?.(stateForGuard);
    if (ok === false) return;

    try {
      if (isCommittingControlled == null) setIsCommittingLocal(true);

      const result = await onCommit({
        changes,
        ctx: { baseData: data, viewData: diff.viewData },
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
    data,
    diff.viewData,
    selectedRowIds,
    activeCell, activeCellControlled,
    isCommitting,
    isCommittingControlled,
  ]);


  // GenGrid에서 전달된 viewData 변경을 pending patch로 변환
  const handleGridDataChange = React.useCallback(
    (nextViewData: TData[]) => {

      const prevById = new Map<string, TData>();
      for (let i = 0; i < gridData.length; i++) {
        const r = gridData[i]!;
        prevById.set(genGridGetRowId(r), r);
      }

      for (let i = 0; i < nextViewData.length; i++) {
        const nextRow = nextViewData[i]!;
        const idStr = genGridGetRowId(nextRow);
        const prevRow = prevById.get(idStr);
        if (!prevRow) continue;

        if (diffKeys.length > 0 && typeof prevRow === 'object' && typeof nextRow === 'object') {
          const patch = shallowDiffPatch(prevRow as any, nextRow as any, diffKeys);
          if (Object.keys(patch).length) {
            pendingApi.updateRow(idStr, patch as any);
          }
        } else {
        }
      }

    },
    [gridData, genGridGetRowId, pendingApi, diffKeys]
  );

  // --- state publish
  React.useEffect(() => {
    onStateChange?.({
      baseData: data,
      viewData: diff.viewData,
      changes: pendingApi.changes,
      dirty: pendingApi.dirty,
      selectedRowIds,
      activeRowId: activeCell?.rowId,
      activeColumnId: activeCell?.columnId,
      isCommitting,
    });
  }, [
    onStateChange,
    data,
    diff.viewData,
    pendingApi.changes,
    pendingApi.dirty,
    selectedRowIds,
    activeCell, activeCellControlled,
    isCommitting,
  ]);

  const actionBarNode =
    showActionBar ? (
      <CrudActionBar<TData>
        state={{
          baseData: data,
          viewData: diff.viewData,
          changes: pendingApi.changes,
          dirty: pendingApi.dirty,
          selectedRowIds,
          activeRowId: activeCell?.rowId,
          activeColumnId: activeCell?.columnId,
          isCommitting,
        }}
        onAdd={createRow ? handleAdd : undefined}
        onDelete={handleDelete}
        onReset={handleReset}
        onSave={handleSave}
      />
    ) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, flex: 1}}>
      {(actionBarPosition === 'top' || actionBarPosition === 'both') && actionBarNode}

      <GenGrid<TData>
        data={gridData}
        onDataChange={handleGridDataChange}
        dataVersion={gridProps?.dataVersion}
        columns={columns as ColumnDef<TData, any>[]}
        getRowId={genGridGetRowId}
        activeCell={activeCellForGrid}
        onActiveCellChange={(next) => setActiveCell(next)}
        rowStatusResolver={(rowId) => pendingApi.getRowStatus(rowId)}
        rowSelection={rowSelection}
        onRowSelectionChange={handleRowSelectionChange}
        {...gridProps}
      />

      {(actionBarPosition === 'bottom' || actionBarPosition === 'both') && actionBarNode}
    </div>
  );
}

