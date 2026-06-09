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
    };

    window.addEventListener('mouseup', stopSelection);
    return () => window.removeEventListener('mouseup', stopSelection);
  }, [dragAnchor]);

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      if (event.button !== 0) return;

      const coord = resolveCellCoordFromTarget(rootRef.current, event.target);
      if (!coord) {
        if (event.target === rootRef.current) {
          setSelections([]);
        }
        return;
      }

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
    },
    [enabled, rootRef, selections, setSelections]
  );

  const handleMouseOver = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (!enabled) return;
      if (!dragAnchor) return;

      const coord = resolveCellCoordFromTarget(rootRef.current, event.target);
      if (!coord) return;

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
