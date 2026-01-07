import { flexRender } from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';
import { cn } from '@gen-office/utils';
import { useDataGrid, useVirtualization } from '../hooks';
import { ColumnHeader, ColumnCell } from '../columns';
import { Pagination } from '../pagination';
import type { DataGridProps } from './DataGrid.types';
import styles from './DataGrid.module.css';

export function DataGrid<TData extends RowData>(props: DataGridProps<TData>) {
  const {
    enableVirtualization = true,
    rowHeight = 48,
    height = '600px',
    striped = true,
    hoverable = true,
    compact = false,
    bordered = 'horizontal',
    stickyHeader = true,
    stickyColumns = 0,
    loading = false,
    loadingMessage = 'Loading...',
    emptyMessage = 'No data available',
    loadingComponent,
    emptyComponent,
    onRowClick,
    getRowClassName,
    showFooter = false,
    showPagination,
    onCellEdit,
    className,
    ...dataGridOptions
  } = props;

  const { enablePagination = false } = dataGridOptions;

  // Use DataGrid hook
  const table = useDataGrid(dataGridOptions);

  // Get rows
  const rows = table.getRowModel().rows;

  // Virtual scrolling
  const { containerRef, virtualRows, totalSize } = useVirtualization({
    rows,
    enabled: enableVirtualization && !enablePagination,
    rowHeight,
  });

  // Calculate sticky column positions
  const getStickyLeft = (index: number) => {
    if (index >= stickyColumns) return undefined;
    // Simple calculation - assume 150px per column (should be dynamic)
    return index * 150;
  };

  // Render loading state
  if (loading) {
    return (
      <div className={cn(styles.container, className)}>
        <div className={styles.loadingContainer}>
          {loadingComponent || (
            <>
              <div className={styles.spinner} />
              <p>{loadingMessage}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Render empty state
  if (rows.length === 0) {
    return (
      <div className={cn(styles.container, className)}>
        <div className={styles.emptyContainer}>
          {emptyComponent || <p>{emptyMessage}</p>}
        </div>
      </div>
    );
  }

  // Pagination info
  const paginationInfo = enablePagination && showPagination !== false ? {
    pageIndex: table.getState().pagination.pageIndex,
    pageSize: table.getState().pagination.pageSize,
    pageCount: table.getPageCount(),
    totalRows: table.getFilteredRowModel().rows.length,
    canPreviousPage: table.getCanPreviousPage(),
    canNextPage: table.getCanNextPage(),
    onFirstPage: () => table.setPageIndex(0),
    onPreviousPage: () => table.previousPage(),
    onNextPage: () => table.nextPage(),
    onLastPage: () => table.setPageIndex(table.getPageCount() - 1),
    onPageChange: (pageIndex: number) => table.setPageIndex(pageIndex),
  } : null;

  // Render table
  const paddingTop = virtualRows && virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom = virtualRows && virtualRows.length > 0
    ? totalSize! - (virtualRows[virtualRows.length - 1]?.end || 0)
    : 0;

  return (
    <div className={cn(styles.container, className)}>
      <div
        ref={containerRef}
        className={styles.tableContainer}
        style={{ height }}
      >
        <table className={cn(styles.table, compact && styles.compact, striped && styles.striped, hoverable && styles.hoverable)}>
          {/* Header */}
          <thead className={cn(styles.thead, stickyHeader && styles.stickyHeader)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className={styles.tr}>
                {headerGroup.headers.map((header, index) => {
                  const isLastColumn = index === headerGroup.headers.length - 1;
                  return (
                    <ColumnHeader
                      key={header.id}
                      header={header}
                      sticky={index < stickyColumns}
                      stickyLeft={getStickyLeft(index)}
                      bordered={bordered}
                      isLastColumn={isLastColumn}
                    />
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody className={styles.tbody}>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}

            {(virtualRows || rows.map((_, index) => ({ index }))).map((virtualRow) => {
              const row = rows[virtualRow.index];
              const visibleCells = row.getVisibleCells();

              return (
                <tr
                  key={row.id}
                  className={cn(
                    styles.tr,
                    onRowClick && styles.clickable,
                    getRowClassName?.(row)
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {visibleCells.map((cell, index) => {
                    const isLastColumn = index === visibleCells.length - 1;
                    return (
                      <ColumnCell
                        key={cell.id}
                        cell={cell}
                        sticky={index < stickyColumns}
                        stickyLeft={getStickyLeft(index)}
                        bordered={bordered}
                        isLastColumn={isLastColumn}
                        onCellEdit={onCellEdit}
                      />
                    );
                  })}
                </tr>
              );
            })}

            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>

          {/* Footer */}
          {showFooter && (
            <tfoot className={styles.tfoot}>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id} className={styles.tr}>
                  {footerGroup.headers.map((header) => (
                    <th key={header.id} className={styles.th}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.footer, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      {paginationInfo && <Pagination {...paginationInfo} />}
    </div>
  );
}
