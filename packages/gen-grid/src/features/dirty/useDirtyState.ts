// packages/gen-grid/src/features/dirty/useDirtyState.ts

import * as React from 'react';

export type DirtyCells = Map<string, Set<string>>; // rowId -> columnKey set

export function useDirtyState<TData>(args: {
  initialBaseline: TData[];
  getRowId: (row: TData) => string;
}) {
  const { initialBaseline, getRowId } = args;

  const [baseline, setBaseline] = React.useState<TData[]>(initialBaseline);
  const [dirtyKeys, setDirtyKeys] = React.useState<string[]>(() => []);
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

// ✅ Row dirty: 해당 row에 dirty cell이 하나라도 있으면 dirty
  const isRowDirty = React.useCallback(
    (rowId: string) => (dirtyCells.get(rowId)?.size ?? 0) > 0,
    [dirtyCells]
  );

  const getDirtyRowIds = React.useCallback(() => Array.from(dirtyCells.keys()), [dirtyCells]);

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
    console.log('setBaselineFromData called');
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

    dirtyKeys,
    dirtyCells,
    clearAllDirty,

    isDirty,
    isRowDirty,
    getDirtyRowIds,
    isCellDirty,

    markCellDirty,
    getBaselineRow,
  };
}
