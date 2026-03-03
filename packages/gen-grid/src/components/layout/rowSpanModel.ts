import type { Table } from '@tanstack/react-table';
import { getMeta } from './utils';

const KEY_SEP = '\u0000';

function toCellKey(rowId: string, columnId: string): string {
  return `${rowId}${KEY_SEP}${columnId}`;
}

export type RowSpanModel = {
  enabled: boolean;
  isCovered: (rowId: string, columnId: string) => boolean;
  getRowSpan: (rowId: string, columnId: string) => number;
  getAnchorRowId: (rowId: string, columnId: string) => string | undefined;
};

const EMPTY_MODEL: RowSpanModel = {
  enabled: false,
  isCovered: () => false,
  getRowSpan: () => 1,
  getAnchorRowId: () => undefined,
};

type RowSpanComparator = (a: unknown, b: unknown, args: { columnId: string }) => boolean;

type RunState = {
  anchorKey: string;
  value: unknown;
  comparator: RowSpanComparator;
};

export function buildRowSpanModel<TData>(
  table: Table<TData>,
  enabled: boolean
): RowSpanModel {
  if (!enabled) return EMPTY_MODEL;

  const rows = table.getRowModel().rows;
  const anchorSpanByKey = new Map<string, number>();
  const coveredKeys = new Set<string>();
  const coveredToAnchorRowId = new Map<string, string>();
  const runByColumn = new Map<string, RunState>();

  for (const row of rows) {
    const isGroupRow = Boolean(row.getCanExpand?.());
    if (isGroupRow) {
      runByColumn.clear();
      continue;
    }

    for (const cell of row.getVisibleCells()) {
      const columnId = cell.column.id;
      const key = toCellKey(row.id, columnId);
      const meta = getMeta(cell.column.columnDef) as any;

      const rowSpanRule = meta?.rowSpan as
        | boolean
        | ((args: { row: unknown; rowId: string; columnId: string }) => boolean)
        | undefined;

      const cellCanSpan =
        rowSpanRule === true
          ? true
          : typeof rowSpanRule === 'function'
            ? Boolean(
                rowSpanRule({
                  row: row.original,
                  rowId: row.id,
                  columnId,
                })
              )
            : false;

      if (!cellCanSpan) {
        runByColumn.delete(columnId);
        continue;
      }

      const valueGetter = meta?.rowSpanValueGetter as
        | ((args: { row: unknown; rowId: string; columnId: string; value: unknown }) => unknown)
        | undefined;
      const comparator =
        (meta?.rowSpanComparator as RowSpanComparator | undefined) ??
        ((a: unknown, b: unknown) => Object.is(a, b));

      const rawValue = cell.getValue();
      const mergeValue = valueGetter
        ? valueGetter({
            row: row.original,
            rowId: row.id,
            columnId,
            value: rawValue,
          })
        : rawValue;

      const prev = runByColumn.get(columnId);
      if (prev && prev.comparator(prev.value, mergeValue, { columnId })) {
        coveredKeys.add(key);
        const anchorRowId = prev.anchorKey.slice(0, prev.anchorKey.indexOf(KEY_SEP));
        coveredToAnchorRowId.set(key, anchorRowId);
        anchorSpanByKey.set(prev.anchorKey, (anchorSpanByKey.get(prev.anchorKey) ?? 1) + 1);
        runByColumn.set(columnId, {
          ...prev,
          value: mergeValue,
        });
        continue;
      }

      anchorSpanByKey.set(key, 1);
      runByColumn.set(columnId, {
        anchorKey: key,
        value: mergeValue,
        comparator,
      });
    }
  }

  return {
    enabled: true,
    isCovered: (rowId: string, columnId: string) => coveredKeys.has(toCellKey(rowId, columnId)),
    getRowSpan: (rowId: string, columnId: string) =>
      anchorSpanByKey.get(toCellKey(rowId, columnId)) ?? 1,
    getAnchorRowId: (rowId: string, columnId: string) =>
      coveredToAnchorRowId.get(toCellKey(rowId, columnId)),
  };
}

