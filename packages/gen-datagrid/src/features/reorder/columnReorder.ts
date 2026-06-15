// packages/gen-datagrid/src/features/reorder/columnReorder.ts
// Resolves column reorder operations while preserving pinning zones.

import type { ColumnPinningState } from '@tanstack/react-table';

type PinningZone = 'left' | 'center' | 'right';

type ReorderColumnOrderArgs = {
  columnOrder: readonly string[];
  columnPinning?: ColumnPinningState;
  movingColumnId: string;
  targetColumnId: string;
};

function getPinningZone(columnId: string, columnPinning?: ColumnPinningState): PinningZone {
  if (columnPinning?.left?.includes(columnId)) return 'left';
  if (columnPinning?.right?.includes(columnId)) return 'right';
  return 'center';
}

export function reorderColumnOrder({
  columnOrder,
  columnPinning,
  movingColumnId,
  targetColumnId,
}: ReorderColumnOrderArgs) {
  if (movingColumnId === targetColumnId) return columnOrder;
  if (getPinningZone(movingColumnId, columnPinning) !== getPinningZone(targetColumnId, columnPinning)) {
    return columnOrder;
  }

  const movingIndex = columnOrder.indexOf(movingColumnId);
  const targetIndex = columnOrder.indexOf(targetColumnId);
  if (movingIndex < 0 || targetIndex < 0) return columnOrder;

  const next = [...columnOrder];
  const [moving] = next.splice(movingIndex, 1);
  next.splice(targetIndex, 0, moving);
  return next;
}
