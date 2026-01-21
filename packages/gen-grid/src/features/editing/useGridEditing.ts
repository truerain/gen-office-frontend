// packages/gen-grid/src/features/editing/useGridEditing.ts

import * as React from 'react';
import type { GenGridProps } from '../../GenGrid.types';
import type { useGridData } from '../data/useGridData';
import type { useDirtyState } from '../dirty/useDirtyState';

interface UseGridEditingArgs<TData> {
  props: GenGridProps<TData>;
  gridData: ReturnType<typeof useGridData<TData>>;
  dirty: ReturnType<typeof useDirtyState<TData>>;
}

export function useGridEditing<TData>({
  props,
  gridData,
  dirty,
}: UseGridEditingArgs<TData>) {
  const { setData } = gridData;
  const { getRowId, onDirtyChange, onCellValueChange } = props;

  /**
   * 상태 변경 알림 로직
   * - dirty 상태가 변경될 때 외부 콜백(onDirtyChange)을 호출합니다.
   */
  const notifyDirty = React.useCallback(() => {
    // markCellDirty가 state를 바꾼 직후이므로, 
    // 실제 isDirty() 값은 다음 렌더링에 반영되지만 
    // 여기서는 현재의 dirtyCells 맵을 기준으로 즉시 판단할 수도 있습니다.
    onDirtyChange?.(dirty.isDirty());
  }, [dirty, onDirtyChange]);

  /**
   * 셀 업데이트 핵심 로직
   */
  const updateCell = React.useCallback(
    (coord: { rowId: string; columnId: string }, nextValue: unknown) => {
      const { rowId, columnId } = coord;

      onCellValueChange?.({ rowId, columnId, value: nextValue });

     // 1. 원본(Baseline) 값과 비교하여 변경 여부 확인
      const baseRow = dirty.getBaselineRow(rowId) as any;
      const baseValue = baseRow ? baseRow[columnId] : undefined;
      const isNowDirty = !Object.is(baseValue, nextValue);

      // 2. 실제 데이터 업데이트 (Immutability 유지)
      setData((prev) => {
        const rows = prev ?? [];
        return rows.map((row) => {
          if (getRowId(row) !== rowId) return row;
          return { ...row, [columnId]: nextValue } as TData;
        });
      });

      // 3. Dirty 상태 마킹 (Map 업데이트)
      dirty.markCellDirty(rowId, columnId, isNowDirty);

      // 4. 변경 알림 통지
      notifyDirty();
    },
    [dirty, getRowId, setData, notifyDirty, onCellValueChange]
  );

  return {
    updateCell,
  };
}