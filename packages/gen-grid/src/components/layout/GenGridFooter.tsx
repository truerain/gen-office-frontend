// packages/gen-grid/src/components/layout/GenGridFooter.tsx

import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';

import { getCellStyle } from './cellStyles';
import { getMeta } from './utils';
import { SELECTION_COLUMN_ID } from '../../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';

import bodyStyles from './GenGridBody.module.css';
import footerStyles from './GenGridFooter.module.css';
import pinningStyles from './GenGridPinning.module.css';

type GenGridFooterProps<TData> = {
  table: Table<TData>;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
};

function hasFooterContent<TData>(table: Table<TData>) {
  const groups = table.getFooterGroups();
  for (const group of groups) {
    for (const header of group.headers) {
      if (header.isPlaceholder) continue;
      if (header.column.columnDef.footer != null) return true;
    }
  }
  return false;
}

export function GenGridFooter<TData>(props: GenGridFooterProps<TData>) {
  const { table, enablePinning, enableColumnSizing } = props;

  if (!hasFooterContent(table)) return null;

  const footerGroups = table.getFooterGroups();

  return (
    <tfoot className={footerStyles.tfoot}>
      {footerGroups.map((fg, idx) => (
        <tr
          key={fg.id}
          className={[
            footerStyles.tr,
            footerStyles.footerRow,
            footerStyles[`footerRow${idx}` as any],
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {fg.headers.map((footer) => {
            const col = footer.column;
            const colId = col.id;
            const meta = getMeta(col.columnDef) as any;

            const isSystemCol = colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID;
            const alignClass =
              meta?.align === 'right'
                ? bodyStyles.alignRight
                : meta?.align === 'center'
                  ? bodyStyles.alignCenter
                  : bodyStyles.alignLeft;

            const pinned = col.getIsPinned();

            return (
              <td
                key={footer.id}
                className={[
                  bodyStyles.td,
                  footerStyles.td,
                  alignClass,
                  isSystemCol ? bodyStyles.selectCol : '',
                  meta?.mono ? bodyStyles.mono : '',
                  pinned ? pinningStyles.pinned : '',
                  pinned === 'left' ? pinningStyles.pinnedLeft : '',
                  pinned === 'right' ? pinningStyles.pinnedRight : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={getCellStyle(col, {
                  enablePinning,
                  enableColumnSizing,
                  isHeader: false,
                })}
                colSpan={footer.colSpan}
              >
                {footer.isPlaceholder
                  ? null
                  : flexRender(col.columnDef.footer, footer.getContext())}
              </td>
            );
          })}
        </tr>
      ))}
    </tfoot>
  );
}
