import * as React from 'react';
import type { Table } from '@tanstack/react-table';
import { useActiveCellNavigation } from '../features/active-cell/useActiveCellNavigation';
import type { ActiveCell } from '../types';
import { SELECTION_COLUMN_ID } from '../features/selection';
import { ROW_NUMBER_COLUMN_ID } from '../features/useRowNumberColumn';
import { GenGridCell } from './GenGridCell';

import styles from './GenGridBody.module.css';

type GenGridBodyProps<TData> = {
  table: Table<TData>;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  activeCell: ActiveCell;
  onCellClick?: (rowId: string, columnId: string) => void;
  onActiveCellChange: (next: { rowId: string; columnId: string }) => void;
};

export function GenGridBody<TData>(props: GenGridBodyProps<TData>) {
  const { table, enablePinning, enableColumnSizing, activeCell, onActiveCellChange } = props;
  const rows = table.getRowModel().rows;

  const isSystemCol = (colId: string) =>
    colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID;

  const nav = useActiveCellNavigation({
    table,
    activeCell,
    onActiveCellChange,
    isCellNavigable: (_, colId) => !isSystemCol(colId),
  });

  return (
    <tbody className={styles.tbody}>
      {rows.map((row) => (
        <tr key={row.id} className={styles.tr}>
          {row.getVisibleCells().map((cell) => {
            const isActive =
              !!activeCell &&
              activeCell.rowId === row.id &&
              activeCell.columnId === cell.column.id;

            return (
              <GenGridCell
                key={cell.id}
                cell={cell as any}
                rowId={row.id}
                isActive={isActive}
                enablePinning={enablePinning}
                enableColumnSizing={enableColumnSizing}
                navCellProps={nav.getCellProps(row.id, cell.column.id, isActive)}
              />
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}
