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
import { buildRowSpanModel } from '../layout/rowSpanModel';

import layout from './GenGridLayout.module.css';
import { useClipboardActions } from '../../features/range-selection/useClipboardActions';
import { GenGridContextMenu } from './GenGridContextMenu';
import { resolveRangeBounds, resolveRangeBoundsList } from '../../features/range-selection/clipboard';
import type {
  GenGridContextMenuActionContext,
  GenGridContextMenuCustomAction,
} from '../../GenGrid.types';

export type GenGridBaseProps<TData> = {
  table: Table<TData>;

  caption?: string;
  'readonly'?: boolean;

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
  fitColumns?: 'none' | 'fill';

  checkboxSelection?: boolean;
  enableRowNumber?: boolean;
  enableActiveRowHighlight?: boolean;
  enableGrouping?: boolean;
  rowSpanning?: boolean;
  rowSpanningMode?: 'real' | 'visual';

  enablePagination?: boolean;
  pageSizeOptions?: number[];

  enableFooter?: boolean;
  footer?: React.ReactNode;
  renderFooter?: (table: Table<TData>) => React.ReactNode;
  noRowsMessage?: React.ReactNode;

  enableFooterRow?: boolean;
  enableStickyFooterRow?: boolean;

  editOnActiveCell?: boolean;
  keepEditingOnNavigate?: boolean;

  onCellValueChange?: (coord: { rowId: string; columnId: string }, value: unknown) => void;
  isRowDirty?: (rowId: string) => boolean;
  isCellDirty?: (rowId: string, columnId: string) => boolean;
  getRowClassName?: (args: { row: TData; rowId: string; rowIndex: number }) => string | undefined;
  getRowStyle?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => React.CSSProperties | undefined;
  getCellClassName?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => string | undefined;
  getCellStyle?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => React.CSSProperties | undefined;
  getCellTooltip?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
    columnId: string;
    value: unknown;
  }) => string | undefined;
  contextMenu?: {
    customActions?: readonly GenGridContextMenuCustomAction<TData>[];
  };
};

function resolveContextMenuColumnHeader<TData>(table: Table<TData>, columnId: string): string {
  const column = table.getColumn(columnId);
  if (!column) return columnId;

  const header = column.columnDef.header;
  if (typeof header === 'string' || typeof header === 'number') {
    return String(header);
  }
  return columnId;
}

