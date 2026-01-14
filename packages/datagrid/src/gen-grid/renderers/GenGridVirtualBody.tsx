import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import styles from '../GenGrid.module.css';
import { getCellStyle, getColumnSizeStyle, getPinnedStyles } from './cellStyles';
import { getMeta } from './utils';

type GenGridVirtualBodyProps<TData> = {
  table: Table<TData>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  rowHeight: number;
  overscan: number;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;
};

export function GenGridVirtualBody<TData>(props: GenGridVirtualBodyProps<TData>) {
  const {
    table,
    scrollRef,
    rowHeight,
    overscan,
    enablePinning,
    enableColumnSizing
  } = props;

  const rows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualItems.length ? virtualItems[0]!.start : 0;
  const paddingBottom = virtualItems.length
    ? totalSize - virtualItems[virtualItems.length - 1]!.end
    : 0;

  const colSpan = table.getVisibleLeafColumns().length;

  React.useLayoutEffect(() => {
    // scrollRef가 잡힌 뒤 한 번 측정
    rowVirtualizer.measure();
    // 레이아웃이 한 프레임 늦게 잡히는 경우까지 커버
    requestAnimationFrame(() => rowVirtualizer.measure());
  }, [rowVirtualizer, rows.length, rowHeight]);

  return (
    <tbody className={styles.tbody}>
      {/* top spacer */}
      {paddingTop > 0 ? (
        <tr>
          <td colSpan={colSpan} style={{ height: paddingTop, padding: 0, border: 0 }} />
        </tr>
      ) : null}

      {/* visible rows */}
      {virtualItems.map((v) => {
        const row = rows[v.index]!;
        return (
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
        );
      })}

      {/* bottom spacer */}
      {paddingBottom > 0 ? (
        <tr>
          <td colSpan={colSpan} style={{ height: paddingBottom, padding: 0, border: 0 }} />
        </tr>
      ) : null}
    </tbody>
  );
}
