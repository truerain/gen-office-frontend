// packages/gen-datagrid/src/features/range-selection/useRangeSelection.ts
// Manages root-level mouse range selection for GenDataGrid.

import * as React from 'react';

import { gridRootSelector } from '../../core/dom/selectors';
import type {
  GenDataGridCellCoord,
  GenDataGridRangeSelection,
  GenDataGridRangeSelections,
} from './rangeSelection';

const interactiveTargetSelector =
  'input,select,textarea,button,[contenteditable="true"]';

function resolveCellCoordFromTarget(root: HTMLElement | null, target: EventTarget | null) {
  if (!root || !(target instanceof HTMLElement)) return null;
  if (target.closest(interactiveTargetSelector)) return null;
  if (target.closest(gridRootSelector) !== root) return null;

  const cell = target.closest<HTMLElement>(
    '[data-gen-datagrid-cell="true"][data-cell-kind="body"][data-rowid][data-colid]'
  );
  if (!cell || cell.closest(gridRootSelector) !== root) return null;

  const rowId = cell.dataset.rowid;
  const columnId = cell.dataset.colid;
  if (!rowId || !columnId) return null;

  return { rowId, columnId };
}

function isScrollbarMouseDown(root: HTMLElement, event: React.MouseEvent<HTMLElement>) {
  const rect = root.getBoundingClientRect();
  const hasVerticalScrollbar = root.scrollHeight > root.clientHeight;
  const hasHorizontalScrollbar = root.scrollWidth > root.clientWidth;
  const isInVerticalScrollbar =
    hasVerticalScrollbar &&
    event.clientX >= rect.left + root.clientWidth &&
    event.clientX <= rect.right;
  const isInHorizontalScrollbar =
    hasHorizontalScrollbar &&
    event.clientY >= rect.top + root.clientHeight &&
    event.clientY <= rect.bottom;

  return isInVerticalScrollbar || isInHorizontalScrollbar;
}

const autoScrollEdgeSize = 32;

function clampIndex(index: number, length: number) {
  return Math.max(0, Math.min(length - 1, index));
}

function getViewportHeight(viewport: HTMLElement, rowHeight: number) {
  const rect = viewport.getBoundingClientRect();
  return rect.height || viewport.clientHeight || rowHeight * 8;
}

function getViewportTop(viewport: HTMLElement) {
  const rect = viewport.getBoundingClientRect();
  return rect.top || 0;
}

function resolveAutoScrollRowIndex({
  viewport,
  rowHeight,
  headerHeight,
  direction,
  rowCount,
}: {
  viewport: HTMLElement;
  rowHeight: number;
  headerHeight: number;
  direction: -1 | 1;
  rowCount: number;
}) {
  if (rowCount === 0) return -1;
  const viewportHeight = getViewportHeight(viewport, rowHeight);
  const targetOffset =
    direction < 0
      ? viewport.scrollTop - headerHeight
      : viewport.scrollTop + viewportHeight - headerHeight - 1;
  return clampIndex(Math.floor(Math.max(0, targetOffset) / rowHeight), rowCount);
}

