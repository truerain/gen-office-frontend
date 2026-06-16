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
  GenDataGridEditableContext,
  GenDataGridEditorContext,
  GenDataGridEditorFactory,
  GenDataGridEditOption,
  GenDataGridEditType,
  GenDataGridHandle,
  GenDataGridProps,
  GenDataGridRenderContext,
} from './GenDataGrid.types';
export type {
  GenDataGridCellCoord,
  GenDataGridRangeSelection,
  GenDataGridRangeSelections,
} from './features/range-selection/rangeSelection';
