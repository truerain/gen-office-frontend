// packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx
// Renders baseline body rows for the div-based DataGrid renderer.

import { flexRender, type Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditorFactory,
} from '../../GenDataGrid.types';
import { createEditableContext, resolveEditableCell } from '../../features/editing/editableCell';
import { createEditorContext } from '../../features/editing/editorContext';
import { resolveNextEditableCell } from '../../features/editing/editNavigation';
import { renderCellEditor } from '../../features/editing/renderEditor';
import type { GenDataGridEditingCell } from '../../features/editing/useCellEditing';
import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';
import {
  isCellInRangeSelections,
  type GenDataGridRangeSelections,
} from '../../features/range-selection/rangeSelection';
import { DataGridCell } from './DataGridCell';
import { formatCellValue } from './cellValue';

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
  getRowHeight,
  activeCell,
  onActiveCellChange,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
}: DataGridBodyProps<TData>) {
  const getOrderedVisibleCells = (row: Row<TData>) =>
    enablePinning
      ? [
          ...row.getLeftVisibleCells(),
          ...row.getCenterVisibleCells(),
          ...row.getRightVisibleCells(),
        ]
      : row.getVisibleCells();

  const getEditableCells = () =>
    rows.flatMap((row) =>
      getOrderedVisibleCells(row)
        .filter((cell) =>
          resolveEditableCell({
            row,
            column: cell.column,
            readOnly,
            isCellEditable,
          })
        )
        .map((cell) => ({ rowId: row.id, columnId: cell.column.id }))
    );

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
          <div
            key={rowId}
            role="row"
            data-rowid={rowId}
            data-row-index={rowIndex}
            className="gen-datagrid__row"
            style={{
              gridTemplateColumns,
              ['--gen-datagrid-current-row-height' as string]: `${resolvedRowHeight}px`,
            }}
          >
            {getOrderedVisibleCells(row).map((cell) => {
              const columnId = cell.column.id;
              const editableContext = createEditableContext({ row, column: cell.column });
              const isEditable = resolveEditableCell({
                row,
                column: cell.column,
                readOnly,
                isCellEditable,
              });
              const isEditing =
                editingCell?.rowId === rowId && editingCell.columnId === columnId;
              const pinning = enablePinning
                ? getColumnPinningInfo(cell.column, { zIndex: isEditing ? 5 : 2 })
                : undefined;
              const commit = (nextValue = draftValue) => {
                onCellValueChange?.({
                  row: row.original,
                  rowId,
                  rowIndex,
                  columnId,
                  previousValue: editableContext.value,
                  value: nextValue,
                });
                onEditCancel();
              };
              const meta = cell.column.columnDef.meta;
              const editOptions =
                meta?.getEditOptions?.(editableContext) ?? meta?.editOptions;
              const selectOnFocus = meta?.editSelectOnFocus ?? editSelectOnFocus ?? false;
              const commitOnBlur = meta?.editCommitOnBlur ?? editCommitOnBlur ?? false;
              const handleTabNavigate = (direction: 1 | -1) => {
                const next = resolveNextEditableCell({
                  editableCells: getEditableCells(),
                  current: { rowId, columnId },
                  direction,
                });
                onCellValueChange?.({
                  row: row.original,
                  rowId,
                  rowIndex,
                  columnId,
                  previousValue: editableContext.value,
                  value: draftValue,
                });
                onEditCancel();
                if (!next || (next.rowId === rowId && next.columnId === columnId)) {
                  return;
                }
                onActiveCellChange(next);
              };
              const editorContext = createEditorContext({
                editableContext,
                draftValue,
                setDraftValue,
                commit,
                cancel: onEditCancel,
                editType: meta?.editType,
                editOptions,
                placeholder: meta?.editPlaceholder,
                selectOnFocus,
                commitOnBlur,
                tabNavigate: handleTabNavigate,
              });
              const content = isEditing
                ? renderCellEditor({
                    ctx: editorContext,
                    renderEditor: meta?.renderEditor,
                    editorFactory,
                  })
                : cell.column.columnDef.cell
                  ? flexRender(cell.column.columnDef.cell, cell.getContext())
                  : formatCellValue(cell.getValue());
              return (
                <DataGridCell
                  key={cell.id}
                  rowId={rowId}
                  columnId={columnId}
                  isActive={Boolean(
                    activeCell &&
                      activeCell.rowId === rowId &&
                      activeCell.columnId === columnId
                  )}
                  isSelected={isCellInRangeSelections({
                    rowId,
                    columnId,
                    rowIds,
                    columnIds,
                    selections: rangeSelections,
                  })}
                  isEditable={isEditable}
                  isEditing={isEditing}
                  pinning={pinning}
                  onActivate={activateCell}
                  onEditStart={() => {
                    if (!isEditable) return;
                    onEditStart({ rowId, columnId, value: editableContext.value });
                  }}
                >
                  {content}
                </DataGridCell>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
