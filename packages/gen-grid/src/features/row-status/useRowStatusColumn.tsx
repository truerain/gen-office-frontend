import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ROW_STATUS_COLUMN_ID, type RowStatus } from './rowStatus';

export function useRowStatusColumn<TData>(args: {
  enabled?: boolean;
  isRowDirty?: (rowId: string) => boolean;
  rowStatusResolver?: (rowId: string) => RowStatus | undefined;
  width?: number;
}) {
  const { enabled, isRowDirty, rowStatusResolver, width = 44 } = args;

  return React.useMemo<ColumnDef<TData> | null>(() => {
    if (!enabled) return null;

    const col: ColumnDef<TData> = {
      id: ROW_STATUS_COLUMN_ID,
      header: '',
      size: width,
      enableSorting: false,
      enableColumnFilter: false,
      meta: {
        // system column
        align: 'center',
        mono: true,
        // pinned는 meta로만 두지 말고 실제 pinning state에 넣는게 핵심(기존 system처럼)
      },
      cell: ({ row }) => {
        const status =
          rowStatusResolver?.(row.id) ??
          (isRowDirty?.(row.id) ? 'updated' : 'clean');

        const tone =
          status === 'created'
            ? 'color-mix(in srgb, #16a34a 25%, transparent)'
            : status === 'updated'
              ? 'color-mix(in srgb, var(--color-focus, #3b82f6) 25%, transparent)'
              : status === 'deleted'
                ? 'color-mix(in srgb, #ef4444 25%, transparent)'
                : 'transparent';

        const symbol =
          status === 'created'
            ? '+'
            : status === 'updated'
              ? '●'
              : status === 'deleted'
                ? '×'
                : '';

        const symbolColor =
          status === 'created'
            ? '#16a34a'
            : status === 'updated'
              ? 'var(--color-focus, #3b82f6)'
              : status === 'deleted'
                ? '#ef4444'
                : 'var(--grid-cell-text)';

        const label =
          status === 'created'
            ? 'Created'
            : status === 'updated'
              ? 'Modified'
              : status === 'deleted'
                ? 'Deleted'
                : 'Clean';

        return (
          <span
            title={label}
            aria-label={label}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: 999,
              border: '1px solid var(--grid-border)',
              background: tone,
              color: symbolColor,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {symbol}
          </span>
        );
      },
    };

    return col;
  }, [enabled, isRowDirty, rowStatusResolver, width]);
}

export const withRowStatusColumn = <TData,>(
  columns: ColumnDef<TData, any>[],
  rowStatusColumn:ColumnDef<TData, any>
) => {
  return [rowStatusColumn, ...columns];
}
