// packages/gen-grid/src/components/layout/GenGridHeader.tsx

import * as React from 'react';
import { flexRender, type Table } from '@tanstack/react-table';
import { FilterCellPopover } from '../../features/filtering/FilterCellPopover';
import { getCellStyle } from './cellStyles';

import styles from './GenGridHeader.module.css';
import pinning from './GenGridPinning.module.css';

type GenGridHeaderProps<TData> = {
  table: Table<TData>;

  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableFiltering?: boolean;

  onAutoSizeColumn?: (columnId: string) => void;
  renderFilterCell?: (header: any) => React.ReactNode;
};

export function GenGridHeader<TData>(props: GenGridHeaderProps<TData>) {
  const { table, enablePinning, enableColumnSizing, enableFiltering, onAutoSizeColumn, renderFilterCell } = props;

  const headerGroups = table.getHeaderGroups();
  const leafHeaderGroup = headerGroups[headerGroups.length - 1];
  const totalHeaderRows = headerGroups.length;
  const renderedLeafColumnIds = new Set<string>();

  const getHeaderCellStyle = (header: any) => {
    const col = header.column;
    const baseStyle = getCellStyle(col, {
      enablePinning,
      enableColumnSizing,
      isHeader: true,
    });

    if (!enableColumnSizing || header.colSpan <= 1) {
      return baseStyle;
    }

    const leafHeaders: any[] = typeof header.getLeafHeaders === 'function' ? header.getLeafHeaders() : [];
    if (!leafHeaders.length) return baseStyle;

    const width = leafHeaders.reduce((sum, leafHeader) => sum + (leafHeader?.column?.getSize?.() ?? 0), 0);
    if (!Number.isFinite(width) || width <= 0) return baseStyle;

    return {
      ...(baseStyle ?? {}),
      width,
      minWidth: width,
    } as React.CSSProperties;
  };

  return (
    <thead className={styles.thead}>
      {headerGroups.map((hg, idx) => (
        <tr
          key={hg.id}
          className={[styles.tr, styles.headerRow, styles[`headerRow${idx}` as any]].filter(Boolean).join(' ')}
        >
          {hg.headers.map((header) => {
            const col = header.column;
            const isLeafBySpan = header.colSpan === 1;
            const subHeaders: any[] = Array.isArray((header as any).subHeaders) ? (header as any).subHeaders : [];
            const isLeafHeader = isLeafBySpan || subHeaders.length === 0;
            const hasParentColumn = Boolean((col as any).parent);
            const shouldRenderLeafPlaceholder = header.isPlaceholder && isLeafBySpan && !hasParentColumn;

            if (isLeafBySpan) {
              if (header.isPlaceholder && !shouldRenderLeafPlaceholder) return null;
              if (renderedLeafColumnIds.has(col.id)) return null;
              renderedLeafColumnIds.add(col.id);
            } else if (header.isPlaceholder) {
              return null;
            }

            const resizing = col.getIsResizing?.() ?? false;
            const isSelectCol = header.column.id === '__select__';
            const canSort = col.getCanSort();
            const sortState = col.getIsSorted();
            const rowSpan = isLeafHeader ? Math.max(1, totalHeaderRows - idx) : 1;

            return (
              <th
                key={header.id}
                className={[
                  styles.th,
                  isSelectCol ? styles.selectCol : '',
                  canSort ? styles.sortable : '',
                  sortState ? styles.sorted : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={getHeaderCellStyle(header)}
                colSpan={header.colSpan}
                rowSpan={rowSpan > 1 ? rowSpan : undefined}
              >
                <div className={styles.thInner} onClick={canSort ? col.getToggleSortingHandler() : undefined}>
                  {flexRender(col.columnDef.header, header.getContext())}
                  {sortState ? <span className={styles.sortIcon}>{sortState === 'asc' ? '^' : 'v'}</span> : null}
                </div>

                {enableColumnSizing && header.colSpan === 1 && header.getResizeHandler ? (
                  <div
                    className={[pinning.resizer, resizing ? pinning.resizerActive : ''].filter(Boolean).join(' ')}
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onAutoSizeColumn?.(col.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : null}
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
            styles[`headerRow${headerGroups.length}` as any],
          ]
            .filter(Boolean)
            .join(' ')}
        >
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
                  isHeader: true,
                })}
              >
                {canFilter ? <FilterCellPopover header={header} /> : null}
              </th>
            );
          })}
        </tr>
      ) : null}
    </thead>
  );
}