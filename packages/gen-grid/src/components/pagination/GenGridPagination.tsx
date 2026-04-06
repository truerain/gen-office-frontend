// packages/gen-grid/src/components/pagination/GenGridPagination.tsx

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import styles from './GenGridPagination.module.css';

type Props<TData> = {
  table: Table<TData>;
  pageSizeOptions?: number[];
};

type PageItem = number | 'ellipsis';

function buildPageItems(pageCount: number, currentPageIndex: number): PageItem[] {
  if (pageCount <= 0) return [];
  if (pageCount <= 9) return Array.from({ length: pageCount }, (_, i) => i);

  const candidates = new Set<number>([
    0,
    1,
    pageCount - 2,
    pageCount - 1,
    currentPageIndex - 1,
    currentPageIndex,
    currentPageIndex + 1,
  ]);

  const pages = Array.from(candidates)
    .filter((page) => page >= 0 && page < pageCount)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  for (let i = 0; i < pages.length; i += 1) {
    const page = pages[i]!;
    const prev = pages[i - 1];
    if (typeof prev === 'number' && page - prev > 1) {
      items.push('ellipsis');
    }
    items.push(page);
  }
  return items;
}

export function GenGridPagination<TData>({ table, pageSizeOptions }: Props<TData>) {
  const options = React.useMemo(() => {
    if (!pageSizeOptions) return [];
    const uniq = new Set<number>();
    for (const size of pageSizeOptions) {
      if (!Number.isFinite(size) || size <= 0) continue;
      uniq.add(Math.floor(size));
    }
    return Array.from(uniq);
  }, [pageSizeOptions]);

  const showPageSizeSelector = options.length > 0;
  const { pageIndex, pageSize } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pageItems = React.useMemo(
    () => buildPageItems(pageCount, pageIndex),
    [pageCount, pageIndex]
  );

 return (
    <div className={styles.pager}>
      <div className={styles.pagerLeft}>
        <button
          type="button"
          className={styles.pagerBtn}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Prev
        </button>

        <div className={styles.pagerPages}>
          {pageItems.map((item, idx) =>
            item === 'ellipsis' ? (
              <span key={`ellipsis-${idx}`} className={styles.pagerEllipsis}>
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                className={`${styles.pagerBtn} ${item === pageIndex ? styles.pagerBtnActive : ''}`}
                onClick={() => table.setPageIndex(item)}
                aria-current={item === pageIndex ? 'page' : undefined}
              >
                {item + 1}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          className={styles.pagerBtn}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>

      {showPageSizeSelector ? (
        <div className={styles.pagerRight}>
          <label className={styles.pagerLabel}>
            Page size
            <select
              className={styles.pagerSelect}
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {options.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}
