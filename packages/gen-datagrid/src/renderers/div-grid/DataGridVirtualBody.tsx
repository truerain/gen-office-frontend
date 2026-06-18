// packages/gen-datagrid/src/renderers/div-grid/DataGridVirtualBody.tsx
// Renders a fixed-height virtualized body for the div-based DataGrid renderer.

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Cell, Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditPolicy,
  GenDataGridEditorFactory,
  GenDataGridScrollSeekingOptions,
} from '../../GenDataGrid.types';
import { deactivateEditingForCellActivation } from '../../features/editing/editingCellActivation';
import { resolveCellEditingRuntime } from '../../features/editing/cellRuntime';
import type { GenDataGridEditingCell } from '../../features/editing/useCellEditing';
import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';
import type { GenDataGridRangeSelections } from '../../features/range-selection/rangeSelection';
import { DataGridBodyRow } from './DataGridBodyRow';

export type DataGridVirtualBodyHandle = {
  scrollToRowIndex: (rowIndex: number) => void;
};

const useClientLayoutEffect =
  typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

function observeVirtualViewportRect(
  element: HTMLDivElement | null,
  rowHeight: number,
  callback: (rect: { width: number; height: number }) => void
) {
  if (!element) {
    callback({ width: 0, height: rowHeight * 8 });
    return () => undefined;
  }

  const report = () => {
    const rect = element.getBoundingClientRect();
    callback({
      width: rect.width || element.clientWidth || 0,
      height: rect.height || element.clientHeight || rowHeight * 8,
    });
  };

  report();

  if (typeof ResizeObserver === 'undefined') {
    window.addEventListener('resize', report);
    return () => window.removeEventListener('resize', report);
  }

  const resizeObserver = new ResizeObserver(report);
  resizeObserver.observe(element);
  return () => resizeObserver.disconnect();
}

type DataGridVirtualBodyProps<TData> = {
  rows: Row<TData>[];
  gridTemplateColumns: string;
  rowHeight: number;
  headerHeight: number;
  rowIds: readonly string[];
  columnIds: readonly string[];
  rangeSelections: GenDataGridRangeSelections;
  viewportElement: HTMLDivElement | null;
  readOnly?: boolean;
  enablePinning?: boolean;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
  editPolicy?: GenDataGridEditPolicy;
  editSelectOnFocus?: boolean;
  editCommitOnBlur?: boolean;
  editorFactory?: GenDataGridEditorFactory<TData>;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  dirtyCellIds?: ReadonlySet<string>;
  dirtyRowIds?: ReadonlySet<string>;
  deletedRowIds?: ReadonlySet<string>;
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
  onEditingNavigate?: (next: Exclude<GenDataGridActiveCell, null>) => void;
  editingCell: GenDataGridEditingCell | null;
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  onEditStart: (args: GenDataGridEditingCell & { value: unknown }) => void;
  onEditCancel: () => void;
  getGridRoot?: () => HTMLElement | null;
  getEditorSurfaces?: () => Iterable<HTMLElement>;
  registerEditorSurface?: (element: HTMLElement) => void;
  unregisterEditorSurface?: (element: HTMLElement) => void;
  scrollSeeking?: boolean | GenDataGridScrollSeekingOptions;
  virtualBodyRef: React.MutableRefObject<DataGridVirtualBodyHandle | null>;
};

const defaultScrollSeekingOptions: Required<GenDataGridScrollSeekingOptions> = {
  enabled: true,
  jumpThresholdRows: 24,
  jumpThresholdViewports: 2,
  resetDelayMs: 120,
};

function getOrderedVisibleCells<TData>(row: Row<TData>, enablePinning: boolean) {
  return enablePinning
    ? [...row.getLeftVisibleCells(), ...row.getCenterVisibleCells(), ...row.getRightVisibleCells()]
    : row.getVisibleCells();
}

function resolvePlaceholderWidth(cell: Cell<unknown, unknown>, index: number) {
  const basis = Math.max(48, Math.floor(cell.column.getSize() * 0.72));
  const variance = (index % 3) * 18;
  return `${Math.max(36, basis - variance)}px`;
}

type VirtualPlaceholderRowProps<TData> = {
  row: Row<TData>;
  gridTemplateColumns: string;
  rowHeight: number;
  enablePinning: boolean;
  style?: React.CSSProperties;
};

