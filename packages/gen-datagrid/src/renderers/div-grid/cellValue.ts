// packages/gen-datagrid/src/renderers/div-grid/cellValue.ts
// Resolves baseline display values from simple TanStack column definitions.

import type { ColumnDef } from '@tanstack/react-table';

export function getCellValue<TData>(
  row: TData,
  rowIndex: number,
  column: ColumnDef<TData, unknown>
) {
  const accessorFn = (column as { accessorFn?: (row: TData, index: number) => unknown }).accessorFn;
  if (typeof accessorFn === 'function') {
    return accessorFn(row, rowIndex);
  }

  const accessorKey = (column as { accessorKey?: unknown }).accessorKey;
  if (typeof accessorKey === 'string' || typeof accessorKey === 'number') {
    return (row as Record<string, unknown>)[String(accessorKey)];
  }

  return undefined;
}

export function formatCellValue(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}
