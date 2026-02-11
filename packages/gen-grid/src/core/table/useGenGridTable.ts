// packages/gen-grid/src/core/table/useGenGridTable.ts
import * as React from 'react';
import {
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type ColumnPinningState,
  type ColumnSizingState,
} from '@tanstack/react-table';
import type { GenGridTreeOptions } from '../../GenGrid.types';

import {
  getLeafColumnDefs,
  getPinnedIdsFromMeta,
  buildInitialPinningState,
} from '../../features/pinning/pinningState';
import { useColumnPinningState } from '../../features/pinning/useColumnPinningState';

import { SELECTION_COLUMN_ID, useSelectionColumn, withSelectionColumn } from '../../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID, useRowNumberColumn, withRowNumberColumn } from '../../features/row-number/useRowNumberColumn';

import { ROW_STATUS_COLUMN_ID } from '../../features/row-status/rowStatus';
import { useRowStatusColumn, withRowStatusColumn } from '../../features/row-status/useRowStatusColumn';
import { useTreeRowModel } from '../../features/tree/useTreeRowModel';

import { GenGridTableActions } from './tanstack-table';

export type GenGridTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  getRowId: (row: TData) => string;

  // sorting
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;

  // ✅ row status
  enableRowStatus?: boolean;
  rowStatusHeader?: string; // (지금 컬럼 header는 ''로 고정이라, 나중에 쓰고 싶으면 useRowStatusColumn에서 반영)
  rowStatusWidth?: number;
  isRowDirty?: (rowId: string) => boolean;
  rowStatusResolver?: (rowId: string) => 'clean' | 'created' | 'updated' | 'deleted';

  // selection
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;

  enableGrouping?: boolean;
  grouping?: GroupingState;
  onGroupingChange?: (next: GroupingState) => void;

  expanded?: ExpandedState;
  onExpandedChange?: (next: ExpandedState) => void;

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

  // 액션 주입
  actions?: GenGridTableActions<TData>;
  tableMeta?: Record<string, any>;
  tree?: GenGridTreeOptions<TData>;

};