function VirtualPlaceholderRow<TData>({
  row,
  gridTemplateColumns,
  rowHeight,
  enablePinning,
  style,
}: VirtualPlaceholderRowProps<TData>) {
  const orderedCells = getOrderedVisibleCells(row, enablePinning);

  return (
    <div
      role="row"
      aria-hidden="true"
      data-rowid={row.id}
      data-row-index={row.index}
      data-virtualized-row="true"
      data-scroll-seeking-row="true"
      className="gen-datagrid__row gen-datagrid__row--placeholder"
      style={{
        gridTemplateColumns,
        ['--gen-datagrid-current-row-height' as string]: `${rowHeight}px`,
        ...style,
      }}
    >
      {orderedCells.map((cell, index) => {
        const pinning = enablePinning ? getColumnPinningInfo(cell.column, { zIndex: 2 }) : undefined;

        return (
          <div
            key={cell.id}
            role="presentation"
            data-pinned-cell={pinning?.pinned || undefined}
            data-pinned-edge={
              pinning?.isLastLeftPinned
                ? 'left-end'
                : pinning?.isFirstRightPinned
                  ? 'right-start'
                  : undefined
            }
            className="gen-datagrid__cell gen-datagrid__cell--placeholder"
            style={pinning?.style}
          >
            <span
              className="gen-datagrid__cell-placeholder-bar"
              style={{ width: resolvePlaceholderWidth(cell as Cell<unknown, unknown>, index) }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function DataGridVirtualBody<TData>({
  rows,
  gridTemplateColumns,
  rowHeight,
  headerHeight,
  rowIds,
  columnIds,
  rangeSelections,
  viewportElement,
  readOnly,
  enablePinning = true,
  isCellEditable,
  editPolicy,
  editSelectOnFocus,
  editCommitOnBlur,
  editorFactory,
  onCellValueChange,
  dirtyCellIds,
  dirtyRowIds,
  deletedRowIds,
  activeCell,
  onActiveCellChange,
  onEditingNavigate,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
  getGridRoot,
  getEditorSurfaces,
  registerEditorSurface,
  unregisterEditorSurface,
  scrollSeeking,
  virtualBodyRef,
}: DataGridVirtualBodyProps<TData>) {
  const getCellRuntime = React.useCallback(
    (coord: { rowId: string; columnId: string }) =>
      resolveCellEditingRuntime({
        rows,
        coord,
        readOnly,
        isCellEditable,
        editPolicy,
        editCommitOnBlur,
      }),
    [editCommitOnBlur, editPolicy, isCellEditable, readOnly, rows]
  );

  const activateCell = React.useCallback(
    (next: Exclude<GenDataGridActiveCell, null>) => {
      if (
        editingCell &&
        (editingCell.rowId !== next.rowId || editingCell.columnId !== next.columnId)
      ) {
        const editingRuntime = getCellRuntime(editingCell);
        const nextRuntime = getCellRuntime(next);
        if (editingRuntime) {
          deactivateEditingForCellActivation({
            row: editingRuntime.row.original,
            rowId: editingRuntime.row.id,
            rowIndex: editingRuntime.row.index,
            columnId: editingCell.columnId,
            previousValue: editingRuntime.editableContext.value,
            draftValue,
            commitOnBlur: editingRuntime.commitOnBlur,
            blurOwnership: editingRuntime.blurOwnership,
            continueClick: nextRuntime?.resolvedEditPolicy.continueTriggers.click ?? false,
            onCellValueChange,
            onEditCancel,
          });
        } else {
          onEditCancel();
        }

        onEditingNavigate?.(next);

        if (nextRuntime?.isEditable && nextRuntime.resolvedEditPolicy.continueTriggers.click) {
          onEditStart({
            rowId: next.rowId,
            columnId: next.columnId,
            value: nextRuntime.editableContext.value,
            entryReason: 'click',
          });
        }
        return;
      }

      onActiveCellChange(next);
    },
    [draftValue, editingCell, getCellRuntime, onActiveCellChange, onCellValueChange, onEditCancel, onEditStart, onEditingNavigate]
  );
  const [isLargeJumpScrolling, setIsLargeJumpScrolling] = React.useState(false);
  const lastScrollTopRef = React.useRef(0);
  const scrollSeekingOptions = React.useMemo(() => {
    if (scrollSeeking === false) {
      return {
        ...defaultScrollSeekingOptions,
        enabled: false,
      };
    }
    if (scrollSeeking === true || scrollSeeking === undefined) {
      return defaultScrollSeekingOptions;
    }
    return {
      ...defaultScrollSeekingOptions,
      ...scrollSeeking,
      enabled: scrollSeeking.enabled ?? true,
    };
  }, [scrollSeeking]);

  const viewportOverscan = Math.max(
    12,
    Math.ceil((viewportElement?.clientHeight ?? rowHeight * 8) / rowHeight)
  );

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewportElement,
    observeElementRect: (_, callback) =>
      observeVirtualViewportRect(viewportElement, rowHeight, callback),
    estimateSize: () => rowHeight,
    overscan: viewportOverscan,
    initialOffset: () => {
      if (!activeCell) return 0;
      const activeRowIndex = rowIds.indexOf(activeCell.rowId);
      return activeRowIndex >= 0 ? activeRowIndex * rowHeight : 0;
    },
    initialRect: {
      width: 0,
      height: rowHeight * 8,
    },
    isScrollingResetDelay: scrollSeekingOptions.resetDelayMs,
  });

  const ensureRowVisible = React.useCallback(
    (rowIndex: number) => {
      if (!viewportElement) {
        rowVirtualizer.scrollToIndex(rowIndex, { align: 'auto' });
        return;
      }

      const rowStart = rowIndex * rowHeight;
      const rowEnd = rowStart + rowHeight;
      const visibleTop = viewportElement.scrollTop;
      const visibleBottom = viewportElement.scrollTop + viewportElement.clientHeight;

      if (rowStart >= visibleTop && rowEnd <= visibleBottom) {
        return;
      }

      if (rowStart < visibleTop) {
        rowVirtualizer.scrollToOffset(Math.max(0, rowStart), {
          align: 'start',
        });
        return;
      }

      rowVirtualizer.scrollToOffset(Math.max(0, rowEnd - viewportElement.clientHeight), {
        align: 'start',
      });
    },
    [headerHeight, rowHeight, rowVirtualizer, viewportElement]
  );

  useClientLayoutEffect(() => {
    if (!scrollSeekingOptions.enabled) {
      setIsLargeJumpScrolling(false);
      return;
    }

    if (!viewportElement) {
      setIsLargeJumpScrolling(false);
      return;
    }

    lastScrollTopRef.current = viewportElement.scrollTop;

    const handleScroll = () => {
      const nextScrollTop = viewportElement.scrollTop;
      const delta = Math.abs(nextScrollTop - lastScrollTopRef.current);
      lastScrollTopRef.current = nextScrollTop;

      setIsLargeJumpScrolling(
        delta >=
          Math.max(
            viewportElement.clientHeight * scrollSeekingOptions.jumpThresholdViewports,
            rowHeight * scrollSeekingOptions.jumpThresholdRows
          )
      );
    };

    viewportElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => viewportElement.removeEventListener('scroll', handleScroll);
  }, [
    rowHeight,
    scrollSeekingOptions.enabled,
    scrollSeekingOptions.jumpThresholdRows,
    scrollSeekingOptions.jumpThresholdViewports,
    viewportElement,
  ]);

  useClientLayoutEffect(() => {
    if (!rowVirtualizer.isScrolling && isLargeJumpScrolling) {
      setIsLargeJumpScrolling(false);
    }
  }, [isLargeJumpScrolling, rowVirtualizer.isScrolling]);

  useClientLayoutEffect(() => {
    virtualBodyRef.current = {
      scrollToRowIndex: (rowIndex: number) => {
        ensureRowVisible(rowIndex);
      },
    };

    return () => {
      virtualBodyRef.current = null;
    };
  }, [ensureRowVisible, virtualBodyRef]);

  useClientLayoutEffect(() => {
    if (!activeCell) return;
    const activeRowIndex = rowIds.indexOf(activeCell.rowId);
    if (activeRowIndex < 0) return;
    ensureRowVisible(activeRowIndex);
  }, [activeCell, ensureRowVisible, rowIds]);

  const totalSize = rowVirtualizer.getTotalSize();
  const virtualItems = rowVirtualizer.getVirtualItems();
  const isScrollSeeking =
    scrollSeekingOptions.enabled && rowVirtualizer.isScrolling && isLargeJumpScrolling;

  return (
    <div
      role="rowgroup"
      data-gen-datagrid-body="true"
      data-virtualized-body="true"
      className="gen-datagrid__body gen-datagrid__body--virtual"
      style={{ height: `${totalSize}px` }}
    >
      {virtualItems.map((virtualItem) => {
        const row = rows[virtualItem.index];
        if (!row) return null;

        const isActiveRow = activeCell?.rowId === row.id;
        const isEditingRow = editingCell?.rowId === row.id;
        const rowStyle: React.CSSProperties = {
          position: 'absolute',
          top: `${virtualItem.start}px`,
          left: 0,
        };

        if (isScrollSeeking && !isActiveRow && !isEditingRow) {
          return (
            <VirtualPlaceholderRow
              key={row.id}
              row={row}
              gridTemplateColumns={gridTemplateColumns}
              rowHeight={rowHeight}
              enablePinning={enablePinning}
              style={rowStyle}
            />
          );
        }

        return (
          <DataGridBodyRow
            key={row.id}
            row={row}
            rows={rows}
            gridTemplateColumns={gridTemplateColumns}
            rowHeight={rowHeight}
            rowIds={rowIds}
            columnIds={columnIds}
            rangeSelections={rangeSelections}
            readOnly={readOnly}
            enablePinning={enablePinning}
            isCellEditable={isCellEditable}
            editPolicy={editPolicy}
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={onCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            activeCell={activeCell}
            onActiveCellChange={activateCell}
            onEditingNavigate={onEditingNavigate}
            editingCell={editingCell}
            draftValue={draftValue}
            setDraftValue={setDraftValue}
            onEditStart={onEditStart}
            onEditCancel={onEditCancel}
            getGridRoot={getGridRoot}
            getEditorSurfaces={getEditorSurfaces}
            registerEditorSurface={registerEditorSurface}
            unregisterEditorSurface={unregisterEditorSurface}
            virtualized
            style={rowStyle}
          />
        );
      })}
    </div>
  );
}
