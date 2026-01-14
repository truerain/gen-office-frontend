// packages/datagrid/src/gen-grid/types.ts
import type {
  ColumnDef,
  RowSelectionState,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  ColumnPinningState,
  ColumnSizingState
} from '@tanstack/react-table';

export type GenGridProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  caption?: string;
  className?: string;

  headerHeight?: number;      // Header row height (px) default: 40
  rowHeight?: number;         // Body row height (px) default: 36
  
  // sorting (Step3)
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;

  // selection (Step4)
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;

  // pagination (Step5)
  enablePagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;
  pageSizeOptions?: number[];

  // column filtering (Step6)
  enableFiltering?: boolean;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (next: ColumnFiltersState) => void;
  
   // global filtering (Step6.5)
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (next: string) => void;

  // Step7: pinning
  enablePinning?: boolean;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: (next: ColumnPinningState) => void;
  
  // Step8:  sizing (Step8)
  enableColumnSizing?: boolean;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: (next: ColumnSizingState) => void;

  // Step9: vertical scroll + sticky header
  maxHeight?: number | string;        // ex) 420, '60vh'
  enableStickyHeader?: boolean;       // default true when maxHeight is set

  getRowId?: (originalRow: TData, index: number) => string;
};
