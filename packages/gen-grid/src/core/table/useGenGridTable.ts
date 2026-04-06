// packages/gen-grid/src/core/table/useGenGridTable.ts
import * as React from 'react';
import {
  getCoreRowModel,
  getExpandedRowModel,
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
  type VisibilityState,
} from '@tanstack/react-table';
import type { GenGridTreeOptions } from '../../GenGrid.types';

import {
  getLeafColumnDefs,
  getPinnedIdsFromMeta,
  buildInitialPinningState,
} from '../../features/pinning/pinningState';
import { useColumnPinningState } from '../../features/pinning/useColumnPinningState';

import { SELECTION_COLUMN_ID, useSelectionColumn } from '../../features/row-selection/rowSelection';
import { ROW_NUMBER_COLUMN_ID, useRowNumberColumn } from '../../features/row-number/useRowNumberColumn';

import { ROW_STATUS_COLUMN_ID } from '../../features/row-status/rowStatus';
import { useRowStatusColumn } from '../../features/row-status/useRowStatusColumn';
import { useTreeRowModel } from '../../features/tree/useTreeRowModel';

import { genGridOperatorFilterFn } from '../../features/filtering/filterModel';

import { GenGridTableActions } from './tanstack-table';

export type GenGridTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  getRowId: (row: TData) => string;

  // sorting
  sorting?: SortingState;
  onSortingChange?: (next: SortingState) => void;

  // row status
  enableRowStatus?: boolean;
  rowStatusHeader?: string; // currently fixed to '' in UI; keep for future extension
  rowStatusWidth?: number;
  isRowDirty?: (rowId: string) => boolean;
  rowStatusResolver?: (rowId: string) => 'clean' | 'created' | 'updated' | 'deleted';

  // selection
  checkboxSelection?: boolean;
  checkboxSelectionMode?: 'all' | 'createdOnly';
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;

  enableGrouping?: boolean;
  grouping?: GroupingState;
  onGroupingChange?: (next: GroupingState) => void;
  rowSpanning?: boolean;

  expanded?: ExpandedState;
  onExpandedChange?: (next: ExpandedState) => void;

  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (next: VisibilityState) => void;

  // row number
  enableRowNumber?: boolean;
  rowNumberHeader?: string;
  rowNumberWidth?: number;

  // pagination
  enablePagination?: boolean;
  pagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;
  totalRowCount?: number;

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

  // actions
  actions?: GenGridTableActions<TData>;
  tableMeta?: Record<string, any>;
  tree?: GenGridTreeOptions<TData>;

};

