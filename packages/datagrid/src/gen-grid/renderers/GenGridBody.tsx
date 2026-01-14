import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import styles from '../GenGrid.module.css';
import { getCellStyle, getColumnSizeStyle, getPinnedStyles } from './cellStyles';
import { getMeta } from './utils';

type GenGridBodyProps<TData> = {
  table: Table<TData>;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
};

export function GenGridBody<TData>(props: GenGridBodyProps<TData>) {
  const { table, enablePinning, enableColumnSizing } = props;
  const rows = table.getRowModel().rows;

  return (
    <tbody className={styles.tbody}>
      {rows.map((row) => (
        <tr key={row.id} className={styles.tr}>
          {row.getVisibleCells().map((cell) => {
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
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
          )})}
        </tr>
      ))}
    </tbody>
  );
}
