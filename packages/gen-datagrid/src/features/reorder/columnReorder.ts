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

type ReorderColumnPinningArgs = {
  columnPinning?: ColumnPinningState;
  movingColumnId: string;
  targetColumnId: string;
};

export function getColumnPinningZone(
  columnId: string,
  columnPinning?: ColumnPinningState
): PinningZone {
  if (columnPinning?.left?.includes(columnId)) return 'left';
  if (columnPinning?.right?.includes(columnId)) return 'right';
  return 'center';
}

function reorderIds(
  columnIds: readonly string[],
  movingColumnId: string,
  targetColumnId: string
) {
  if (movingColumnId === targetColumnId) return columnIds;

  const movingIndex = columnIds.indexOf(movingColumnId);
  const targetIndex = columnIds.indexOf(targetColumnId);
  if (movingIndex < 0 || targetIndex < 0) return columnIds;

  const next = [...columnIds];
  const [moving] = next.splice(movingIndex, 1);
  next.splice(targetIndex, 0, moving);
  return next;
}

export function reorderColumnOrder({
  columnOrder,
  columnPinning,
  movingColumnId,
  targetColumnId,
}: ReorderColumnOrderArgs) {
  if (movingColumnId === targetColumnId) return columnOrder;
  if (
    getColumnPinningZone(movingColumnId, columnPinning) !==
    getColumnPinningZone(targetColumnId, columnPinning)
  ) {
    return columnOrder;
  }

  return reorderIds(columnOrder, movingColumnId, targetColumnId);
}

export function reorderColumnPinning({
  columnPinning,
  movingColumnId,
  targetColumnId,
}: ReorderColumnPinningArgs): ColumnPinningState {
  const zone = getColumnPinningZone(movingColumnId, columnPinning);
  if (zone !== getColumnPinningZone(targetColumnId, columnPinning)) {
    return columnPinning ?? {};
  }

  if (zone === 'center') return columnPinning ?? {};

  const currentZoneIds = columnPinning?.[zone] ?? [];
  const nextZoneIds = reorderIds(currentZoneIds, movingColumnId, targetColumnId);
  if (nextZoneIds === currentZoneIds) return columnPinning ?? {};

  return {
    ...columnPinning,
    [zone]: nextZoneIds,
  };
}
