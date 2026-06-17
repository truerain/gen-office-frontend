// packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx
// Composes the baseline div-based DataGrid root, header, and body.

import * as React from 'react';

import type {
  GenDataGridCellValueChange,
  GenDataGridDirtyCell,
  GenDataGridHandle,
  GenDataGridProps,
} from '../../GenDataGrid.types';
import { focusCellInRoot } from '../../core/dom/cellDom';
import { useDataGridTable } from '../../core/table/useDataGridTable';
import {
  getFirstActiveCell,
  isActiveCellNavigationKey,
  resolveNextActiveCell,
  resolveNextLinearCell,
} from '../../features/active-cell/navigation';
import { resolveEditableCell } from '../../features/editing/editableCell';
import { useCellEditing } from '../../features/editing/useCellEditing';
import { useClipboardActions } from '../../features/range-selection/useClipboardActions';
import { useRangeSelection } from '../../features/range-selection/useRangeSelection';
import { DataGridBody } from './DataGridBody';
import { DataGridFooterBar } from './DataGridFooterBar';
import { DataGridFooterRow } from './DataGridFooterRow';
import { DataGridHeader } from './DataGridHeader';
import {
  DataGridVirtualBody,
  type DataGridVirtualBodyHandle,
} from './DataGridVirtualBody';
import { buildGridTemplateColumnsFromModel } from './gridTemplate';

type DataGridRootProps<TData> = GenDataGridProps<TData> & {
  rootRef: React.ForwardedRef<GenDataGridHandle>;
};

