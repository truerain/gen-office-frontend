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
  // 1. ê¸°ì´ˆ ?°ì´??ë°?ì´ˆê¸°ê°?ë³´ê?
  const gridData = useGridData(props);
  const initialDefaultRef = React.useRef<TData[]>(        // hardReset?? mount ?œì  defaultData ?€??(uncontrolled?ì„œë§??˜ë? ?ˆìŒ)
    'defaultData' in props ? props.defaultData ?? [] : []
  );

  // 2. ê¸°ëŠ¥ë³?ë¹„ì¦ˆ?ˆìŠ¤ ë¡œì§ ??
  const dirty = useDirtyState<TData>({                    // baseline ì´ˆê¸°ê°’ì? ??ƒ ë°°ì—´?´ì–´????
    initialBaseline: gridData.data ?? [],
    getRowId: props.getRowId,
  });
  const { updateCell } = useGridEditing({ props, gridData, dirty });

  // 3. ?¸ë? API ?¸ì¶œ (Imperative Handle)
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
        // ???¬ê¸°??"?¨ì¼ ì§„ì…???¼ë¡œ ?? œ ë¡œì§ ?˜í–‰
        gridData.setData(prev => prev.filter((_, idx) => {
          // rowId ê¸°ë°˜?¼ë¡œ ì§€?°ë ¤ë©?getRowId ?„ìš”.
          // ê°€???ˆì „??ë°©ì‹?€ table rowId ê¸°ì??¼ë¡œ ì§€?°ëŠ” ê²?
          // ?¼ë‹¨ ê¸°ë³¸?€ props.getRowId ?ˆìœ¼ë©?ê·¸ê±¸ë¡?ë§¤ì¹­:
          if (!props.getRowId) {
            // getRowIdê°€ ?†ë‹¤ë©?row.id(=tanstack rowId)ë¡œëŠ” prev?ì„œ ì°¾ê¸° ?´ë ¤?€
            // => ??ê²½ìš°??"getRowId ?„ìˆ˜"ë¡??•ì±…???ëŠ” ê±?ê°•ë ¥ ì¶”ì²œ
            return true;
          }
          return props.getRowId(prev[idx] as any) !== rowId;
        }));

        // ?? œ ??dirty/selection/activeCell ?•ë¦¬???¤ìŒ ?¨ê³„?ì„œ actions??ê°™ì´ ?£ìœ¼ë©???
      },
    };
  }, [gridData.setData, props.getRowId]);

  // 4. TanStack Table ?”ì§„ ?‹ì—…
  const table = useGenGridTable<TData>({
    ...props,
    data: gridData.data ?? [],
    isRowDirty: dirty.isRowDirty,
    actions,
  });

// 5. ?°ì´??ë²„ì „ ë³€ê²???Dirty ë¦¬ì…‹ (Effect)
  React.useEffect(() => {
    dirty.setBaselineFromData(gridData.data ?? []);
    dirty.clearAllDirty();
    props.onDirtyChange?.(false);
  }, [props.dataVersion]);

  const notifyDirty = React.useCallback(() => {
    props.onDirtyChange?.(dirty.isDirty());
  }, [dirty, props]);

 
  return (
    <GenGridProvider table={table} activeCell={props.activeCell} onActiveCellChange={props.onActiveCellChange}>
      <GenGridBase<TData>
        {...props} // ?¹ì? ?„ìš”??ê²ƒë§Œ ? ë³„ ?„ë‹¬
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