function annotateUserCellRendererMeta<TData>(
  defs: readonly ColumnDef<TData, any>[]
): ColumnDef<TData, any>[] {
  return defs.map((def) => {
    const typed = def as ColumnDef<TData, any> & {
      columns?: readonly ColumnDef<TData, any>[];
      meta?: Record<string, unknown>;
    };
    const hasUserCellRenderer = typeof typed.cell === 'function';
    const nextMeta = {
      ...(typed.meta ?? {}),
      __genGridHasUserCellRenderer: hasUserCellRenderer,
    };

    if (typed.columns?.length) {
      return {
        ...typed,
        meta: nextMeta,
        columns: annotateUserCellRendererMeta(typed.columns),
      } as ColumnDef<TData, any>;
    }

    return {
      ...typed,
      meta: nextMeta,
    } as ColumnDef<TData, any>;
  });
}

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

    checkboxSelection,
    checkboxSelectionMode,
    rowSelection,
    onRowSelectionChange,

    enableGrouping,
    grouping,
    onGroupingChange,
    rowSpanning,

    expanded,
    onExpandedChange,

    columnVisibility,
    onColumnVisibilityChange,

    enableRowNumber,
    rowNumberHeader,
    rowNumberWidth,

    enablePagination,
    pagination,
    onPaginationChange,
    totalRowCount,

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
  const rowSpanningEnabled = Boolean(rowSpanning);
  const treeModel = useTreeRowModel<TData>({ data, tree });
  const tableData = treeEnabled ? treeModel.visibleRows : data;

  // ---------- internal states ----------
  const [innerSorting, setInnerSorting] = React.useState<SortingState>([]);
  const [innerRowSelection, setInnerRowSelection] = React.useState<RowSelectionState>({});
  const [innerGrouping, setInnerGrouping] = React.useState<GroupingState>([]);
  const [innerExpanded, setInnerExpanded] = React.useState<ExpandedState>({});
  const [innerColumnFilters, setInnerColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [innerGlobalFilter, setInnerGlobalFilter] = React.useState<string>('');
  const [innerColumnSizing, setInnerColumnSizing] = React.useState<ColumnSizingState>({});
  const [innerColumnVisibility, setInnerColumnVisibility] = React.useState<VisibilityState>({});

  // ---------- user pinned from meta ----------
  const leafDefs = React.useMemo(() => getLeafColumnDefs(columns), [columns]);
  const userPinned = React.useMemo(() => getPinnedIdsFromMeta(leafDefs), [leafDefs]);

  // initial pinning includes system columns (rowStatus -> selection -> rowNumber)
  const initialPinning = React.useMemo(
    () =>
      buildInitialPinningState({
        systemLeft: [
          ...(enableRowStatus ? [ROW_STATUS_COLUMN_ID] : []),
          ...(checkboxSelection ? [SELECTION_COLUMN_ID] : []),
          ...(enableRowNumber ? [ROW_NUMBER_COLUMN_ID] : []),
        ],
        userLeft: userPinned.left,
        userRight: userPinned.right,
      }),
    [enableRowStatus, checkboxSelection, enableRowNumber, userPinned.left, userPinned.right]
  );

  const { columnPinning: innerColumnPinning, setColumnPinning: setInnerColumnPinning } =
    useColumnPinningState(initialPinning);

  // ---------- resolved states ----------
  const resolvedSorting = sorting ?? innerSorting;
  const resolvedRowSelection = rowSelection ?? innerRowSelection;
  const resolvedGrouping = grouping ?? innerGrouping;
  const resolvedExpanded = expanded ?? innerExpanded;
  const resolvedPagination = pagination ?? { pageIndex: 0, pageSize: 10 };
  const resolvedColumnFilters = columnFilters ?? innerColumnFilters;
  const resolvedGlobalFilter = globalFilter ?? innerGlobalFilter;
  const resolvedColumnPinning = columnPinning ?? innerColumnPinning;
  const resolvedColumnSizing = columnSizing ?? innerColumnSizing;
  const resolvedColumnVisibility = columnVisibility ?? innerColumnVisibility;

  // create system columns
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

  const annotatedColumns = React.useMemo(
    () => annotateUserCellRendererMeta(columns),
    [columns]
  );

  // compose columns in a single pass to keep render/nav order stable:
  // rowStatus -> selection -> rowNumber -> user columns
  const resolvedColumns = React.useMemo(() => {
    const systemColumns: ColumnDef<TData, any>[] = [];
    if (rowStatusColumn) systemColumns.push(rowStatusColumn);
    if (checkboxSelection) systemColumns.push(selectionColumn);
    if (enableRowNumber) systemColumns.push(rowNumberColumn);
    return [...systemColumns, ...annotatedColumns];
  }, [
    annotatedColumns,
    rowStatusColumn,
    checkboxSelection,
    selectionColumn,
    enableRowNumber,
    rowNumberColumn,
  ]);

  const enableAnyFiltering = !!enableFiltering || !!enableGlobalFilter;
  const resolvedTotalRowCount = React.useMemo(() => {
    if (typeof totalRowCount === 'number' && Number.isFinite(totalRowCount)) {
      return Math.max(0, Math.floor(totalRowCount));
    }
    return tableData.length;
  }, [totalRowCount, tableData.length]);
  const resolvedPageCount = React.useMemo(() => {
    if (!enablePagination) return undefined;
    const pageSize = Math.max(1, Math.floor(resolvedPagination.pageSize || 1));
    return Math.max(0, Math.ceil(resolvedTotalRowCount / pageSize));
  }, [enablePagination, resolvedPagination.pageSize, resolvedTotalRowCount]);

  const treeWarningsRef = React.useRef<{
    sorting: boolean;
    pagination: boolean;
    grouping: boolean;
  }>({
    sorting: false,
    pagination: false,
    grouping: false,
  });

  const rowSpanWarningsRef = React.useRef<{ sorting: boolean }>({ sorting: false });

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

  React.useEffect(() => {
    if (!rowSpanningEnabled) {
      rowSpanWarningsRef.current = { sorting: false };
      return;
    }

    const hasSortingInput = (resolvedSorting?.length ?? 0) > 0 || Boolean(onSortingChange);
    if (hasSortingInput && !rowSpanWarningsRef.current.sorting) {
      rowSpanWarningsRef.current.sorting = true;
      // eslint-disable-next-line no-console
      console.warn('[GenGrid] rowSpanning mode: sorting is disabled and will be ignored.');
    }
  }, [rowSpanningEnabled, resolvedSorting, onSortingChange]);

  // keep meta object stable to avoid unnecessary table instance re-renders
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
    defaultColumn: {
      filterFn: genGridOperatorFilterFn,
    },
    autoResetExpanded: false,
    state: {
      sorting: treeEnabled || rowSpanningEnabled ? undefined : resolvedSorting,
      rowSelection: resolvedRowSelection,
      grouping: treeEnabled ? undefined : enableGrouping ? resolvedGrouping : undefined,
      expanded: treeEnabled ? undefined : enableGrouping ? resolvedExpanded : undefined,
      pagination: treeEnabled ? undefined : enablePagination ? resolvedPagination : undefined,
      columnFilters: enableFiltering ? resolvedColumnFilters : undefined,
      globalFilter: enableGlobalFilter ? resolvedGlobalFilter : undefined,
      columnPinning: resolvedColumnPinning,
      columnSizing: resolvedColumnSizing,
      columnVisibility: resolvedColumnVisibility,
    },

    onSortingChange: (updater) => {
      if (treeEnabled || rowSpanningEnabled) return;
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
      if (!onPaginationChange) return;
      onPaginationChange(typeof updater === 'function' ? updater(resolvedPagination) : updater);
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

    onColumnVisibilityChange: (updater) => {
      const next = typeof updater === 'function' ? updater(resolvedColumnVisibility) : updater;
      if (onColumnVisibilityChange) {
        onColumnVisibilityChange(next);
      } else {
        setInnerColumnVisibility(next);
      }
    },

    enableRowSelection: (row) => {
      if (!checkboxSelection) return false;
      if (checkboxSelectionMode === 'createdOnly') {
        if (!rowStatusResolver) return false;
        return rowStatusResolver(String(row.id)) === 'created';
      }
      return true;
    },
    enableGrouping: treeEnabled ? false : enableGrouping ?? false,
    enableSorting: treeEnabled || rowSpanningEnabled ? false : true,
    enableColumnResizing: enableColumnSizing ?? false,
    columnResizeMode: 'onChange',
    manualPagination: Boolean(enablePagination),
    pageCount: treeEnabled ? undefined : resolvedPageCount,

    meta,
    
    getRowId,

    getCoreRowModel: getCoreRowModel(),
    getGroupedRowModel: treeEnabled ? undefined : enableGrouping ? getGroupedRowModel() : undefined,
    getSortedRowModel: treeEnabled || rowSpanningEnabled ? undefined : getSortedRowModel(),
    getFilteredRowModel: enableAnyFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: undefined,
    getExpandedRowModel: treeEnabled ? undefined : enableGrouping ? getExpandedRowModel() : undefined,
  });
}
