import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ROW_STATUS_COLUMN_ID } from './rowStatus';

export function useRowStatusColumn<TData>(args: {
  enabled?: boolean;
  isRowDirty?: (rowId: string) => boolean;
  width?: number;
}) {
  const { enabled, isRowDirty, width = 44 } = args;

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
        const dirty = isRowDirty?.(row.id) ?? false;
        return (
          <span
            title={dirty ? 'Modified' : 'Clean'}
            aria-label={dirty ? 'Modified' : 'Clean'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 18,
              height: 18,
              borderRadius: 999,
              border: '1px solid var(--grid-border)',
              background: dirty ? 'color-mix(in srgb, var(--color-focus, #3b82f6) 25%, transparent)' : 'transparent',
            }}
          />
        );
      },
    };

    return col;
  }, [enabled, isRowDirty, width]);
}

export const withRowStatusColumn = <TData,>(
  columns: ColumnDef<TData, any>[],
  rowStatusColumn:ColumnDef<TData, any>
) => {
  return [rowStatusColumn, ...columns];
}
