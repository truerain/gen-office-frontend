// packages/gen-grid/src/components/layout/cellStyles.ts

import type * as React from 'react';
import type { Column } from '@tanstack/react-table';

export function getCellStyle<TData>(
  column: Column<TData, unknown>,
  opts: {
    enablePinning?: boolean;
    enableColumnSizing?: boolean;
    isHeader?: boolean;
  }
): React.CSSProperties | undefined {
  const pinnedStyle = opts.enablePinning
    ? getPinnedStyles(column, { isHeader: opts.isHeader })
    : undefined;

  const sizeStyle = opts.enableColumnSizing
    ? { width: column.getSize() }
    : undefined;

  return {
    ...(pinnedStyle ?? {}),
    ...(sizeStyle ?? {})
  };
}

export function getPinnedStyles<TData>(
  column: Column<TData, unknown>,
  opts?: { isHeader?: boolean }
): React.CSSProperties | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;

  const style: React.CSSProperties = {
    position: 'sticky',
    background: 'var(--color-surface, #fff)',
    zIndex: opts?.isHeader ? 30 : 3
  };

  if (pinned === 'left') style.left = column.getStart('left');
  if (pinned === 'right') style.right = column.getAfter('right');

  return style;
}


export function getColumnSizeStyle<TData>(column: Column<TData, unknown>) {
  // TanStack이 관리하는 size를 실제 DOM width로 반영
  return { width: column.getSize() };
}

