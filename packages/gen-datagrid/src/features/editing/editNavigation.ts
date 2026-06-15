// packages/gen-datagrid/src/features/editing/editNavigation.ts
// Resolves editable-cell navigation targets while editing.

import type { GenDataGridActiveCell } from '../../GenDataGrid.types';

type EditableCellCoord = Exclude<GenDataGridActiveCell, null>;

type ResolveNextEditableCellArgs = {
  editableCells: readonly EditableCellCoord[];
  current: EditableCellCoord;
  direction: 1 | -1;
};

export function resolveNextEditableCell({
  editableCells,
  current,
  direction,
}: ResolveNextEditableCellArgs): EditableCellCoord | null {
  const currentIndex = editableCells.findIndex(
    (cell) => cell.rowId === current.rowId && cell.columnId === current.columnId
  );
  if (currentIndex < 0) return null;

  const nextIndex = currentIndex + direction;
  if (nextIndex < 0 || nextIndex >= editableCells.length) return current;
  return editableCells[nextIndex];
}
