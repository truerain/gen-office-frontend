// packages/gen-grid/src/components/base/GenGridBase.tsx

import * as React from 'react';
import type { Table } from '@tanstack/react-table';

import { useGenGridContext } from '../../core/context/GenGridProvider';

import { GenGridHeader } from '../layout/GenGridHeader';
import { GenGridFooter } from '../layout/GenGridFooter';
import { GenGridBody } from '../layout/GenGridBody';
import { GenGridVirtualBody } from '../layout/GenGridVirtualBody';
import { GenGridPagination } from '../../components/pagination/GenGridPagination';
import { useActiveCellNavigation } from '../../features/active-cell/useActiveCellNavigation';
import { SELECTION_COLUMN_ID } from '../../features/selection/selection';
import { ROW_NUMBER_COLUMN_ID } from '../../features/row-number/useRowNumberColumn';

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
  enableActiveRowHighlight?: boolean;

  enablePagination?: boolean;
  pageSizeOptions?: number[];

  enableFooter?: boolean;
  footer?: React.ReactNode;
  renderFooter?: (table: Table<TData>) => React.ReactNode;

  enableFooterRow?: boolean;
  enableStickyFooterRow?: boolean;

  editOnActiveCell?: boolean;
  keepEditingOnNavigate?: boolean;

  onCellValueChange?: (coord: { rowId: string; columnId: string }, value: unknown) => void;
  isRowDirty?: (rowId: string) => boolean;
  isCellDirty?: (rowId: string, columnId: string) => boolean;
};

