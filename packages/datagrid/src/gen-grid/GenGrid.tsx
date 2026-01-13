// packages/datagrid/src/gen-grid/GenGrid.tsx
import * as React from 'react';
import { flexRender } from '@tanstack/react-table';

import styles from './GenGrid.module.css';
import type { GenGridProps } from './types';
import { useGenGridTable } from './useGenGridTable';
import { GenGridPagination } from './GenGridPagination';

// Step2: column meta(표현 힌트) 타입
export type GenGridColumnMeta = {
  align?: 'left' | 'center' | 'right';
  mono?: boolean; // 숫자/코드 컬럼용
};

// Step2: columnDef에서 meta 꺼내는 헬퍼
function getMeta(columnDef: any): GenGridColumnMeta | undefined {
  return columnDef?.meta as GenGridColumnMeta | undefined;
}


export function GenGrid<TData>(props: GenGridProps<TData>) {
  const table = useGenGridTable(props);

  const {
    caption,
    className,
    enableRowSelection,
    enablePagination,
    pageSizeOptions,
    enableFiltering
  } = props;

  // 헤더 그룹(그룹 헤더 포함)
  const headerGroups = table.getHeaderGroups();
  // leaf columns만 있는 마지막 헤더 그룹
  const leafHeaderGroup = headerGroups[headerGroups.length - 1];

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}

        <thead className={styles.thead}>
          {/* 1) 일반 헤더 렌더 (그룹 헤더 포함) */}
          {headerGroups.map((hg) => (
            <tr key={hg.id} className={styles.tr}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortState = header.column.getIsSorted(); // false | 'asc' | 'desc'
                const isSelectCol = header.column.id === '__select__';

                return (
                  <th
                    key={header.id}
                    className={[
                      styles.th,
                      isSelectCol ? styles.selectCol : '',
                      canSort ? styles.sortable : '',
                      sortState ? styles.sorted : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    colSpan={header.colSpan}
                    scope="col"
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    aria-sort={
                      sortState === 'asc'
                        ? 'ascending'
                        : sortState === 'desc'
                          ? 'descending'
                          : 'none'
                    }
                  >
                    <div className={styles.thInner}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}

                      {/* 정렬 아이콘 */}
                      {canSort ? (
                        <span className={styles.sortIcon} aria-hidden="true">
                          {sortState === 'asc' ? '▲' : sortState === 'desc' ? '▼' : '↕'}
                        </span>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}

          {/* 2) Step6: 필터 Row (leaf columns만 대상으로) */}
          {enableFiltering ? (
            <tr className={styles.tr}>
              {leafHeaderGroup.headers.map((header) => {
                const column = header.column;
                const isSelectCol = column.id === '__select__';

                // 아주 단순한 기준:
                // - selection column은 필터 없음
                // - accessorKey가 있는 컬럼만 필터 input 노출
                const colDef: any = column.columnDef;
                const hasAccessorKey = !!colDef.accessorKey;
                const canFilter = column.getCanFilter() && hasAccessorKey && !isSelectCol;

                return (
                  <th
                    key={header.id + '__filter'}
                    className={[
                      styles.th,
                      isSelectCol ? styles.selectCol : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    scope="col"
                  >
                    {canFilter ? (
                      <input
                        className={styles.filterInput}
                        value={(column.getFilterValue() ?? '') as string}
                        onChange={(e) => column.setFilterValue(e.target.value)}
                        placeholder="Filter..."
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          ) : null}
        </thead>

        <tbody className={styles.tbody}>
          {table.getRowModel().rows.map((row) => (
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

                return (
                  <td
                    key={cell.id}
                    className={[
                      styles.td,
                      alignClass, 
                      isSelectCol ? styles.selectCol : '',
                      meta?.mono ? styles.mono : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Step4: 선택 상태 표시(학습용) */}
      {enableRowSelection ? (
        <div className={styles.footerInfo}>
          Selected rows: {table.getSelectedRowModel().rows.length}
        </div>
      ) : null}

      {/* Step5: Pagination UI */}
      {enablePagination ? (
        <GenGridPagination table={table} pageSizeOptions={pageSizeOptions} />
      ) : null}
    </div>
  );
}
