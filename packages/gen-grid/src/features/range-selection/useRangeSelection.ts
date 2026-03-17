import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import type { RangeCellCoord, SelectedRange, SelectedRanges } from './types';

function toBounds(a: number, b: number) {
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

export function useRangeSelection<TData>(args: {
  table: Table<TData>;
  enabled: boolean;
  selectedRanges: SelectedRanges;
  setSelectedRanges: React.Dispatch<React.SetStateAction<SelectedRanges>>;
  activeCell: RangeCellCoord | null;
}) {
  const { table, enabled, selectedRanges, setSelectedRanges, activeCell } = args;
  const draggingRef = React.useRef(false);
  const draggingRangeIndexRef = React.useRef<number | null>(null);

  const rows = table.getRowModel().rows;

  const visibleColumnIds = React.useMemo(() => {
    const firstRowCells = rows[0]?.getVisibleCells?.();
    if (Array.isArray(firstRowCells) && firstRowCells.length > 0) {
      return firstRowCells.map((cell) => cell.column.id);
    }
    return table.getVisibleLeafColumns().map((c) => c.id);
  }, [rows, table]);

  const firstVisibleColumnId = visibleColumnIds[0] ?? null;

  const rowIndexById = React.useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r, i) => map.set(r.id, i));
    return map;
  }, [rows]);

  const colIndexById = React.useMemo(() => {
    const map = new Map<string, number>();
    visibleColumnIds.forEach((id, i) => map.set(id, i));
    return map;
  }, [visibleColumnIds]);

  const createRange = React.useCallback(
    (rowId: string, columnId: string): SelectedRange => ({
      anchor: { rowId, columnId },
      focus: { rowId, columnId },
    }),
    []
  );

  const beginRange = React.useCallback(
    (rowId: string, columnId: string, additive: boolean) => {
      if (!enabled) return;
      draggingRef.current = true;
      setSelectedRanges((prev) => {
        const next = additive ? [...prev, createRange(rowId, columnId)] : [createRange(rowId, columnId)];
        draggingRangeIndexRef.current = next.length - 1;
        return next;
      });
    },
    [createRange, enabled, setSelectedRanges]
  );

  const selectFromAnchor = React.useCallback(
    (
      anchor: RangeCellCoord | null,
      rowId: string,
      columnId: string,
      additive: boolean
    ) => {
      if (!enabled) return;
      if (!rowIndexById.has(rowId) || !colIndexById.has(columnId)) return;

      draggingRef.current = false;
      draggingRangeIndexRef.current = null;

      const anchorIsValid =
        !!anchor && rowIndexById.has(anchor.rowId) && colIndexById.has(anchor.columnId);

      const nextRange = anchorIsValid && anchor
        ? { anchor: { rowId: anchor.rowId, columnId: anchor.columnId }, focus: { rowId, columnId } }
        : createRange(rowId, columnId);

      setSelectedRanges((prev) => (additive ? [...prev, nextRange] : [nextRange]));
    },
    [colIndexById, createRange, enabled, rowIndexById, setSelectedRanges]
  );

  const extendRange = React.useCallback(
    (rowId: string, columnId: string) => {
      if (!enabled || !draggingRef.current) return;
      const targetIndex = draggingRangeIndexRef.current;
      if (targetIndex == null) return;

      setSelectedRanges((prev) => {
        const range = prev[targetIndex];
        if (!range) return prev;
        if (range.focus.rowId === rowId && range.focus.columnId === columnId) {
          return prev;
        }

        const next = [...prev];
        next[targetIndex] = {
          ...range,
          focus: { rowId, columnId },
        };
        return next;
      });
    },
    [enabled, setSelectedRanges]
  );

  const endRange = React.useCallback(() => {
    draggingRef.current = false;
    draggingRangeIndexRef.current = null;
  }, []);

  React.useEffect(() => {
    const handleMouseUp = () => {
      draggingRef.current = false;
      draggingRangeIndexRef.current = null;
    };
    const handleBlur = () => {
      draggingRef.current = false;
      draggingRangeIndexRef.current = null;
    };

    document.addEventListener('mouseup', handleMouseUp, true);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  React.useEffect(() => {
    if (enabled) return;
    draggingRef.current = false;
    draggingRangeIndexRef.current = null;
    if (selectedRanges.length > 0) setSelectedRanges([]);
  }, [enabled, selectedRanges.length, setSelectedRanges]);

  const clearRanges = React.useCallback(() => {
    draggingRef.current = false;
    draggingRangeIndexRef.current = null;
    setSelectedRanges([]);
  }, [setSelectedRanges]);

  const isInSingleRange = React.useCallback(
    (range: SelectedRange, rowId: string, columnId: string) => {
      const rowIndex = rowIndexById.get(rowId);
      const colIndex = colIndexById.get(columnId);
      const anchorRowIndex = rowIndexById.get(range.anchor.rowId);
      const focusRowIndex = rowIndexById.get(range.focus.rowId);
      const anchorColIndex = colIndexById.get(range.anchor.columnId);
      const focusColIndex = colIndexById.get(range.focus.columnId);

      if (
        rowIndex == null ||
        colIndex == null ||
        anchorRowIndex == null ||
        focusRowIndex == null ||
        anchorColIndex == null ||
        focusColIndex == null
      ) {
        return false;
      }

      const rowBounds = toBounds(anchorRowIndex, focusRowIndex);
      const isRowRange =
        firstVisibleColumnId != null &&
        range.anchor.columnId === firstVisibleColumnId;
      const colBounds = isRowRange
        ? { min: 0, max: visibleColumnIds.length - 1 }
        : toBounds(anchorColIndex, focusColIndex);

      return (
        rowIndex >= rowBounds.min &&
        rowIndex <= rowBounds.max &&
        colIndex >= colBounds.min &&
        colIndex <= colBounds.max
      );
    },
    [colIndexById, firstVisibleColumnId, rowIndexById, visibleColumnIds.length]
  );

  const isCellInRange = React.useCallback(
    (rowId: string, columnId: string) => {
      if (!enabled || selectedRanges.length === 0) return false;
      return selectedRanges.some((range) => isInSingleRange(range, rowId, columnId));
    },
    [enabled, isInSingleRange, selectedRanges]
  );

  const getRangeHandlers = React.useCallback(
    (rowId: string, columnId: string) => ({
      onMouseDown: (e: React.MouseEvent) => {
        if (!enabled) return;
        if (e.button !== 0) return;

        const target = e.target as HTMLElement | null;
        if (
          target &&
          target.closest('input,select,textarea,button,[contenteditable="true"]')
        ) {
          return;
        }

        const additive = e.ctrlKey || e.metaKey;
        if (e.shiftKey) {
          e.preventDefault();
          const fallbackAnchor = selectedRanges[selectedRanges.length - 1]?.anchor ?? null;
          selectFromAnchor(activeCell ?? fallbackAnchor, rowId, columnId, additive);
          return;
        }

        beginRange(rowId, columnId, additive);
      },
      onMouseEnter: (_e: React.MouseEvent) => {
        if (!enabled) return;
        extendRange(rowId, columnId);
      },
      onMouseUp: () => {
        if (!enabled) return;
        endRange();
      },
    }),
    [activeCell, beginRange, enabled, endRange, extendRange, selectFromAnchor, selectedRanges]
  );

  return {
    clearRanges,
    isCellInRange,
    getRangeHandlers,
  };
}
