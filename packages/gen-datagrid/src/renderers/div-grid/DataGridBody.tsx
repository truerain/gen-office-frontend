// packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx
// Renders baseline body rows for the div-based DataGrid renderer.

import type { Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditorFactory,
} from '../../GenDataGrid.types';
import { createEditableContext, resolveEditableCell } from '../../features/editing/editableCell';
import type { GenDataGridEditingCell } from '../../features/editing/useCellEditing';
import type { GenDataGridRangeSelections } from '../../features/range-selection/rangeSelection';
import { DataGridBodyRow } from './DataGridBodyRow';

type DataGridBodyProps<TData> = {
  rows: Row<TData>[];
  gridTemplateColumns: string;
  rowHeight: number;
  rowIds: readonly string[];
  columnIds: readonly string[];
  rangeSelections: GenDataGridRangeSelections;
  readOnly?: boolean;
  enablePinning?: boolean;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
  editSelectOnFocus?: boolean;
  editCommitOnBlur?: boolean;
  editorFactory?: GenDataGridEditorFactory<TData>;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  dirtyCellIds?: ReadonlySet<string>;
  dirtyRowIds?: ReadonlySet<string>;
  deletedRowIds?: ReadonlySet<string>;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
  editingCell: GenDataGridEditingCell | null;
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  onEditStart: (args: GenDataGridEditingCell & { value: unknown }) => void;
  onEditCancel: () => void;
};

export function DataGridBody<TData>({
  rows,
  gridTemplateColumns,
  rowHeight,
  rowIds,
  columnIds,
  rangeSelections,
  readOnly,
  enablePinning = true,
  isCellEditable,
  editSelectOnFocus,
  editCommitOnBlur,
  editorFactory,
  onCellValueChange,
  dirtyCellIds,
  dirtyRowIds,
  deletedRowIds,
  getRowHeight,
  activeCell,
  onActiveCellChange,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
}: DataGridBodyProps<TData>) {
  const activateCell = (next: Exclude<GenDataGridActiveCell, null>) => {
    if (
      editingCell &&
      (editingCell.rowId !== next.rowId || editingCell.columnId !== next.columnId)
    ) {
      const editingRow = rows.find((row) => row.id === editingCell.rowId);
      const editingTanstackCell = editingRow
        ?.getVisibleCells()
        .find((cell) => cell.column.id === editingCell.columnId);
      if (editingRow && editingTanstackCell) {
        const editableContext = createEditableContext({
          row: editingRow,
          column: editingTanstackCell.column,
        });
        const meta = editingTanstackCell.column.columnDef.meta;
        const commitOnBlur = meta?.editCommitOnBlur ?? editCommitOnBlur ?? false;
        if (commitOnBlur) {
          onCellValueChange?.({
            row: editingRow.original,
            rowId: editingRow.id,
            rowIndex: editingRow.index,
            columnId: editingTanstackCell.column.id,
            previousValue: editableContext.value,
            value: draftValue,
          });
        }
      }
      onEditCancel();
    }

    onActiveCellChange(next);
  };

  return (
    <div role="rowgroup" data-gen-datagrid-body="true" className="gen-datagrid__body">
      {rows.map((row) => {
        const rowId = row.id;
        const rowIndex = row.index;
        const resolvedRowHeight =
          getRowHeight?.({ row: row.original, rowId, rowIndex }) ?? rowHeight;
        return (
          <DataGridBodyRow
            key={rowId}
            row={row}
            rows={rows}
            gridTemplateColumns={gridTemplateColumns}
            rowHeight={resolvedRowHeight}
            rowIds={rowIds}
            columnIds={columnIds}
            rangeSelections={rangeSelections}
            readOnly={readOnly}
            enablePinning={enablePinning}
            isCellEditable={isCellEditable}
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={onCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            activeCell={activeCell}
            onActiveCellChange={activateCell}
            editingCell={editingCell}
            draftValue={draftValue}
            setDraftValue={setDraftValue}
            onEditStart={onEditStart}
            onEditCancel={onEditCancel}
          />
        );
      })}
    </div>
  );
}
