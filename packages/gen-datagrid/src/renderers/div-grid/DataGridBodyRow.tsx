// packages/gen-datagrid/src/renderers/div-grid/DataGridBodyRow.tsx
// Renders a single body row shared by standard and virtual body renderers.

import { flexRender, type Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditPolicy,
  GenDataGridEditorFactory,
} from '../../GenDataGrid.types';
import {
  resolveNextActiveCell,
  type ActiveCellNavigationKey,
} from '../../features/active-cell/navigation';
import { resolveEditPolicy } from '../../features/editing/editPolicy';
import { resolveBlurOwnership } from '../../features/editing/blurPolicy';
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
  editPolicy?: GenDataGridEditPolicy;
  editSelectOnFocus?: boolean;
  editCommitOnBlur?: boolean;
  editorFactory?: GenDataGridEditorFactory<TData>;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  dirtyCellIds?: ReadonlySet<string>;
  dirtyRowIds?: ReadonlySet<string>;
  deletedRowIds?: ReadonlySet<string>;
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
  onEditingNavigate?: (next: Exclude<GenDataGridActiveCell, null>) => void;
  editingCell: GenDataGridEditingCell | null;
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  onEditStart: (args: GenDataGridEditingCell & { value: unknown }) => void;
  onEditCancel: () => void;
  getGridRoot?: () => HTMLElement | null;
  getEditorSurfaces?: () => Iterable<HTMLElement>;
  registerEditorSurface?: (element: HTMLElement) => void;
  unregisterEditorSurface?: (element: HTMLElement) => void;
  canExpand?: boolean;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
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
  editPolicy,
  editSelectOnFocus,
  editCommitOnBlur,
  editorFactory,
  onCellValueChange,
  dirtyCellIds,
  dirtyRowIds,
  deletedRowIds,
  activeCell,
  onActiveCellChange,
  onEditingNavigate,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
  getGridRoot,
  getEditorSurfaces,
  registerEditorSurface,
  unregisterEditorSurface,
  canExpand = false,
  isExpanded = false,
  onExpandedChange,
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

  const getCellRuntime = (coord: { rowId: string; columnId: string }) => {
    const targetRow = rows.find((item) => item.id === coord.rowId);
    const targetCell = targetRow
      ? getOrderedVisibleCells(targetRow).find((item) => item.column.id === coord.columnId)
      : undefined;
    if (!targetRow || !targetCell) return null;

    const editableContext = createEditableContext({
      row: targetRow,
      column: targetCell.column,
    });

    return {
      editableContext,
      isEditable: resolveEditableCell({
        row: targetRow,
        column: targetCell.column,
        readOnly,
        isCellEditable,
      }),
      resolvedEditPolicy: resolveEditPolicy(editPolicy, targetCell.column.columnDef.meta?.editPolicy),
    };
  };

  const continueEditingAt = (
    next: { rowId: string; columnId: string } | null,
    trigger: 'tab' | 'arrowKey'
  ) => {
    if (!next) {
      return;
    }

    onEditingNavigate?.(next) ?? onActiveCellChange(next);
    const nextRuntime = getCellRuntime(next);
    if (!nextRuntime?.isEditable || !nextRuntime.resolvedEditPolicy.continueTriggers[trigger]) {
      return;
    }
    onEditStart({
      rowId: next.rowId,
      columnId: next.columnId,
      value: nextRuntime.editableContext.value,
      entryReason: trigger === 'tab' ? 'tab' : 'arrowKey',
    });
  };

  const rowId = row.id;
  const rowIndex = row.index;

  return (
    <div
      role="row"
      data-rowid={rowId}
      data-row-index={rowIndex}
      data-dirty-row={dirtyRowIds?.has(rowId) ? 'true' : undefined}
      data-deleted-row={deletedRowIds?.has(rowId) ? 'true' : undefined}
      data-expandable-row={canExpand ? 'true' : undefined}
      data-expanded-row={canExpand && isExpanded ? 'true' : undefined}
      data-virtualized-row={virtualized ? 'true' : undefined}
      className="gen-datagrid__row"
      style={{
        gridTemplateColumns,
        ['--gen-datagrid-current-row-height' as string]: `${rowHeight}px`,
        ...style,
      }}
    >
      {getOrderedVisibleCells(row).map((cell, cellIndex) => {
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
        const resolvedEditPolicy = resolveEditPolicy(editPolicy, meta?.editPolicy);
        const editOptions = meta?.getEditOptions?.(editableContext) ?? meta?.editOptions;
        const selectOnFocus =
          editingCell?.suppressSelectOnFocus
            ? false
            : (meta?.editSelectOnFocus ?? editSelectOnFocus ?? false);
        const commitOnBlur = meta?.editCommitOnBlur ?? editCommitOnBlur ?? true;
        const blurOwnership = resolveBlurOwnership({
          editType: meta?.editType,
          gridPolicy: editPolicy,
          columnPolicy: meta?.editPolicy,
          columnBlurOwnership: meta?.editBlurOwnership,
        });
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
          continueEditingAt(next, 'tab');
        };
        const handleArrowNavigate = (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => {
          const next = resolveNextActiveCell({
            activeCell: { rowId, columnId },
            rowIds: [...rowIds],
            columnIds: [...columnIds],
            key: key as ActiveCellNavigationKey,
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
          continueEditingAt(next, 'arrowKey');
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
          arrowNavigate: handleArrowNavigate,
          openOnEditStart: resolvedEditPolicy.openOnEditStart,
          editEntryReason: editingCell?.entryReason,
          blurOwnership,
          registerEditorSurface,
          unregisterEditorSurface,
          getGridRoot,
          getEditorSurfaces,
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
        const renderedContent =
          cellIndex === 0 && canExpand && !isEditing ? (
            <>
              <button
                type="button"
                className="gen-datagrid__detail-toggle"
                data-gen-datagrid-detail-toggle="true"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Collapse row ' + rowId + ' detail' : 'Expand row ' + rowId + ' detail'}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onExpandedChange?.(!isExpanded);
                }}
              >
                {isExpanded ? '-' : '+'}
              </button>
              <span className="gen-datagrid__cell-content">{content}</span>
            </>
          ) : (
            content
          );

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
            editOpenOnStart={resolvedEditPolicy.openOnEditStart}
            allowReclickEdit={resolvedEditPolicy.startTriggers.reclick}
            allowDoubleClickEdit={resolvedEditPolicy.startTriggers.doubleClick}
            pinning={pinning}
            onActivate={onActiveCellChange}
            onEditStart={({ entryReason }) => {
              if (!isEditable) return;
              onEditStart({ rowId, columnId, value: editableContext.value, entryReason });
            }}
          >
            {renderedContent}
          </DataGridCell>
        );
      })}
    </div>
  );
}