export function DataGridRoot<TData>(props: DataGridRootProps<TData>) {
  const {
    rootRef: forwardedRootRef,
    data,
    defaultData,
    columns,
    getRowId,
    gridId,
    getGridId,
    readOnly,
    readonly,
    editSelectOnFocus,
    editCommitOnBlur,
    editorFactory,
    isCellEditable,
    onCellValueChange,
    activeCell: controlledActiveCell,
    defaultActiveCell,
    onActiveCellChange,
    enableRangeSelection = true,
    selectedRanges,
    defaultSelectedRanges,
    onSelectedRangesChange,
    enableClipboard = true,
    enablePinning = true,
    enableColumnSizing = true,
    enableColumnReorder = true,
    enableColumnFilters = false,
    enableGlobalFilter = false,
    enableFooterRow = false,
    enableStickyFooterRow = false,
    enableFooter = false,
    enablePagination = false,
    enableDirtyState = true,
    enableVirtualization = false,
    clipboardOptions,
    footer,
    renderFooter,
    onDirtyStateChange,
    onRowsDelete,
    className,
    style,
    rowHeight = 36,
    getRowHeight,
    headerHeight = 40,
    footerRowHeight = 36,
  } = props;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [viewportElement, setViewportElement] = React.useState<HTMLDivElement | null>(null);
  const virtualBodyRef = React.useRef<DataGridVirtualBodyHandle | null>(null);
  const reactId = React.useId();
  const resolvedGridId = React.useMemo(
    () => gridId ?? getGridId?.() ?? `gen-datagrid-${reactId.replace(/:/g, '')}`,
    [getGridId, gridId, reactId]
  );
  const table = useDataGridTable(props);
  const tableRows = table.getRowModel().rows;
  const visibleColumns = (
    enablePinning
      ? [
          ...table.getLeftLeafColumns(),
          ...table.getCenterLeafColumns(),
          ...table.getRightLeafColumns(),
        ]
      : table.getVisibleLeafColumns()
  ).filter((column) => column.getIsVisible());
  const headerGroups = table.getHeaderGroups();
  const footerGroups = table.getFooterGroups();
  const filteredRows = table.getFilteredRowModel().rows;
  const rowIds = React.useMemo(() => tableRows.map((row) => row.id), [tableRows]);
  const columnIds = React.useMemo(
    () => visibleColumns.map((column) => column.id),
    [visibleColumns]
  );
  const gridTemplateColumns = buildGridTemplateColumnsFromModel(visibleColumns);
  const resolvedReadOnly = readOnly ?? readonly ?? false;
  const rangeSelection = useRangeSelection({
    rootRef,
    enabled: enableRangeSelection,
    selectedRanges,
    defaultSelectedRanges,
    onSelectedRangesChange,
  });
  const clipboard = useClipboardActions({
    table,
    selection: rangeSelection.selection,
    enabled: enableClipboard,
    includeHeader: clipboardOptions?.includeHeader,
  });
  const [uncontrolledActiveCell, setUncontrolledActiveCell] = React.useState(
    () => defaultActiveCell ?? getFirstActiveCell(rowIds, columnIds)
  );
  const activeCell =
    controlledActiveCell !== undefined ? controlledActiveCell : uncontrolledActiveCell;
  const editing = useCellEditing();
  const [dirtyCells, setDirtyCells] = React.useState<Map<string, GenDataGridDirtyCell>>(
    () => new Map()
  );
  const [deletedRowIdList, setDeletedRowIdList] = React.useState<string[]>(() => []);

  const createDirtyState = React.useCallback(
    (cells: Map<string, GenDataGridDirtyCell>, deletedRowIds: string[]) => ({
      cells: Array.from(cells.values()),
      rowIds: Array.from(
        new Set([...Array.from(cells.values()).map((cell) => cell.rowId), ...deletedRowIds])
      ),
      deletedRowIds,
    }),
    []
  );

  const dirtyState = React.useMemo(
    () => createDirtyState(dirtyCells, deletedRowIdList),
    [createDirtyState, deletedRowIdList, dirtyCells]
  );
  const dirtyCellIds = React.useMemo(() => new Set(dirtyCells.keys()), [dirtyCells]);
  const dirtyRowIds = React.useMemo(() => new Set(dirtyState.rowIds), [dirtyState.rowIds]);
  const deletedRowIds = React.useMemo(
    () => new Set(deletedRowIdList),
    [deletedRowIdList]
  );

  const updateDirtyCells = React.useCallback(
    (
      updater: (current: Map<string, GenDataGridDirtyCell>) => Map<string, GenDataGridDirtyCell>
    ) => {
      setDirtyCells((current) => {
        const next = updater(current);
        const nextDeletedRowIds = deletedRowIdList;
        onDirtyStateChange?.(createDirtyState(next, nextDeletedRowIds));
        return next;
      });
    },
    [createDirtyState, deletedRowIdList, onDirtyStateChange]
  );

  const handleCellValueChange = React.useCallback(
    (args: GenDataGridCellValueChange<TData>) => {
      if (enableDirtyState && !Object.is(args.previousValue, args.value)) {
        updateDirtyCells((current) => {
          const next = new Map(current);
          const key = `${args.rowId}::${args.columnId}`;
          const existing = next.get(key);
          next.set(key, {
            rowId: args.rowId,
            columnId: args.columnId,
            previousValue: existing?.previousValue ?? args.previousValue,
            value: args.value,
          });
          return next;
        });
      }
      onCellValueChange?.(args);
    },
    [enableDirtyState, onCellValueChange, updateDirtyCells]
  );

  const resetDirtyState = React.useCallback(
    (rowIds?: readonly string[]) => {
      const rowIdSet = rowIds ? new Set(rowIds) : null;
      const nextDeletedRowIds = rowIdSet
        ? deletedRowIdList.filter((rowId) => !rowIdSet.has(rowId))
        : [];
      const nextDirtyCells = rowIdSet
        ? new Map(
            Array.from(dirtyCells.entries()).filter(([, cell]) => !rowIdSet.has(cell.rowId))
          )
        : new Map<string, GenDataGridDirtyCell>();

      setDeletedRowIdList(nextDeletedRowIds);
      setDirtyCells(nextDirtyCells);
      onDirtyStateChange?.(createDirtyState(nextDirtyCells, nextDeletedRowIds));
    },
    [createDirtyState, deletedRowIdList, dirtyCells, onDirtyStateChange]
  );

  const commitDirtyState = React.useCallback(
    (rowIds?: readonly string[]) => {
      resetDirtyState(rowIds);
    },
    [resetDirtyState]
  );

  const deleteRows = React.useCallback(
    (rowIdsToDelete: readonly string[]) => {
      const uniqueRowIds = Array.from(new Set(rowIdsToDelete));
      if (uniqueRowIds.length === 0) return;
      setDeletedRowIdList((current) => {
        const next = Array.from(new Set([...current, ...uniqueRowIds]));
        onDirtyStateChange?.(createDirtyState(dirtyCells, next));
        return next;
      });
      onRowsDelete?.(uniqueRowIds);
    },
    [createDirtyState, dirtyCells, onDirtyStateChange, onRowsDelete]
  );

  const clearColumnFilters = React.useCallback(() => {
    table.setColumnFilters([]);
  }, [table]);

  const clearGlobalFilter = React.useCallback(() => {
    table.setGlobalFilter(undefined);
  }, [table]);

  const clearFilters = React.useCallback(() => {
    table.setColumnFilters([]);
    table.setGlobalFilter(undefined);
  }, [table]);

  React.useImperativeHandle(
    forwardedRootRef,
    () => ({
      get rootElement() {
        return rootRef.current;
      },
      clearSelection: rangeSelection.clearSelection,
      copySelection: clipboard.copySelection,
      clearColumnFilters,
      clearGlobalFilter,
      clearFilters,
      resetDirtyState,
      commitDirtyState,
      deleteRows,
      getDirtyState: () => dirtyState,
    }),
    [
      clearColumnFilters,
      clearFilters,
      clearGlobalFilter,
      clipboard.copySelection,
      commitDirtyState,
      dirtyState,
      deleteRows,
      forwardedRootRef,
      rangeSelection.clearSelection,
      resetDirtyState,
    ]
  );

  const setActiveCell = React.useCallback(
    (next: Exclude<typeof activeCell, null>) => {
      if (controlledActiveCell === undefined) {
        setUncontrolledActiveCell(next);
      }
      onActiveCellChange?.(next);
    },
    [controlledActiveCell, onActiveCellChange]
  );

  const startActiveCellEditing = React.useCallback(() => {
    if (!activeCell) return false;

    const row = tableRows.find((item) => item.id === activeCell.rowId);
    const column = visibleColumns.find((item) => item.id === activeCell.columnId);
    if (!row || !column) return false;

    const isEditable = resolveEditableCell({
      row,
      column,
      readOnly: resolvedReadOnly,
      isCellEditable,
    });
    if (!isEditable) return false;

    editing.startEditing({
      rowId: activeCell.rowId,
      columnId: activeCell.columnId,
      value: row.getValue(column.id),
    });
    return true;
  }, [activeCell, editing, isCellEditable, resolvedReadOnly, tableRows, visibleColumns]);

  React.useEffect(() => {
    if (controlledActiveCell !== undefined) return;
    if (activeCell) {
      const rowExists = rowIds.includes(activeCell.rowId);
      const columnExists = columnIds.includes(activeCell.columnId);
      if (rowExists && columnExists) return;
    }
    setUncontrolledActiveCell(getFirstActiveCell(rowIds, columnIds));
  }, [activeCell, columnIds, controlledActiveCell, rowIds]);

  React.useEffect(() => {
    if (!activeCell) return;
    if (enableVirtualization) {
      const activeRowIndex = rowIds.indexOf(activeCell.rowId);
      if (activeRowIndex >= 0) {
        virtualBodyRef.current?.scrollToRowIndex(activeRowIndex);
      }
    }
    const frame = requestAnimationFrame(() => {
      if (focusCellInRoot(rootRef.current, activeCell)) {
        return;
      }
      requestAnimationFrame(() => {
        focusCellInRoot(rootRef.current, activeCell);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeCell, enableVirtualization, rowIds]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input,select,textarea,button,[contenteditable="true"]')) {
        return;
      }

      const isCopyShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c';
      if (isCopyShortcut && clipboard.canCopy) {
        event.preventDefault();
        void clipboard.copySelection({
          includeHeader: event.shiftKey ? true : undefined,
        });
        return;
      }

      if (event.key === 'Escape' && rangeSelection.selections.length > 0) {
        event.preventDefault();
        rangeSelection.clearSelection();
        return;
      }

      if (event.key === 'Enter' || event.key === 'F2') {
        if (startActiveCellEditing()) {
          event.preventDefault();
          return;
        }
      }

      if (event.key === 'Tab') {
        const next = resolveNextLinearCell({
          activeCell,
          rowIds,
          columnIds,
          direction: event.shiftKey ? -1 : 1,
        });
        if (!next || next === activeCell) return;

        event.preventDefault();
        setActiveCell(next);
        return;
      }

      if (!isActiveCellNavigationKey(event.key)) return;

      const next = resolveNextActiveCell({
        activeCell,
        rowIds,
        columnIds,
        key: event.key,
        wholeGrid: event.ctrlKey || event.metaKey,
      });
      if (!next) return;

      event.preventDefault();
      setActiveCell(next);
    },
    [
      activeCell,
      clipboard,
      columnIds,
      rangeSelection,
      rowIds,
      setActiveCell,
      startActiveCellEditing,
    ]
  );

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
      }}
      role="grid"
      data-gen-datagrid-root="true"
      data-grid-id={resolvedGridId}
      aria-rowcount={tableRows.length}
      aria-colcount={visibleColumns.length}
      className={['gen-datagrid', className].filter(Boolean).join(' ')}
      style={{
        ['--gen-datagrid-row-height' as string]: `${rowHeight}px`,
        ['--gen-datagrid-header-height' as string]: `${headerHeight}px`,
        ...style,
      }}
      onKeyDown={handleKeyDown}
      onMouseDown={rangeSelection.handleMouseDown}
      onMouseOver={rangeSelection.handleMouseOver}
    >
      {enableGlobalFilter ? (
        <div className="gen-datagrid__global-filter" data-global-filter="true">
          <input
            aria-label="Global filter"
            className="gen-datagrid__global-filter-input"
            value={table.getState().globalFilter == null ? '' : String(table.getState().globalFilter)}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value || undefined);
            }}
          />
        </div>
      ) : null}
      <div
        ref={setViewportElement}
        className="gen-datagrid__viewport"
        data-gen-datagrid-viewport="true"
      >
        <DataGridHeader
          table={table}
          headerGroups={headerGroups}
          columns={visibleColumns}
          gridTemplateColumns={gridTemplateColumns}
          enablePinning={enablePinning}
          enableColumnSizing={enableColumnSizing}
          enableColumnReorder={enableColumnReorder}
          enableColumnFilters={enableColumnFilters}
        />
        {enableVirtualization ? (
          <DataGridVirtualBody
            rows={tableRows}
            gridTemplateColumns={gridTemplateColumns}
            rowHeight={rowHeight}
            headerHeight={headerHeight}
            rowIds={rowIds}
            columnIds={columnIds}
            rangeSelections={rangeSelection.selections}
            viewportElement={viewportElement}
            readOnly={resolvedReadOnly}
            enablePinning={enablePinning}
            isCellEditable={isCellEditable}
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={handleCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            activeCell={activeCell}
            onActiveCellChange={setActiveCell}
            editingCell={editing.editingCell}
            draftValue={editing.draftValue}
            setDraftValue={editing.setDraftValue}
            onEditStart={editing.startEditing}
            onEditCancel={editing.cancelEditing}
            virtualBodyRef={virtualBodyRef}
          />
        ) : (
          <DataGridBody
            rows={tableRows}
            gridTemplateColumns={gridTemplateColumns}
            rowHeight={rowHeight}
            rowIds={rowIds}
            columnIds={columnIds}
            rangeSelections={rangeSelection.selections}
            readOnly={resolvedReadOnly}
            enablePinning={enablePinning}
            isCellEditable={isCellEditable}
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={handleCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            getRowHeight={getRowHeight}
            activeCell={activeCell}
            onActiveCellChange={setActiveCell}
            editingCell={editing.editingCell}
            draftValue={editing.draftValue}
            setDraftValue={editing.setDraftValue}
            onEditStart={editing.startEditing}
            onEditCancel={editing.cancelEditing}
          />
        )}
        {enableFooterRow ? (
          <DataGridFooterRow
            table={table}
            footerGroups={footerGroups}
            columns={visibleColumns}
            gridTemplateColumns={gridTemplateColumns}
            enablePinning={enablePinning}
            sticky={enableStickyFooterRow}
            footerRowHeight={footerRowHeight}
          />
        ) : null}
      </div>
      {enablePagination ? (
        <div className="gen-datagrid__pagination" data-gen-datagrid-pagination="true">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span className="gen-datagrid__pagination-status">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      ) : null}
      {enableFooter && (renderFooter || footer) ? (
        <DataGridFooterBar>
          {renderFooter
            ? renderFooter({
                table,
                rows: filteredRows.map((row) => row.original),
                dirtyState,
                pagination: table.getState().pagination,
              })
            : footer}
        </DataGridFooterBar>
      ) : null}
    </div>
  );
}
