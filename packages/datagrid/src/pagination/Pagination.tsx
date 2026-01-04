
import { Button } from '@gen-office/primitives'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@gen-office/utils';
import type { PaginationProps } from '../types';
import styles from './Pagination.module.css';

export function Pagination({
  pageIndex,
  pageSize,
  pageCount,
  totalRows,
  canPreviousPage,
  canNextPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = false,
  pageSizeOptions = [10, 20, 50, 100],
  compact = false,
}: PaginationProps) {
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className={cn(styles.container, compact && styles.compact)}>
      <div className={styles.info}>
        Showing {startRow} to {endRow} of {totalRows} rows
      </div>

      <div className={styles.controls}>
        {showPageSizeSelector && onPageSizeChange && (
          <div className={styles.pageSizeSelector}>
            <span className={styles.label}>Rows per page:</span>
            <select
              className={styles.select}
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.buttons}>
          <Button
            variant="outline"
            size="sm"
            onClick={onFirstPage}
            disabled={!canPreviousPage}
            aria-label="First page"
          >
            <ChevronsLeft size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousPage}
            disabled={!canPreviousPage}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </Button>

          <span className={styles.pageInfo}>
            Page {pageIndex + 1} of {pageCount}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!canNextPage}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onLastPage}
            disabled={!canNextPage}
            aria-label="Last page"
          >
            <ChevronsRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}