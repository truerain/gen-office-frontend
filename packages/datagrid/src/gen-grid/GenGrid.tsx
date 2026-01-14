import * as React from 'react';

import styles from './GenGrid.module.css';
import { useGenGridTable } from './useGenGridTable';
import { GenGridHeader } from './renderers/GenGridHeader';
import { GenGridBody } from './renderers/GenGridBody';
import { GenGridVirtualBody } from './renderers/GenGridVirtualBody';
import type { GenGridProps, ActiveCell } from './types';
import { GenGridPagination } from './GenGridPagination';

export function GenGrid<TData>(props: GenGridProps<TData>) {
  const table = useGenGridTable<TData>(props);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const {
    maxHeight,
    enableStickyHeader,
    headerHeight = 40,
    rowHeight = 36,
    enableVirtualization = false,
    overscan = 10,
    enableFiltering,
    enablePinning,
    enableColumnSizing,
    enableRowSelection,
    enablePagination,
    pageSizeOptions = [10, 20, 50, 100]
  } = props;

  const stickyHeaderEnabled = enableStickyHeader ?? Boolean(maxHeight);
  // ✅ 다중 헤더 + 필터까지 포함한 줄 수 (Step9.1)
  const headerRowCount = table.getHeaderGroups().length + (enableFiltering ? 1 : 0);

  // ✅ Step8.5 auto-size: table.setColumnSizing(...)로 구현한 함수가 있다면 여기에 두고 header로 전달
  const autoSizeColumn = React.useCallback((columnId: string) => {
    // 너희가 이미 만든 구현을 그대로 여기에 둬도 되고,
    // header에서 table을 직접 써서 구현해도 됨(둘 중 하나 선택)
  }, []);
  // active cell 상태
  const [activeCell, setActiveCell] = React.useState<{ rowId: string; columnId: string } | null>(null);
  const handleActiveCellChange = React.useCallback(
    (next: { rowId: string; columnId: string }) => {
      setActiveCell(next);
    },
    []
  );

  return (
    <div
      className={styles.root}
      style={{
        ['--gen-grid-header-height' as any]: `${headerHeight}px`,
        ['--gen-grid-row-height' as any]: `${rowHeight}px`
      }}
    >
      <div
        ref={scrollRef}
        className={styles.tableScroll}
        style={{
          ...(props.height ? { height: props.height } : {}),
          ...(props.maxHeight ? { maxHeight: props.maxHeight } : {})
        }}
        data-sticky-header={stickyHeaderEnabled || undefined}
        // 경계선/오프셋 계산에 쓸 수 있음
        data-header-rows={headerRowCount}
      >
        <table className={styles.table}>
          <GenGridHeader
            table={table}
            enablePinning={enablePinning}
            enableColumnSizing={enableColumnSizing}
            enableFiltering={enableFiltering}
            onAutoSizeColumn={autoSizeColumn}
            renderFilterCell={(header) => {
              // 기존 filter cell 렌더 코드 이 자리(또는 별도 컴포넌트)로 옮기기
              return null;
            }}
          />

          {enableVirtualization ? (
            <GenGridVirtualBody<TData>
              table={table}
              scrollRef={scrollRef}
              rowHeight={rowHeight}
              overscan={overscan}
              enablePinning={enablePinning}
              enableColumnSizing={enableColumnSizing}
              activeCell={activeCell}
              onActiveCellChange={handleActiveCellChange}
            />
          ) : (
            <GenGridBody<TData>
              table={table}
              enablePinning={enablePinning}
              enableColumnSizing={enableColumnSizing}
              activeCell={activeCell}
              onActiveCellChange={handleActiveCellChange}
            />
          )}
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