export function useRangeSelection({
  rootRef,
  enabled,
  selectedRanges,
  defaultSelectedRanges,
  onSelectedRangesChange,
  rowIds = [],
  columnIds = [],
  viewportElement,
  rowHeight = 36,
  headerHeight = 40,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  selectedRanges?: GenDataGridRangeSelections;
  defaultSelectedRanges?: GenDataGridRangeSelections;
  onSelectedRangesChange?: (next: GenDataGridRangeSelections) => void;
  rowIds?: readonly string[];
  columnIds?: readonly string[];
  viewportElement?: HTMLElement | null;
  rowHeight?: number;
  headerHeight?: number;
}) {
  const [uncontrolledSelections, setUncontrolledSelections] =
    React.useState<GenDataGridRangeSelections>(() => defaultSelectedRanges ?? []);
  const selections = selectedRanges ?? uncontrolledSelections;
  const [dragAnchor, setDragAnchor] = React.useState<GenDataGridCellCoord | null>(null);
  const [dragMode, setDragMode] = React.useState<'replace' | 'append' | null>(null);
  const dragPointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const latestPointerRef = React.useRef<{ x: number; y: number } | null>(null);
  const latestFocusCoordRef = React.useRef<GenDataGridCellCoord | null>(null);
  const isDraggingRef = React.useRef(false);

  const setSelections = React.useCallback(
    (
      next:
        | GenDataGridRangeSelections
        | ((current: GenDataGridRangeSelections) => GenDataGridRangeSelections)
    ) => {
      const resolvedNext =
        typeof next === 'function'
          ? (next as (current: GenDataGridRangeSelections) => GenDataGridRangeSelections)(
              selections
            )
          : next;

      if (selectedRanges === undefined) {
        setUncontrolledSelections(resolvedNext);
      }
      onSelectedRangesChange?.(resolvedNext);
    },
    [onSelectedRangesChange, selectedRanges, selections]
  );

  React.useEffect(() => {
    if (!dragAnchor) return;

    const stopSelection = () => {
      setDragAnchor(null);
      setDragMode(null);
      isDraggingRef.current = false;
      dragPointerRef.current = null;
      latestPointerRef.current = null;
      latestFocusCoordRef.current = null;
    };

    window.addEventListener('mouseup', stopSelection);
    return () => window.removeEventListener('mouseup', stopSelection);
  }, [dragAnchor]);

  React.useEffect(() => {
    if (!enabled || !dragAnchor || !viewportElement || rowIds.length === 0) return;

    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (event.buttons === 0) {
        isDraggingRef.current = false;
        latestPointerRef.current = null;
        return;
      }
      latestPointerRef.current = { x: event.clientX, y: event.clientY };
    };

    const updateAutoScroll = () => {
      if (!isDraggingRef.current) {
        return;
      }

      const pointer = latestPointerRef.current;
      if (pointer) {
        const viewportRect = viewportElement.getBoundingClientRect();
        const viewportTop = viewportRect.top || getViewportTop(viewportElement);
        const viewportHeight = viewportRect.height || getViewportHeight(viewportElement, rowHeight);
        const viewportLeft = viewportRect.left || 0;
        const viewportWidth = viewportRect.width || viewportElement.clientWidth || 0;
        const viewportRight = viewportLeft + viewportWidth;
        const viewportBottom = viewportTop + viewportHeight;
        const topDistance = pointer.y - viewportTop;
        const bottomDistance = viewportBottom - pointer.y;
        const isInsideHorizontalBounds =
          viewportWidth <= 0 || (pointer.x >= viewportLeft && pointer.x <= viewportRight);
        const direction: -1 | 1 | 0 =
          isInsideHorizontalBounds && topDistance < autoScrollEdgeSize
            ? -1
            : isInsideHorizontalBounds && bottomDistance < autoScrollEdgeSize
              ? 1
              : 0;

        if (direction !== 0) {
          const edgeDistance = direction < 0 ? topDistance : bottomDistance;
          const intensity = Math.max(
            0,
            Math.min(1, (autoScrollEdgeSize - edgeDistance) / autoScrollEdgeSize)
          );
          const scrollDelta = Math.ceil(rowHeight * (0.25 + intensity * 1.25));
          viewportElement.scrollTop = Math.max(
            0,
            viewportElement.scrollTop + direction * scrollDelta
          );
          viewportElement.dispatchEvent(new Event('scroll'));

          const rowIndex = resolveAutoScrollRowIndex({
            viewport: viewportElement,
            rowHeight,
            headerHeight,
            direction,
            rowCount: rowIds.length,
          });
          const rowId = rowIds[rowIndex];
          const columnId = latestFocusCoordRef.current?.columnId ?? dragAnchor.columnId;

          if (rowId && columnId && columnIds.includes(columnId)) {
            const nextRange = {
              anchor: dragAnchor,
              focus: { rowId, columnId },
            };
            latestFocusCoordRef.current = nextRange.focus;
            setSelections((current) => {
              if (dragMode === 'append') {
                return current.length > 0 ? [...current.slice(0, -1), nextRange] : [nextRange];
              }
              return [nextRange];
            });
          }
        }
      }

      animationFrame = requestAnimationFrame(updateAutoScroll);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animationFrame = requestAnimationFrame(updateAutoScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [
    columnIds,
    dragAnchor,
    dragMode,
    enabled,
    headerHeight,
    rowHeight,
    rowIds,
    setSelections,
    viewportElement,
  ]);

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      if (event.button !== 0) return;

      const root = rootRef.current;
      const coord = resolveCellCoordFromTarget(root, event.target);
      if (!coord) {
        if (root && event.target === root && !isScrollbarMouseDown(root, event)) {
          setSelections([]);
        }
        return;
      }

      event.preventDefault();

      const previousSelection = selections[selections.length - 1] ?? null;
      const nextAnchor = event.shiftKey && previousSelection ? previousSelection.anchor : coord;
      const nextRange: GenDataGridRangeSelection = {
        anchor: nextAnchor,
        focus: coord,
      };

      if (event.ctrlKey || event.metaKey) {
        setSelections((current) => [...current, nextRange]);
        setDragMode('append');
      } else {
        setSelections((current) =>
          event.shiftKey && current.length > 0
            ? [...current.slice(0, -1), nextRange]
            : [nextRange]
        );
        setDragMode('replace');
      }
      setDragAnchor(nextAnchor);
      isDraggingRef.current = true;
      dragPointerRef.current = { x: event.clientX, y: event.clientY };
      latestPointerRef.current = { x: event.clientX, y: event.clientY };
      latestFocusCoordRef.current = coord;
    },
    [enabled, rootRef, selections, setSelections]
  );

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      if (!dragAnchor) return;

      const coord = resolveCellCoordFromTarget(rootRef.current, event.target);
      if (!coord) return;

      latestPointerRef.current = { x: event.clientX, y: event.clientY };
      latestFocusCoordRef.current = coord;

      const dragPointer = dragPointerRef.current;
      if (dragPointer) {
        const deltaX = Math.abs(event.clientX - dragPointer.x);
        const deltaY = Math.abs(event.clientY - dragPointer.y);
        if (deltaX < 2 && deltaY < 2) {
          return;
        }
      }

      setSelections((current) => {
        const nextRange: GenDataGridRangeSelection = {
          anchor: dragAnchor,
          focus: coord,
        };
        if (dragMode === 'append') {
          return current.length > 0 ? [...current.slice(0, -1), nextRange] : [nextRange];
        }
        return [nextRange];
      });
    },
    [dragAnchor, dragMode, enabled, rootRef, setSelections]
  );

  return {
    selections,
    selection: selections[selections.length - 1] ?? null,
    clearSelection: () => setSelections([]),
    setSingleSelection: (coord: GenDataGridCellCoord) =>
      setSelections([
        {
          anchor: coord,
          focus: coord,
        },
      ]),
    setSingleRange: (range: GenDataGridRangeSelection) => setSelections([range]),
    extendSelectionTo: (coord: GenDataGridCellCoord, anchor?: GenDataGridCellCoord) =>
      setSelections((current) => {
        const currentSelection = current[current.length - 1] ?? null;
        return [
          {
            anchor: currentSelection?.anchor ?? anchor ?? coord,
            focus: coord,
          },
        ];
      }),
    handleMouseDown,
    handleMouseOver,
  };
}
