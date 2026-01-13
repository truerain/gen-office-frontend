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

    enableFiltering,      // Step6: Column Filtering 
    columnFilters,
    onColumnFiltersChange,
    
    enableGlobalFilter,   // Step6.5: Global Filtering
    globalFilter,
    onGlobalFilterChange,

    getRowId
  } = props;

  const [innerSorting, setInnerSorting] = React.useState<SortingState>([]);                   // Step3: 내부 정렬 상태
  const [innerRowSelection, setInnerRowSelection] = React.useState<RowSelectionState>({});    // Step4: 내부 선택 상태
  const [innerPagination, setInnerPagination] = React.useState<PaginationState>({             // Step5: 내부 페이지네이션 상태
    pageIndex: 0,
    pageSize: 10
  });
  const [innerColumnFilters, setInnerColumnFilters] = React.useState<ColumnFiltersState>([]); // Step6: 내부 필터링 상태 
  const [innerGlobalFilter, setInnerGlobalFilter] = React.useState<string>('');               // Step6.5: 내부 글로벌 필터 상태

  const resolvedSorting = sorting ?? innerSorting;                            // Step3: 정렬 상태 해결    
  const resolvedRowSelection = rowSelection ?? innerRowSelection;             // Step4: 선택 상태 해결
  const resolvedPagination = pagination ?? innerPagination;                   // Step5: 페이지네이션 상태 해결
  const resolvedColumnFilters = columnFilters ?? innerColumnFilters;          // Step6: 컬럼 필터링 상태 해결
  const resolvedGlobalFilter = globalFilter ?? innerGlobalFilter;             // Step6.5: 글로벌 필터 상태 해결

  // Step4: 선택 컬럼을 columns 앞에 붙임
  const selectionColumn = useSelectionColumn<TData>();
  const resolvedColumns = React.useMemo(() => {
    return enableRowSelection ? withSelectionColumn(columns, selectionColumn) : columns;
  }, [enableRowSelection, columns, selectionColumn]);

  const enableAnyFiltering = !!enableFiltering || !!enableGlobalFilter;     // ✅ column/global 중 하나라도 켜져있으면 filtered row model ON

  return useReactTable({
    data,
    columns: resolvedColumns,
    state: {
      sorting: resolvedSorting,
      rowSelection: resolvedRowSelection,
      pagination: enablePagination ? resolvedPagination : undefined,          // Step5: pagination은 켰을 때만 상태 전달
      columnFilters: enableFiltering ? resolvedColumnFilters : undefined,     // Step6: filtering state 주입
      globalFilter: enableGlobalFilter ? resolvedGlobalFilter : undefined    // Step6.5: global filtering은 켰을 때만 상태 전달
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

    // ✅ Step6.5
    onGlobalFilterChange: (updater) => {
      if (!enableGlobalFilter) return;
      if (onGlobalFilterChange)  {
        onGlobalFilterChange(typeof updater === 'function' ? updater(resolvedGlobalFilter) : updater);
      } else {
        console.log(updater);
       setInnerGlobalFilter(updater);
      }
    },

    enableRowSelection: enableRowSelection ?? false,
    getRowId,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: enableAnyFiltering ? getFilteredRowModel() : undefined,       // ✅ Step6: filtering row model은 켰을 때만
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined   // ✅ Step5: pagination row model은 켰을 때만
  });
}