export function useGenGridTable<TData>(props: GenGridTableProps<TData>) {
  const {
    data,
    columns,

    sorting,
    onSortingChange,

    enableRowStatus,
    rowStatusWidth,
    isRowDirty,
    rowStatusResolver,

    enableRowSelection,
    rowSelection,
    onRowSelectionChange,

    enableGrouping,
    grouping,
    onGroupingChange,

    expanded,
    onExpandedChange,

    enableRowNumber,
    rowNumberHeader,
    rowNumberWidth,

    enablePagination,
    pagination,
    onPaginationChange,

    enableFiltering,
    columnFilters,
    onColumnFiltersChange,

    enableGlobalFilter,
    globalFilter,
    onGlobalFilterChange,

    enablePinning,
    columnPinning,
    onColumnPinningChange,

    enableColumnSizing,
    columnSizing,
    onColumnSizingChange,

    actions,
    tableMeta,
    tree,

    getRowId,
  } = props;

  const treeEnabled = Boolean(tree?.enabled);
  const treeModel = useTreeRowModel<TData>({ data, tree });
  const tableData = treeEnabled ? treeModel.visibleRows : data;

  // ---------- internal states ----------
  const [innerSorting, setInnerSorting] = React.useState<SortingState>([]);
  const [innerRowSelection, setInnerRowSelection] = React.useState<RowSelectionState>({});
  const [innerGrouping, setInnerGrouping] = React.useState<GroupingState>([]);
  const [innerExpanded, setInnerExpanded] = React.useState<ExpandedState>({});
  const [innerPagination, setInnerPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [innerColumnFilters, setInnerColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [innerGlobalFilter, setInnerGlobalFilter] = React.useState<string>('');
  const [innerColumnSizing, setInnerColumnSizing] = React.useState<ColumnSizingState>({});

  // ---------- user pinned from meta ----------
  const leafDefs = React.useMemo(() => getLeafColumnDefs(columns), [columns]);
  const userPinned = React.useMemo(() => getPinnedIdsFromMeta(leafDefs), [leafDefs]);

  // ✅ initial pinning includes system columns (rowStatus -> selection -> rowNumber)
  const initialPinning = React.useMemo(
    () =>
      buildInitialPinningState({
        systemLeft: [
          ...(enableRowStatus ? [ROW_STATUS_COLUMN_ID] : []),
          ...(enableRowSelection ? [SELECTION_COLUMN_ID] : []),
          ...(enableRowNumber ? [ROW_NUMBER_COLUMN_ID] : []),
        ],
        userLeft: userPinned.left,
        userRight: userPinned.right,
      }),
    [enableRowStatus, enableRowSelection, enableRowNumber, userPinned.left, userPinned.right]
  );

  const { columnPinning: innerColumnPinning, setColumnPinning: setInnerColumnPinning } =
    useColumnPinningState(initialPinning);

  // ---------- resolved states ----------
  const resolvedSorting = sorting ?? innerSorting;
  const resolvedRowSelection = rowSelection ?? innerRowSelection;
  const resolvedGrouping = grouping ?? innerGrouping;
  const resolvedExpanded = expanded ?? innerExpanded;
  const resolvedPagination = pagination ?? innerPagination;
  const resolvedColumnFilters = columnFilters ?? innerColumnFilters;
  const resolvedGlobalFilter = globalFilter ?? innerGlobalFilter;
  const resolvedColumnPinning = columnPinning ?? innerColumnPinning;
  const resolvedColumnSizing = columnSizing ?? innerColumnSizing;

  // ✅ create system columns
  const rowStatusColumn = useRowStatusColumn<TData>({
    enabled: !!enableRowStatus,
    width: rowStatusWidth ?? 44,
    isRowDirty,
    rowStatusResolver,
  });

  const selectionColumn = useSelectionColumn<TData>();

  const rowNumberColumn = useRowNumberColumn<TData>({
    header: rowNumberHeader ?? 'No.',
    width: rowNumberWidth ?? 56,
  });

  // compose columns: rowStatus -> selection -> rowNumber -> user columns
  const resolvedColumns = React.useMemo(() => {
    let next = columns;

    if (rowStatusColumn) {
      next = withRowStatusColumn(next, rowStatusColumn);
    }

    if (enableRowSelection) {
      next = withSelectionColumn(next, selectionColumn);
    }

    if (enableRowNumber) {
      next = withRowNumberColumn(next, rowNumberColumn);
    }

    return next;
  }, [
    columns,
    rowStatusColumn,
    enableRowSelection,
    selectionColumn,
    enableRowNumber,
    rowNumberColumn,
  ]);

  const enableAnyFiltering = !!enableFiltering || !!enableGlobalFilter;

  const treeWarningsRef = React.useRef<{
    sorting: boolean;
    pagination: boolean;
    grouping: boolean;
  }>({
    sorting: false,
    pagination: false,
    grouping: false,
  });

  React.useEffect(() => {
    if (!treeEnabled) {
      treeWarningsRef.current = { sorting: false, pagination: false, grouping: false };
      return;
    }

    const hasSortingInput = (resolvedSorting?.length ?? 0) > 0 || Boolean(onSortingChange);
    const hasPaginationInput =
      Boolean(enablePagination) || Boolean(pagination) || Boolean(onPaginationChange);
    const hasGroupingInput =
      Boolean(enableGrouping) ||
      (resolvedGrouping?.length ?? 0) > 0 ||
      Boolean(grouping) ||
      Boolean(onGroupingChange) ||
      Boolean(expanded) ||
      Boolean(onExpandedChange);

    if (hasSortingInput && !treeWarningsRef.current.sorting) {
      treeWarningsRef.current.sorting = true;
      // eslint-disable-next-line no-console
      console.warn('[GenGrid] tree mode: sorting is disabled and will be ignored.');
    }

    if (hasPaginationInput && !treeWarningsRef.current.pagination) {
      treeWarningsRef.current.pagination = true;
      // eslint-disable-next-line no-console
      console.warn('[GenGrid] tree mode: pagination is disabled and will be ignored.');
    }

    if (hasGroupingInput && !treeWarningsRef.current.grouping) {
      treeWarningsRef.current.grouping = true;
      // eslint-disable-next-line no-console
      console.warn('[GenGrid] tree mode: grouping/expanded is disabled and will be ignored.');
    }
  }, [
    treeEnabled,
    resolvedSorting,
    onSortingChange,
    enablePagination,
    pagination,
    onPaginationChange,
    enableGrouping,
    resolvedGrouping,
    grouping,
    onGroupingChange,
    expanded,
    onExpandedChange,
  ]);

  // meta 객체를 안정적으로 유지 (table instance 불필요 리렌더 방지)
  const meta = React.useMemo(() => {
    return {
      genGrid: actions,
      genGridTree: treeEnabled
        ? {
            treeColumnId: tree?.treeColumnId,
            indentPx: tree?.indentPx ?? 12,
            depthByRowId: treeModel.depthByRowId,
            hasChildrenByRowId: treeModel.hasChildrenByRowId,
            orphanRowIds: treeModel.orphanRowIds,
            orphanRowCount: treeModel.orphanRowIds.length,
            expandedRowIds: treeModel.expandedRowIds,
            isExpanded: treeModel.isExpanded,
            toggleRow: treeModel.toggleRow,
          }
        : undefined,
      ...(tableMeta ?? {}),
    };
  }, [actions, tableMeta, treeEnabled, tree, treeModel]);


  return useReactTable<TData>({
    data: tableData,
    columns: resolvedColumns,
    autoResetExpanded: false,
    state: {
      sorting: treeEnabled ? undefined : resolvedSorting,
      rowSelection: resolvedRowSelection,
      grouping: treeEnabled ? undefined : enableGrouping ? resolvedGrouping : undefined,
      expanded: treeEnabled ? undefined : enableGrouping ? resolvedExpanded : undefined,
      pagination: treeEnabled ? undefined : enablePagination ? resolvedPagination : undefined,
      columnFilters: enableFiltering ? resolvedColumnFilters : undefined,
      globalFilter: enableGlobalFilter ? resolvedGlobalFilter : undefined,
      columnPinning: resolvedColumnPinning,
      columnSizing: resolvedColumnSizing,
    },

    onSortingChange: (updater) => {
      if (treeEnabled) return;
      const next = typeof updater === 'function' ? updater(resolvedSorting) : updater;
      onSortingChange ? onSortingChange(next) : setInnerSorting(next);
    },

    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(resolvedRowSelection) : updater;
      onRowSelectionChange ? onRowSelectionChange(next) : setInnerRowSelection(next);
    },

    onGroupingChange: (updater) => {
      if (treeEnabled) return;
      if (!enableGrouping) return;
      const next = typeof updater === 'function' ? updater(resolvedGrouping) : updater;
      onGroupingChange ? onGroupingChange(next) : setInnerGrouping(next);
    },

    onExpandedChange: (updater) => {
      if (treeEnabled) return;
      if (!enableGrouping) return;
      const next = typeof updater === 'function' ? updater(resolvedExpanded) : updater;
      onExpandedChange ? onExpandedChange(next) : setInnerExpanded(next);
    },

    onPaginationChange: (updater) => {
      if (treeEnabled) return;
      if (!enablePagination) return;
      if (onPaginationChange) {
        onPaginationChange(typeof updater === 'function' ? updater(resolvedPagination) : updater);
      } else {
        setInnerPagination(updater);
      }
    },

    onColumnFiltersChange: (updater) => {
      if (!enableFiltering) return;
      if (onColumnFiltersChange) {
        onColumnFiltersChange(typeof updater === 'function' ? updater(resolvedColumnFilters) : updater);
      } else {
        setInnerColumnFilters(updater);
      }
    },

    onGlobalFilterChange: (updater) => {
      if (!enableGlobalFilter) return;
      if (onGlobalFilterChange) {
        onGlobalFilterChange(typeof updater === 'function' ? updater(resolvedGlobalFilter) : updater);
      } else {
        setInnerGlobalFilter(updater);
      }
    },

    onColumnPinningChange: (updater) => {
      if (!enablePinning) return;
      if (onColumnPinningChange) {
        onColumnPinningChange(typeof updater === 'function' ? updater(resolvedColumnPinning) : updater);
      } else {
        setInnerColumnPinning(updater);
      }
    },

    onColumnSizingChange: (updater) => {
      if (!enableColumnSizing) return;
      if (onColumnSizingChange) {
        onColumnSizingChange(typeof updater === 'function' ? updater(resolvedColumnSizing) : updater);
      } else {
        setInnerColumnSizing(updater);
      }
    },

    enableRowSelection: enableRowSelection ?? false,
    enableGrouping: treeEnabled ? false : enableGrouping ?? false,
    enableSorting: treeEnabled ? false : true,
    enableColumnResizing: enableColumnSizing ?? false,
    columnResizeMode: 'onChange',

    meta,
    
    getRowId,

    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: treeEnabled ? undefined : enableGrouping ? getGroupedRowModel() : undefined,
    getSortedRowModel: treeEnabled ? undefined : getSortedRowModel(),
    getFilteredRowModel: enableAnyFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: treeEnabled ? undefined : enablePagination ? getPaginationRowModel() : undefined,
    getExpandedRowModel: treeEnabled ? undefined : enableGrouping ? getExpandedRowModel() : undefined,
  });
}
