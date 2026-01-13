// packages/datagrid/src/gen-grid/types.ts
import type {
  ColumnDef,
  RowSelectionState,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  ColumnPinningState
} from '@tanstack/react-table';

export type GenGridProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  caption?: string;
  className?: string;

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
  
  getRowId?: (originalRow: TData, index: number) => string;
};
