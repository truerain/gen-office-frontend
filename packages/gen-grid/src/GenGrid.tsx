// packages/gen-grid/src/GenGrid.tsx
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGridProvider } from './GenGridProvider';
import type { GenGridHandle, GenGridProps } from './types';
import { GenGridBase } from './GenGridBase';
import { useGridData } from './features/data/useGridData';
import { useDirtyState } from './features/dirty/useDirtyState';

// ✅ 추가
import { useGenGridTable } from './useGenGridTable';

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
  const { data, setData, isControlled } = useGridData(props);

  // ✅ data가 undefined일 수 있으니 baseline과 table에 동일하게 보장
  const resolvedData = data ?? [];

  // hardReset용: mount 시점 defaultData 저장 (uncontrolled에서만 의미 있음)
  const initialDefaultRef = React.useRef<TData[]>(
    'defaultData' in props ? props.defaultData ?? [] : []
  );

  // ✅ baseline 초기값은 항상 배열이어야 함
  const dirty = useDirtyState<TData>({
    initialBaseline: resolvedData,
    getRowId: props.getRowId,
  });

  // ✅ controlled에서 부모가 data를 새로 갈아끼우는 경우 baseline 리셋
  React.useEffect(() => {
    if (!isControlled) return;
    dirty.setBaselineFromData(resolvedData);
    dirty.clearAllDirty();
    props.onDirtyChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, resolvedData]);

  // ✅ useReactTable 대신 useGenGridTable 사용
  //    (중요) props.data 대신 resolvedData를 주입해서 undefined 방지
  const table = useGenGridTable<TData>({
    ...props,
    data: resolvedData,
  });

  const notifyDirty = React.useCallback(() => {
    props.onDirtyChange?.(dirty.isDirty());
  }, [dirty, props]);

  const updateCell = React.useCallback(
    (coord: { rowId: string; columnId: string }, nextValue: unknown) => {
      const columnKey = getAccessorKeyFromColumnId(props.columns, coord.columnId);
      if (!columnKey) return;

      const baseRow = dirty.getBaselineRow(coord.rowId) as any | undefined;
      const baseValue = baseRow ? baseRow[columnKey] : undefined;
      const nextIsDirty = !Object.is(baseValue, nextValue);

      setData((prev) =>
        (prev ?? []).map((r) => {
          if (props.getRowId(r) !== coord.rowId) return r;
          return { ...(r as any), [columnKey]: nextValue } as TData;
        })
      );

      dirty.markCellDirty(coord.rowId, columnKey, nextIsDirty);
      notifyDirty();
    },
    [dirty, notifyDirty, props, setData]
  );

  React.useImperativeHandle(
    ref,
    (): GenGridHandle<TData> => ({
      getData: () => resolvedData,
      isDirty: () => dirty.isDirty(),

      revertAll: () => {
        setData(dirty.baseline);
        dirty.clearAllDirty();
        props.onDirtyChange?.(false);
      },

      acceptChanges: () => {
        dirty.setBaselineFromData(resolvedData);
        dirty.clearAllDirty();
        props.onDirtyChange?.(false);
      },

      load: (nextData) => {
        const next = nextData ?? [];
        setData(next);
        dirty.setBaselineFromData(next);
        dirty.clearAllDirty();
        props.onDirtyChange?.(false);
      },

      hardReset: () => {
        const init = initialDefaultRef.current ?? [];
        setData(init);
        dirty.setBaselineFromData(init);
        dirty.clearAllDirty();
        props.onDirtyChange?.(false);
      },
    }),
    [dirty, props, resolvedData, setData]
  );

  return (
    <GenGridProvider table={table}>
      <GenGridBase<TData>
        table={table}
        caption={props.caption}
        height={props.height}
        maxHeight={props.maxHeight}
        enableStickyHeader={props.enableStickyHeader}
        headerHeight={props.headerHeight}
        rowHeight={props.rowHeight}
        enableVirtualization={props.enableVirtualization}
        overscan={props.overscan}
        enableFiltering={props.enableFiltering}
        enablePinning={props.enablePinning}
        enableColumnSizing={props.enableColumnSizing}
        enableRowSelection={props.enableRowSelection}
        enablePagination={props.enablePagination}
        pageSizeOptions={props.pageSizeOptions}
        onCellValueChange={updateCell}
        isCellDirty={(rowId, columnId) => dirty.isCellDirty(rowId, columnId)}
      />
    </GenGridProvider>
  );
}) as <TData>(
  props: GenGridProps<TData> & { ref?: React.Ref<GenGridHandle<TData>> }
) => React.ReactElement;
