// packages/gen-datagrid/src/renderers/div-grid/gridTemplate.ts
// Builds CSS grid column templates for the div-based DataGrid renderer.

import type { ColumnDef } from '@tanstack/react-table';

export const DEFAULT_COLUMN_WIDTH = 160;

export function getColumnId<TData>(column: ColumnDef<TData, unknown>, index: number) {
  const columnId = (column as { id?: string }).id;
  if (columnId) return columnId;

  const accessorKey = (column as { accessorKey?: unknown }).accessorKey;
  if (typeof accessorKey === 'string') return accessorKey;
  if (typeof accessorKey === 'number') return String(accessorKey);

  return `column_${index}`;
}

export function getColumnWidth<TData>(column: ColumnDef<TData, unknown>) {
  const size = (column as { size?: unknown }).size;
  return typeof size === 'number' && Number.isFinite(size) && size > 0
    ? size
    : DEFAULT_COLUMN_WIDTH;
}

export function buildGridTemplateColumns<TData>(columns: ColumnDef<TData, unknown>[]) {
  return columns.map((column) => `${getColumnWidth(column)}px`).join(' ');
}
