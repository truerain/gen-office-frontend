// packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx
// Renders baseline body rows for the div-based DataGrid renderer.

import { Fragment } from 'react';
import type { Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValidation,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridDetailPanelContext,
  GenDataGridEditPolicy,
  GenDataGridEditorFactory,
  GenDataGridExpandedRowState,
  GenDataGridRowContext,
  GenDataGridTreeRowContext,
  GenDataGridValidationContext,
} from '../../GenDataGrid.types';
import { deactivateEditingForCellActivation } from '../../features/editing/editingCellActivation';
import { resolveCellEditingRuntime } from '../../features/editing/cellRuntime';
import type { GenDataGridEditingCell } from '../../features/editing/useCellEditing';
import type { GenDataGridRangeSelections } from '../../features/range-selection/rangeSelection';
import type {
  GenDataGridVisualRowMergeDisplayModel,
  GenDataGridVisualRowMergeModel,
} from '../../features/visual-row-merge/visualRowMerge';
import { DataGridBodyRow } from './DataGridBodyRow';
import { DataGridDetailRow } from './DataGridDetailRow';

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
  currentRowId?: string | null;
  getCellValidation?: (
    ctx: GenDataGridValidationContext<TData>
  ) => GenDataGridCellValidation | null | undefined;
  visualRowMergeModel?: GenDataGridVisualRowMergeModel;
  visualRowMergeDisplayModel?: GenDataGridVisualRowMergeDisplayModel;
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
  onEditDeactivate: () => void;
  onEditCancel: () => void;
  getGridRoot?: () => HTMLElement | null;
  getEditorSurfaces?: () => Iterable<HTMLElement>;
  registerEditorSurface?: (element: HTMLElement) => void;
  unregisterEditorSurface?: (element: HTMLElement) => void;
  enableMasterDetail?: boolean;
  expandedRows?: GenDataGridExpandedRowState;
  getRowCanExpand?: (ctx: GenDataGridRowContext<TData>) => boolean;
  renderDetailPanel?: (ctx: GenDataGridDetailPanelContext<TData>) => React.ReactNode;
  detailPanelHeight?: number;
  onExpandedRowToggle?: (rowId: string, expanded: boolean) => void;
  enableTreeRows?: boolean;
  getRowCanExpandTree?: (ctx: GenDataGridTreeRowContext<TData>) => boolean;
  treeIndentWidth?: number;
  onTreeExpandedRowToggle?: (row: Row<TData>, expanded: boolean) => void;
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
  currentRowId,
  getCellValidation,
  visualRowMergeModel,
  visualRowMergeDisplayModel,
  getRowHeight,
  activeCell,
  onActiveCellChange,
  onEditingNavigate,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditDeactivate,
  onEditCancel,
  getGridRoot,
  getEditorSurfaces,
  registerEditorSurface,
  unregisterEditorSurface,
  enableMasterDetail = false,
  expandedRows = {},
  getRowCanExpand,
  renderDetailPanel,
  detailPanelHeight = 160,
  onExpandedRowToggle,
  enableTreeRows = false,
  getRowCanExpandTree,
  treeIndentWidth = 16,
  onTreeExpandedRowToggle,
}: DataGridBodyProps<TData>) {
  const activateCell = (next: Exclude<GenDataGridActiveCell, null>) => {
    if (
      editingCell &&
      (editingCell.rowId !== next.rowId || editingCell.columnId !== next.columnId)
    ) {
      const editingRuntime = resolveCellEditingRuntime({
        rows,
        coord: editingCell,
        readOnly,
        isCellEditable,
        editPolicy,
        editCommitOnBlur,
      });
      const nextRuntime = resolveCellEditingRuntime({
        rows,
        coord: next,
        readOnly,
        isCellEditable,
        editPolicy,
        editCommitOnBlur,
      });
      if (editingRuntime) {
        deactivateEditingForCellActivation({
          row: editingRuntime.row.original,
          rowId: editingRuntime.row.id,
          rowIndex: editingRuntime.row.index,
          columnId: editingCell.columnId,
          previousValue: editingRuntime.editableContext.value,
          draftValue,
          commitOnBlur: editingRuntime.commitOnBlur,
          blurOwnership: editingRuntime.blurOwnership,
          continueClick: nextRuntime?.resolvedEditPolicy.continueTriggers.click ?? false,
          onCellValueChange,
          onEditCancel: onEditDeactivate,
        });
      } else {
        onEditDeactivate();
      }

      onEditingNavigate?.(next);

      if (nextRuntime?.isEditable && nextRuntime.resolvedEditPolicy.continueTriggers.click) {
        onEditStart({
          rowId: next.rowId,
          columnId: next.columnId,
          value: nextRuntime.editableContext.value,
          entryReason: 'click',
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
        const rowContext = { row: row.original, rowId, rowIndex };
        const treeContext = {
          ...rowContext,
          depth: row.depth,
          parentRowId: row.parentId,
        };
        const treeCanExpand = Boolean(
          enableTreeRows &&
            row.getCanExpand() &&
            (getRowCanExpandTree?.(treeContext) ?? true)
        );
        const canExpand = Boolean(
          enableMasterDetail &&
            renderDetailPanel &&
            (getRowCanExpand?.(rowContext) ?? true)
        );
        const isExpanded = Boolean(expandedRows[rowId]);

        return (
          <Fragment key={rowId}>
            <DataGridBodyRow
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
              currentRowId={currentRowId}
              getCellValidation={getCellValidation}
              visualRowMergeModel={visualRowMergeModel}
              visualRowMergeDisplayModel={visualRowMergeDisplayModel}
              activeCell={activeCell}
              onActiveCellChange={activateCell}
              onEditingNavigate={onEditingNavigate}
              editingCell={editingCell}
              draftValue={draftValue}
              setDraftValue={setDraftValue}
              onEditStart={onEditStart}
              onEditCancel={onEditCancel}
              getGridRoot={getGridRoot}
              getEditorSurfaces={getEditorSurfaces}
              registerEditorSurface={registerEditorSurface}
              unregisterEditorSurface={unregisterEditorSurface}
              canExpand={canExpand}
              isExpanded={isExpanded}
              onExpandedChange={(expanded) => onExpandedRowToggle?.(rowId, expanded)}
              treeDepth={enableTreeRows ? row.depth : 0}
              treeParentRowId={enableTreeRows ? row.parentId : undefined}
              treeCanExpand={treeCanExpand}
              treeIsExpanded={treeCanExpand && row.getIsExpanded()}
              treeIndentWidth={treeIndentWidth}
              onTreeExpandedChange={(expanded) => onTreeExpandedRowToggle?.(row, expanded)}
            />
            {canExpand && isExpanded && renderDetailPanel ? (
              <DataGridDetailRow
                parentRowId={rowId}
                gridTemplateColumns={gridTemplateColumns}
                height={detailPanelHeight}
              >
                {renderDetailPanel({
                  ...rowContext,
                  expanded: true,
                  collapse: () => onExpandedRowToggle?.(rowId, false),
                })}
              </DataGridDetailRow>
            ) : null}
          </Fragment>
        );
      })}
    </div>
  );
}
