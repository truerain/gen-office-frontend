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
        align: 'center',
        mono: true,
      },
      cell: ({ row }) => {
        const status =
          rowStatusResolver?.(row.id) ??
          (isRowDirty?.(row.id) ? 'updated' : 'clean');

        const tone =
          status === 'created'
            ? 'var(--grid-row-status-created-bg)'
            : status === 'updated'
              ? 'var(--grid-row-status-updated-bg)'
              : status === 'deleted'
                ? 'var(--grid-row-status-deleted-bg)'
                : 'transparent';

        const symbol =
          status === 'created'
            ? 'C'
            : status === 'updated'
              ? 'M'
              : status === 'deleted'
                ? 'D'
                : '';

        const symbolColor =
          status === 'created'
            ? 'var(--grid-row-status-created-fg)'
            : status === 'updated'
              ? 'var(--grid-row-status-updated-fg)'
              : status === 'deleted'
                ? 'var(--grid-row-status-deleted-fg)'
                : 'var(--grid-row-status-clean-fg)';

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
              width: 'var(--grid-row-status-badge-size)',
              height: 'var(--grid-row-status-badge-size)',
              borderRadius: 'var(--grid-row-status-badge-radius)',
              border: '1px solid var(--grid-row-status-border)',
              background: tone,
              color: symbolColor,
              fontSize: 'var(--grid-row-status-font-size)',
              fontWeight: 'var(--grid-row-status-font-weight)',
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
  rowStatusColumn: ColumnDef<TData, any>
) => {
  return [rowStatusColumn, ...columns];
};
