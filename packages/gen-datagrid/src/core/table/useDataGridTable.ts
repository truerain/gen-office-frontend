// packages/gen-datagrid/src/core/table/useDataGridTable.ts
// Creates the TanStack table model used by the div-based DataGrid renderer.

import * as React from 'react';
import {
  getCoreRowModel,
  useReactTable,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type OnChangeFn,
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

  const resolvedColumnOrder = columnOrder ?? uncontrolledColumnOrder;
  const resolvedColumnVisibility = columnVisibility ?? uncontrolledColumnVisibility;
  const resolvedColumnSizing = columnSizing ?? uncontrolledColumnSizing;
  const resolvedColumnPinning = columnPinning ?? uncontrolledColumnPinning;

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

  return useReactTable({
    data: rows,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder: resolvedColumnOrder,
      columnVisibility: resolvedColumnVisibility,
      columnSizing: resolvedColumnSizing,
      columnPinning: resolvedColumnPinning,
    },
    onColumnOrderChange: handleColumnOrderChange,
    onColumnVisibilityChange: handleColumnVisibilityChange,
    onColumnSizingChange: handleColumnSizingChange,
    onColumnPinningChange: handleColumnPinningChange,
  });
}
