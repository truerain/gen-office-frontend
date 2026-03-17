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

  const getGroupVisibilityToggle = (header: any) => {
    const meta = header?.column?.columnDef?.meta as
      | {
          groupVisibilityToggle?: {
            columnIds?: string[];
            expandLabel?: React.ReactNode;
            collapseLabel?: React.ReactNode;
            ariaLabel?: string;
          };
        }
      | undefined;
    const config = meta?.groupVisibilityToggle;
    if (!config) return null;

    const configuredColumnIds =
      Array.isArray(config.columnIds) && config.columnIds.length > 0 ? config.columnIds : null;
    const fallbackColumnIds: string[] =
      configuredColumnIds == null
        ? ((typeof header.column?.getLeafColumns === 'function'
            ? header.column.getLeafColumns()
            : []) as any[])
            .map((leafColumn) => leafColumn?.id)
            .filter((columnId): columnId is string => typeof columnId === 'string')
            .slice(1)
        : [];
    const targetColumnIds = configuredColumnIds ?? fallbackColumnIds;
    if (targetColumnIds.length === 0) return null;

    const targetColumns = targetColumnIds
      .map((columnId) => table.getColumn(columnId))
      .filter((column): column is NonNullable<typeof column> => Boolean(column));
    if (targetColumns.length === 0) return null;

    const isExpanded = targetColumns.every((column) => column.getIsVisible());
    return {
      isExpanded,
      expandLabel: config.expandLabel ?? '+',
      collapseLabel: config.collapseLabel ?? '-',
      ariaLabel: config.ariaLabel ?? 'Toggle grouped columns',
      onToggle: (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const nextVisible = !isExpanded;
        table.setColumnVisibility((prev) => {
          const next = { ...prev };
          targetColumns.forEach((column) => {
            next[column.id] = nextVisible;
          });
          return next;
        });
      },
    };
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
            const subHeaders: any[] = Array.isArray((header as any).subHeaders) ? (header as any).subHeaders : [];
            const hasParentColumn = Boolean((col as any).parent);
            const isStandaloneLeafPlaceholder =
              header.isPlaceholder && !hasParentColumn && header.colSpan === 1;
            const isLeafHeader = subHeaders.length === 0 || isStandaloneLeafPlaceholder;

            if (header.isPlaceholder && !isStandaloneLeafPlaceholder) return null;
            if (isLeafHeader) {
              if (renderedLeafColumnIds.has(col.id)) return null;
              renderedLeafColumnIds.add(col.id);
            }

            const resizing = col.getIsResizing?.() ?? false;
            const isSelectCol = header.column.id === '__select__';
            const canSort = col.getCanSort();
            const sortState = col.getIsSorted();
            const rowSpan = isLeafHeader ? Math.max(1, totalHeaderRows - idx) : 1;
            const groupToggle = getGroupVisibilityToggle(header);

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
                  {groupToggle ? (
                    <button
                      type="button"
                      className={styles.groupToggleButton}
                      aria-label={groupToggle.ariaLabel}
                      aria-expanded={groupToggle.isExpanded}
                      onClick={groupToggle.onToggle}
                    >
                      {groupToggle.isExpanded ? groupToggle.collapseLabel : groupToggle.expandLabel}
                    </button>
                  ) : null}
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
