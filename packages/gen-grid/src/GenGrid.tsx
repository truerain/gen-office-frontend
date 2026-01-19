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

  // 4. TanStack Table 엔진 셋업
  const table = useGenGridTable<TData>({
    ...props,
    data: gridData.data ?? [],
    isRowDirty: dirty.isRowDirty
  });

// 5. 데이터 버전 변경 시 Dirty 리셋 (Effect)
  React.useEffect(() => {
    console.log('GenGrid: dataVersion changed, resetting dirty baseline');
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
