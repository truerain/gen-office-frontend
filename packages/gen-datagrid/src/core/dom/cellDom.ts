// packages/gen-datagrid/src/core/dom/cellDom.ts
// Provides root-scoped cell DOM lookup and focus helpers.

import { getOwningGridRoot } from './gridBoundary';
import { getCellSelector, gridViewportSelector } from './selectors';

export type GenDataGridCellCoord = {
  rowId: string;
  columnId: string;
};

export function findCellInRoot(root: HTMLElement | null, coord: GenDataGridCellCoord) {
  if (!root) return null;
  const candidates = root.querySelectorAll<HTMLElement>(
    getCellSelector(coord.rowId, coord.columnId)
  );
  return (
    Array.from(candidates).find((cell) => {
      const ownerRoot = getOwningGridRoot(cell);
      return ownerRoot === root || (!ownerRoot && root.contains(cell));
    }) ?? null
  );
}

export function focusCellInRoot(root: HTMLElement | null, coord: GenDataGridCellCoord) {
  const cell = findCellInRoot(root, coord);
  if (!cell) return false;

  cell.focus({ preventScroll: true });
  scrollCellElementIntoView(root, cell);
  return true;
}

export function scrollCellIntoViewInRoot(root: HTMLElement | null, coord: GenDataGridCellCoord) {
  const cell = findCellInRoot(root, coord);
  if (!cell) return false;

  scrollCellElementIntoView(root, cell);
  return true;
}

function scrollCellElementIntoView(root: HTMLElement | null, cell: HTMLElement) {
  cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  scrollCellIntoUnpinnedViewport(root, cell);
}

function scrollCellIntoUnpinnedViewport(root: HTMLElement | null, cell: HTMLElement) {
  if (!root) return;
  if (cell.dataset.pinnedCell) return;

  const viewport = Array.from(root.querySelectorAll<HTMLElement>(gridViewportSelector)).find(
    (item) => {
      const ownerRoot = getOwningGridRoot(item);
      return ownerRoot === root || (!ownerRoot && root.contains(item));
    }
  );
  if (!viewport) return;

  const viewportRect = viewport.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();
  const pinnedBounds = getPinnedViewportBounds(root, viewportRect);
  const visibleLeft = pinnedBounds.left;
  const visibleRight = pinnedBounds.right;

  if (cellRect.left < visibleLeft) {
    viewport.scrollLeft -= visibleLeft - cellRect.left;
    return;
  }

  if (cellRect.right > visibleRight) {
    viewport.scrollLeft += cellRect.right - visibleRight;
  }
}

function getPinnedViewportBounds(root: HTMLElement, viewportRect: DOMRect) {
  let left = viewportRect.left;
  let right = viewportRect.right;

  root
    .querySelectorAll<HTMLElement>(
      '[data-gen-datagrid-cell="true"][data-cell-kind="header"][data-pinned-cell="left"]'
    )
    .forEach((cell) => {
      const ownerRoot = getOwningGridRoot(cell);
      if (ownerRoot && ownerRoot !== root) return;
      const rect = cell.getBoundingClientRect();
      left = Math.max(left, rect.right);
    });

  root
    .querySelectorAll<HTMLElement>(
      '[data-gen-datagrid-cell="true"][data-cell-kind="header"][data-pinned-cell="right"]'
    )
    .forEach((cell) => {
      const ownerRoot = getOwningGridRoot(cell);
      if (ownerRoot && ownerRoot !== root) return;
      const rect = cell.getBoundingClientRect();
      right = Math.min(right, rect.left);
    });

  return { left, right };
}