export function GenGridBase<TData>(props: GenGridBaseProps<TData>) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollHeight, setScrollHeight] = React.useState(0);

  const {
    table,

    height,
    maxHeight,

    enableStickyHeader,
    headerHeight,
    rowHeight,

    enableVirtualization = false,
    overscan = 10,

    enableFiltering,
    enablePinning,
    enableColumnSizing,

    enableRowSelection,
    enableRowNumber,
    enableActiveRowHighlight = false,

    enablePagination,
    pageSizeOptions = [10, 20, 50, 100],

    enableFooter,
    footer,
    renderFooter,
    enableFooterRow,
    enableStickyFooterRow,

    editOnActiveCell,
    keepEditingOnNavigate,

    onCellValueChange,
    isCellDirty,
  } = props;

  const stickyHeaderEnabled =  enableStickyHeader !== undefined ? enableStickyHeader : true;
  const headerRowCount = table.getHeaderGroups().length + (enableFiltering ? 1 : 0);
  const columnSizingEnabled = enableColumnSizing !== undefined ? enableColumnSizing : true;
  const footerContent = renderFooter ? renderFooter(table) : footer;
  const footerEnabled = enableFooter !== undefined ? enableFooter : false;
  const showFooter = footerEnabled && footerContent !== null && footerContent !== undefined;

  const footerRowEnabled = enableFooterRow !== undefined ? enableFooterRow : true;
  const stickyFooterRowEnabled =
    enableStickyFooterRow !== undefined ? enableStickyFooterRow : false;

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setScrollHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasFooterRowContent = React.useMemo(() => {
    if (!footerRowEnabled) return false;
    const groups = table.getFooterGroups();
    for (const group of groups) {
      for (const header of group.headers) {
        if (header.isPlaceholder) continue;
        if (header.column.columnDef.footer != null) return true;
      }
    }
    return false;
  }, [footerRowEnabled, table]);

  const footerRowCount = hasFooterRowContent ? table.getFooterGroups().length : 0;
  const totalHeaderHeight = (headerHeight ?? 40) * headerRowCount;
  const totalFooterHeight = (rowHeight ?? 36) * footerRowCount;
  const rowCount = table.getRowModel().rows.length;
  const totalBodyHeight = (rowHeight ?? 36) * rowCount;
  const availableBodyHeight = Math.max(0, scrollHeight - totalHeaderHeight - totalFooterHeight);
  const footerSpacerHeight =
    stickyFooterRowEnabled
      ? Math.max(0, availableBodyHeight - totalBodyHeight)
      : 0;

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

  const isSystemCol = React.useCallback(
    (colId: string) => colId === SELECTION_COLUMN_ID || colId === ROW_NUMBER_COLUMN_ID,
    []
  );

  const nav = useActiveCellNavigation({
    table,
    activeCell,
    onActiveCellChange: handleActiveCellChange,
    isCellNavigable: (_, colId) => !isSystemCol(colId),
    focusOptions: { stickyHeaderHeight: (headerHeight ?? 40) * headerRowCount },
  });

  const escapeAttrValue = React.useCallback((value: string) => {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
      return CSS.escape(value);
    }
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }, []);

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container || !activeCell) return;

    const column = table.getColumn(activeCell.columnId);
    const pinned = column?.getIsPinned();
    const isPinned = pinned === 'left' || pinned === 'right';

    const raf = requestAnimationFrame(() => {
      const rowId = String(activeCell.rowId);
      const colId = String(activeCell.columnId);
      const selector = `td[data-rowid="${escapeAttrValue(rowId)}"][data-colid="${escapeAttrValue(colId)}"]`;
      const cell = container.querySelector(selector) as HTMLElement | null;
      if (!cell) {
        if (!enableVirtualization) return;

        const rows = table.getRowModel().rows;
        const idx = rows.findIndex((r) => r.id === rowId);
        if (idx < 0) return;

        const headerOffset = (headerHeight ?? 40) * headerRowCount;
        const targetTop = Math.max(0, idx * (rowHeight ?? 36) - headerOffset);
        container.scrollTop = targetTop;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();

      let pinnedLeftWidth = 0;
      let pinnedRightWidth = 0;
      for (const col of table.getVisibleLeafColumns()) {
        const side = col.getIsPinned();
        if (side === 'left') pinnedLeftWidth += col.getSize();
        if (side === 'right') pinnedRightWidth += col.getSize();
      }

      const padding = 8;
      const leftLimit = containerRect.left + pinnedLeftWidth + padding;
      const rightLimit = containerRect.right - pinnedRightWidth - padding;

      if (!isPinned) {
        if (cellRect.left < leftLimit) {
          container.scrollLeft -= leftLimit - cellRect.left;
        } else if (cellRect.right > rightLimit) {
          container.scrollLeft += cellRect.right - rightLimit;
        }
      }

      const headerOffset = (headerHeight ?? 40) * headerRowCount;
      const topLimit = containerRect.top + headerOffset + padding;
      const bottomLimit = containerRect.bottom - padding;

      if (cellRect.top < topLimit) {
        container.scrollTop -= topLimit - cellRect.top;
      } else if (cellRect.bottom > bottomLimit) {
        container.scrollTop += cellRect.bottom - bottomLimit;
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [activeCell, enableVirtualization, escapeAttrValue, headerHeight, headerRowCount, rowHeight, table]);

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container || !enableVirtualization) return;

    let raf = 0;
    const onScroll = () => {
      if (!activeCell) return;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!container.contains(document.activeElement)) {
          container.focus({ preventScroll: true });
        }
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      container.removeEventListener('scroll', onScroll);
    };
  }, [activeCell, enableVirtualization]);

  return (
    <div
      className={layout.root}
      data-has-footer={showFooter || undefined}
      style={{
        ['--gen-grid-header-height' as any]: `${headerHeight ?? 40}px`,
        ['--gen-grid-row-height' as any]: `${rowHeight ?? 36}px`,
      }}
    >
      <div
        ref={scrollRef}
        className={layout.tableScroll}
        data-sticky-header={stickyHeaderEnabled || undefined}
        data-sticky-footer-row={stickyFooterRowEnabled || undefined}
        data-header-rows={headerRowCount}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.defaultPrevented) return;
          nav.handleKeyDown(e);
        }}
      >
        <table
          className={layout.table}
          style={
            columnSizingEnabled
              ? { width: table.getTotalSize(), minWidth: table.getTotalSize() }
              : undefined
          }
        >
          <GenGridHeader
            table={table}
            enablePinning={enablePinning}
            enableColumnSizing={columnSizingEnabled}
            enableFiltering={enableFiltering}
            onAutoSizeColumn={autoSizeColumn}
            renderFilterCell={() => null}
          />

          {enableVirtualization ? (
            <GenGridVirtualBody<TData>
              table={table}
              scrollRef={scrollRef}
              rowHeight={rowHeight ?? 36}
              overscan={overscan}
              enablePinning={enablePinning}
              enableColumnSizing={columnSizingEnabled}
              enableActiveRowHighlight={enableActiveRowHighlight}
              activeCell={activeCell}
              onActiveCellChange={handleActiveCellChange}
              editOnActiveCell={editOnActiveCell}
              keepEditingOnNavigate={keepEditingOnNavigate}
              onCellValueChange={handleCellValueChange}
              isRowDirty={props.isRowDirty}
              isCellDirty={isCellDirty}
              footerSpacerHeight={footerSpacerHeight}
            />
          ) : (
            <GenGridBody<TData>
              table={table}
              enablePinning={enablePinning}
              enableColumnSizing={enableColumnSizing}
              enableActiveRowHighlight={enableActiveRowHighlight}
              activeCell={activeCell}
              onActiveCellChange={handleActiveCellChange}
              editOnActiveCell={editOnActiveCell}
              keepEditingOnNavigate={keepEditingOnNavigate}
              onCellValueChange={handleCellValueChange}
              isRowDirty={props.isRowDirty}
              isCellDirty={isCellDirty}
              footerSpacerHeight={footerSpacerHeight}
            />
          )}

          {footerRowEnabled ? (
            <GenGridFooter<TData>
              table={table}
              enablePinning={enablePinning}
              enableColumnSizing={columnSizingEnabled}
            />
          ) : null}
        </table>
      </div>

      {showFooter ? (
        <div className={layout.footer} data-sticky-footer>
          {footerContent}
        </div>
      ) : null}

      {enablePagination ? (
        <GenGridPagination table={table} pageSizeOptions={pageSizeOptions} />
      ) : null}
    </div>
  );
}
