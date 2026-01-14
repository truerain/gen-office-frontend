// packages/datagrid/src/gen-grid/GenGrid.tsx
import * as React from 'react';
import { flexRender, Header, Cell, type Column  } from '@tanstack/react-table';

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

function getPinnedStyles<TData>(
  column: Column<TData, unknown>,
  opts?: { isHeader?: boolean }
) {
  const pinned = column.getIsPinned(); // false | 'left' | 'right'
  if (!pinned) return undefined;

  // left pinned: left offset = getStart('left')
  // right pinned: right offset = getAfter('right')
  const style: React.CSSProperties = {
    position: 'sticky',
    background: 'var(--color-surface, #fff)', // pinned 시 배경 보장
    zIndex: opts?.isHeader ? 6 : 3
  };

  if (pinned === 'left') style.left = column.getStart('left');
  if (pinned === 'right') style.right = column.getAfter('right');

  return style;
}

function getColumnSizeStyle<TData>(column: Column<TData, unknown>) {
  // TanStack이 관리하는 size를 실제 DOM width로 반영
  return { width: column.getSize() };
}



export function GenGrid<TData>(props: GenGridProps<TData>) {
  const table = useGenGridTable(props);

  const {
    caption,
    className,
    headerHeight = 40,
    rowHeight = 32,
    enableRowSelection,
    enablePagination,
    pageSizeOptions,
    enableFiltering,
    maxHeight, 
    enableStickyHeader
  } = props;

  function autoSizeColumn(columnId: string) {
    const column = table.getColumn(columnId);
    if (!column) return;

    // 1) 헤더 텍스트 길이
    const headerText = String(column.columnDef.header ?? column.id);

    // 2) 현재 row model 기준으로 샘플링 (너무 많으면 비용↑)
    const rows = table.getRowModel().rows;
    const sample = rows.slice(0, 30);

    // 3) 셀 값 길이 최대치 추정
    let maxLen = headerText.length;

    for (const row of sample) {
      const v = row.getValue(columnId);
      if (v == null) continue;
      const len = String(v).length;
      if (len > maxLen) maxLen = len;
    }

    // 4) heuristic: 글자수 * 8px + padding(32px) + 여유(16px)
    //    숫자/모노 폰트면 조금 더 타이트하게 잡아도 됨(일단 단순)
    const nextSize = Math.min(480, Math.max(80, maxLen * 8 + 48));

    table.setColumnSizing((prev) => ({
      ...prev,
      [columnId]: nextSize
    }));

  }

  // Step9: sticky header 기본값 설정
  const stickyHeaderEnabled = enableStickyHeader ?? Boolean(maxHeight);

  // 헤더 그룹(그룹 헤더 포함)
  const headerGroups = table.getHeaderGroups();
  // leaf columns만 있는 마지막 헤더 그룹
  const leafHeaderGroup = headerGroups[headerGroups.length - 1];
  
  const columnSizingInfo = table.getState().columnSizingInfo;
  const isResizing = columnSizingInfo.isResizingColumn;
  
  return (
    <div 
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{
        '--gengrid-header-height': `${headerHeight}px`,
        '--gengrid-row-height': `${rowHeight}px`
      } as React.CSSProperties}
    >
      {/* caption은 스크롤 밖 */}
      {caption ? <div className={styles.caption}>{caption}</div> : null}
      {/* 6.5 Global Filter */}
      {props.enableGlobalFilter ? (
        <div className={styles.toolbar}>
          <input
            className={styles.globalSearch}
            value={(table.getState().globalFilter ?? '') as string}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            placeholder="Search..."
          />
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => table.setGlobalFilter('')}
            disabled={!table.getState().globalFilter}
          >
            Clear
          </button>
        </div>
      ) : null}
      <div 
        className={styles.tableScroll} 
        style={maxHeight ? { maxHeight } : undefined}
        data-sticky-header={stickyHeaderEnabled || undefined}
        data-resizing={Boolean(isResizing) || undefined}
        >
        <table className={styles.table}>
          <thead className={styles.thead}>
            {/* 1) 일반 헤더 렌더 (그룹 헤더 포함) */}
            
            {headerGroups.map((hg) => (
              <tr key={hg.id} className={styles.tr}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted(); // false | 'asc' | 'desc'
                  const isSelectCol = header.column.id === '__select__';
                  
                  const pinnedStyle = props.enablePinning ? getPinnedStyles(header.column, { isHeader: true }) : undefined; // Step7: pinned 스타일 적용
                  const pinned = header.column.getIsPinned(); // false|'left'|'right'
                  const isLeafHeader = header.depth === headerGroups.length - 1; // leaf인지

                  const sizeStyle = props.enableColumnSizing ? getColumnSizeStyle(header.column) : undefined; // Step8: column sizing 스타일 적용
                  const resizing = header.column.getIsResizing();

                  return (
                    <th
                      key={header.id}
                      style={{
                            ...(pinnedStyle ?? {}),   // Step7: pinned 스타일
                            ...(sizeStyle ?? {})      // Step8: column sizing 스타일
                          }}
                      className={[
                        styles.th,
                        isSelectCol ? styles.selectCol : '',
                        pinned ? styles.pinned : '',
                        pinned === 'left' ? styles.pinnedLeft : '',
                        pinned === 'right' ? styles.pinnedRight : '',
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
                        {/* ✅ Pin controls: leaf header에서만 노출 */}
                        {props.enablePinning && isLeafHeader && !isSelectCol ? (
                          <span className={styles.pinControls}>
                            <button
                              type="button"
                              className={styles.pinBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                header.column.pin('left');
                              }}
                              aria-label="Pin left"
                              disabled={pinned === 'left'}
                            >
                              ⟸
                            </button>
                            <button
                              type="button"
                              className={styles.pinBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                header.column.pin(false);
                              }}
                              aria-label="Unpin"
                              disabled={!pinned}
                            >
                              ✕
                            </button>
                            <button
                              type="button"
                              className={styles.pinBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                header.column.pin('right');
                              }}
                              aria-label="Pin right"
                              disabled={pinned === 'right'}
                            >
                              ⟹
                            </button>
                          </span>
                        ) : null}
                        {/* ✅ resize handle: leaf header에서만 */}
                        {props.enableColumnSizing && header.colSpan === 1 ? (
                          <div
                            className={[
                                  styles.resizer,
                                  resizing ? styles.resizerActive : ''
                                ].filter(Boolean).join(' ')}
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            onClick={(e) => {
                              e.stopPropagation();      // 정렬 클릭 방지
                              autoSizeColumn(header.column.id);
                            }}  
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}

            {/* 2) Step6: 필터 Row (leaf columns만 대상으로) */}
            {enableFiltering ? (
              <tr className={[styles.tr, styles.filterRow].filter(Boolean).join(' ')}>
                {leafHeaderGroup.headers.map((header) => {
                  const column = header.column;
                  const isSelectCol = column.id === '__select__';

                  // 아주 단순한 기준:
                  // - selection column은 필터 없음
                  // - accessorKey가 있는 컬럼만 필터 input 노출
                  const colDef: any = column.columnDef;
                  const hasAccessorKey = !!colDef.accessorKey;
                  const canFilter = column.getCanFilter() && hasAccessorKey && !isSelectCol;

                  const pinnedStyle = props.enablePinning ? getPinnedStyles(header.column, { isHeader: false }) : undefined; // Step7: pinned 스타일 적용
                  const pinned = header.column.getIsPinned(); // false|'left'|'right'
                  const isLeafHeader = header.depth === headerGroups.length - 1; // leaf인지
                  const sizeStyle = props.enableColumnSizing ? getColumnSizeStyle(header.column) : undefined; // Step8: column sizing 스타일 적용

                  return (
                    <th
                      key={header.id + '__filter'}
                      style={{
                            ...(pinnedStyle ?? {}),   // Step7: pinned 스타일
                            ...(sizeStyle ?? {})      // Step8: column sizing 스타일
                          }}
                      className={[
                        styles.th,
                        pinned ? styles.pinned : '',
                        pinned === 'left' ? styles.pinnedLeft : '',
                        pinned === 'right' ? styles.pinnedRight : '',
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
                  const pinned = cell.column.getIsPinned();
                  const sizeStyle = props.enableColumnSizing ? getColumnSizeStyle(cell.column) : undefined; // Step8: column sizing 스타일 적용
                  const pinnedStyle = props.enablePinning ? getPinnedStyles(cell.column, { isHeader: false }) : undefined;

                  return (
                    <td
                      key={cell.id}
                      style={{
                            ...(pinnedStyle ?? {}),   // Step7: pinned 스타일
                            ...(sizeStyle ?? {})      // Step8: column sizing 스타일
                          }}
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
                    >
                      <div className={styles.cellContent}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
