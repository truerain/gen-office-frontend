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
   * ?ÅÌÉú Î≥ÄÍ≤??åÎ¶º Î°úÏßÅ
   * - dirty ?ÅÌÉúÍ∞Ä Î≥ÄÍ≤ΩÎê† ???∏Î? ÏΩúÎ∞±(onDirtyChange)???∏Ï∂ú?©Îãà??
   */
  const notifyDirty = React.useCallback(() => {
    // markCellDirtyÍ∞Ä stateÎ•?Î∞îÍæº ÏßÅÌõÑ?¥Î?Î°? 
    // ?§Ï†ú isDirty() Í∞íÏ? ?§Ïùå ?åÎçîÎßÅÏóê Î∞òÏòÅ?òÏ?Îß?
    // ?¨Í∏∞?úÎäî ?ÑÏû¨??dirtyCells ÎßµÏùÑ Í∏∞Ï??ºÎ°ú Ï¶âÏãú ?êÎã®???òÎèÑ ?àÏäµ?àÎã§.
    onDirtyChange?.(dirty.isDirty());
  }, [dirty, onDirtyChange]);

  const isCoercibleNumber = React.useCallback((value: unknown) => {
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (trimmed === '') return false;
    const num = Number(trimmed);
    return Number.isFinite(num);
  }, []);

  const isEqualForDirty = React.useCallback(
    (a: unknown, b: unknown) => {
      if (a == null && b == null) return true;
      if (isCoercibleNumber(a) && isCoercibleNumber(b)) {
        return Number(a) === Number(b);
      }
      return Object.is(a, b);
    },
    [isCoercibleNumber]
  );

  /**
   * ?Ä ?ÖÎç∞?¥Ìä∏ ?µÏã¨ Î°úÏßÅ
   */
  const updateCell = React.useCallback(
    (coord: { rowId: string; columnId: string }, nextValue: unknown) => {
      const { rowId, columnId } = coord;

      onCellValueChange?.({ rowId, columnId, value: nextValue });

     // 1. ?êÎ≥∏(Baseline) Í∞íÍ≥º ÎπÑÍµê?òÏó¨ Î≥ÄÍ≤??¨Î? ?ïÏù∏
      const baseRow = dirty.getBaselineRow(rowId) as any;
      const baseValue = baseRow ? baseRow[columnId] : undefined;
      const isNowDirty = !isEqualForDirty(baseValue, nextValue);

      // 2. ?§Ï†ú ?∞Ïù¥???ÖÎç∞?¥Ìä∏ (Immutability ?†Ï?)
      setData((prev) => {
        const rows = prev ?? [];
        return rows.map((row) => {
          if (getRowId(row) !== rowId) return row;
          return { ...row, [columnId]: nextValue } as TData;
        });
      });

      // 3. Dirty ?ÅÌÉú ÎßàÌÇπ (Map ?ÖÎç∞?¥Ìä∏)
      dirty.markCellDirty(rowId, columnId, isNowDirty);

      // 4. Î≥ÄÍ≤??åÎ¶º ?µÏ?
      notifyDirty();
    },
    [dirty, getRowId, setData, notifyDirty, onCellValueChange, isEqualForDirty]
  );

  return {
    updateCell,
  };
}
