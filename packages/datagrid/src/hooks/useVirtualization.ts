import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Row, RowData } from '@tanstack/react-table';

export interface UseVirtualizationOptions<TData extends RowData> {
  rows: Row<TData>[];
  enabled?: boolean;
  rowHeight?: number;
  overscan?: number;
}

export function useVirtualization<TData extends RowData>(
  options: UseVirtualizationOptions<TData>
) {
  const { rows, enabled = true, rowHeight = 48, overscan = 10 } = options;

  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => rowHeight,
    overscan,
    enabled,
  });

  const virtualRows = enabled ? virtualizer.getVirtualItems() : null;
  const totalSize = enabled ? virtualizer.getTotalSize() : undefined;

  return {
    containerRef,
    virtualizer,
    virtualRows,
    totalSize,
  };
}