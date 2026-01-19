// packages/gen-grid/src/hooks/useGridInstance.ts

import * as React from 'react';
import type { GenGridHandle } from '../types/GenGridHandle';
import type { useGridData } from '../features/data/useGridData';
import type { useDirtyState } from '../features/dirty/useDirtyState';
import type { GenGridProps } from '../GenGrid.types';

interface UseGridInstanceArgs<TData> {
  ref: React.ForwardedRef<GenGridHandle<TData>>;
  props: GenGridProps<TData>;
  gridData: ReturnType<typeof useGridData<TData>>;
  dirty: ReturnType<typeof useDirtyState<TData>>;
  initialDefaultData: TData[]; // mount 시점의 데이터 (hardReset용)
}

/**
 * 외부에서 ref를 통해 호출하는 메서드들(revertAll, acceptChanges, load 등)을 관리하는 useGridInstance
 */
export function useGridInstance<TData>({
  ref,
  props,
  gridData,
  dirty,
  initialDefaultData,
}: UseGridInstanceArgs<TData>) {
  const { data, setData } = gridData;
  const { onDirtyChange } = props;

  React.useImperativeHandle(
    ref,
    (): GenGridHandle<TData> => ({
      // 1. 현재 데이터 조회
      getData: () => data ?? [],

      // 2. Dirty 상태 조회
      isDirty: () => dirty.isDirty(),
      getDirtyRowIds: () => dirty.getDirtyRowIds(),

      // 3. 모든 변경 사항 되돌리기 (Baseline으로 복구)
      revertAll: () => {
        setData(dirty.baseline);
        dirty.clearAllDirty();
        onDirtyChange?.(false);
      },

      // 4. 현재 상태를 Baseline으로 확정 (저장 후 호출)
      acceptChanges: () => {
        const currentData = data ?? [];
        dirty.setBaselineFromData(currentData);
        dirty.clearAllDirty();
        onDirtyChange?.(false);
      },

      // 5. 새로운 데이터 로드 (외부 API 호출 후 등)
      load: (nextData) => {
        const next = nextData ?? [];
        setData(next);
        dirty.setBaselineFromData(next);
        dirty.clearAllDirty();
        onDirtyChange?.(false);
      },

      // 6. 완전 초기 상태로 리셋 (Mount 시점 데이터)
      hardReset: () => {
        const init = initialDefaultData ?? [];
        setData(init);
        dirty.setBaselineFromData(init);
        dirty.clearAllDirty();
        onDirtyChange?.(false);
      },
    }),
    [data, dirty, onDirtyChange, setData, initialDefaultData]
  );
}