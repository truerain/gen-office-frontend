// packages/gen-datagrid/src/features/range-selection/clipboard.ts
// Builds clipboard text from GenDataGrid range selection state.

import type { Table } from '@tanstack/react-table';

import {
  resolveRangeSelectionBounds,
  type GenDataGridRangeSelection,
} from './rangeSelection';

export type GenDataGridClipboardOptions = {
  includeHeader?: boolean;
};

export function stringifyClipboardValue(value: unknown) {
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

export function toClipboardCell(value: string) {
  if (!/[\t\n\r"]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function getColumnHeaderText<TData>(table: Table<TData>, columnId: string) {
  const column = table.getColumn(columnId);
  const header = column?.columnDef.header;
  if (typeof header === 'string' || typeof header === 'number') return String(header);
  return columnId;
}

export function buildClipboardMatrix<TData>({
  table,
  selection,
  includeHeader = false,
}: {
  table: Table<TData>;
  selection: GenDataGridRangeSelection | null;
  includeHeader?: boolean;
}) {
  const rows = table.getRowModel().rows;
  const rowIds = rows.map((row) => row.id);
  const columnIds = table.getVisibleLeafColumns().map((column) => column.id);
  const bounds = resolveRangeSelectionBounds({ rowIds, columnIds, selection });
  if (!bounds) return [];

  const matrix: string[][] = [];
  if (includeHeader) {
    matrix.push(bounds.columnIds.map((columnId) => getColumnHeaderText(table, columnId)));
  }

  for (let rowIndex = bounds.rowMin; rowIndex <= bounds.rowMax; rowIndex++) {
    const row = rows[rowIndex];
    if (!row) continue;
    matrix.push(
      bounds.columnIds.map((columnId) => stringifyClipboardValue(row.getValue(columnId)))
    );
  }

  return matrix;
}

export function serializeClipboardMatrix(matrix: string[][]) {
  return matrix.map((row) => row.map(toClipboardCell).join('\t')).join('\n');
}

export function parseClipboardGrid(input: string) {
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.trim()) return [];

  const delimiter = normalized.includes('\t') ? '\t' : ',';
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index++) {
    const char = normalized[index]!;
    const next = normalized[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell);
      cell = '';
      continue;
    }

    if (!inQuotes && char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);
  if (rows.length > 1 && rows[rows.length - 1]?.length === 1 && rows[rows.length - 1]?.[0] === '') {
    rows.pop();
  }
  return rows;
}
