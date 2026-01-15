// packages/datagrid/src/gen-grid/renderers/GenGridCell.tsx
import * as React from 'react';
import { flexRender, type Cell } from '@tanstack/react-table';
import { getCellStyle } from './cellStyles';
import { getMeta } from './utils';
import { SELECTION_COLUMN_ID } from '../features/selection';
import { ROW_NUMBER_COLUMN_ID } from '../features/useRowNumberColumn';

import styles from './GenGridBody.module.css';
import body from './GenGridBody.module.css';
import pinning from './GenGridPinning.module.css';

type GenGridCellProps<TData> = {
  cell: Cell<TData, unknown>;
  rowId: string;
  isActive: boolean;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  // useActiveCellNavigation 에서 주는 props (role/tabIndex/onKeyDown/onClick 등)
  navCellProps: React.HTMLAttributes<HTMLTableCellElement>;
};

export function GenGridCell<TData>(props: GenGridCellProps<TData>) {
  const { cell, rowId, isActive, enablePinning, enableColumnSizing, navCellProps } = props;

  const colId = cell.column.id;
  const pinned = cell.column.getIsPinned();

  const meta = getMeta(cell.column.columnDef);

  const alignClass =
    meta?.align === 'right'
      ? styles.alignRight
      : meta?.align === 'center'
        ? styles.alignCenter
        : styles.alignLeft;

  const isSystemCol = colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID;

  return (
    <td
      key={cell.id}
      className={[
        styles.td,
        alignClass,
        isSystemCol ? styles.systemCol : '',
        meta?.mono ? styles.mono : '',
        pinned ? styles.pinned : '',
        pinned === 'left' ? styles.pinnedLeft : '',
        pinned === 'right' ? styles.pinnedRight : '',
        isActive ? styles.activeCell : '', // 있으면 사용, 없으면 제거해도 됨
      ]
        .filter(Boolean)
        .join(' ')}
      style={getCellStyle(cell.column, {
        enablePinning,
        enableColumnSizing,
        isHeader: false,
      })}
      {...navCellProps}
      data-rowid={rowId}
      data-colid={colId}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}