export function GenGridBase<TData>(props: GenGridBaseProps<TData>) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollHeight, setScrollHeight] = React.useState(0);

  const {
    table,

    readonly: readonlyProp,
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
    fitColumns,

    checkboxSelection,
    enableRowNumber,
    enableActiveRowHighlight = false,
    enableGrouping,
    rowSpanning,
    rowSpanningMode,

    enablePagination,
    pageSizeOptions = [10, 20, 50, 100],

    enableFooter,
    footer,
    renderFooter,
    noRowsMessage,
    enableFooterRow,
    enableStickyFooterRow,

    editOnActiveCell,
    keepEditingOnNavigate,
    contextMenu: contextMenuOptions,

    onCellValueChange,
    isCellDirty,
  } = props;
  void enableGrouping;
  void checkboxSelection;

  const stickyHeaderEnabled =  enableStickyHeader !== undefined ? enableStickyHeader : true;
  const headerRowCount = table.getHeaderGroups().length + (enableFiltering ? 1 : 0);
  const columnSizingEnabled = enableColumnSizing !== undefined ? enableColumnSizing : true;
  const fitColumnsMode = fitColumns ?? 'none';
  const shouldFillColumns = columnSizingEnabled && fitColumnsMode === 'fill';
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
  const resolvedNoRowsMessage = noRowsMessage ?? 'No data';

  const autoSizeColumn = React.useCallback((columnId: string) => {
    void columnId;
  }, []);

  const toCssSize = React.useCallback((value?: number | string): string | undefined => {
    if (value == null) return undefined;
    return typeof value === 'number' ? `${value}px` : value;
  }, []);
  // activeCell is managed by Provider
  const {
    activeCell,
    setActiveCell,
    options,
    clearSelectedRanges,
    selectedRanges,
    getLastSelectedRange,
  } = useGenGridContext<TData>();

  const tableState = table.getState();
  const hasColumnFilter = (tableState.columnFilters?.length ?? 0) > 0;
  const hasGlobalFilter = String(tableState.globalFilter ?? '').length > 0;
  const hasFiltering = hasColumnFilter || hasGlobalFilter;
  const treeEnabled = Boolean((table.options.meta as any)?.genGridTree);
  const spanRows = table.getRowModel().rows;
  const resolvedRowSpanningMode = rowSpanningMode ?? 'real';
  const rowSpanningEnabled =
    Boolean(rowSpanning) &&
    !enableVirtualization &&
    !enableGrouping &&
    !treeEnabled &&
    !hasFiltering;
  const rowSpanModel = React.useMemo(
    () => buildRowSpanModel(table, rowSpanningEnabled),
    [table, rowSpanningEnabled, spanRows]
  );
  const rows = table.getRowModel().rows;

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

  const [contextMenu, setContextMenu] = React.useState<{ x: number; y: number } | null>(null);

  const closeContextMenu = React.useCallback(() => {
    setContextMenu(null);
  }, []);

  const { canCopy, canPaste, copyToClipboard, pasteFromClipboard } = useClipboardActions({
    table,
    rows,
    selectedRanges,
    activeCell,
    onCellValueChange,
  });

  const rangeStats = React.useMemo(() => {
    if (!contextMenu) return null;
    const lastSelectedRange = getLastSelectedRange();
    const bounds = lastSelectedRange ? resolveRangeBounds(table, lastSelectedRange) : null;
    if (!bounds) return null;

    let sum = 0;
    let count = 0;

    for (let rowIndex = bounds.rowMin; rowIndex <= bounds.rowMax; rowIndex++) {
      const row = rows[rowIndex];
      if (!row) continue;

      for (const columnId of bounds.columnIds) {
        const value = row.getValue(columnId);
        if (typeof value !== 'number' || !Number.isFinite(value)) continue;
        sum += value;
        count += 1;
      }
    }

    return {
      sum,
      avg: count > 0 ? sum / count : 0,
      count,
    };
  }, [contextMenu, rows, table, getLastSelectedRange]);

  const contextMenuActionContext = React.useMemo<GenGridContextMenuActionContext<TData> | null>(() => {
    if (!contextMenu) return null;
    const boundsList = resolveRangeBoundsList(table, selectedRanges);
    const matrixList: unknown[][][] = [];
    const cells: GenGridContextMenuActionContext<TData>['cells'] = [];

    for (const bounds of boundsList) {
      const matrix: unknown[][] = [];
      for (let rowIndex = bounds.rowMin; rowIndex <= bounds.rowMax; rowIndex++) {
        const row = rows[rowIndex];
        if (!row) continue;
        const rowMatrix: unknown[] = [];
        for (const columnId of bounds.columnIds) {
          const value = row.getValue(columnId);
          rowMatrix.push(value);
          cells.push({
            rowIndex,
            rowId: row.id,
            columnId,
            columnHeader: resolveContextMenuColumnHeader(table, columnId),
            value,
            row: row.original,
          });
        }
        matrix.push(rowMatrix);
      }
      matrixList.push(matrix);
    }

    return {
      table,
      selectedRanges,
      boundsList,
      cells,
      matrixList,
    };
  }, [contextMenu, rows, selectedRanges, table]);

  const customContextMenuActions = React.useMemo(() => {
    const defs = contextMenuOptions?.customActions ?? [];
    if (!contextMenuActionContext || defs.length === 0) return [];

    type ResolvedContextMenuAction = {
      key: string;
      label: React.ReactNode;
      disabled?: boolean;
      onClick?: () => void | Promise<void>;
      children?: ResolvedContextMenuAction[];
    };

    const resolveActions = (
      actions: readonly GenGridContextMenuCustomAction<TData>[]
    ): ResolvedContextMenuAction[] =>
      actions.map((action) => {
        const disabled = typeof action.disabled === 'function'
          ? Boolean(action.disabled(contextMenuActionContext))
          : Boolean(action.disabled);
        return {
          key: action.key,
          label: action.label,
          disabled,
          onClick: action.onClick
            ? () => action.onClick?.(contextMenuActionContext)
            : undefined,
          children:
            action.children && action.children.length > 0
              ? resolveActions(action.children)
              : undefined,
        };
      });

    return resolveActions(defs);
  }, [contextMenuActionContext, contextMenuOptions?.customActions]);
  React.useEffect(() => {
    if (!contextMenu) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-gen-grid-context-menu="true"]')) return;
      closeContextMenu();
    };
    const handleScroll = () => closeContextMenu();
    const handleResize = () => closeContextMenu();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeContextMenu();
    };

    document.addEventListener('mousedown', handleMouseDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [closeContextMenu, contextMenu]);

  const nav = useActiveCellNavigation({
    table,
    activeCell,
    onActiveCellChange: handleActiveCellChange,
    isCellNavigable: () => true,
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
        ...(toCssSize(height) ? { height: toCssSize(height) } : {}),
        ...(toCssSize(maxHeight) ? { maxHeight: toCssSize(maxHeight) } : {}),
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

          const target = e.target as HTMLElement | null;
          if (target?.closest('input,select,textarea,button,[contenteditable="true"]')) {
            return;
          }

          const isCtrlOrMeta = e.ctrlKey || e.metaKey;
          const key = e.key.toLowerCase();

          if (isCtrlOrMeta && key === 'c' && canCopy) {
            e.preventDefault();
            void copyToClipboard(Boolean(e.shiftKey));
            return;
          }

          if (isCtrlOrMeta && key === 'v' && canPaste) {
            e.preventDefault();
            void pasteFromClipboard();
            return;
          }

          if (options.enableRangeSelection && e.key === 'Escape') {
            clearSelectedRanges();
            return;
          }
          nav.handleKeyDown(e);
        }}
        onContextMenu={(e) => {
          const target = e.target as HTMLElement | null;
          if (!target) return;
          if (target.closest('input,select,textarea,button,[contenteditable="true"]')) {
            return;
          }
          const cell = target.closest('td[data-rowid][data-colid]') as HTMLElement | null;
          if (!cell) return;

          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });
        }}
      >
        <table
          className={layout.table}
          style={
            columnSizingEnabled
              ? shouldFillColumns
                ? { width: '100%', minWidth: table.getTotalSize() }
                : { width: table.getTotalSize(), minWidth: table.getTotalSize() }
              : undefined
          }
        >
          <colgroup>
            {table.getVisibleLeafColumns().map((column) => (
              <col
                key={column.id}
                style={
                  columnSizingEnabled
                    ? { width: column.getSize(), minWidth: column.getSize() }
                    : undefined
                }
              />
            ))}
          </colgroup>

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
              readonly={readonlyProp}
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
              getRowClassName={props.getRowClassName}
              getRowStyle={props.getRowStyle}
              getCellClassName={props.getCellClassName}
              getCellStyle={props.getCellStyle}
              getCellTooltip={props.getCellTooltip}
              noRowsMessage={null}
              footerSpacerHeight={footerSpacerHeight}
              rowSpanModel={rowSpanModel}
              rowSpanningMode={resolvedRowSpanningMode}
            />
          ) : (
            <GenGridBody<TData>
              table={table}
              readonly={readonlyProp}
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
              getRowClassName={props.getRowClassName}
              getRowStyle={props.getRowStyle}
              getCellClassName={props.getCellClassName}
              getCellStyle={props.getCellStyle}
              getCellTooltip={props.getCellTooltip}
              noRowsMessage={null}
              footerSpacerHeight={footerSpacerHeight}
              rowSpanModel={rowSpanModel}
              rowSpanningMode={resolvedRowSpanningMode}
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
        {rowCount === 0 && resolvedNoRowsMessage ? (
          <div
            className={layout.emptyOverlay}
            style={{ top: totalHeaderHeight }}
          >
            {resolvedNoRowsMessage}
          </div>
        ) : null}
      </div>

      {showFooter ? (
        <div className={layout.footer} data-sticky-footer>
          {footerContent}
        </div>
      ) : null}

      {enablePagination ? (
        <GenGridPagination table={table} pageSizeOptions={pageSizeOptions} />
      ) : null}

      <GenGridContextMenu
        contextMenu={contextMenu}
        canCopy={canCopy}
        canPaste={canPaste}
        rangeStats={rangeStats}
        customActions={customContextMenuActions}
        onClose={closeContextMenu}
        onCopy={() => void copyToClipboard(false)}
        onCopyWithHeader={() => void copyToClipboard(true)}
        onPaste={() => void pasteFromClipboard()}
      />
    </div>
  );
}
