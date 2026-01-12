// DataGrid.tsx (변경 부분만 포함해서 전체 보여줄게)
import { flexRender } from '@tanstack/react-table';
import type { RowData } from '@tanstack/react-table';
import { cn } from '@gen-office/utils';
import { useDataGrid, useVirtualization } from '../hooks';
import type { UseDataGridOptions } from '../hooks';
import { ColumnHeader, ColumnCell } from '../columns';
import { Pagination } from '../pagination';
import type { DataGridProps, BulkAction } from './DataGrid.types';

import styles from './DataGrid.module.css';

export function DataGrid<TData extends RowData>(props: DataGridProps<TData>) {
  const {
    mode,
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

    bulkActions,
    showBulkActionsBar = true,
    showClearSelection = true,
  } = props;

  const dataGridOptions = props as unknown as UseDataGridOptions<TData>;

  const { enablePagination = false, enableRowSelection = false } = dataGridOptions;

  const table = useDataGrid<TData>(dataGridOptions);
  const rows = table.getRowModel().rows;

  const virtualizationEnabled =
    enableVirtualization && (mode === 'client' ? true : !enablePagination);

  const { containerRef, virtualRows, totalSize } = useVirtualization({
    rows,
    enabled: virtualizationEnabled,
    rowHeight,
  });

  const visibleColCount = table.getVisibleLeafColumns().length;

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const showBulkBar =
    showBulkActionsBar &&
    enableRowSelection &&
    selectedCount > 0 &&
    Boolean(bulkActions?.length || showClearSelection);

  const getStickyLeft = (index: number) => {
    if (!stickyColumns || index >= stickyColumns) return undefined;

    const cols = table.getVisibleLeafColumns();
    let left = 0;
    for (let i = 0; i < index; i++) {
      const metaWidth = cols[i]?.columnDef?.meta?.width;
      const w = typeof metaWidth === 'number' ? metaWidth : 150;
      left += w;
    }
    return left;
  };

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

  if (rows.length === 0) {
    return (
      <div className={cn(styles.container, className)}>
        <div className={styles.emptyContainer}>
          {emptyComponent || <p>{emptyMessage}</p>}
        </div>
      </div>
    );
  }

  const paginationInfo =
    enablePagination && showPagination !== false
      ? {
          pageIndex: table.getState().pagination.pageIndex,
          pageSize: table.getState().pagination.pageSize,
          pageCount: table.getPageCount(),
          totalRows: mode === 'client' ? table.getFilteredRowModel().rows.length : rows.length,
          canPreviousPage: table.getCanPreviousPage(),
          canNextPage: table.getCanNextPage(),
          onFirstPage: () => table.setPageIndex(0),
          onPreviousPage: () => table.previousPage(),
          onNextPage: () => table.nextPage(),
          onLastPage: () => table.setPageIndex(table.getPageCount() - 1),
          onPageChange: (pageIndex: number) => table.setPageIndex(pageIndex),
        }
      : null;

  const paddingTop = virtualRows && virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows && virtualRows.length > 0
      ? totalSize! - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div className={cn(styles.container, className)}>
      {/* ✅ Bulk Action Bar */}
      {showBulkBar && (
        <div className={styles.bulkBar}>
          <div className={styles.bulkBarLeft}>
            <strong>{selectedCount}</strong> selected
          </div>

          <div className={styles.bulkBarRight}>
            {bulkActions?.map((action: BulkAction<TData>) => {
              const disabled = action.disabled?.(selectedRows) ?? false;
              return (
                <button
                  key={action.key}
                  type="button"
                  className={styles.bulkButton}
                  disabled={disabled}
                  onClick={() => action.onClick(selectedRows)}
                >
                  {action.label}
                </button>
              );
            })}

            {showClearSelection && (
              <button
                type="button"
                className={styles.bulkButton}
                onClick={() => table.resetRowSelection()}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={containerRef} className={styles.tableContainer} style={{ height }}>
        <table
          className={cn(
            styles.table,
            compact && styles.compact,
            striped && styles.striped,
            hoverable && styles.hoverable
          )}
        >
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

          <tbody className={styles.tbody}>
            {paddingTop > 0 && (
              <tr>
                <td colSpan={visibleColCount} style={{ height: `${paddingTop}px` }} />
              </tr>
            )}

            {(virtualRows || rows.map((_, index) => ({ index }))).map((virtualRow) => {
              const row = rows[virtualRow.index];
              const visibleCells = row.getVisibleCells();

              return (
                <tr
                  key={row.id}
                  className={cn(styles.tr, onRowClick && styles.clickable, getRowClassName?.(row))}
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
                <td colSpan={visibleColCount} style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>

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

      {paginationInfo && <Pagination {...paginationInfo} />}
    </div>
  );
}
