// packages/gen-datagrid/src/renderers/div-grid/DataGridBody.tsx
// Renders baseline body rows for the div-based DataGrid renderer.

import * as React from 'react';
import { flexRender, type Row } from '@tanstack/react-table';

import type { GenDataGridActiveCell } from '../../GenDataGrid.types';
import {
  isCellInRangeSelections,
  type GenDataGridRangeSelections,
  type GenDataGridRangeSelection,
} from '../../features/range-selection/rangeSelection';
import { DataGridCell } from './DataGridCell';
import { formatCellValue } from './cellValue';

type DataGridBodyProps<TData> = {
  rows: Row<TData>[];
  gridTemplateColumns: string;
  rowHeight: number;
  rowIds: readonly string[];
  columnIds: readonly string[];
  rangeSelections: GenDataGridRangeSelections;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
};

export function DataGridBody<TData>({
  rows,
  gridTemplateColumns,
  rowHeight,
  rowIds,
  columnIds,
  rangeSelections,
  getRowHeight,
  activeCell,
  onActiveCellChange,
}: DataGridBodyProps<TData>) {
  return (
    <div role="rowgroup" data-gen-datagrid-body="true" className="gen-datagrid__body">
      {rows.map((row) => {
        const rowId = row.id;
        const rowIndex = row.index;
        const resolvedRowHeight =
          getRowHeight?.({ row: row.original, rowId, rowIndex }) ?? rowHeight;
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
            {row.getVisibleCells().map((cell) => {
              const columnId = cell.column.id;
              return (
                <DataGridCell
                  key={cell.id}
                  rowId={rowId}
                  columnId={columnId}
                  isActive={Boolean(
                    activeCell &&
                      activeCell.rowId === rowId &&
                      activeCell.columnId === columnId
                  )}
                  isSelected={isCellInRangeSelections({
                    rowId,
                    columnId,
                    rowIds,
                    columnIds,
                    selections: rangeSelections,
                  })}
                  onActivate={onActiveCellChange}
                >
                  {cell.column.columnDef.cell
                    ? flexRender(cell.column.columnDef.cell, cell.getContext())
                    : formatCellValue(cell.getValue())}
                </DataGridCell>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
