// packages/gen-datagrid/src/renderers/div-grid/DataGridHeader.tsx
// Renders the baseline header row for the div-based DataGrid renderer.

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { getColumnId } from './gridTemplate';

type DataGridHeaderProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  gridTemplateColumns: string;
};

function resolveHeader<TData>(column: ColumnDef<TData, unknown>, columnId: string) {
  const header = column.header;
  if (typeof header === 'string' || typeof header === 'number') return String(header);
  return columnId;
}

export function DataGridHeader<TData>({
  columns,
  gridTemplateColumns,
}: DataGridHeaderProps<TData>) {
  return (
    <div role="rowgroup" data-gen-datagrid-header="true" className="gen-datagrid__header">
      <div role="row" className="gen-datagrid__row" style={{ gridTemplateColumns }}>
        {columns.map((column, columnIndex) => {
          const columnId = getColumnId(column, columnIndex);
          return (
            <div
              key={columnId}
              role="columnheader"
              data-gen-datagrid-cell="true"
              data-cell-kind="header"
              data-colid={columnId}
              className="gen-datagrid__header-cell"
            >
              {resolveHeader(column, columnId)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
