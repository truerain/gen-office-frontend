// packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx
// Renders baseline body rows for the div-based DataGrid renderer.

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import type { GenDataGridActiveCell } from '../../GenDataGrid.types';
import { DataGridCell } from './DataGridCell';
import { formatCellValue, getCellValue } from './cellValue';
import { getColumnId } from './gridTemplate';

type DataGridBodyProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  gridTemplateColumns: string;
  getRowId: (row: TData, index: number) => string;
  rowHeight: number;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
};

export function DataGridBody<TData>({
  data,
  columns,
  gridTemplateColumns,
  getRowId,
  rowHeight,
  getRowHeight,
  activeCell,
  onActiveCellChange,
}: DataGridBodyProps<TData>) {
  return (
    <div role="rowgroup" data-gen-datagrid-body="true" className="gen-datagrid__body">
      {data.map((row, rowIndex) => {
        const rowId = getRowId(row, rowIndex);
        const resolvedRowHeight = getRowHeight?.({ row, rowId, rowIndex }) ?? rowHeight;
        return (
          <div
            key={rowId}
            role="row"
            data-rowid={rowId}
            data-row-index={rowIndex}
            className="gen-datagrid__row"
            style={{
              gridTemplateColumns,
              ['--gen-datagrid-current-row-height' as string]: `${resolvedRowHeight}px`,
            }}
          >
            {columns.map((column, columnIndex) => {
              const columnId = getColumnId(column, columnIndex);
              const value = getCellValue(row, rowIndex, column);
              return (
                <DataGridCell
                  key={columnId}
                  rowId={rowId}
                  columnId={columnId}
                  isActive={Boolean(
                    activeCell &&
                      activeCell.rowId === rowId &&
                      activeCell.columnId === columnId
                  )}
                  onActivate={onActiveCellChange}
                >
                  {formatCellValue(value)}
                </DataGridCell>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
