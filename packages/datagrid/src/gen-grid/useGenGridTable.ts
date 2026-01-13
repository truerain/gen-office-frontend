// packages/datagrid/src/gen-grid/useGenGridTable.ts
import * as React from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState
} from '@tanstack/react-table';

import type { GenGridProps } from './types';
import { useSelectionColumn, withSelectionColumn } from './features/selection';

export function useGenGridTable<TData>(props: GenGridProps<TData>) {
  const {
    data,
    columns,
    
    sorting,              // Step3: Sorting
    onSortingChange,
    
    enableRowSelection,   // Step4: Selection
    rowSelection,
    onRowSelectionChange,
    
    enablePagination,     // Step5: Pagination
    pagination,
    onPaginationChange,

    enableFiltering,      // Step6: Filtering ✅
    columnFilters,
    onColumnFiltersChange,

    getRowId
  } = props;

  const [innerSorting, setInnerSorting] = React.useState<SortingState>([]);                   // Step3: 내부 정렬 상태
  const [innerRowSelection, setInnerRowSelection] = React.useState<RowSelectionState>({});    // Step4: 내부 선택 상태
  const [innerPagination, setInnerPagination] = React.useState<PaginationState>({             // Step5: 내부 페이지네이션 상태
    pageIndex: 0,
    pageSize: 10
  });
  const [innerColumnFilters, setInnerColumnFilters] = React.useState<ColumnFiltersState>([]); // Step6: 내부 필터링 상태 
  
  const resolvedSorting = sorting ?? innerSorting;                            // Step3: 정렬 상태 해결    
  const resolvedRowSelection = rowSelection ?? innerRowSelection;             // Step4: 선택 상태 해결
  const resolvedPagination = pagination ?? innerPagination;
   const resolvedColumnFilters = columnFilters ?? innerColumnFilters;

  // Step4: 선택 컬럼을 columns 앞에 붙임
  const selectionColumn = useSelectionColumn<TData>();
  const resolvedColumns = React.useMemo(() => {
    return enableRowSelection ? withSelectionColumn(columns, selectionColumn) : columns;
  }, [enableRowSelection, columns, selectionColumn]);



  return useReactTable({
    data,
    columns: resolvedColumns,
    state: {
      sorting: resolvedSorting,
      rowSelection: resolvedRowSelection,
      pagination: enablePagination ? resolvedPagination : undefined,
      columnFilters: enableFiltering ? resolvedColumnFilters : undefined
    },
    
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(resolvedSorting) : updater;
      if (onSortingChange) onSortingChange(next);
      else setInnerSorting(next);
    },
    
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(resolvedRowSelection) : updater;
      if (onRowSelectionChange) onRowSelectionChange(next);
      else setInnerRowSelection(next);
    },

    onPaginationChange: (updater) => {
      if (!enablePagination) return;

      if (onPaginationChange) {
        onPaginationChange(
          typeof updater === 'function'
            ? updater(resolvedPagination)
            : updater
        );
      } else {
        setInnerPagination(updater); // ✅ 핵심
      }
    },

    onColumnFiltersChange: (updater) => {
      if (!enableFiltering) return;
      if (onColumnFiltersChange) {
        onColumnFiltersChange(
          typeof updater === 'function' ? updater(resolvedColumnFilters) : updater
        );
      } else {
        setInnerColumnFilters(updater);
      }
    },

    enableRowSelection: enableRowSelection ?? false,
    getRowId,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,       // ✅ Step6: filtering row model은 켰을 때만
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined   // ✅ Step5: pagination row model은 켰을 때만
  });
}
