import type { Table } from '@tanstack/react-table';
import type { SelectedRange } from './types';

export type RangeBounds = {
  rowMin: number;
  rowMax: number;
  colMin: number;
  colMax: number;
  columnIds: string[];
};

export const SYSTEM_COLUMN_IDS = new Set<string>(['__select__', '__rowNumber__', '__row_status__']);

function toBounds(a: number, b: number) {
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

export function resolveRangeBounds<TData>(
  table: Table<TData>,
  selectedRange: SelectedRange
): RangeBounds | null {
  if (!selectedRange) return null;

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const visibleColumnIds = visibleColumns.map((col) => col.id);
  const firstVisibleColumnId = visibleColumnIds[0] ?? null;
  if (rows.length === 0 || visibleColumnIds.length === 0) return null;

  const rowIndexById = new Map<string, number>();
  rows.forEach((row, idx) => rowIndexById.set(row.id, idx));
  const colIndexById = new Map<string, number>();
  visibleColumnIds.forEach((columnId, idx) => colIndexById.set(columnId, idx));

  const anchorRow = rowIndexById.get(selectedRange.anchor.rowId);
  const focusRow = rowIndexById.get(selectedRange.focus.rowId);
  const anchorCol = colIndexById.get(selectedRange.anchor.columnId);
  const focusCol = colIndexById.get(selectedRange.focus.columnId);
  if (anchorRow == null || focusRow == null || anchorCol == null || focusCol == null) return null;

  const rowBounds = toBounds(anchorRow, focusRow);
  const isRowRange =
    firstVisibleColumnId != null && selectedRange.anchor.columnId === firstVisibleColumnId;
  const colBounds = isRowRange
    ? { min: 0, max: visibleColumnIds.length - 1 }
    : toBounds(anchorCol, focusCol);

  return {
    rowMin: rowBounds.min,
    rowMax: rowBounds.max,
    colMin: colBounds.min,
    colMax: colBounds.max,
    columnIds: visibleColumnIds.slice(colBounds.min, colBounds.max + 1),
  };
}

export function stringifyClipboardValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function toClipboardCell(value: string): string {
  if (!/[\t\n\r"]/ .test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function parseClipboardGrid(input: string): string[][] {
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.trim()) return [];

  const delimiter = normalized.includes('\t') ? '\t' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]!;
    const next = normalized[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      row.push(cell);
      cell = '';
      continue;
    }
    if (!inQuotes && ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }
    cell += ch;
  }

  row.push(cell);
  rows.push(row);
  return rows;
}