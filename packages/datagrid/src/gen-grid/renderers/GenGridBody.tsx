import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import styles from '../GenGrid.module.css';
import { getCellStyle, getColumnSizeStyle, getPinnedStyles } from './cellStyles';
import { useActiveCellNavigation } from '../features/active-cell/useActiveCellNavigation';
import type { ActiveCell } from '../types';
import { getMeta } from './utils';
import { SELECTION_COLUMN_ID } from '../features/selection';
import { ROW_NUMBER_COLUMN_ID } from '../features/useRowNumberColumn';

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
    onActiveCellChange: onActiveCellChange,
    // 예: selection 컬럼은 네비게이션에서 제외하고 싶으면
    isCellNavigable: (_, colId) => !isSystemCol(colId),
  });

  return (
    <tbody className={styles.tbody}>
      {rows.map((row) => (
        <tr key={row.id} className={styles.tr}>
          {row.getVisibleCells().map((cell) => {
                  const isActive = !!activeCell && activeCell.rowId === row.id && activeCell.columnId === cell.column.id;
                  const isSelectCol = cell.column.id === '__select__';
                  const meta = getMeta(cell.column.columnDef);
                  const alignClass =
                    meta?.align === 'right'
                      ? styles.alignRight
                      : meta?.align === 'center'
                        ? styles.alignCenter
                        : styles.alignLeft;
                  const pinned = cell.column.getIsPinned();
                  const sizeStyle = props.enableColumnSizing ? getColumnSizeStyle(cell.column) : undefined; // Step8: column sizing 스타일 적용
                  const pinnedStyle = props.enablePinning ? getPinnedStyles(cell.column, { isHeader: false }) : undefined;

                  return (
                      <td
                        key={cell.id}
                        className={[
                          styles.td,
                          alignClass, 
                          isSelectCol ? styles.selectCol : '',
                          meta?.mono ? styles.mono : '',
                          pinned ? styles.pinned : '',
                          pinned === 'left' ? styles.pinnedLeft : '',
                          pinned === 'right' ? styles.pinnedRight : ''
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={getCellStyle(cell.column, {
                          enablePinning,
                          enableColumnSizing,
                          isHeader: false
                        })}
                        {...nav.getCellProps(row.id, cell.column.id, isActive)}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
          )})}
        </tr>
      ))}
    </tbody>
  );
}
