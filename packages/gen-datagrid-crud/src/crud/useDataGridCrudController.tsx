// packages/gen-datagrid-crud/src/crud/useDataGridCrudController.tsx
// Provides the thin workflow controller used by GenDataGridCrud.

import * as React from 'react';
import type {
  GenDataGridChangeSet,
  GenDataGridDirtyState,
  GenDataGridHandle,
  GenDataGridRowStatus,
  GenDataGridRowStatusContext,
} from '@gen-office/gen-datagrid';
import type { RowSelectionState } from '@tanstack/react-table';

import type {
  DataGridCrudActionApi,
  DataGridCrudController,
  DataGridCrudControllerArgs,
  DataGridCrudFieldErrors,
  DataGridCrudUiState,
  DataGridCrudValidationResult,
} from '../GenDataGridCrud.types';

const EMPTY_DIRTY_STATE: GenDataGridDirtyState = {
  cells: [],
  rowIds: [],
  deletedRowIds: [],
};

const EMPTY_FIELD_ERRORS: DataGridCrudFieldErrors = {};

function waitForAnimationFrame() {
  if (typeof requestAnimationFrame === 'function') {
    return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
  return Promise.resolve();
}

function hasChangeSetChanges<TData>(changeSet: GenDataGridChangeSet<TData>) {
  return (
    changeSet.created.length > 0 ||
    changeSet.updated.length > 0 ||
    changeSet.deleted.length > 0
  );
}

function hasFieldErrors(fieldErrors: DataGridCrudFieldErrors) {
  return Object.keys(fieldErrors).length > 0;
}

function normalizeValidationResult(result: DataGridCrudValidationResult) {
  if (result == null || result === true) {
    return {
      valid: true,
      fieldErrors: EMPTY_FIELD_ERRORS,
      error: undefined,
    };
  }

  if (result === false) {
    return {
      valid: false,
      fieldErrors: EMPTY_FIELD_ERRORS,
      error: undefined,
    };
  }

  const fieldErrors = result.fieldErrors ?? EMPTY_FIELD_ERRORS;
  return {
    valid: result.valid ?? (!hasFieldErrors(fieldErrors) && result.error == null),
    fieldErrors,
    error: result.error,
  };
}

function applyPatchToRow<TData>(row: TData, patch: Record<string, unknown>) {
  return { ...(row as object), ...patch } as TData;
}

function mergeCreatedRowsIntoChangeSet<TData>(
  changeSet: GenDataGridChangeSet<TData>,
  createdRows: readonly TData[],
  getRowId: (row: TData, index: number) => string
): GenDataGridChangeSet<TData> {
  if (createdRows.length === 0) return changeSet;

  const createdRowIds = new Set(createdRows.map((row, index) => getRowId(row, index)));
  const updatedByCreatedRowId = new Map(
    changeSet.updated
      .filter((item) => createdRowIds.has(item.rowId))
      .map((item) => [item.rowId, item.patch])
  );
  const deletedCreatedRowIds = new Set(
    changeSet.deleted
      .filter((item) => createdRowIds.has(item.rowId))
      .map((item) => item.rowId)
  );

  return {
    ...changeSet,
    created: createdRows.flatMap((row, index) => {
      const rowId = getRowId(row, index);
      if (deletedCreatedRowIds.has(rowId)) return [];
      const patch = updatedByCreatedRowId.get(rowId);
      return [patch ? applyPatchToRow(row, patch) : row];
    }),
    updated: changeSet.updated.filter((item) => !createdRowIds.has(item.rowId)),
    deleted: changeSet.deleted.filter((item) => !createdRowIds.has(item.rowId)),
  };
}

async function readChangeSetAfterFlush<TData>(
  gridRef: React.RefObject<GenDataGridHandle<TData> | null>
) {
  let changeSet = gridRef.current?.getChangeSet();
  for (
    let attempt = 0;
    attempt < 3 && (!changeSet || !hasChangeSetChanges(changeSet));
    attempt += 1
  ) {
    await waitForAnimationFrame();
    changeSet = gridRef.current?.getChangeSet();
  }
  return changeSet;
}

export function useDataGridCrudController<TData>(
  args: DataGridCrudControllerArgs<TData>
): DataGridCrudController<TData> {
  const {
    readonly = false,
    data,
    getRowId,
    createRow,
    createdRowPosition = 'top',
    onCommit,
    beforeCommit,
    validateCommit,
    onCommitSuccess,
    onCommitError,
    onValidationError,
    onExport,
    onStateChange,
    gridFeatureOptions,
  } = args;
  const gridRef = React.useRef<GenDataGridHandle<TData>>(null);
  const [dirtyState, setDirtyState] = React.useState<GenDataGridDirtyState>(EMPTY_DIRTY_STATE);
  const [isCommitting, setIsCommitting] = React.useState(false);
  const [currentRowId, setCurrentRowId] = React.useState<string | null>(null);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [filterEnabled, setFilterEnabled] = React.useState(false);
  const [columnReorderEnabled, setColumnReorderEnabled] = React.useState(false);
  const [lastChangeSet, setLastChangeSet] = React.useState<GenDataGridChangeSet<TData>>();
  const [createdRows, setCreatedRows] = React.useState<TData[]>([]);
  const [fieldErrors, setFieldErrors] =
    React.useState<DataGridCrudFieldErrors>(EMPTY_FIELD_ERRORS);
  const [validationError, setValidationError] = React.useState<unknown>();

  const gridData = React.useMemo(
    () => (createdRowPosition === 'top' ? [...createdRows, ...data] : [...data, ...createdRows]),
    [createdRowPosition, createdRows, data]
  );

  const createdRowIds = React.useMemo(
    () => createdRows.map((row, index) => getRowId(row, index)),
    [createdRows, getRowId]
  );
  const createdRowIdSet = React.useMemo(
    () => new Set(createdRowIds),
    [createdRowIds]
  );

  const selectedRowIds = React.useMemo(
    () => Object.keys(rowSelection).filter((rowId) => rowSelection[rowId]),
    [rowSelection]
  );

  const resolvedFilterEnabled = gridFeatureOptions?.enableColumnFilters ?? filterEnabled;
  const resolvedColumnReorderEnabled =
    gridFeatureOptions?.enableColumnReorder ?? columnReorderEnabled;

  const state = React.useMemo<DataGridCrudUiState<TData>>(
    () => ({
      readonly,
      canCreateRow: Boolean(createRow),
      canExport: Boolean(onExport),
      data: gridData,
      sourceData: data,
      createdRows,
      createdRowIds,
      dirtyState,
      dirty:
        createdRows.length > 0 ||
        dirtyState.rowIds.length > 0 ||
        dirtyState.deletedRowIds.length > 0,
      isCommitting,
      fieldErrors,
      validationError,
      currentRowId,
      selectedRowIds,
      filterEnabled: resolvedFilterEnabled,
      columnReorderEnabled: resolvedColumnReorderEnabled,
      lastChangeSet,
    }),
    [
      createRow,
      currentRowId,
      data,
      gridData,
      createdRows,
      createdRowIds,
      dirtyState,
      fieldErrors,
      isCommitting,
      lastChangeSet,
      onExport,
      readonly,
      resolvedColumnReorderEnabled,
      resolvedFilterEnabled,
      selectedRowIds,
      validationError,
    ]
  );

  React.useEffect(() => {
    onStateChange?.(state);
  }, [onStateChange, state]);

  const handleDirtyStateChange = React.useCallback((nextState: GenDataGridDirtyState) => {
    const apply = () => setDirtyState(nextState);
    if (typeof queueMicrotask === 'function') {
      queueMicrotask(apply);
      return;
    }
    void Promise.resolve().then(apply);
  }, []);

  const save = React.useCallback(async () => {
    const handle = gridRef.current;
    if (!handle || !onCommit || readonly) return;

    setIsCommitting(true);
    try {
      await handle.flushEditing();
      const gridChangeSet = await readChangeSetAfterFlush(gridRef);
      if (!gridChangeSet) return;
      const changeSet = mergeCreatedRowsIntoChangeSet(gridChangeSet, createdRows, getRowId);
      setLastChangeSet(changeSet);
      if (!hasChangeSetChanges(changeSet)) return;

      const nextState: DataGridCrudUiState<TData> = {
        ...state,
        dirtyState: changeSet.dirtyState,
        dirty: changeSet.dirtyState.rowIds.length > 0,
        lastChangeSet: changeSet,
        isCommitting: true,
      };
      const commitArgs = {
        changeSet,
        state: nextState,
        data: handle.getData(),
      };

      const validation = normalizeValidationResult(await validateCommit?.(commitArgs));
      setFieldErrors(validation.fieldErrors);
      setValidationError(validation.error);
      if (!validation.valid) {
        onValidationError?.({
          error: validation.error,
          fieldErrors: validation.fieldErrors,
        });
        return;
      }

      const shouldCommit = await beforeCommit?.(commitArgs);
      if (shouldCommit === false) return;

      const result = await onCommit(commitArgs);
      if (result && result.ok === false) {
        const resultFieldErrors = result.fieldErrors ?? EMPTY_FIELD_ERRORS;
        setFieldErrors(resultFieldErrors);
        setValidationError(result.error);
        onCommitError?.({ error: result.error, fieldErrors: result.fieldErrors });
        return;
      }

      handle.acceptChanges();
      setCreatedRows([]);
      setFieldErrors(EMPTY_FIELD_ERRORS);
      setValidationError(undefined);
      onCommitSuccess?.({ nextData: result?.nextData });
    } catch (error) {
      onCommitError?.({ error });
    } finally {
      setIsCommitting(false);
    }
  }, [
    beforeCommit,
    createdRows,
    getRowId,
    onCommit,
    onCommitError,
    onCommitSuccess,
    onValidationError,
    readonly,
    state,
    validateCommit,
  ]);

  const reset = React.useCallback(() => {
    gridRef.current?.cancelEditing();
    gridRef.current?.resetDirtyState();
    setCreatedRows([]);
    setFieldErrors(EMPTY_FIELD_ERRORS);
    setValidationError(undefined);
  }, []);

  const deleteSelectedRows = React.useCallback(() => {
    if (readonly) return;
    const targets = selectedRowIds.length > 0
      ? selectedRowIds
      : currentRowId
        ? [currentRowId]
        : [];
    if (targets.length === 0) return;
    const targetSet = new Set(targets);
    const persistentTargets = targets.filter((rowId) => !createdRowIdSet.has(rowId));
    if (persistentTargets.length > 0) {
      gridRef.current?.deleteRows(persistentTargets);
    }
    if (targets.some((rowId) => createdRowIdSet.has(rowId))) {
      setCreatedRows((current) =>
        current.filter((row, index) => !targetSet.has(getRowId(row, index)))
      );
    }
    setRowSelection({});
  }, [createdRowIdSet, currentRowId, getRowId, readonly, selectedRowIds]);

  const clearFilters = React.useCallback(() => {
    gridRef.current?.clearFilters();
  }, []);

  const toggleFilters = React.useCallback(() => {
    setFilterEnabled((current) => !current);
  }, []);

  const toggleColumnReorder = React.useCallback(() => {
    setColumnReorderEnabled((current) => !current);
  }, []);

  const addRow = React.useCallback(() => {
    if (readonly || !createRow) return;
    const row = createRow({ data: gridData });
    setCreatedRows((current) => [...current, row]);
  }, [createRow, gridData, readonly]);

  const exportExcel = React.useCallback(() => {
    if (!onExport) return undefined;
    return onExport({
      data: state.data,
      sourceData: state.sourceData,
      createdRows: state.createdRows,
      lastChangeSet: state.lastChangeSet,
      state,
    });
  }, [onExport, state]);

  const actionApi = React.useMemo<DataGridCrudActionApi>(
    () => ({
      addRow,
      deleteSelectedRows,
      save,
      reset,
      clearFilters,
      toggleFilters,
      toggleColumnReorder,
      exportExcel,
    }),
    [
      addRow,
      clearFilters,
      deleteSelectedRows,
      exportExcel,
      reset,
      save,
      toggleColumnReorder,
      toggleFilters,
    ]
  );

  const deletedRowIds = React.useMemo(
    () => new Set(dirtyState.deletedRowIds),
    [dirtyState.deletedRowIds]
  );
  const dirtyRowIds = React.useMemo(
    () => new Set(dirtyState.rowIds),
    [dirtyState.rowIds]
  );

  const rowStatusResolver = React.useCallback(
    (ctx: GenDataGridRowStatusContext<TData>): GenDataGridRowStatus => {
      if (createdRowIdSet.has(ctx.rowId)) return 'created';
      if (deletedRowIds.has(ctx.rowId)) return 'deleted';
      if (dirtyRowIds.has(ctx.rowId)) return 'updated';
      return 'clean';
    },
    [createdRowIdSet, deletedRowIds, dirtyRowIds]
  );

  const gridStateProps = React.useMemo<DataGridCrudController<TData>['gridStateProps']>(
    () => ({
      enableDirtyState: gridFeatureOptions?.enableDirtyState ?? true,
      onDirtyStateChange: handleDirtyStateChange,
      enableRowStatus: gridFeatureOptions?.enableRowStatus ?? true,
      rowStatusResolver,
      enableCurrentRowHighlight: gridFeatureOptions?.enableCurrentRowHighlight ?? true,
      onCurrentRowChange: setCurrentRowId,
      enableRowSelection: gridFeatureOptions?.enableRowSelection ?? true,
      rowSelection,
      onRowSelectionChange: setRowSelection,
      enableColumnFilters: resolvedFilterEnabled,
      enableColumnReorder: resolvedColumnReorderEnabled,
    }),
    [
      gridFeatureOptions?.enableCurrentRowHighlight,
      gridFeatureOptions?.enableDirtyState,
      gridFeatureOptions?.enableRowSelection,
      gridFeatureOptions?.enableRowStatus,
      handleDirtyStateChange,
      resolvedColumnReorderEnabled,
      resolvedFilterEnabled,
      rowSelection,
      rowStatusResolver,
    ]
  );

  return {
    gridRef,
    state,
    gridData,
    actionApi,
    gridStateProps,
  };
}
