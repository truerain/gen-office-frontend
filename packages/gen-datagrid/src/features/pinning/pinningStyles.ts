// packages/gen-datagrid/src/features/pinning/pinningStyles.ts
// Builds sticky positioning styles and DOM markers for pinned columns.

import type * as React from 'react';
import type { Column } from '@tanstack/react-table';

export type GenDataGridPinningInfo = {
  pinned: 'left' | 'right' | false;
  isLastLeftPinned: boolean;
  isFirstRightPinned: boolean;
  style: React.CSSProperties;
};

export function getColumnPinningInfo<TData>(
  column: Column<TData, unknown>,
  options?: { zIndex?: number }
): GenDataGridPinningInfo {
  const pinned = column.getIsPinned();
  const isLastLeftPinned = pinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinned = pinned === 'right' && column.getIsFirstColumn('right');

  return {
    pinned,
    isLastLeftPinned,
    isFirstRightPinned,
    style:
      pinned === false
        ? {}
        : {
            position: 'sticky',
            left: pinned === 'left' ? `${column.getStart('left')}px` : undefined,
            right: pinned === 'right' ? `${column.getAfter('right')}px` : undefined,
            zIndex: options?.zIndex ?? 2,
          },
  };
}
