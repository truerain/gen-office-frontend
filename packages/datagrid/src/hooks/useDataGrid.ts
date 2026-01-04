//import { useMemo } from 'react';

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

export function useDataGrid<TData extends RowData>(options: UseDataGridOptions<TData>) {
  const {
    data,
    columns,
    enableSorting = true,
    enableFiltering = true,
    enablePagination = false,
    enableRowSelection = false,
    enableMultiSort = false,
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
    pagination,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    onPaginationChange,
    pageSize = 10,
    pageIndex = 0,
  } = options;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    
    // Only include state properties if they are provided (for controlled mode)
    // If undefined, omit them to allow TanStack Table to use internal state (uncontrolled mode)
    state: {
      ...(sorting !== undefined && { sorting }),
      ...(columnFilters !== undefined && { columnFilters }),
      ...(columnVisibility !== undefined && { columnVisibility }),
      ...(rowSelection !== undefined && { rowSelection }),
      ...(pagination !== undefined && { pagination }),
    },
    
    // Only include handlers if they are provided (for controlled mode)
    ...(onSortingChange !== undefined && { onSortingChange }),
    ...(onColumnFiltersChange !== undefined && { onColumnFiltersChange }),
    ...(onColumnVisibilityChange !== undefined && { onColumnVisibilityChange }),
    ...(onRowSelectionChange !== undefined && { onRowSelectionChange }),
    ...(onPaginationChange !== undefined && { onPaginationChange }),
    
    enableRowSelection,
    enableSorting,
    enableMultiSort,
    enableColumnFilters: enableFiltering,
    
    // Initial pagination settings (for uncontrolled mode)
    // These are only used when pagination state is not provided
    initialState: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    
    manualPagination: false,
    autoResetPageIndex: false,
  });

  return table;
}