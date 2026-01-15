import * as React from 'react';
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import type { GenGridHandle } from './types/GenGridHandle';
import { useGridDataUncontrolled } from './features/data/useGridDataUncontrolled';
import { useDirtyState } from './features/dirty/useDirtyState';

// ✅ 기존에 있던 presentational GenGrid (table을 받아 렌더만 하는 컴포넌트)
import { GenGridBase } from './GenGridBase';

type CellCoord = { rowId: string; columnKey: string };

export type GenGridUncontrolledProps<TData> = {
  columns: ColumnDef<TData, any>[];
  defaultData: TData[];
  getRowId: (row: TData) => string;

  /** 내부 데이터가 바뀔 때 snapshot 통지(선택) */
  onDataChange?: (next: TData[]) => void;

  /** 기존 GenGrid 옵션들 (필요한 것만 pass-through) */
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableFiltering?: boolean;
};

export const GenGridUncontrolled = React.forwardRef(function GenGridUncontrolledInner<TData>(
  props: GenGridUncontrolledProps<TData>,
  ref: React.ForwardedRef<GenGridHandle<TData>>
) {
  const {
    columns,
    defaultData,
    getRowId,
    onDataChange,
    enablePinning,
    enableColumnSizing,
    enableFiltering,
  } = props;

  // mount 시점 초기 defaultData 저장 (hardReset 용)
  const initialRef = React.useRef<TData[]>(defaultData);

  const gridData = useGridDataUncontrolled<TData>({
    defaultData,
    onDataChange,
  });

  const dirty = useDirtyState<TData>({
    initialBaseline: defaultData,
    getRowId,
  });

  // table 생성 (data는 내부 state를 사용)
  const table = useReactTable({
    data: gridData.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    // sorting/filtering 등은 v1에서는 생략 가능
  });

  /**
   * ✅ 셀 커밋 시 실제 데이터 반영 + dirty 계산
   * - columnKey는 "accessorKey"로 들어온다고 가정 (v1 권장)
   */
  const updateCell = React.useCallback(
    ({ rowId, columnKey }: CellCoord, nextValue: unknown) => {
      // baseline 값과 비교해서 dirty 판정
      const baseRow = dirty.getBaselineRow(rowId) as any | undefined;
      const baseValue = baseRow ? baseRow[columnKey] : undefined;
      const nextIsDirty = !Object.is(baseValue, nextValue);

      // data 업데이트
      gridData.setData((prev) =>
        prev.map((r) => {
          if (getRowId(r) !== rowId) return r;
          return { ...(r as any), [columnKey]: nextValue } as TData;
        })
      );

      // dirty map 업데이트
      dirty.markCellDirty(rowId, columnKey, nextIsDirty);
    },
    [dirty, getRowId, gridData]
  );

  // ✅ ref handle 제공
  React.useImperativeHandle(
    ref,
    (): GenGridHandle<TData> => ({
      getData: () => gridData.data,

      isDirty: () => dirty.isDirty(),

      revertAll: () => {
        gridData.setData(dirty.baseline);
        dirty.clearAllDirty();
        // active/edit/selection 같은 UI state는 GenGrid 내부 정책에 맞게 추가 초기화 가능
      },

      acceptChanges: () => {
        dirty.setBaselineFromData(gridData.data);
        dirty.clearAllDirty();
      },

      load: (nextData) => {
        gridData.setData(nextData);
        dirty.setBaselineFromData(nextData);
        dirty.clearAllDirty();
        // active/edit/selection/sort/filter 초기화 정책 필요하면 여기서 처리
      },

      hardReset: () => {
        const init = initialRef.current;
        gridData.setData(init);
        dirty.setBaselineFromData(init);
        dirty.clearAllDirty();
      },
    }),
    [dirty, gridData]
  );

  return (
    <GenGridBase
      table={table}
      enablePinning={enablePinning}
      enableColumnSizing={enableColumnSizing}
      enableFiltering={enableFiltering}
      /** ✅ GenGridBody → useCellEditing.updateValue로 연결되게 해줘야 함 */
      onCellValueChange={(coord: { rowId: string; columnId: string }, value: unknown) => {
        // 여기서 columnId는 "accessorKey"라고 가정
        updateCell({ rowId: coord.rowId, columnKey: coord.columnId }, value);
      }}
      /** (선택) dirty 표시를 셀에 적용하려면 isCellDirty도 내려서 data-dirty에 붙이기 */
      isCellDirty={(rowId: string, columnId: string) => dirty.isCellDirty(rowId, columnId)}
    />
  );
}) as <TData>(
  props: GenGridUncontrolledProps<TData> & { ref?: React.Ref<GenGridHandle<TData>> }
) => React.ReactElement;
