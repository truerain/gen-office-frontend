// packages/gen-datagrid/src/core/table/useDataGridTable.ts
// Creates the TanStack table model used by the div-based DataGrid renderer.

import * as React from 'react';
import {
  getFilteredRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnFiltersState,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type OnChangeFn,
  type PaginationState,
  type Updater,
  type VisibilityState,
} from '@tanstack/react-table';

import type { GenDataGridProps } from '../../GenDataGrid.types';

function resolveUpdater<TState>(updater: Updater<TState>, previous: TState) {
  return typeof updater === 'function'
    ? (updater as (old: TState) => TState)(previous)
    : updater;
}

export function useDataGridTable<TData>({
  data,
  defaultData,
  columns,
  getRowId,
  columnOrder,
  defaultColumnOrder,
  onColumnOrderChange,
  columnVisibility,
  defaultColumnVisibility,
  onColumnVisibilityChange,
  columnSizing,
  defaultColumnSizing,
  onColumnSizingChange,
  columnPinning,
  defaultColumnPinning,
  onColumnPinningChange,
  columnFilters,
  defaultColumnFilters,
  onColumnFiltersChange,
  globalFilter,
  defaultGlobalFilter,
  onGlobalFilterChange,
  pagination,
  defaultPagination,
  onPaginationChange,
  filterMode = 'client',
  paginationMode = 'client',
  totalRowCount,
  enableColumnSizing = true,
  enablePagination = false,
}: GenDataGridProps<TData>) {
  const rows = data ?? defaultData ?? [];
  const [uncontrolledColumnOrder, setUncontrolledColumnOrder] =
    React.useState<ColumnOrderState>(() => defaultColumnOrder ?? []);
  const [uncontrolledColumnVisibility, setUncontrolledColumnVisibility] =
    React.useState<VisibilityState>(() => defaultColumnVisibility ?? {});
  const [uncontrolledColumnSizing, setUncontrolledColumnSizing] =
    React.useState<ColumnSizingState>(() => defaultColumnSizing ?? {});
  const [uncontrolledColumnPinning, setUncontrolledColumnPinning] =
    React.useState<ColumnPinningState>(() => defaultColumnPinning ?? {});
  const [uncontrolledColumnFilters, setUncontrolledColumnFilters] =
    React.useState<ColumnFiltersState>(() => defaultColumnFilters ?? []);
  const [uncontrolledGlobalFilter, setUncontrolledGlobalFilter] =
    React.useState<unknown>(() => defaultGlobalFilter ?? '');
  const [uncontrolledPagination, setUncontrolledPagination] =
    React.useState<PaginationState>(() => defaultPagination ?? { pageIndex: 0, pageSize: 10 });

  const resolvedColumnOrder = columnOrder ?? uncontrolledColumnOrder;
  const resolvedColumnVisibility = columnVisibility ?? uncontrolledColumnVisibility;
  const resolvedColumnSizing = columnSizing ?? uncontrolledColumnSizing;
  const resolvedColumnPinning = columnPinning ?? uncontrolledColumnPinning;
  const resolvedColumnFilters = columnFilters ?? uncontrolledColumnFilters;
  const resolvedGlobalFilter =
    globalFilter !== undefined ? globalFilter : uncontrolledGlobalFilter;
  const resolvedPagination = pagination ?? uncontrolledPagination;

  const handleColumnOrderChange = React.useCallback<OnChangeFn<ColumnOrderState>>(
    (updater) => {
      const next = resolveUpdater(updater, resolvedColumnOrder);
      if (columnOrder === undefined) {
        setUncontrolledColumnOrder(next);
      }
      onColumnOrderChange?.(next);
    },
    [columnOrder, onColumnOrderChange, resolvedColumnOrder]
  );

  const handleColumnVisibilityChange = React.useCallback<OnChangeFn<VisibilityState>>(
    (updater) => {
      const next = resolveUpdater(updater, resolvedColumnVisibility);
      if (columnVisibility === undefined) {
        setUncontrolledColumnVisibility(next);
      }
      onColumnVisibilityChange?.(next);
    },
    [columnVisibility, onColumnVisibilityChange, resolvedColumnVisibility]
  );

  const handleColumnSizingChange = React.useCallback<OnChangeFn<ColumnSizingState>>(
    (updater) => {
      const next = resolveUpdater(updater, resolvedColumnSizing);
      if (columnSizing === undefined) {
        setUncontrolledColumnSizing(next);
      }
      onColumnSizingChange?.(next);
    },
    [columnSizing, onColumnSizingChange, resolvedColumnSizing]
  );

  const handleColumnPinningChange = React.useCallback<OnChangeFn<ColumnPinningState>>(
    (updater) => {
      const next = resolveUpdater(updater, resolvedColumnPinning);
      if (columnPinning === undefined) {
        setUncontrolledColumnPinning(next);
      }
      onColumnPinningChange?.(next);
    },
    [columnPinning, onColumnPinningChange, resolvedColumnPinning]
  );

  const handleColumnFiltersChange = React.useCallback<OnChangeFn<ColumnFiltersState>>(
    (updater) => {
      const next = resolveUpdater(updater, resolvedColumnFilters);
      if (columnFilters === undefined) {
        setUncontrolledColumnFilters(next);
      }
      onColumnFiltersChange?.(next);
    },
    [columnFilters, onColumnFiltersChange, resolvedColumnFilters]
  );

  const handleGlobalFilterChange = React.useCallback<OnChangeFn<unknown>>(
    (updater) => {
      const next = resolveUpdater(updater, resolvedGlobalFilter);
      if (globalFilter === undefined) {
        setUncontrolledGlobalFilter(next);
      }
      onGlobalFilterChange?.(next);
    },
    [globalFilter, onGlobalFilterChange, resolvedGlobalFilter]
  );

  const handlePaginationChange = React.useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = resolveUpdater(updater, resolvedPagination);
      if (pagination === undefined) {
        setUncontrolledPagination(next);
      }
      onPaginationChange?.(next);
    },
    [onPaginationChange, pagination, resolvedPagination]
  );

  return useReactTable({
    data: rows,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: filterMode === 'client' ? getFilteredRowModel() : undefined,
    getPaginationRowModel:
      enablePagination && paginationMode === 'client' ? getPaginationRowModel() : undefined,
    state: {
      columnOrder: resolvedColumnOrder,
      columnVisibility: resolvedColumnVisibility,
      columnSizing: resolvedColumnSizing,
      columnPinning: resolvedColumnPinning,
      columnFilters: resolvedColumnFilters,
      globalFilter: resolvedGlobalFilter,
      pagination: resolvedPagination,
    },
    onColumnOrderChange: handleColumnOrderChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnPinningChange: handleColumnPinningChange,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: handlePaginationChange,
    manualFiltering: filterMode === 'manual',
    manualPagination: paginationMode === 'manual',
    rowCount: paginationMode === 'manual' ? totalRowCount ?? rows.length : undefined,
    enableColumnResizing: enableColumnSizing,
    columnResizeMode: 'onChange',
  });
}
