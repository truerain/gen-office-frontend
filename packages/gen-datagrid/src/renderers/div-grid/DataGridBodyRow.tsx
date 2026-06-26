// packages/gen-datagrid/src/renderers/div-grid/DataGridBodyRow.tsx
// Renders a single body row shared by standard and virtual body renderers.

import { flexRender, type Cell, type Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridCellValidation,
  GenDataGridEditableContext,
  GenDataGridEditPolicy,
  GenDataGridEditorFactory,
  GenDataGridValidationContext,
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
import { isGenDataGridSystemColumnId } from '../../features/system-columns/systemColumns';
import { DataGridCell } from './DataGridCell';
import { formatCellValue } from './cellValue';

function getPinningZone<TData>(cell: Cell<TData, unknown>, enablePinning: boolean) {
  if (!enablePinning) return 'center';
  return cell.column.getIsPinned() || 'center';
}

function clampBodyColSpan<TData>({
  cells,
  cellIndex,
  requestedSpan,
  enablePinning,
}: {
  cells: Cell<TData, unknown>[];
  cellIndex: number;
  requestedSpan: number;
  enablePinning: boolean;
}) {
  const span = Math.max(1, Math.floor(requestedSpan));
  if (span <= 1) return 1;

  const currentCell = cells[cellIndex];
  if (!currentCell) return 1;

  const zone = getPinningZone(currentCell, enablePinning);
  const availableInZone = cells.slice(cellIndex).findIndex((cell) => getPinningZone(cell, enablePinning) !== zone);
  const maxSpan = availableInZone < 0 ? cells.length - cellIndex : availableInZone;

  return span <= maxSpan ? span : 1;
}

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
  currentRowId?: string | null;
  getCellValidation?: (
    ctx: GenDataGridValidationContext<TData>
  ) => GenDataGridCellValidation | null | undefined;
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
  treeDepth?: number;
  treeParentRowId?: string;
  treeCanExpand?: boolean;
  treeIsExpanded?: boolean;
  treeIndentWidth?: number;
  onTreeExpandedChange?: (expanded: boolean) => void;
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
  currentRowId,
  getCellValidation,
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
  treeDepth = 0,
  treeParentRowId,
  treeCanExpand = false,
  treeIsExpanded = false,
  treeIndentWidth = 16,
  onTreeExpandedChange,
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
  const orderedCells = getOrderedVisibleCells(row);
  const firstUserCellIndex = orderedCells.findIndex(
    (cell) => !isGenDataGridSystemColumnId(cell.column.id)
  );
  let coveredCellCount = 0;

  return (
    <div
      role="row"
      data-rowid={rowId}
      data-row-index={rowIndex}
      data-dirty-row={dirtyRowIds?.has(rowId) ? 'true' : undefined}
      data-deleted-row={deletedRowIds?.has(rowId) ? 'true' : undefined}
      data-current-row={currentRowId === rowId ? 'true' : undefined}
      data-expandable-row={canExpand ? 'true' : undefined}
      data-expanded-row={canExpand && isExpanded ? 'true' : undefined}
      data-tree-depth={treeDepth > 0 ? treeDepth : undefined}
      data-tree-parent-rowid={treeParentRowId}
      data-tree-expandable-row={treeCanExpand ? 'true' : undefined}
      data-tree-expanded-row={treeCanExpand && treeIsExpanded ? 'true' : undefined}
      data-virtualized-row={virtualized ? 'true' : undefined}
      className="gen-datagrid__row"
      style={{
        gridTemplateColumns,
        ['--gen-datagrid-current-row-height' as string]: `${rowHeight}px`,
        ...style,
      }}
    >
      {orderedCells.map((cell, cellIndex) => {
        if (coveredCellCount > 0) {
          coveredCellCount -= 1;
          return null;
        }

        const columnId = cell.column.id;
        const isSystemColumn = isGenDataGridSystemColumnId(columnId);
        const editableContext = createEditableContext({ row, column: cell.column });
        const isEditable = resolveEditableCell({
          row,
          column: cell.column,
          readOnly,
          isCellEditable,
        });
        const isEditing = editingCell?.rowId === rowId && editingCell.columnId === columnId;
        const validation = isSystemColumn
          ? null
          : getCellValidation?.({
              row: row.original,
              rowId,
              rowIndex,
              columnId,
              value: editableContext.value,
            });
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
        const requestedBodyColSpan =
          typeof meta?.bodyColSpan === 'function'
            ? meta.bodyColSpan({
                row: row.original,
                rowId,
                rowIndex,
                columnId,
                value: editableContext.value,
              })
            : meta?.bodyColSpan;
        const bodyColSpan = requestedBodyColSpan
          ? clampBodyColSpan({
              cells: orderedCells,
              cellIndex,
              requestedSpan: requestedBodyColSpan,
              enablePinning,
            })
          : 1;
        if (bodyColSpan > 1) {
          coveredCellCount = bodyColSpan - 1;
        }
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
        const renderedContent = (() => {
          if (cellIndex !== firstUserCellIndex || isEditing) return content;

          const detailToggle = canExpand ? (
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
          ) : null;

          if (treeDepth <= 0 && !treeCanExpand) {
            return detailToggle ? (
              <>
                {detailToggle}
                <span className="gen-datagrid__cell-content">{content}</span>
              </>
            ) : content;
          }

          return (
            <>
              <span
                className="gen-datagrid__tree-indent"
                data-gen-datagrid-tree-indent="true"
                style={{ width: treeDepth * treeIndentWidth }}
              />
              {treeCanExpand ? (
                <button
                  type="button"
                  className="gen-datagrid__tree-toggle"
                  data-gen-datagrid-tree-toggle="true"
                  aria-expanded={treeIsExpanded}
                  aria-label={treeIsExpanded ? 'Collapse row ' + rowId + ' tree' : 'Expand row ' + rowId + ' tree'}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onTreeExpandedChange?.(!treeIsExpanded);
                  }}
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                >
                  {treeIsExpanded ? '-' : '+'}
                </button>
              ) : (
                <span className="gen-datagrid__tree-toggle-spacer" aria-hidden="true" />
              )}
              {detailToggle}
              <span className="gen-datagrid__cell-content">{content}</span>
            </>
          );
        })();

        return (
          <DataGridCell
            key={cell.id}
            rowId={rowId}
            columnId={columnId}
            isActive={Boolean(
              !isSystemColumn &&
                activeCell &&
                activeCell.rowId === rowId &&
                activeCell.columnId === columnId
            )}
            isSelected={
              !isSystemColumn &&
              isCellInRangeSelections({
                rowId,
                columnId,
                rowIds,
                columnIds,
                selections: rangeSelections,
              })
            }
            isEditable={!isSystemColumn && isEditable}
            isEditing={!isSystemColumn && isEditing}
            isDirty={dirtyCellIds?.has(`${rowId}::${columnId}`)}
            validation={validation}
            editOpenOnStart={resolvedEditPolicy.openOnEditStart}
            allowReclickEdit={resolvedEditPolicy.startTriggers.reclick}
            allowDoubleClickEdit={resolvedEditPolicy.startTriggers.doubleClick}
            activateOnMouseDown={!isSystemColumn}
            pinning={pinning}
            bodyColSpan={bodyColSpan}
            style={{ gridColumn: String(cellIndex + 1) + ' / span ' + String(bodyColSpan) }}
            onActivate={onActiveCellChange}
            onEditStart={({ entryReason }) => {
              if (isSystemColumn || !isEditable) return;
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
