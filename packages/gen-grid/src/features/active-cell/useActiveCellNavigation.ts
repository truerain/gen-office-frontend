// packages/gen-grid/src/features/active-cell/useActiveCellNavigation.ts

import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { focusGridCell } from './cellDom';
import { ROW_STATUS_COLUMN_ID } from '../row-status/rowStatus';

export type ActiveCell = { rowId: string; columnId: string } | null;

type Direction = 'left' | 'right' | 'up' | 'down';

// focusGridCell(rowId, colId, opts?) ?ïÌÉúÎ•?Í∞Ä??
type FocusOptions = Parameters<typeof focusGridCell>[2];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useActiveCellNavigation<TData>(args: {
  table: Table<TData>;
  activeCell: ActiveCell;
  onActiveCellChange: (next: { rowId: string; columnId: string }) => void;

  /**
   * Navigable ?Ä???úÏñ¥ (?? system column ?úÏô∏)
   * default: true
   */
  isCellNavigable?: (rowId: string, columnId: string) => boolean;

  /**
   * focusGridCell ?∏Ï∂ú ???òÍ∏∏ ?µÏÖò (sticky/pinned Í≥†Î†§)
   */
  focusOptions?: FocusOptions;

  /**
   * navigable ?ÑÎãå ?Ä/Ïª¨Îüº??ÎßåÎÇ¨????Í±¥ÎÑà?∞Í∏∞
   * default: true
   */
  skipNonNavigable?: boolean;

  /**
   * PageUp/PageDown ??Î≤àÏóê ?¥Îèô??row ??Í≥ÑÏÇ∞???ÑÌïú fallback
   * default: 10
   */
  pageRowFallback?: number;
}) {
  const {
    table,
    activeCell,
    onActiveCellChange,
    isCellNavigable,
    focusOptions,
    skipNonNavigable = true,
    pageRowFallback = 10,
  } = args;

  const rows = table.getRowModel().rows;

  // row?Ä Î¨¥Í???"Î≥¥Ïù¥??Ïª¨Îüº" ?úÏÑú
  const visibleColumnIds = React.useMemo(() => {
    return table.getVisibleLeafColumns().map((c) => c.id);
  }, [table]);

  // O(1) lookup cache
  const rowIndexById = React.useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < rows.length; i++) m.set(rows[i].id, i);
    return m;
  }, [rows]);

  const colIndexById = React.useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < visibleColumnIds.length; i++) m.set(visibleColumnIds[i], i);
    return m;
  }, [visibleColumnIds]);

  const canNavigate = React.useCallback(
    (rowId: string, columnId: string) => {
      return isCellNavigable ? isCellNavigable(rowId, columnId) : true;
    },
    [isCellNavigable]
  );

  const focus = React.useCallback(
    (rowId: string, columnId: string) => {
      requestAnimationFrame(() => focusGridCell(rowId, columnId, focusOptions));
    },
    [focusOptions]
  );

  const setActive = React.useCallback(
    (rowId: string, columnId: string, opts?: { focus?: boolean }) => {
      if (!canNavigate(rowId, columnId)) return;

      onActiveCellChange({ rowId, columnId });
      if (opts?.focus) focus(rowId, columnId);
    },
    [onActiveCellChange, canNavigate, focus]
  );

  const getRepresentativeColumnId = React.useCallback(
    (rowId?: string) => {
      if (visibleColumnIds.length === 0) return null;

      if (visibleColumnIds.includes(ROW_STATUS_COLUMN_ID)) {
        return ROW_STATUS_COLUMN_ID;
      }

      const rowIndex = rowId ? rowIndexById.get(rowId) : undefined;
      const row = rowIndex == null ? undefined : rows[rowIndex];
      const isGrouped =
        row && typeof (row as any).getIsGrouped === 'function'
          ? (row as any).getIsGrouped()
          : false;

      if (isGrouped) {
        const grouping = (table.getState() as any)?.grouping as string[] | undefined;
        const groupColId = grouping?.[0];
        if (groupColId && visibleColumnIds.includes(groupColId)) return groupColId;
      }

      return visibleColumnIds[0];
    },
    [rows, rowIndexById, table, visibleColumnIds]
  );

  const setActiveRow = React.useCallback(
    (rowId: string, opts?: { focus?: boolean }) => {
      const colId = getRepresentativeColumnId(rowId);
      if (!colId) return;
      setActive(rowId, colId, opts);
    },
    [getRepresentativeColumnId, setActive]
  );

  const firstNavigableColId = React.useCallback(
    (rowId: string) => {
      for (let i = 0; i < visibleColumnIds.length; i++) {
        const colId = visibleColumnIds[i];
        if (canNavigate(rowId, colId)) return colId;
      }
      return visibleColumnIds[0];
    },
    [visibleColumnIds, canNavigate]
  );

  const lastNavigableColId = React.useCallback(
    (rowId: string) => {
      for (let i = visibleColumnIds.length - 1; i >= 0; i--) {
        const colId = visibleColumnIds[i];
        if (canNavigate(rowId, colId)) return colId;
      }
      return visibleColumnIds[visibleColumnIds.length - 1];
    },
    [visibleColumnIds, canNavigate]
  );

  const findNextNavigable = React.useCallback(
    (rowIndex: number, colIndex: number, dir: Direction) => {
      const maxRow = rows.length - 1;
      const maxCol = visibleColumnIds.length - 1;

      let r = clamp(rowIndex, 0, maxRow);
      let c = clamp(colIndex, 0, maxCol);

      const step = () => {
        switch (dir) {
          case 'left':
            c--;
            break;
          case 'right':
            c++;
            break;
          case 'up':
            r--;
            break;
          case 'down':
            r++;
            break;
        }
      };

      // Î™©Ìëú Ïπ∏Î???Í≤Ä?¨ÌïòÎ©?skip
      for (let guard = 0; guard < 5000; guard++) {
        if (r < 0 || r > maxRow || c < 0 || c > maxCol) return null;

        const rowId = rows[r]?.id;
        const colId = visibleColumnIds[c];
        if (!rowId || !colId) return null;

        if (canNavigate(rowId, colId)) return { rowId, columnId: colId };

        step();
      }

      return null;
    },
    [rows, visibleColumnIds, canNavigate]
  );

  /**
   * PageUp/PageDown ?¥Îèô row delta Í≥ÑÏÇ∞
   * - ?ÑÏû¨ active cell DOM??Í∏∞Ï??ºÎ°ú Ïª®ÌÖå?¥ÎÑà ?íÏù¥ / ?Ä ?íÏù¥Î°?Ï∂îÏ†ï
   * - Î™?Ï∞æÏúºÎ©?fallback ?¨Ïö©
   */
  const getPageRowDelta = React.useCallback(() => {
    if (!activeCell) return pageRowFallback;

    const el = document.querySelector<HTMLElement>(
      `[data-row-id="${CSS.escape(activeCell.rowId)}"][data-col-id="${CSS.escape(activeCell.columnId)}"]`
    );
    if (!el) return pageRowFallback;

    const container = el.closest<HTMLElement>('[class*="tableScroll"]');
    if (!container) return pageRowFallback;

    const rowPx = el.getBoundingClientRect().height || 36;
    const visiblePx = container.clientHeight;

    // ???îÎ©¥ - 1Ï§??ïÎèÑ ?¥Îèô
    const delta = Math.max(1, Math.floor(visiblePx / rowPx) - 1);
    return delta;
  }, [activeCell, pageRowFallback]);

  const move = React.useCallback(
    (dir: Direction) => {
      if (!activeCell) return;

      const rowIndex = rowIndexById.get(activeCell.rowId);
      const colIndex = colIndexById.get(activeCell.columnId);
      if (rowIndex == null || colIndex == null) return;

      let nextRowIndex = rowIndex;
      let nextColIndex = colIndex;

      switch (dir) {
        case 'left':
          nextColIndex = colIndex - 1;
          break;
        case 'right':
          nextColIndex = colIndex + 1;
          break;
        case 'up':
          nextRowIndex = rowIndex - 1;
          break;
        case 'down':
          nextRowIndex = rowIndex + 1;
          break;
      }

      nextRowIndex = clamp(nextRowIndex, 0, rows.length - 1);
      nextColIndex = clamp(nextColIndex, 0, visibleColumnIds.length - 1);

      const nextRow = rows[nextRowIndex];
      const nextColId = visibleColumnIds[nextColIndex];
      if (!nextRow || !nextColId) return;

      if (canNavigate(nextRow.id, nextColId)) {
        setActive(nextRow.id, nextColId, { focus: true });
        return;
      }

      if (!skipNonNavigable) return;

      const found = findNextNavigable(nextRowIndex, nextColIndex, dir);
      if (found) setActive(found.rowId, found.columnId, { focus: true });
    },
    [
      activeCell,
      rowIndexById,
      colIndexById,
      rows,
      visibleColumnIds,
      canNavigate,
      setActive,
      skipNonNavigable,
      findNextNavigable,
    ]
  );

  const moveHomeEnd = React.useCallback(
    (kind: 'home' | 'end', wholeGrid: boolean) => {
      if (!activeCell) return;

      const currentRowIndex = rowIndexById.get(activeCell.rowId);
      const currentColIndex = colIndexById.get(activeCell.columnId);
      if (currentRowIndex == null || currentColIndex == null) return;

      const targetRowIndex = wholeGrid ? (kind === 'home' ? 0 : rows.length - 1) : currentRowIndex;
      const rowId = rows[targetRowIndex]?.id;
      if (!rowId) return;

      const colId =
        kind === 'home' ? firstNavigableColId(rowId) : lastNavigableColId(rowId);
      if (!colId) return;

      setActive(rowId, colId, { focus: true });
    },
    [activeCell, rowIndexById, colIndexById, rows, firstNavigableColId, lastNavigableColId, setActive]
  );

  const movePage = React.useCallback(
    (kind: 'pgup' | 'pgdn') => {
      if (!activeCell) return;

      const rowIndex = rowIndexById.get(activeCell.rowId);
      const colIndex = colIndexById.get(activeCell.columnId);
      if (rowIndex == null || colIndex == null) return;

      const delta = getPageRowDelta();
      const nextRowIndex =
        kind === 'pgdn'
          ? clamp(rowIndex + delta, 0, rows.length - 1)
          : clamp(rowIndex - delta, 0, rows.length - 1);

      const rowId = rows[nextRowIndex]?.id;
      const colId = visibleColumnIds[colIndex];
      if (!rowId || !colId) return;

      if (canNavigate(rowId, colId)) {
        setActive(rowId, colId, { focus: true });
        return;
      }

      if (!skipNonNavigable) return;

      const found = findNextNavigable(nextRowIndex, colIndex, kind === 'pgdn' ? 'down' : 'up');
      if (found) setActive(found.rowId, found.columnId, { focus: true });
    },
    [
      activeCell,
      rowIndexById,
      colIndexById,
      getPageRowDelta,
      rows,
      visibleColumnIds,
      canNavigate,
      setActive,
      skipNonNavigable,
      findNextNavigable,
    ]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      // modifier Ï°∞Ìï©
      const wholeGrid = e.ctrlKey || e.metaKey;

      switch (e.key) {
        case 'Tab': {
          e.preventDefault();
          const dir = e.shiftKey ? 'left' : 'right';
          move(dir);
          break;
        }
        case 'ArrowLeft':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          move('down');
          break;

        case 'Home':
          e.preventDefault();
          moveHomeEnd('home', wholeGrid);
          break;
        case 'End':
          e.preventDefault();
          moveHomeEnd('end', wholeGrid);
          break;

        case 'PageDown':
          e.preventDefault();
          movePage('pgdn');
          break;
        case 'PageUp':
          e.preventDefault();
          movePage('pgup');
          break;

        default:
          break;
      }
    },
    [move, moveHomeEnd, movePage]
  );

  // ??GenGridBody?êÏÑú td??Í∑∏Î?Î°?spread ?????àÎäî props ?úÍ≥µ
  const getCellProps = React.useCallback(
    (rowId: string, columnId: string, isActive: boolean) => {
      return {
        'data-row-id': rowId,
        'data-col-id': columnId,
        'data-active-cell': isActive || undefined,
        tabIndex: isActive ? 0 : -1,

        onFocus: () => {
          if (!isActive) setActive(rowId, columnId);
        },

        onMouseDown: (e: React.MouseEvent) => {
          const target = e.target as HTMLElement | null;
          if (
            target &&
            target.closest('input,select,textarea,button,[contenteditable="true"]')
          ) {
            return;
          }
          // Í∏∞Î≥∏ ?¨Ïª§???çÏä§???†ÌÉù ??Î∞©Ï? + ÏßÅÏ†ë focus
          e.preventDefault();
          setActive(rowId, columnId, { focus: true });
        },

        onKeyDown: (e: React.KeyboardEvent) => {
          handleKeyDown(e);
        },
      } as const;
    },
    [handleKeyDown, setActive]
  );

  return {
    getCellProps,
    handleKeyDown, // ?∏Î??êÏÑú grid wrapper??Í±∏Í≥† ?∂ÏùÑ ?åÎèÑ ?¨Ïö© Í∞Ä??
    move,
    setActive,
    setActiveRow,
    getRepresentativeColumnId,
    rows,
    visibleColumnIds,
    rowIndexById,
    colIndexById,
  };
}
