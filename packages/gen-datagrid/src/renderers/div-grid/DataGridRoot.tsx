// packages/gen-datagrid/src/renderers/div-grid/DataGridRoot.tsx
// Composes the baseline div-based DataGrid root, header, and body.

import * as React from 'react';

import type { GenDataGridHandle, GenDataGridProps } from '../../GenDataGrid.types';
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
import { DataGridHeader } from './DataGridHeader';
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
    clipboardOptions,
    className,
    style,
    rowHeight = 36,
    getRowHeight,
    headerHeight = 40,
  } = props;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
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

  React.useImperativeHandle(
    forwardedRootRef,
    () => ({
      get rootElement() {
        return rootRef.current;
      },
      clearSelection: rangeSelection.clearSelection,
      copySelection: clipboard.copySelection,
    }),
    [clipboard.copySelection, forwardedRootRef, rangeSelection.clearSelection]
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
    const frame = requestAnimationFrame(() => {
      focusCellInRoot(rootRef.current, activeCell);
    });
    return () => cancelAnimationFrame(frame);
  }, [activeCell]);

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
      <DataGridHeader
        table={table}
        headerGroups={headerGroups}
        columns={visibleColumns}
        gridTemplateColumns={gridTemplateColumns}
        enablePinning={enablePinning}
        enableColumnSizing={enableColumnSizing}
        enableColumnReorder={enableColumnReorder}
      />
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
        onCellValueChange={onCellValueChange}
        getRowHeight={getRowHeight}
        activeCell={activeCell}
        onActiveCellChange={setActiveCell}
        editingCell={editing.editingCell}
        draftValue={editing.draftValue}
        setDraftValue={editing.setDraftValue}
        onEditStart={editing.startEditing}
        onEditCancel={editing.cancelEditing}
      />
    </div>
  );
}
