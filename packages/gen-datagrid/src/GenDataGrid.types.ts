// packages/gen-datagrid/src/GenDataGrid.types.ts
// Defines the baseline public props for GenDataGrid.

import type * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

export type GenDataGridActiveCell = {
  rowId: string;
  columnId: string;
} | null;

export type GenDataGridProps<TData> = {
  data?: TData[];
  defaultData?: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
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
