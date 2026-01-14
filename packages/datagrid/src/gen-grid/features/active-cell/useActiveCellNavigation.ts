// packages/datagrid/src/gen-grid/features/active-cell/useActiveCellNavigation.ts
import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { focusGridCell } from './cellDom';

export type ActiveCell = { rowId: string; columnId: string } | null;

type Direction = 'left' | 'right' | 'up' | 'down';

// focusGridCell(rowId, colId, opts?) 형태를 가정
type FocusOptions = Parameters<typeof focusGridCell>[2];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useActiveCellNavigation<TData>(args: {
  table: Table<TData>;
  activeCell: ActiveCell;
  onActiveCellChange: (next: { rowId: string; columnId: string }) => void;

  /**
   * Navigable 대상 제어 (예: system column 제외)
   * default: true
   */
  isCellNavigable?: (rowId: string, columnId: string) => boolean;

  /**
   * focusGridCell 호출 시 넘길 옵션 (sticky/pinned 고려)
   */
  focusOptions?: FocusOptions;

  /**
   * navigable 아닌 셀/컬럼을 만났을 때 건너뛰기
   * default: true
   */
  skipNonNavigable?: boolean;

  /**
   * PageUp/PageDown 한 번에 이동할 row 수 계산을 위한 fallback
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

  // row와 무관한 "보이는 컬럼" 순서
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

      // 목표 칸부터 검사하며 skip
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
   * PageUp/PageDown 이동 row delta 계산
   * - 현재 active cell DOM을 기준으로 컨테이너 높이 / 셀 높이로 추정
   * - 못 찾으면 fallback 사용
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

    // 한 화면 - 1줄 정도 이동
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
      // modifier 조합
      const wholeGrid = e.ctrlKey || e.metaKey;

      switch (e.key) {
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

  // ✅ GenGridBody에서 td에 그대로 spread 할 수 있는 props 제공
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
          // 기본 포커스/텍스트 선택 튐 방지 + 직접 focus
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
    handleKeyDown, // 외부에서 grid wrapper에 걸고 싶을 때도 사용 가능
    move,
    setActive,
    rows,
    visibleColumnIds,
    rowIndexById,
    colIndexById,
  };
}
