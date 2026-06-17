// packages/gen-datagrid/src/renderers/div-grid/DataGridBodyRow.tsx
// Renders a single body row shared by standard and virtual body renderers.

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

type DataGridBodyRowProps<TData> = {
  row: Row<TData>;
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
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
  editingCell: GenDataGridEditingCell | null;
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  onEditStart: (args: GenDataGridEditingCell & { value: unknown }) => void;
  onEditCancel: () => void;
  style?: React.CSSProperties;
  virtualized?: boolean;
};

export function DataGridBodyRow<TData>({
  row,
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
  activeCell,
  onActiveCellChange,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
  style,
  virtualized = false,
}: DataGridBodyRowProps<TData>) {
  const getOrderedVisibleCells = (targetRow: Row<TData>) =>
    enablePinning
      ? [
          ...targetRow.getLeftVisibleCells(),
          ...targetRow.getCenterVisibleCells(),
          ...targetRow.getRightVisibleCells(),
        ]
      : targetRow.getVisibleCells();

  const getEditableCells = () =>
    rows.flatMap((targetRow) =>
      getOrderedVisibleCells(targetRow)
        .filter((cell) =>
          resolveEditableCell({
            row: targetRow,
            column: cell.column,
            readOnly,
            isCellEditable,
          })
        )
        .map((cell) => ({ rowId: targetRow.id, columnId: cell.column.id }))
    );

  const rowId = row.id;
  const rowIndex = row.index;

  return (
    <div
      role="row"
      data-rowid={rowId}
      data-row-index={rowIndex}
      data-dirty-row={dirtyRowIds?.has(rowId) ? 'true' : undefined}
      data-deleted-row={deletedRowIds?.has(rowId) ? 'true' : undefined}
      data-virtualized-row={virtualized ? 'true' : undefined}
      className="gen-datagrid__row"
      style={{
        gridTemplateColumns,
        ['--gen-datagrid-current-row-height' as string]: `${rowHeight}px`,
        ...style,
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
        const isEditing = editingCell?.rowId === rowId && editingCell.columnId === columnId;
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
        const editOptions = meta?.getEditOptions?.(editableContext) ?? meta?.editOptions;
        const selectOnFocus =
          editingCell?.suppressSelectOnFocus
            ? false
            : (meta?.editSelectOnFocus ?? editSelectOnFocus ?? false);
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
              activeCell && activeCell.rowId === rowId && activeCell.columnId === columnId
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
            isDirty={dirtyCellIds?.has(`${rowId}::${columnId}`)}
            pinning={pinning}
            onActivate={onActiveCellChange}
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
}
