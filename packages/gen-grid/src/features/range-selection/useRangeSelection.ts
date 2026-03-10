import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import type { RangeCellCoord, SelectedRange } from './types';

function toBounds(a: number, b: number) {
  return { min: Math.min(a, b), max: Math.max(a, b) };
}

export function useRangeSelection<TData>(args: {
  table: Table<TData>;
  enabled: boolean;
  selectedRange: SelectedRange;
  setSelectedRange: React.Dispatch<React.SetStateAction<SelectedRange>>;
  activeCell: RangeCellCoord | null;
}) {
  const { table, enabled, selectedRange, setSelectedRange, activeCell } = args;
  const draggingRef = React.useRef(false);

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
    (rowId: string, columnId: string) => {
      if (!enabled) return;
      draggingRef.current = true;
      setSelectedRange(createRange(rowId, columnId));
    },
    [createRange, enabled, setSelectedRange]
  );

  const selectFromAnchor = React.useCallback(
    (anchor: RangeCellCoord | null, rowId: string, columnId: string) => {
      if (!enabled) return;
      if (!rowIndexById.has(rowId) || !colIndexById.has(columnId)) return;

      draggingRef.current = false;
      const anchorIsValid =
        !!anchor && rowIndexById.has(anchor.rowId) && colIndexById.has(anchor.columnId);

      if (anchorIsValid && anchor) {
        setSelectedRange({
          anchor: { rowId: anchor.rowId, columnId: anchor.columnId },
          focus: { rowId, columnId },
        });
        return;
      }

      setSelectedRange(createRange(rowId, columnId));
    },
    [colIndexById, createRange, enabled, rowIndexById, setSelectedRange]
  );

  const extendRange = React.useCallback(
    (rowId: string, columnId: string) => {
      if (!enabled || !draggingRef.current) return;

      setSelectedRange((prev) => {
        if (!prev) return createRange(rowId, columnId);

        if (prev.focus.rowId === rowId && prev.focus.columnId === columnId) {
          return prev;
        }

        return {
          ...prev,
          focus: {
            rowId,
            columnId,
          },
        };
      });
    },
    [createRange, enabled, setSelectedRange]
  );

  const endRange = React.useCallback(() => {
    draggingRef.current = false;
  }, []);

  React.useEffect(() => {
    const handleMouseUp = () => {
      draggingRef.current = false;
    };
    const handleBlur = () => {
      draggingRef.current = false;
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
    if (selectedRange) setSelectedRange(null);
  }, [enabled, selectedRange, setSelectedRange]);

  const clearRange = React.useCallback(() => {
    draggingRef.current = false;
    setSelectedRange(null);
  }, [setSelectedRange]);

  const isCellInRange = React.useCallback(
    (rowId: string, columnId: string) => {
      if (!enabled || !selectedRange) return false;

      const rowIndex = rowIndexById.get(rowId);
      const colIndex = colIndexById.get(columnId);
      const anchorRowIndex = rowIndexById.get(selectedRange.anchor.rowId);
      const focusRowIndex = rowIndexById.get(selectedRange.focus.rowId);
      const anchorColIndex = colIndexById.get(selectedRange.anchor.columnId);
      const focusColIndex = colIndexById.get(selectedRange.focus.columnId);

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
        selectedRange.anchor.columnId === firstVisibleColumnId;
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
    [
      enabled,
      selectedRange,
      rowIndexById,
      colIndexById,
      firstVisibleColumnId,
      visibleColumnIds.length,
    ]
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

        if (e.shiftKey) {
          e.preventDefault();
          selectFromAnchor(activeCell ?? selectedRange?.anchor ?? null, rowId, columnId);
          return;
        }

        beginRange(rowId, columnId);
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
    [activeCell, beginRange, enabled, endRange, extendRange, selectFromAnchor, selectedRange]
  );

  return {
    clearRange,
    isCellInRange,
    getRangeHandlers,
  };
}
