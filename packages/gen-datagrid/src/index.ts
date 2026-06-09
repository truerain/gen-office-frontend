// packages/gen-datagrid/src/index.ts
// Exposes the public GenDataGrid package entrypoint.

import './index.css';

export { GenDataGrid } from './GenDataGrid';
export type {
  GenDataGridActiveCell,
  GenDataGridHandle,
  GenDataGridProps,
} from './GenDataGrid.types';
export type {
  GenDataGridCellCoord,
  GenDataGridRangeSelection,
  GenDataGridRangeSelections,
} from './features/range-selection/rangeSelection';
