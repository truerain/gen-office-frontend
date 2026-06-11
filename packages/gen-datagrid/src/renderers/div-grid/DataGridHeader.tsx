// packages/gen-datagrid/src/renderers/div-grid/DataGridHeader.tsx
// Renders the baseline header row for the div-based DataGrid renderer.

import * as React from 'react';
import { flexRender, type HeaderGroup } from '@tanstack/react-table';

import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';

type DataGridHeaderProps<TData> = {
  headerGroups: HeaderGroup<TData>[];
  gridTemplateColumns: string;
};

export function DataGridHeader<TData>({
  headerGroups,
  gridTemplateColumns,
}: DataGridHeaderProps<TData>) {
  return (
    <div role="rowgroup" data-gen-datagrid-header="true" className="gen-datagrid__header">
      {headerGroups.map((headerGroup) => (
        <div
          key={headerGroup.id}
          role="row"
          className="gen-datagrid__row"
          style={{ gridTemplateColumns }}
        >
          {headerGroup.headers.map((header) => {
            const columnId = header.column.id;
            const pinning = getColumnPinningInfo(header.column);
            return (
            <div
              key={header.id}
              role="columnheader"
              data-gen-datagrid-cell="true"
              data-cell-kind="header"
              data-colid={columnId}
              data-pinned-cell={pinning.pinned || undefined}
              data-pinned-edge={
                pinning.isLastLeftPinned
                  ? 'left-end'
                  : pinning.isFirstRightPinned
                    ? 'right-start'
                    : undefined
              }
              className="gen-datagrid__header-cell"
              style={pinning.style}
            >
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
