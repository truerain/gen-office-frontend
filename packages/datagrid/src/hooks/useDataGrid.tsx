import * as React from 'react';

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
import type { UseDataGridOptions } from './useDataGrid.types';

// ✅ indeterminate checkbox (TanStack 권장 패턴)
function IndeterminateCheckbox(
  props: React.InputHTMLAttributes<HTMLInputElement> & { indeterminate?: boolean }
) {
  const { indeterminate, ...rest } = props;
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);

  return <input ref={ref} type="checkbox" {...rest} />;
}


export function useDataGrid<TData extends RowData>(options: UseDataGridOptions<TData>) {
  const {
    data,
    columns,
    enableSorting,
    enableFiltering,
    enablePagination,
    enableRowSelection,
    enableMultiSort,

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
  } = options;

  // ✅ selection column 자동 삽입
  const selectionColumn = React.useMemo<DataGridColumnDef<TData>>(
    () => ({
      id: '__select__',
      size: 44,
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IndeterminateCheckbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="Select all rows"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
            aria-label="Select row"
          />
        </div>
      ),
      meta: { width: 44 },
    }),
    []
  );

  const mergedColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns;
    return [selectionColumn, ...columns];
  }, [enableRowSelection, selectionColumn, columns]);

  const table = useReactTable({
    data,
    columns: mergedColumns,

    // ✅ row selection on
    enableRowSelection: Boolean(enableRowSelection),

    // state
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },

    // handlers
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onRowSelectionChange,
    onPaginationChange,

    // row models
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,

    // sorting
    enableMultiSort,
  });

  return table;
}