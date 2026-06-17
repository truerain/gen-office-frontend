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

export function useRangeSelection({
  rootRef,
  enabled,
  selectedRanges,
  defaultSelectedRanges,
  onSelectedRangesChange,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  selectedRanges?: GenDataGridRangeSelections;
  defaultSelectedRanges?: GenDataGridRangeSelections;
  onSelectedRangesChange?: (next: GenDataGridRangeSelections) => void;
}) {
  const [uncontrolledSelections, setUncontrolledSelections] =
    React.useState<GenDataGridRangeSelections>(() => defaultSelectedRanges ?? []);
  const selections = selectedRanges ?? uncontrolledSelections;
  const [dragAnchor, setDragAnchor] = React.useState<GenDataGridCellCoord | null>(null);
  const [dragMode, setDragMode] = React.useState<'replace' | 'append' | null>(null);
  const dragPointerRef = React.useRef<{ x: number; y: number } | null>(null);

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
      dragPointerRef.current = null;
    };

    window.addEventListener('mouseup', stopSelection);
    return () => window.removeEventListener('mouseup', stopSelection);
  }, [dragAnchor]);

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
      dragPointerRef.current = { x: event.clientX, y: event.clientY };
    },
    [enabled, rootRef, selections, setSelections]
  );

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      if (!dragAnchor) return;

      const coord = resolveCellCoordFromTarget(rootRef.current, event.target);
      if (!coord) return;

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
    handleMouseDown,
    handleMouseOver,
  };
}
