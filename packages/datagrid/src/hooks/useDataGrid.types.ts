
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type RowData,
  type OnChangeFn,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  type PaginationState as TablePaginationState,
} from '@tanstack/react-table';
import type { DataGridColumnDef } from '../types';

export interface UseDataGridOptions<TData extends RowData> {
  data: TData[];
  columns: DataGridColumnDef<TData>[];
  
  // Features
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  
  // State
  sorting?: SortingState;
  columnFilters?: ColumnFiltersState;
  columnVisibility?: VisibilityState;
  rowSelection?: RowSelectionState;
  pagination?: TablePaginationState;
  
  // Handlers
  onSortingChange?: OnChangeFn<SortingState>;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onPaginationChange?: OnChangeFn<TablePaginationState>;
  
  // Pagination options
  pageSize?: number;
  pageIndex?: number;
}
