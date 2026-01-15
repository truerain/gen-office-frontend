// packages/gen-grid/src/features/dirty/useDirtyState.ts

import * as React from 'react';

export type DirtyCells = Map<string, Set<string>>; // rowId -> columnKey set

export function useDirtyState<TData>(args: {
  initialBaseline: TData[];
  getRowId: (row: TData) => string;
}) {
  const { initialBaseline, getRowId } = args;

  const [baseline, setBaseline] = React.useState<TData[]>(initialBaseline);
  const [dirtyCells, setDirtyCells] = React.useState<DirtyCells>(() => new Map());

  const baselineIndex = React.useMemo(() => {
    const m = new Map<string, TData>();
    for (const r of baseline) m.set(getRowId(r), r);
    return m;
  }, [baseline, getRowId]);

  const clearAllDirty = React.useCallback(() => {
    setDirtyCells(new Map());
  }, []);

  const isDirty = React.useCallback(() => dirtyCells.size > 0, [dirtyCells]);

  const isCellDirty = React.useCallback(
    (rowId: string, columnKey: string) => dirtyCells.get(rowId)?.has(columnKey) ?? false,
    [dirtyCells]
  );

  const markCellDirty = React.useCallback(
    (rowId: string, columnKey: string, dirty: boolean) => {
      setDirtyCells((prev) => {
        const next = new Map(prev);
        const cols = new Set(next.get(rowId) ?? []);

        if (dirty) cols.add(columnKey);
        else cols.delete(columnKey);

        if (cols.size === 0) next.delete(rowId);
        else next.set(rowId, cols);

        return next;
      });
    },
    []
  );

  const setBaselineFromData = React.useCallback((nextBaseline: TData[]) => {
    setBaseline(nextBaseline);
  }, []);

  const getBaselineRow = React.useCallback(
    (rowId: string) => baselineIndex.get(rowId),
    [baselineIndex]
  );

  return {
    baseline,
    setBaselineFromData,
    baselineIndex,

    dirtyCells,
    clearAllDirty,
    isDirty,
    isCellDirty,

    markCellDirty,
    getBaselineRow,
  };
}
