// packages/gen-datagrid/src/renderers/div-grid/DataGridFooterRow.tsx
// Renders column-aligned footer rows for the div-based DataGrid renderer.

import * as React from 'react';
import { flexRender, type Column, type HeaderGroup, type Table } from '@tanstack/react-table';

import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';

type DataGridFooterRowProps<TData> = {
  table: Table<TData>;
  footerGroups: HeaderGroup<TData>[];
  columns: Column<TData, unknown>[];
  gridTemplateColumns: string;
  enablePinning?: boolean;
  sticky?: boolean;
  footerRowHeight?: number;
};

function hasFooterContent<TData>(table: Table<TData>) {
  return table
    .getFooterGroups()
    .some((group) =>
      group.headers.some((header) => header.column.columnDef.footer != null)
    );
}

export function DataGridFooterRow<TData>({
  table,
  footerGroups,
  columns,
  gridTemplateColumns,
  enablePinning = true,
  sticky = false,
  footerRowHeight,
}: DataGridFooterRowProps<TData>) {
  if (!hasFooterContent(table)) return null;

  return (
    <div
      role="rowgroup"
      data-gen-datagrid-footer-row="true"
      data-sticky-footer-row={sticky ? 'true' : undefined}
      className="gen-datagrid__footer-rowgroup"
    >
      {footerGroups.map((footerGroup) => (
        <div
          key={footerGroup.id}
          role="row"
          className="gen-datagrid__row"
          style={{
            gridTemplateColumns,
            ['--gen-datagrid-footer-row-height' as string]:
              footerRowHeight !== undefined ? `${footerRowHeight}px` : undefined,
          }}
        >
          {columns.map((column) => {
            const footer = footerGroup.headers.find((item) => item.column.id === column.id);
            if (!footer) return null;

            const pinning = enablePinning
              ? getColumnPinningInfo(column, { zIndex: sticky ? 4 : 2 })
              : undefined;

            return (
              <div
                key={footer.id}
                role="gridcell"
                data-gen-datagrid-cell="true"
                data-cell-kind="footer"
                data-colid={column.id}
                data-pinned-cell={pinning?.pinned || undefined}
                data-pinned-edge={
                  pinning?.isLastLeftPinned
                    ? 'left-end'
                    : pinning?.isFirstRightPinned
                      ? 'right-start'
                      : undefined
                }
                className="gen-datagrid__footer-row-cell"
                style={pinning?.style}
              >
                {footer.isPlaceholder
                  ? null
                  : flexRender(column.columnDef.footer, footer.getContext())}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
