import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import styles from '../GenGrid.module.css';
import { getCellStyle } from './cellStyles';

type GenGridHeaderProps<TData> = {
  table: Table<TData>;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableFiltering?: boolean;

  // Step8.5 auto-size를 header 안에서 쓸 거면 table이 필요하니 여기서 구현 가능
  onAutoSizeColumn?: (columnId: string) => void;

  // filter cell 렌더는 기존 구현을 그대로 이쪽으로 옮기기
  renderFilterCell?: (header: any) => React.ReactNode;
};

export function GenGridHeader<TData>(props: GenGridHeaderProps<TData>) {
  const {
    table,
    enablePinning,
    enableColumnSizing,
    enableFiltering,
    onAutoSizeColumn,
    renderFilterCell
  } = props;

  const headerGroups = table.getHeaderGroups();
  const leafHeaderGroup = headerGroups[headerGroups.length - 1];

  return (
    <thead className={styles.thead}>
      {headerGroups.map((hg, idx) => (
        <tr
          key={hg.id}
          className={[
            styles.tr,
            styles.headerRow,
            styles[`headerRow${idx}` as any]
          ].filter(Boolean).join(' ')}
        >
          {hg.headers.map((header) => {
            const col = header.column;
            const resizing = col.getIsResizing?.() ?? false;
            const isSelectCol = header.column.id === '__select__';
            
            return (
              <th
                key={header.id}
                className={[styles.th, isSelectCol ? styles.selectCol : ''].filter(Boolean).join(' ')}
                style={getCellStyle(col, {
                  enablePinning,
                  enableColumnSizing,
                  isHeader: true
                })}
                colSpan={header.colSpan}
              >
                <div className={styles.thInner}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(col.columnDef.header, header.getContext())}

                  {/* ✅ (예시) 리사이저 핸들: leaf header에서만 */}
                  {enableColumnSizing && header.colSpan === 1 && header.getResizeHandler ? (
                    <div
                      className={[
                        styles.resizer,
                        resizing ? styles.resizerActive : ''
                      ].filter(Boolean).join(' ')}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onAutoSizeColumn?.(col.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : null}

                  {/* ✅ (예시) pin/sort UI도 기존 코드 여기로 이동 */}
                </div>
              </th>
            );
          })}
        </tr>
      ))}

      {enableFiltering && renderFilterCell ? (
        <tr
          className={[
            styles.tr,
            styles.headerRow,
            styles.filterRow,
            styles[`headerRow${headerGroups.length}` as any]
          ].filter(Boolean).join(' ')}
        >
          {/* filter row는 leaf header 기준이 안전 */}
          {leafHeaderGroup.headers.map((header) => {
              const isSelectCol = header.column.id === '__select__';
            const colDef: any = header.column.columnDef;
            const hasAccessorKey = !!colDef.accessorKey;
            const col = header.column;
            const canFilter = header.column.getCanFilter() && hasAccessorKey && !isSelectCol;
            return (
              <th
                key={header.id}
                className={[styles.th, styles.columnFilter].filter(Boolean).join(' ')}
                style={getCellStyle(col, {
                  enablePinning,
                  enableColumnSizing,
                  isHeader: true
                })}
              >
                  {canFilter ? (
                    <input
                      className={styles.filterInput}
                      value={(header.column.getFilterValue() ?? '') as string}
                      onChange={(e) => header.column.setFilterValue(e.target.value)}
                      placeholder="Filter..."
                    />
                  ) : null}
              </th>
            );
          })}
        </tr>
      ) : null}
    </thead>
  );
}
