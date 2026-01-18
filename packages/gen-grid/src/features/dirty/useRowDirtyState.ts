// src/features/dirty/useRowDirtyState.ts

import * as React from 'react';

type RowId = string;

export function useRowDirtyState<TData>(args: {
  initialBaseline: TData[];
  getRowId: (row: TData) => RowId;
  dirtyKeys: string[];
}) {
  const { getRowId, dirtyKeys } = args;

  const [baselineMap, setBaselineMap] = React.useState(() => {
    const m = new Map<RowId, TData>();
    for (const r of args.initialBaseline) m.set(getRowId(r), r);
    return m;
  });

  const [dirtyRows, setDirtyRows] = React.useState<Set<RowId>>(() => new Set());

  const isDirty = React.useCallback(() => dirtyRows.size > 0, [dirtyRows]);
  const isRowDirty = React.useCallback((rowId: RowId) => dirtyRows.has(rowId), [dirtyRows]);

  const recalcRow = React.useCallback(
    (rowId: RowId, nextRow: TData) => {
      const base = baselineMap.get(rowId) as any;
      const next = nextRow as any;

      let same = true;
      for (const k of dirtyKeys) {
        if (!Object.is(base?.[k], next?.[k])) {
          same = false;
          break;
        }
      }

      setDirtyRows((prev) => {
        const s = new Set(prev);
        if (same) s.delete(rowId);
        else s.add(rowId);
        return s;
      });
    },
    [baselineMap, dirtyKeys]
  );

  const resetBaseline = React.useCallback(
    (rows: TData[]) => {
      const m = new Map<RowId, TData>();
      for (const r of rows) m.set(getRowId(r), r);
      setBaselineMap(m);
      setDirtyRows(new Set());
    },
    [getRowId]
  );

  const acceptChanges = React.useCallback(
    (currentRows: TData[]) => resetBaseline(currentRows),
    [resetBaseline]
  );

  const getDirtyRowIds = React.useCallback(() => Array.from(dirtyRows), [dirtyRows]);

  return { recalcRow, resetBaseline, acceptChanges, isDirty, isRowDirty, getDirtyRowIds };
}
