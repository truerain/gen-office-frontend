import * as React from 'react';
import type { Row, Table } from '@tanstack/react-table';
import type { ActiveCell } from '../active-cell/types';
import type { SelectedRange } from './types';
import {
  parseClipboardGrid,
  resolveRangeBounds,
  stringifyClipboardValue,
  SYSTEM_COLUMN_IDS,
  toClipboardCell,
} from './clipboard';

export function useClipboardActions<TData>(args: {
  table: Table<TData>;
  rows: Row<TData>[];
  selectedRange: SelectedRange;
  activeCell: ActiveCell;
  onCellValueChange?: (coord: { rowId: string; columnId: string }, value: unknown) => void;
}) {
  const { table, rows, selectedRange, activeCell, onCellValueChange } = args;

  const rangeBounds = React.useMemo(
    () => resolveRangeBounds(table, selectedRange),
    [table, selectedRange]
  );

  const canCopy = Boolean(rangeBounds);
  const pasteStartCell = selectedRange?.anchor ?? activeCell;
  const canPaste = Boolean(pasteStartCell && onCellValueChange);

  const rowById = React.useMemo(() => new Map(rows.map((row) => [row.id, row] as const)), [rows]);

  const canEditCell = React.useCallback(
    (rowId: string, columnId: string) => {
      if (SYSTEM_COLUMN_IDS.has(columnId)) return false;
      const column = table.getColumn(columnId);
      if (!column) return false;
      const meta = (column.columnDef.meta ?? {}) as any;
      const row = rowById.get(rowId)?.original;
      if (typeof meta?.editable === 'function') {
        if (row == null || !meta.editable({ row, rowId, columnId })) return false;
      }
      if (meta?.editable === false) return false;
      if (!meta?.editable && !meta?.renderEditor && !meta?.editType) return false;
      return true;
    },
    [rowById, table]
  );

  const copyToClipboard = React.useCallback(
    async (withHeader: boolean) => {
      if (!rangeBounds) return;

      const lines: string[] = [];
      if (withHeader) {
        const headerLine = rangeBounds.columnIds
          .map((columnId) => {
            const column = table.getColumn(columnId);
            if (!column) return columnId;
            const headerDef = (column.columnDef as any).header;
            if (typeof headerDef === 'string' || typeof headerDef === 'number') {
              return String(headerDef);
            }
            return column.id;
          })
          .map(toClipboardCell)
          .join('\t');
        lines.push(headerLine);
      }

      for (let rowIndex = rangeBounds.rowMin; rowIndex <= rangeBounds.rowMax; rowIndex++) {
        const row = rows[rowIndex];
        if (!row) continue;
        const line = rangeBounds.columnIds
          .map((columnId) => {
            const column = table.getColumn(columnId);
            const meta = (column?.columnDef.meta ?? {}) as any;
            let value = row.getValue(columnId);
            if (typeof meta?.exportValue === 'function') {
              const exported = meta.exportValue({
                value,
                row: row.original,
                rowId: row.id,
                columnId,
              });
              if (exported !== undefined) value = exported;
            }
            return toClipboardCell(stringifyClipboardValue(value));
          })
          .join('\t');
        lines.push(line);
      }

      try {
        await navigator.clipboard.writeText(lines.join('\n'));
      } catch {
        // clipboard permission denied or unavailable
      }
    },
    [rangeBounds, rows, table]
  );

  const coercePastedValue = React.useCallback((raw: string, meta: any): unknown => {
    const text = raw ?? '';
    if (meta?.editType === 'number') {
      const trimmed = text.trim();
      if (trimmed === '') return '';
      const num = Number(trimmed);
      return Number.isFinite(num) ? num : text;
    }
    if (meta?.editType === 'checkbox') {
      const lowered = text.trim().toLowerCase();
      if (['true', '1', 'y', 'yes', 'on'].includes(lowered)) return true;
      if (['false', '0', 'n', 'no', 'off'].includes(lowered)) return false;
      return Boolean(text);
    }
    return text;
  }, []);

  const pasteFromClipboard = React.useCallback(async () => {
    if (!onCellValueChange || !pasteStartCell) return;

    let text = '';
    try {
      text = await navigator.clipboard.readText();
    } catch {
      return;
    }

    const grid = parseClipboardGrid(text);
    if (!grid.length) return;

    const visibleColumns = table.getVisibleLeafColumns();
    const visibleColumnIds = visibleColumns.map((column) => column.id);
    const rowIndexById = new Map(rows.map((row, idx) => [row.id, idx] as const));
    const colIndexById = new Map(visibleColumnIds.map((columnId, idx) => [columnId, idx] as const));

    const startRowIndex = rowIndexById.get(pasteStartCell.rowId);
    const startColIndex = colIndexById.get(pasteStartCell.columnId);
    if (startRowIndex == null || startColIndex == null) return;

    for (let r = 0; r < grid.length; r++) {
      const targetRowIndex = startRowIndex + r;
      if (targetRowIndex >= rows.length) break;
      const targetRow = rows[targetRowIndex]!;
      const values = grid[r]!;

      for (let c = 0; c < values.length; c++) {
        const targetColIndex = startColIndex + c;
        if (targetColIndex >= visibleColumnIds.length) break;
        const targetColumnId = visibleColumnIds[targetColIndex]!;

        if (!canEditCell(targetRow.id, targetColumnId)) continue;

        const column = table.getColumn(targetColumnId);
        const meta = (column?.columnDef.meta ?? {}) as any;
        const nextValue = coercePastedValue(values[c] ?? '', meta);
        onCellValueChange({ rowId: targetRow.id, columnId: targetColumnId }, nextValue);
      }
    }
  }, [canEditCell, coercePastedValue, onCellValueChange, pasteStartCell, rows, table]);

  return {
    canCopy,
    canPaste,
    copyToClipboard,
    pasteFromClipboard,
  };
}