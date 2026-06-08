// packages/gen-datagrid/src/features/active-cell/navigation.ts
// Calculates active cell movement for keyboard navigation.

import type { GenDataGridActiveCell } from '../../GenDataGrid.types';

export type ActiveCellNavigationKey =
  | 'ArrowUp'
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'Home'
  | 'End'
  | 'PageUp'
  | 'PageDown';

type ResolveNextActiveCellArgs = {
  activeCell: GenDataGridActiveCell;
  rowIds: string[];
  columnIds: string[];
  key: ActiveCellNavigationKey;
  wholeGrid?: boolean;
  pageRowCount?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getFirstActiveCell(rowIds: string[], columnIds: string[]): GenDataGridActiveCell {
  const rowId = rowIds[0];
  const columnId = columnIds[0];
  return rowId && columnId ? { rowId, columnId } : null;
}

export function resolveNextActiveCell({
  activeCell,
  rowIds,
  columnIds,
  key,
  wholeGrid = false,
  pageRowCount = 10,
}: ResolveNextActiveCellArgs): GenDataGridActiveCell {
  if (rowIds.length === 0 || columnIds.length === 0) return null;
  if (!activeCell) return getFirstActiveCell(rowIds, columnIds);

  const currentRowIndex = rowIds.indexOf(activeCell.rowId);
  const currentColumnIndex = columnIds.indexOf(activeCell.columnId);
  const rowIndex = currentRowIndex >= 0 ? currentRowIndex : 0;
  const columnIndex = currentColumnIndex >= 0 ? currentColumnIndex : 0;

  switch (key) {
    case 'ArrowUp':
      return { rowId: rowIds[clamp(rowIndex - 1, 0, rowIds.length - 1)], columnId: columnIds[columnIndex] };
    case 'ArrowDown':
      return { rowId: rowIds[clamp(rowIndex + 1, 0, rowIds.length - 1)], columnId: columnIds[columnIndex] };
    case 'ArrowLeft':
      return { rowId: rowIds[rowIndex], columnId: columnIds[clamp(columnIndex - 1, 0, columnIds.length - 1)] };
    case 'ArrowRight':
      return { rowId: rowIds[rowIndex], columnId: columnIds[clamp(columnIndex + 1, 0, columnIds.length - 1)] };
    case 'Home':
      return {
        rowId: wholeGrid ? rowIds[0] : rowIds[rowIndex],
        columnId: columnIds[0],
      };
    case 'End':
      return {
        rowId: wholeGrid ? rowIds[rowIds.length - 1] : rowIds[rowIndex],
        columnId: columnIds[columnIds.length - 1],
      };
    case 'PageUp':
      return { rowId: rowIds[clamp(rowIndex - pageRowCount, 0, rowIds.length - 1)], columnId: columnIds[columnIndex] };
    case 'PageDown':
      return { rowId: rowIds[clamp(rowIndex + pageRowCount, 0, rowIds.length - 1)], columnId: columnIds[columnIndex] };
    default:
      return activeCell;
  }
}

export function isActiveCellNavigationKey(key: string): key is ActiveCellNavigationKey {
  return (
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'ArrowLeft' ||
    key === 'ArrowRight' ||
    key === 'Home' ||
    key === 'End' ||
    key === 'PageUp' ||
    key === 'PageDown'
  );
}
