// packages/gen-grid/src/GenGrid.tsx
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGridProvider } from './core/context/GenGridProvider';
import type { GenGridProps } from './GenGrid.types';
import type { GenGridHandle } from './types/GenGridHandle';

import { useGridEditing } from './features/editing/useGridEditing';

import { GenGridBase } from './components/base/GenGridBase';
import { useGridData } from './features/data/useGridData';
import { useDirtyState } from './features/dirty/useDirtyState';

import { useGenGridTable } from './core/table/useGenGridTable';
import { useGridInstance } from './hooks/useGridInstance';

function getAccessorKeyFromColumnId<TData>(
  columns: ColumnDef<TData, any>[],
  columnId: string
): string | null {
  return columnId;
}

export const GenGrid = React.forwardRef(function GenGridInner<TData>(
  props: GenGridProps<TData>,
  ref: React.ForwardedRef<GenGridHandle<TData>>
) {
  // 1. 기초 데이터 및 초기값 보관
  const gridData = useGridData(props);
  const initialDefaultRef = React.useRef<TData[]>(        // hardReset용: mount 시점 defaultData 저장 (uncontrolled에서만 의미 있음)
    'defaultData' in props ? props.defaultData ?? [] : []
  );

  // 2. 기능별 비즈니스 로직 훅
  const dirty = useDirtyState<TData>({                    // baseline 초기값은 항상 배열이어야 함
    initialBaseline: gridData.data ?? [],
    getRowId: props.getRowId,
  });
  const { updateCell } = useGridEditing({ props, gridData, dirty });

  // 3. 외부 API 노출 (Imperative Handle)
  useGridInstance({
    ref,
    props,
    gridData,
    dirty,
    initialDefaultData: initialDefaultRef.current
  });

  const actions = React.useMemo(() => {
    return {
      setData: gridData.setData,
      deleteRow: (rowId: string) => {
        // ✅ 여기서 "단일 진입점"으로 삭제 로직 수행
        gridData.setData(prev => prev.filter((_, idx) => {
          // rowId 기반으로 지우려면 getRowId 필요.
          // 가장 안전한 방식은 table rowId 기준으로 지우는 것.
          // 일단 기본은 props.getRowId 있으면 그걸로 매칭:
          if (!props.getRowId) {
            // getRowId가 없다면 row.id(=tanstack rowId)로는 prev에서 찾기 어려움
            // => 이 경우는 "getRowId 필수"로 정책을 두는 걸 강력 추천
            return true;
          }
          return props.getRowId(prev[idx] as any) !== rowId;
        }));

        // 삭제 후 dirty/selection/activeCell 정리는 다음 단계에서 actions에 같이 넣으면 됨
      },
    };
  }, [gridData.setData, props.getRowId]);

  // 4. TanStack Table 엔진 셋업
  const table = useGenGridTable<TData>({
    ...props,
    data: gridData.data ?? [],
    isRowDirty: dirty.isRowDirty,
    actions,
  });

// 5. 데이터 버전 변경 시 Dirty 리셋 (Effect)
  React.useEffect(() => {
    dirty.setBaselineFromData(gridData.data ?? []);
    dirty.clearAllDirty();
    props.onDirtyChange?.(false);
  }, [props.dataVersion]);

  const notifyDirty = React.useCallback(() => {
    props.onDirtyChange?.(dirty.isDirty());
  }, [dirty, props]);

 
  return (
    <GenGridProvider table={table}>
      <GenGridBase<TData>
        {...props} // 혹은 필요한 것만 선별 전달
        table={table}
        onCellValueChange={updateCell}
        isRowDirty={dirty.isRowDirty}
        isCellDirty={dirty.isCellDirty}
      />
    </GenGridProvider>
  );
}) as <TData>(
  props: GenGridProps<TData> & { ref?: React.Ref<GenGridHandle<TData>> }
) => React.ReactElement;
