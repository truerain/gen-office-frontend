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
  DataGridCrudUiState,
} from '../GenDataGridCrud.types';

const EMPTY_DIRTY_STATE: GenDataGridDirtyState = {
  cells: [],
  rowIds: [],
  deletedRowIds: [],
};

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
    onCommit,
    beforeCommit,
    onCommitSuccess,
    onCommitError,
    onStateChange,
  } = args;
  const gridRef = React.useRef<GenDataGridHandle<TData>>(null);
  const [dirtyState, setDirtyState] = React.useState<GenDataGridDirtyState>(EMPTY_DIRTY_STATE);
  const [isCommitting, setIsCommitting] = React.useState(false);
  const [currentRowId, setCurrentRowId] = React.useState<string | null>(null);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [filterEnabled, setFilterEnabled] = React.useState(false);
  const [columnReorderEnabled, setColumnReorderEnabled] = React.useState(false);
  const [lastChangeSet, setLastChangeSet] = React.useState<GenDataGridChangeSet<TData>>();

  const selectedRowIds = React.useMemo(
    () => Object.keys(rowSelection).filter((rowId) => rowSelection[rowId]),
    [rowSelection]
  );

  const state = React.useMemo<DataGridCrudUiState<TData>>(
    () => ({
      readonly,
      data,
      dirtyState,
      dirty: dirtyState.rowIds.length > 0,
      isCommitting,
      currentRowId,
      selectedRowIds,
      filterEnabled,
      columnReorderEnabled,
      lastChangeSet,
    }),
    [
      columnReorderEnabled,
      currentRowId,
      data,
      dirtyState,
      filterEnabled,
      isCommitting,
      lastChangeSet,
      readonly,
      selectedRowIds,
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
      const changeSet = await readChangeSetAfterFlush(gridRef);
      if (!changeSet) return;
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

      const shouldCommit = await beforeCommit?.(commitArgs);
      if (shouldCommit === false) return;

      const result = await onCommit(commitArgs);
      if (result && result.ok === false) {
        onCommitError?.({ error: result.error, fieldErrors: result.fieldErrors });
        return;
      }

      handle.acceptChanges();
      onCommitSuccess?.({ nextData: result?.nextData });
    } catch (error) {
      onCommitError?.({ error });
    } finally {
      setIsCommitting(false);
    }
  }, [beforeCommit, onCommit, onCommitError, onCommitSuccess, readonly, state]);

  const reset = React.useCallback(() => {
    gridRef.current?.cancelEditing();
    gridRef.current?.resetDirtyState();
  }, []);

  const deleteSelectedRows = React.useCallback(() => {
    if (readonly) return;
    const targets = selectedRowIds.length > 0
      ? selectedRowIds
      : currentRowId
        ? [currentRowId]
        : [];
    if (targets.length === 0) return;
    gridRef.current?.deleteRows(targets);
    setRowSelection({});
  }, [currentRowId, readonly, selectedRowIds]);

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
    // Created-row state is intentionally deferred to Gate 11.
  }, []);

  const exportExcel = React.useCallback(() => {
    // Real Excel export is intentionally deferred to Gate 11/12.
  }, []);

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
      if (deletedRowIds.has(ctx.rowId)) return 'deleted';
      if (dirtyRowIds.has(ctx.rowId)) return 'updated';
      return 'clean';
    },
    [deletedRowIds, dirtyRowIds]
  );

  const gridStateProps = React.useMemo<DataGridCrudController<TData>['gridStateProps']>(
    () => ({
      enableDirtyState: true,
      onDirtyStateChange: handleDirtyStateChange,
      enableRowStatus: true,
      rowStatusResolver,
      enableCurrentRowHighlight: true,
      onCurrentRowChange: setCurrentRowId,
      enableRowSelection: true,
      rowSelection,
      onRowSelectionChange: setRowSelection,
      enableColumnFilters: filterEnabled,
      enableColumnReorder: columnReorderEnabled,
    }),
    [columnReorderEnabled, filterEnabled, handleDirtyStateChange, rowSelection, rowStatusResolver]
  );

  return {
    gridRef,
    state,
    actionApi,
    gridStateProps,
  };
}
