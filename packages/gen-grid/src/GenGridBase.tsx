// packages/gen-grid/src/GenGridBase.tsx
import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import { useGenGridContext } from './GenGridProvider';

import { GenGridHeader } from './renderers/GenGridHeader';
import { GenGridBody } from './renderers/GenGridBody';
import { GenGridVirtualBody } from './renderers/GenGridVirtualBody';
import { GenGridPagination } from './GenGridPagination';

import layout from './GenGridLayout.module.css';
import controls from './GenGridControls.module.css';

export type GenGridBaseProps<TData> = {
  table: Table<TData>;

  caption?: string;

  height?: number | string;
  maxHeight?: number | string;

  enableStickyHeader?: boolean;
  headerHeight?: number;
  rowHeight?: number;

  enableVirtualization?: boolean;
  overscan?: number;

  enableFiltering?: boolean;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;

  enableRowSelection?: boolean;
  enableRowNumber?: boolean;

  enablePagination?: boolean;
  pageSizeOptions?: number[];

  onCellValueChange?: (coord: { rowId: string; columnId: string }, value: unknown) => void;
  isCellDirty?: (rowId: string, columnId: string) => boolean;
};

export function GenGridBase<TData>(props: GenGridBaseProps<TData>) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const {
    table,

    height,
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
    enableRowNumber,

    enablePagination,
    pageSizeOptions = [10, 20, 50, 100],

    onCellValueChange,
    isCellDirty,
  } = props;

  const stickyHeaderEnabled = enableStickyHeader ?? Boolean(maxHeight);
  const headerRowCount = table.getHeaderGroups().length + (enableFiltering ? 1 : 0);

  const autoSizeColumn = React.useCallback((columnId: string) => {
    void columnId;
  }, []);

  // ✅ activeCell을 Provider에서 관리
  const { activeCell, setActiveCell } = useGenGridContext<TData>();

  const handleActiveCellChange = React.useCallback(
    (next: { rowId: string; columnId: string }) => setActiveCell(next),
    [setActiveCell]
  );

  const handleCellValueChange = React.useCallback(
    (coord: { rowId: string; columnId: string }, value: unknown) => {
      onCellValueChange?.(coord, value);
    },
    [onCellValueChange]
  );

  return (
    <div
      className={layout.root}
      style={{
        ['--gen-grid-header-height' as any]: `${headerHeight}px`,
        ['--gen-grid-row-height' as any]: `${rowHeight}px`,
      }}
    >
      <div
        ref={scrollRef}
        className={layout.tableScroll}
        style={{
          ...(height ? { height } : {}),
          ...(maxHeight ? { maxHeight } : {}),
        }}
        data-sticky-header={stickyHeaderEnabled || undefined}
        data-header-rows={headerRowCount}
      >
        <table className={layout.table}>
          <GenGridHeader
            table={table}
            enablePinning={enablePinning}
            enableColumnSizing={enableColumnSizing}
            enableFiltering={enableFiltering}
            onAutoSizeColumn={autoSizeColumn}
            renderFilterCell={() => null}
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
              onCellValueChange={handleCellValueChange}
              isCellDirty={isCellDirty}
            />
          ) : (
            <GenGridBody<TData>
              table={table}
              enablePinning={enablePinning}
              enableColumnSizing={enableColumnSizing}
              activeCell={activeCell}
              onActiveCellChange={handleActiveCellChange}
              onCellValueChange={handleCellValueChange}
              isCellDirty={isCellDirty}
            />
          )}
        </table>
      </div>

      {enableRowSelection ? (
        <div className={controls.footerInfo}>
          Selected rows: {table.getSelectedRowModel().rows.length}
        </div>
      ) : null}

      {enablePagination ? (
        <GenGridPagination table={table} pageSizeOptions={pageSizeOptions} />
      ) : null}
    </div>
  );
}
