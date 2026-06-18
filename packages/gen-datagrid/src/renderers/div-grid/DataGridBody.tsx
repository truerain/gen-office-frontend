// packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx
// Renders baseline body rows for the div-based DataGrid renderer.

import type { Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditPolicy,
  GenDataGridEditorFactory,
} from '../../GenDataGrid.types';
import { resolveEditPolicy } from '../../features/editing/editPolicy';
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
  editPolicy?: GenDataGridEditPolicy;
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
  onEditingNavigate?: (next: Exclude<GenDataGridActiveCell, null>) => void;
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
  editPolicy,
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
  onEditingNavigate,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
}: DataGridBodyProps<TData>) {
  const getCellRuntime = (coord: { rowId: string; columnId: string }) => {
    const row = rows.find((item) => item.id === coord.rowId);
    const tanstackCell = row?.getVisibleCells().find((cell) => cell.column.id === coord.columnId);
    if (!row || !tanstackCell) return null;

    const editableContext = createEditableContext({
      row,
      column: tanstackCell.column,
    });
    const meta = tanstackCell.column.columnDef.meta;

    return {
      row,
      tanstackCell,
      editableContext,
      isEditable: resolveEditableCell({
        row,
        column: tanstackCell.column,
        readOnly,
        isCellEditable,
      }),
      resolvedEditPolicy: resolveEditPolicy(editPolicy, meta?.editPolicy),
    };
  };

  const activateCell = (next: Exclude<GenDataGridActiveCell, null>) => {
    if (
      editingCell &&
      (editingCell.rowId !== next.rowId || editingCell.columnId !== next.columnId)
    ) {
      const editingRuntime = getCellRuntime(editingCell);
      if (editingRuntime) {
        onCellValueChange?.({
          row: editingRuntime.row.original,
          rowId: editingRuntime.row.id,
          rowIndex: editingRuntime.row.index,
          columnId: editingRuntime.tanstackCell.column.id,
          previousValue: editingRuntime.editableContext.value,
          value: draftValue,
        });
      }
      onEditCancel();

      onEditingNavigate?.(next);

      const nextRuntime = getCellRuntime(next);
      if (nextRuntime?.isEditable && nextRuntime.resolvedEditPolicy.continueTriggers.click) {
        onEditStart({
          rowId: next.rowId,
          columnId: next.columnId,
          value: nextRuntime.editableContext.value,
        });
      }
      return;
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
            editPolicy={editPolicy}
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={onCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            activeCell={activeCell}
            onActiveCellChange={activateCell}
            onEditingNavigate={onEditingNavigate}
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
