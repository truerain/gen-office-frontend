// packages/gen-datagrid/src/index.ts
// Exposes the public GenDataGrid package entrypoint.

import './index.css';
import './core/table/tanstack-table';

export { GenDataGrid } from './GenDataGrid';
export type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditorContext,
  GenDataGridEditorFactory,
  GenDataGridEditOption,
  GenDataGridEditType,
  GenDataGridHandle,
  GenDataGridProps,
} from './GenDataGrid.types';
export type {
  GenDataGridCellCoord,
  GenDataGridRangeSelection,
  GenDataGridRangeSelections,
} from './features/range-selection/rangeSelection';
