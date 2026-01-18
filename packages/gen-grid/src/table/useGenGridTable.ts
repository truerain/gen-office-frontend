// packages/gen-grid/src/useGenGridTable.ts
import * as React from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type ColumnPinningState,
  type ColumnSizingState 
} from '@tanstack/react-table';

import {
  getLeafColumnDefs,
  getPinnedIdsFromMeta,
  buildInitialPinningState,
} from '@/features/pinning/pinningState';
import { useColumnPinningState } from '@/features/pinning/useColumnPinningState';

import type { GenGridProps } from '@/GenGrid.types';
import { SELECTION_COLUMN_ID, useSelectionColumn, withSelectionColumn } from '@/features/selection/selection';
import { ROW_NUMBER_COLUMN_ID, useRowNumberColumn, withRowNumberColumn } from '@/features/row-number/useRowNumberColumn';
import { ROW_STATUS_COLUMN_ID } from '@/features/row-status/rowStatus';
import { useRowStatusColumn } from '@/features/row-status/useRowStatusColumn';



export type GenGridTableProps<TData> = {
  data: TData[];                       // ✅ 여기선 반드시 배열
  columns: ColumnDef<TData, any>[];
  getRowId: (row: TData) => string;

  // sorting
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;

  // selection
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;

  // row number
  enableRowNumber?: boolean;
  rowNumberHeader?: string;
  rowNumberWidth?: number;

  // pagination
  enablePagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;

  // filtering
  enableFiltering?: boolean;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (next: ColumnFiltersState) => void;

  // global filter
  enableGlobalFilter?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: (next: string) => void;

  // pinning
  enablePinning?: boolean;
  columnPinning?: ColumnPinningState;
  onColumnPinningChange?: (next: ColumnPinningState) => void;

  // sizing
  enableColumnSizing?: boolean;
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: (next: ColumnSizingState) => void;
};


