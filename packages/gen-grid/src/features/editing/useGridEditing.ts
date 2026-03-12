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
   * Dirty-state notification helper.
   * Fires onDirtyChange whenever dirty status changes.
   */
  const notifyDirty = React.useCallback(() => {
    // markCellDirty updates state asynchronously.
    // dirty.isDirty() reads current dirty map state directly.
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
   * Core cell update workflow.
   */
  const updateCell = React.useCallback(
    (coord: { rowId: string; columnId: string }, nextValue: unknown) => {
      const { rowId, columnId } = coord;

      onCellValueChange?.({ rowId, columnId, value: nextValue });

      // 1) Compare with baseline value.
      const baseRow = dirty.getBaselineRow(rowId) as any;
      const baseValue = baseRow ? baseRow[columnId] : undefined;
      const isNowDirty = !isEqualForDirty(baseValue, nextValue);

      // 2) Update current row immutably.
      setData((prev) => {
        const rows = prev ?? [];
        return rows.map((row) => {
          if (getRowId(row) !== rowId) return row;
          return { ...row, [columnId]: nextValue } as TData;
        });
      });

      // 3) Mark dirty state in map.
      dirty.markCellDirty(rowId, columnId, isNowDirty);

      // 4) Notify dirty state.
      notifyDirty();
    },
    [dirty, getRowId, setData, notifyDirty, onCellValueChange, isEqualForDirty]
  );

  return {
    updateCell,
  };
}
