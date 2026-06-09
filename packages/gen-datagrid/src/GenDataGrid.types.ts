// packages/gen-datagrid/src/GenDataGrid.types.ts
// Defines the baseline public props for GenDataGrid.

import type * as React from 'react';
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnSizingState,
  VisibilityState,
} from '@tanstack/react-table';

import type { GenDataGridRangeSelections } from './features/range-selection/rangeSelection';

export type GenDataGridActiveCell = {
  rowId: string;
  columnId: string;
} | null;

export type GenDataGridHandle = {
  rootElement: HTMLDivElement | null;
  clearSelection: () => void;
  copySelection: (options?: { includeHeader?: boolean }) => Promise<boolean>;
};

export type GenDataGridProps<TData> = {
  data?: TData[];
  defaultData?: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  enableRangeSelection?: boolean;
  selectedRanges?: GenDataGridRangeSelections;
  defaultSelectedRanges?: GenDataGridRangeSelections;
  onSelectedRangesChange?: (next: GenDataGridRangeSelections) => void;
  enableClipboard?: boolean;
  clipboardOptions?: {
    includeHeader?: boolean;
  };
  columnOrder?: ColumnOrderState;
  defaultColumnOrder?: ColumnOrderState;
  onColumnOrderChange?: (next: ColumnOrderState) => void;
  columnVisibility?: VisibilityState;
  defaultColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (next: VisibilityState) => void;
  columnSizing?: ColumnSizingState;
  defaultColumnSizing?: ColumnSizingState;
  onColumnSizingChange?: (next: ColumnSizingState) => void;
  gridId?: string;
  getGridId?: () => string;
  activeCell?: GenDataGridActiveCell;
  defaultActiveCell?: GenDataGridActiveCell;
  onActiveCellChange?: (next: GenDataGridActiveCell) => void;
  rowHeight?: number;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  headerHeight?: number;
  className?: string;
  style?: React.CSSProperties;
};
