// packages/gen-grid/src/features/dirty/useDirtyState.ts

import * as React from 'react';

export type DirtyCells = Map<string, Set<string>>; // rowId -> columnKey set

interface UseDirtyStateArgs<TData> {
  initialBaseline: TData[];
  getRowId: (row: TData) => string;
}

export function useDirtyState<TData>(props: UseDirtyStateArgs<TData>) {
  const { initialBaseline, getRowId } = props;
  
  const [baseline, setBaseline] = React.useState<TData[]>(initialBaseline);           // 1. 원본 데이터 스냅샷 관리
  const [dirtyCells, setDirtyCells] = React.useState<DirtyCells>(() => new Map());    // 2. 변경된 셀 추적 (Map과 Set을 활용한 고성능 인덱싱)
  //const [dirtyKeys, setDirtyKeys] = React.useState<string[]>(() => []);

  // 3. 빠른 조회를 위한 Baseline 인덱싱
  const baselineIndex = React.useMemo(() => {
    const map = new Map<string, TData>();
    for (const row of baseline) {
      map.set(getRowId(row), row);
    }
    return map;
  }, [baseline, getRowId]);

  // --- Actions ---
  const setBaselineFromData = React.useCallback((nextBaseline: TData[]) => {
    setBaseline(nextBaseline);
  }, []);

  const clearAllDirty = React.useCallback(() => {
    setDirtyCells(new Map());
  }, []);
 
  
  const markCellDirty = React.useCallback((rowId: string, columnKey: string, isDirty: boolean) => {
    setDirtyCells((prev) => {
      const next = new Map(prev);
      const rowDirtyCols = new Set(next.get(rowId) ?? []);

      if (isDirty) {
        rowDirtyCols.add(columnKey);
      } else {
        rowDirtyCols.delete(columnKey);
      }

      if (rowDirtyCols.size === 0) {
        next.delete(rowId);
      } else {
        next.set(rowId, rowDirtyCols);
      }
      return next;
    });
  }, []);

  // --- Selectors (Derived State) ---
  const isDirty = React.useCallback(() => dirtyCells.size > 0, [dirtyCells]);
  const isRowDirty = React.useCallback(
    (rowId: string) => (dirtyCells.get(rowId)?.size ?? 0) > 0,
    [dirtyCells]
  );
  const isCellDirty = React.useCallback(
    (rowId: string, columnKey: string) => dirtyCells.get(rowId)?.has(columnKey) ?? false,
    [dirtyCells]
  );

  const getDirtyRowIds = React.useCallback(() => Array.from(dirtyCells.keys()), [dirtyCells]);

  const getBaselineRow = React.useCallback(
    (rowId: string) => baselineIndex.get(rowId),
    [baselineIndex]
  );

  return {
    baseline,
    baselineIndex,
    dirtyCells,

    // Setters
    setBaselineFromData,
    clearAllDirty,
    markCellDirty,
    
    // Getters
    isDirty,
    isRowDirty,
    isCellDirty,
    getDirtyRowIds,
    getBaselineRow,

    //dirtyKeys,
  };
}
