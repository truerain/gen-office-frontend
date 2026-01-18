// packages/gen-grid/src/components/pagination/GenGridPagination.tsx

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import styles from './GenGridPagination.module.css';

type Props<TData> = {
  table: Table<TData>;
  pageSizeOptions?: number[];
};

export function GenGridPagination<TData>({ table, pageSizeOptions }: Props<TData>) {
  const options = pageSizeOptions ?? [10, 20, 50, 100];
  const { pageIndex, pageSize } = table.getState().pagination;

 return (
    <div className={styles.pager}>
      <div className={styles.pagerLeft}>
        <button
          type="button"
          className={styles.pagerBtn}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {'<<'}
        </button>
        <button
          type="button"
          className={styles.pagerBtn}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {'<'}
        </button>
        <button
          type="button"
          className={styles.pagerBtn}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {'>'}
        </button>
        <button
          type="button"
          className={styles.pagerBtn}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {'>>'}
        </button>
      </div>

      <div className={styles.pagerMid}>
        Page <strong>{pageIndex + 1}</strong> of <strong>{table.getPageCount()}</strong>
      </div>

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
    </div>
  );
}
