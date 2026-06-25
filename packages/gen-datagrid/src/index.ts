// packages/gen-datagrid/src/index.ts
// Exposes the public GenDataGrid package entrypoint.

import './index.css';
import './core/table/tanstack-table';

export { GenDataGrid } from './GenDataGrid';
export type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridDirtyCell,
  GenDataGridDirtyState,
  GenDataGridRowContext,
  GenDataGridExpandedRowState,
  GenDataGridTreeExpandedState,
  GenDataGridTreeRowContext,
  GenDataGridDetailPanelContext,
  GenDataGridDeleteRowsBehavior,
  GenDataGridEditableContext,
  GenDataGridEditorContext,
  GenDataGridEditorFactory,
  GenDataGridEditOption,
  GenDataGridEditType,
  GenDataGridFilterMode,
  GenDataGridHandle,
  GenDataGridPaginationMode,
  GenDataGridPasteError,
  GenDataGridPasteErrorReason,
  GenDataGridPasteOptions,
  GenDataGridProps,
  GenDataGridRenderContext,
  GenDataGridScrollSeekingOptions,
} from './GenDataGrid.types';
export type {
  GenDataGridCellCoord,
  GenDataGridRangeSelection,
  GenDataGridRangeSelections,
} from './features/range-selection/rangeSelection';
export {
  collectTreeExpandedRows,
  collapseTreeExpandedRowsFromDepth,
} from './features/tree/treeState';
export type {
  CollectTreeExpandedRowsArgs,
  CollapseTreeExpandedRowsFromDepthArgs,
  GenDataGridTreePath,
} from './features/tree/treeState';
