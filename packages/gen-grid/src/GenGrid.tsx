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
  // 1. 湲곗큹 ?곗씠??諛?珥덇린媛?蹂닿?
  const gridData = useGridData(props);
  const initialDefaultRef = React.useRef<TData[]>(        // hardReset?? mount ?쒖젏 defaultData ???(uncontrolled?먯꽌留??섎? ?덉쓬)
    'defaultData' in props ? props.defaultData ?? [] : []
  );

  // 2. 湲곕뒫蹂?鍮꾩쫰?덉뒪 濡쒖쭅 ??
  const dirty = useDirtyState<TData>({                    // baseline 珥덇린媛믪? ??긽 諛곗뿴?댁뼱????
    initialBaseline: gridData.data ?? [],
    getRowId: props.getRowId,
  });
  const { updateCell } = useGridEditing({ props, gridData, dirty });

  // 3. ?몃? API ?몄텧 (Imperative Handle)
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
        // ???ш린??"?⑥씪 吏꾩엯???쇰줈 ??젣 濡쒖쭅 ?섑뻾
        gridData.setData(prev => prev.filter((_, idx) => {
          // rowId 湲곕컲?쇰줈 吏?곕젮硫?getRowId ?꾩슂.
          // 媛???덉쟾??諛⑹떇? table rowId 湲곗??쇰줈 吏?곕뒗 寃?
          // ?쇰떒 湲곕낯? props.getRowId ?덉쑝硫?洹멸구濡?留ㅼ묶:
          if (!props.getRowId) {
            // getRowId媛 ?녿떎硫?row.id(=tanstack rowId)濡쒕뒗 prev?먯꽌 李얘린 ?대젮?
            // => ??寃쎌슦??"getRowId ?꾩닔"濡??뺤콉???먮뒗 嫄?媛뺣젰 異붿쿇
            return true;
          }
          return props.getRowId(prev[idx] as any) !== rowId;
        }));

        // ??젣 ??dirty/selection/activeCell ?뺣━???ㅼ쓬 ?④퀎?먯꽌 actions??媛숈씠 ?ｌ쑝硫???
      },
    };
  }, [gridData.setData, props.getRowId]);

  // 4. TanStack Table ?붿쭊 ?뗭뾽
  const table = useGenGridTable<TData>({
    ...props,
    data: gridData.data ?? [],
    isRowDirty: dirty.isRowDirty,
    actions,
  });

// 5. ?곗씠??踰꾩쟾 蹂寃???Dirty 由ъ뀑 (Effect)
  React.useEffect(() => {
    dirty.setBaselineFromData(gridData.data ?? []);
    dirty.clearAllDirty();
    props.onDirtyChange?.(false);
  }, [props.dataVersion]);

  const notifyDirty = React.useCallback(() => {
    props.onDirtyChange?.(dirty.isDirty());
  }, [dirty, props]);

 
  return (
    <GenGridProvider
      table={table}
      activeCell={props.activeCell}
      onActiveCellChange={props.onActiveCellChange}
      options={{ editorFactory: props.editorFactory, keepEditingOnNavigate: props.keepEditingOnNavigate }}
    >
      <GenGridBase<TData>
        {...props} // ?뱀? ?꾩슂??寃껊쭔 ?좊퀎 ?꾨떖
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


