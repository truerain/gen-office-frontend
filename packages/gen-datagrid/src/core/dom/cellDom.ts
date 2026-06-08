// packages/gen-datagrid/src/core/dom/cellDom.ts
// Provides root-scoped cell DOM lookup and focus helpers.

import { getCellSelector } from './selectors';

export type GenDataGridCellCoord = {
  rowId: string;
  columnId: string;
};

export function findCellInRoot(root: HTMLElement | null, coord: GenDataGridCellCoord) {
  if (!root) return null;
  return root.querySelector<HTMLElement>(getCellSelector(coord.rowId, coord.columnId));
}

export function focusCellInRoot(root: HTMLElement | null, coord: GenDataGridCellCoord) {
  const cell = findCellInRoot(root, coord);
  if (!cell) return false;

  cell.focus({ preventScroll: true });
  cell.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  return true;
}