export function useGenGridTable<TData>(props: GenGridTableProps<TData>) {
  const {
    data,
    columns,
    
    sorting,              // Step3: Sorting
    onSortingChange,
    
    enableRowSelection,   // Step4: Selection
    rowSelection,
    onRowSelectionChange,
    
    enableRowNumber,       // RowNumber column
    rowNumberHeader,       // default 'No.'
    rowNumberWidth,
    
    enablePagination,     // Step5: Pagination
    pagination,
    onPaginationChange,

    enableFiltering,      // Step6: Column Filtering 
    columnFilters,
    onColumnFiltersChange,
    
    enableGlobalFilter,   // Step6.5: Global Filtering
    globalFilter,
    onGlobalFilterChange,

    enablePinning,        // Step7: Pinning
    columnPinning,
    onColumnPinningChange,

    enableColumnSizing,         // Step8: Column Sizing
    columnSizing,
    onColumnSizingChange,

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

  const leafDefs = React.useMemo(() => getLeafColumnDefs(columns), [columns]);
  const userPinned = React.useMemo(() => getPinnedIdsFromMeta(leafDefs), [leafDefs]);

  const initialPinning = React.useMemo(
    () =>
      buildInitialPinningState({
        systemLeft: [
          ...(enableRowSelection ? [SELECTION_COLUMN_ID] : []),
          ...(enableRowNumber ? [ROW_NUMBER_COLUMN_ID] : []),
        ],
        userLeft: userPinned.left,
        userRight: userPinned.right,
      }),
    [enableRowSelection, enableRowNumber, userPinned.left, userPinned.right]
  );
  const { columnPinning: innerColumnPinning, setColumnPinning: setInnerColumnPinning } = useColumnPinningState(initialPinning);


  const [innerColumnSizing, setInnerColumnSizing] = React.useState<ColumnSizingState>({});    // Step8: 내부 컬럼 사이징 상태

  const resolvedSorting = sorting ?? innerSorting;                            // Step3: 정렬 상태 해결    
  const resolvedRowSelection = rowSelection ?? innerRowSelection;             // Step4: 선택 상태 해결
  const resolvedPagination = pagination ?? innerPagination;                   // Step5: 페이지네이션 상태 해결
  const resolvedColumnFilters = columnFilters ?? innerColumnFilters;          // Step6: 컬럼 필터링 상태 해결
  const resolvedGlobalFilter = globalFilter ?? innerGlobalFilter;             // Step6.5: 글로벌 필터 상태 해결
  const resolvedColumnPinning = columnPinning ?? innerColumnPinning;          // Step7: 컬럼 고정 상태 해결
  const resolvedColumnSizing = columnSizing ?? innerColumnSizing;             // Step8: 컬럼 사이징 상태 해결

  // Step4: 선택 컬럼을 columns 앞에 붙임
  const selectionColumn = useSelectionColumn<TData>();
  const rowNumberColumn = useRowNumberColumn<TData>({
        header: rowNumberHeader ?? 'No.',
        width: rowNumberWidth ?? 56,
      });
  
  // Columns에 RowNumber + Selection 컬럼 적용    
  const resolvedColumns = React.useMemo(() => {
      let next = columns;

      if (enableRowSelection) {
        next = withSelectionColumn(next, selectionColumn);
      }

      if (enableRowNumber) {
        next = withRowNumberColumn(next, rowNumberColumn); // ✅ selection 다음에 삽입
      }

      return next;
  }, [
      columns,
      enableRowSelection,
      selectionColumn,
      enableRowNumber,
      rowNumberColumn,
    ]);

  const enableAnyFiltering = !!enableFiltering || !!enableGlobalFilter;     // ✅ column/global 중 하나라도 켜져있으면 filtered row model ON

  return useReactTable<TData>({
    data,
    columns: resolvedColumns,
    state: {
      sorting: resolvedSorting,
      rowSelection: resolvedRowSelection,
      pagination: enablePagination ? resolvedPagination : undefined,          // Step5: pagination은 켰을 때만 상태 전달
      columnFilters: enableFiltering ? resolvedColumnFilters : undefined,     // Step6: filtering state 주입
      globalFilter: enableGlobalFilter ? resolvedGlobalFilter : undefined,    // Step6.5: global filtering은 켰을 때만 상태 전달
      columnPinning: resolvedColumnPinning,       // Step7: column pinning 설정 (켜져있든 아니든 상태 전달)
      columnSizing: resolvedColumnSizing          // Step8: column sizing 설정 (켜져있든 아니든 상태 전달)
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

    // Step6.5
    onGlobalFilterChange: (updater) => {
      if (!enableGlobalFilter) return;
      if (onGlobalFilterChange)  {
        onGlobalFilterChange(typeof updater === 'function' ? updater(resolvedGlobalFilter) : updater);
      } else {
        //console.log(updater);
       setInnerGlobalFilter(updater);
      }
    },
    
    // Step7 Column Pinning
    onColumnPinningChange: (updater) => {
      if (!enablePinning) return;
      if (onColumnPinningChange) {
        onColumnPinningChange( typeof updater === 'function' ? updater(resolvedColumnPinning) : updater );
      } else {
        setInnerColumnPinning(updater);
      }
    },

    onColumnSizingChange: (updater) => {
      if (!enableColumnSizing) return;

      if (onColumnSizingChange) {
        onColumnSizingChange(typeof updater === 'function' ? updater(resolvedColumnSizing) : updater)
      } else {
        setInnerColumnSizing(updater);    // ⭐ 핵심: updater 그대로 React에 위임 (stale 방지)
      }
    },
  
    enableRowSelection: enableRowSelection ?? false,
    enableColumnResizing: props.enableColumnSizing ?? false,
    columnResizeMode: 'onChange', // 드래그 중 즉시 반영 (onEnd로도 가능)
    getRowId,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: enableAnyFiltering ? getFilteredRowModel() : undefined,       // ✅ Step6: filtering row model은 켰을 때만
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined   // ✅ Step5: pagination row model은 켰을 때만
  });
}
