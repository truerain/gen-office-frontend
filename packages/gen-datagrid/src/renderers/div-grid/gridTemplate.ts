// packages/gen-datagrid/src/renderers/div-grid/gridTemplate.ts
// Builds CSS grid column templates for the div-based DataGrid renderer.

import type { Column, ColumnDef } from '@tanstack/react-table';

import type { GenDataGridColumnFitMode } from '../../GenDataGrid.types';

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

function formatGridWidth(width: number) {
  return Number.isInteger(width) ? String(width) : width.toFixed(3).replace(/\.?0+$/, '');
}

export function buildGridTemplateColumnsFromModel<TData>(
  columns: Column<TData, unknown>[],
  columnFitMode: GenDataGridColumnFitMode = 'none',
  availableWidth?: number
) {
  const columnWidths = columns.map((column) => column.getSize());
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const shouldGrow =
    columnFitMode === 'grow' &&
    typeof availableWidth === 'number' &&
    Number.isFinite(availableWidth) &&
    availableWidth > totalWidth &&
    totalWidth > 0;

  return columnWidths
    .map((width) => {
      if (!shouldGrow) return String(width) + 'px';
      const grownWidth = width + (availableWidth - totalWidth) * (width / totalWidth);
      return formatGridWidth(grownWidth) + 'px';
    })
    .join(' ');
}
