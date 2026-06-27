// packages/gen-datagrid/src/renderers/div-grid/DataGridVirtualBody.tsx
// Renders a measured virtualized body for the div-based DataGrid renderer.

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Cell, Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValidation,
  GenDataGridCellValueChange,
  GenDataGridDetailPanelContext,
  GenDataGridEditableContext,
  GenDataGridEditPolicy,
  GenDataGridEditorFactory,
  GenDataGridExpandedRowState,
  GenDataGridRowContext,
  GenDataGridScrollSeekingOptions,
  GenDataGridTreeRowContext,
  GenDataGridValidationContext,
} from '../../GenDataGrid.types';
import { deactivateEditingForCellActivation } from '../../features/editing/editingCellActivation';
import { resolveCellEditingRuntime } from '../../features/editing/cellRuntime';
import type { GenDataGridEditingCell } from '../../features/editing/useCellEditing';
import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';
import type { GenDataGridRangeSelections } from '../../features/range-selection/rangeSelection';
import {
  buildVisibleStartVisualRowMergeDisplayModel,
  createVisualRowMergeKey,
  type GenDataGridVisualRowMergeDisplayModel,
  type GenDataGridVisualRowMergeModel,
} from '../../features/visual-row-merge/visualRowMerge';
import { DataGridBodyRow } from './DataGridBodyRow';
import { DataGridDetailRow } from './DataGridDetailRow';
import { formatCellValue } from './cellValue';

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
  currentRowId?: string | null;
  getCellValidation?: (
    ctx: GenDataGridValidationContext<TData>
  ) => GenDataGridCellValidation | null | undefined;
  visualRowMergeModel?: GenDataGridVisualRowMergeModel;
  visualRowMergeContinuationColumnIds?: readonly string[];
  visualRowMergeStickyLabelColumnIds?: readonly string[];
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  enableMasterDetail?: boolean;
  expandedRows?: GenDataGridExpandedRowState;
  getRowCanExpand?: (ctx: GenDataGridRowContext<TData>) => boolean;
  renderDetailPanel?: (ctx: GenDataGridDetailPanelContext<TData>) => React.ReactNode;
  detailPanelHeight?: number;
  onExpandedRowToggle?: (rowId: string, expanded: boolean) => void;
  enableTreeRows?: boolean;
  getRowCanExpandTree?: (ctx: GenDataGridTreeRowContext<TData>) => boolean;
  treeIndentWidth?: number;
  onTreeExpandedRowToggle?: (row: Row<TData>, expanded: boolean) => void;
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

function parseGridTemplatePixelTracks(gridTemplateColumns: string) {
  return gridTemplateColumns
    .trim()
    .split(/\s+/)
    .map((track) => {
      if (!track.endsWith('px')) return undefined;
      const value = Number(track.slice(0, -2));
      return Number.isFinite(value) ? value : undefined;
    });
}

type VirtualPlaceholderRowProps<TData> = {
  row: Row<TData>;
  gridTemplateColumns: string;
  rowHeight: number;
  enablePinning: boolean;
};

function VirtualPlaceholderRow<TData>({
  row,
  gridTemplateColumns,
  rowHeight,
  enablePinning,
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
  currentRowId,
  getCellValidation,
  visualRowMergeModel,
  visualRowMergeContinuationColumnIds,
  visualRowMergeStickyLabelColumnIds,
  getRowHeight,
  enableMasterDetail = false,
  expandedRows = {},
  getRowCanExpand,
  renderDetailPanel,
  detailPanelHeight = 160,
  onExpandedRowToggle,
  enableTreeRows = false,
  getRowCanExpandTree,
  treeIndentWidth = 16,
  onTreeExpandedRowToggle,
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
  void headerHeight;

  const previousEnsureVisibleActiveCellRef = React.useRef<typeof activeCell>(null);

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

  const getBaseRowHeight = React.useCallback(
    (row: Row<TData>) =>
      getRowHeight?.({ row: row.original, rowId: row.id, rowIndex: row.index }) ?? rowHeight,
    [getRowHeight, rowHeight]
  );

  const getRowContext = React.useCallback(
    (row: Row<TData>) => ({ row: row.original, rowId: row.id, rowIndex: row.index }),
    []
  );

  const getCanExpandRow = React.useCallback(
    (row: Row<TData>) => {
      const rowContext = getRowContext(row);
      return Boolean(
        enableMasterDetail &&
          renderDetailPanel &&
          (getRowCanExpand?.(rowContext) ?? true)
      );
    },
    [enableMasterDetail, getRowCanExpand, getRowContext, renderDetailPanel]
  );

  const getEstimatedRowSize = React.useCallback(
    (index: number) => {
      const row = rows[index];
      if (!row) return rowHeight;
      const canExpand = getCanExpandRow(row);
      const isExpanded = Boolean(expandedRows[row.id]);
      return getBaseRowHeight(row) + (canExpand && isExpanded ? detailPanelHeight : 0);
    },
    [detailPanelHeight, expandedRows, getBaseRowHeight, getCanExpandRow, rowHeight, rows]
  );

  const getInitialOffset = React.useCallback(() => {
    if (!activeCell) return 0;
    const activeRowIndex = rowIds.indexOf(activeCell.rowId);
    if (activeRowIndex <= 0) return 0;
    let offset = 0;
    for (let index = 0; index < activeRowIndex; index += 1) {
      offset += getEstimatedRowSize(index);
    }
    return offset;
  }, [activeCell, getEstimatedRowSize, rowIds]);

  const viewportOverscan = Math.max(
    12,
    Math.ceil((viewportElement?.clientHeight ?? rowHeight * 8) / rowHeight)
  );

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => viewportElement,
    observeElementRect: (_, callback) =>
      observeVirtualViewportRect(viewportElement, rowHeight, callback),
    estimateSize: getEstimatedRowSize,
    measureElement: (element) => {
      const measuredHeight = element.getBoundingClientRect().height;
      if (measuredHeight > 0) return measuredHeight;
      const index = Number(element.getAttribute('data-index') ?? 0);
      return getEstimatedRowSize(Number.isFinite(index) ? index : 0);
    },
    overscan: viewportOverscan,
    initialOffset: getInitialOffset,
    initialRect: {
      width: 0,
      height: rowHeight * 8,
    },
    isScrollingResetDelay: scrollSeekingOptions.resetDelayMs,
  });

  const ensureRowVisible = React.useCallback(
    (rowIndex: number) => {
      if (viewportElement) {
        const virtualItem = rowVirtualizer
          .getVirtualItems()
          .find((item) => item.index === rowIndex);
        if (virtualItem) {
          const rowStart = virtualItem.start;
          const rowEnd = virtualItem.end ?? virtualItem.start + virtualItem.size;
          const visibleTop = viewportElement.scrollTop;
          const visibleBottom = viewportElement.scrollTop + viewportElement.clientHeight;
          if (rowStart >= visibleTop && rowEnd <= visibleBottom) {
            return;
          }
        }
      }

      const offsetInfo = rowVirtualizer.getOffsetForIndex(rowIndex, 'auto');
      if (!offsetInfo) return;
      const [offset, align] = offsetInfo;
      rowVirtualizer.scrollToOffset(offset, { align });
    },
    [rowVirtualizer, viewportElement]
  );

  useClientLayoutEffect(() => {
    rowVirtualizer.measure();
  }, [detailPanelHeight, expandedRows, getEstimatedRowSize, gridTemplateColumns, rowVirtualizer]);

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
    if (!activeCell) {
      previousEnsureVisibleActiveCellRef.current = activeCell;
      return;
    }

    const previousActiveCell = previousEnsureVisibleActiveCellRef.current;
    const activeCellChanged =
      !previousActiveCell ||
      previousActiveCell.rowId !== activeCell.rowId ||
      previousActiveCell.columnId !== activeCell.columnId;
    previousEnsureVisibleActiveCellRef.current = activeCell;

    if (!activeCellChanged) return;

    const activeRowIndex = rowIds.indexOf(activeCell.rowId);
    if (activeRowIndex < 0) return;
    ensureRowVisible(activeRowIndex);
  }, [activeCell, ensureRowVisible, rowIds]);

  const totalSize = rowVirtualizer.getTotalSize();
  const virtualItems = rowVirtualizer.getVirtualItems();
  const isScrollSeeking =
    scrollSeekingOptions.enabled && rowVirtualizer.isScrolling && isLargeJumpScrolling;
  const firstVisibleVirtualItem = (() => {
    if (!viewportElement) return undefined;
    const visibleTop = viewportElement.scrollTop;
    const visibleBottom = visibleTop + viewportElement.clientHeight;
    return virtualItems.find((item) => {
      const itemEnd = item.end ?? item.start + item.size;
      return itemEnd > visibleTop && item.start < visibleBottom;
    });
  })();
  const visualRowMergeDisplayModel: GenDataGridVisualRowMergeDisplayModel | undefined =
    firstVisibleVirtualItem && visualRowMergeContinuationColumnIds?.length
      ? buildVisibleStartVisualRowMergeDisplayModel({
          rows,
          columnIds: visualRowMergeContinuationColumnIds,
          mergeModel: visualRowMergeModel,
          visibleRowStartIndex: firstVisibleVirtualItem.index,
        })
      : undefined;
  const stickyMergeLabels = (() => {
    if (!firstVisibleVirtualItem || !visualRowMergeModel) return [];
    if (!visualRowMergeStickyLabelColumnIds?.length) return [];

    const row = rows[firstVisibleVirtualItem.index];
    if (!row) return [];

    const stickyLabelColumnIds = new Set(visualRowMergeStickyLabelColumnIds);
    const trackWidths = parseGridTemplatePixelTracks(gridTemplateColumns);
    let left = 0;
    return getOrderedVisibleCells(row, enablePinning).flatMap((cell, cellIndex) => {
      const columnId = cell.column.id;
      const width = trackWidths[cellIndex] ?? cell.column.getSize();
      const currentLeft = left;
      left += width;

      if (!stickyLabelColumnIds.has(columnId)) return [];
      const state = visualRowMergeModel[createVisualRowMergeKey(row.id, columnId)];
      if (state !== 'middle' && state !== 'end') return [];
      if (enablePinning && cell.column.getIsPinned()) return [];

      return [
        {
          columnId,
          value: formatCellValue(cell.getValue()),
          left: currentLeft,
          width,
        },
      ];
    });
  })();

  return (
    <div
      role="rowgroup"
      data-gen-datagrid-body="true"
      data-virtualized-body="true"
      className="gen-datagrid__body gen-datagrid__body--virtual"
      style={{ height: `${totalSize}px` }}
    >
      {stickyMergeLabels.length > 0 ? (
        <div
          aria-hidden="true"
          className="gen-datagrid__sticky-merge-layer"
          data-visual-row-merge-sticky-layer="true"
        >
          {stickyMergeLabels.map((label) => (
            <div
              key={label.columnId}
              className="gen-datagrid__sticky-merge-label"
              data-visual-row-merge-sticky-label="true"
              data-colid={label.columnId}
              style={{
                left: `${label.left}px`,
                width: `${label.width}px`,
                height: `${rowHeight}px`,
              }}
            >
              {label.value}
            </div>
          ))}
        </div>
      ) : null}
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
        const resolvedRowHeight = getBaseRowHeight(row);
        const rowContext = getRowContext(row);
        const treeContext = {
          ...rowContext,
          depth: row.depth,
          parentRowId: row.parentId,
        };
        const treeCanExpand = Boolean(
          enableTreeRows &&
            row.getCanExpand() &&
            (getRowCanExpandTree?.(treeContext) ?? true)
        );
        const canExpand = getCanExpandRow(row);
        const isExpanded = Boolean(expandedRows[row.id]);

        return (
          <div
            key={row.id}
            ref={(node) => {
              if (node) rowVirtualizer.measureElement(node);
            }}
            data-virtualized-item="true"
            data-index={virtualItem.index}
            data-rowid={row.id}
            className="gen-datagrid__virtual-item"
            style={rowStyle}
          >
            {isScrollSeeking && !isActiveRow && !isEditingRow ? (
              <VirtualPlaceholderRow
                row={row}
                gridTemplateColumns={gridTemplateColumns}
                rowHeight={resolvedRowHeight}
                enablePinning={enablePinning}
              />
            ) : (
              <DataGridBodyRow
                row={row}
                rows={rows}
                gridTemplateColumns={gridTemplateColumns}
                rowHeight={resolvedRowHeight}
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
                currentRowId={currentRowId}
                getCellValidation={getCellValidation}
                visualRowMergeModel={visualRowMergeModel}
                visualRowMergeDisplayModel={visualRowMergeDisplayModel}
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
                canExpand={canExpand}
                isExpanded={isExpanded}
                onExpandedChange={(expanded) => onExpandedRowToggle?.(row.id, expanded)}
                treeDepth={enableTreeRows ? row.depth : 0}
                treeParentRowId={enableTreeRows ? row.parentId : undefined}
                treeCanExpand={treeCanExpand}
                treeIsExpanded={treeCanExpand && row.getIsExpanded()}
                treeIndentWidth={treeIndentWidth}
                onTreeExpandedChange={(expanded) => onTreeExpandedRowToggle?.(row, expanded)}
              />
            )}
            {canExpand && isExpanded && renderDetailPanel ? (
              <DataGridDetailRow
                parentRowId={row.id}
                gridTemplateColumns={gridTemplateColumns}
                height={detailPanelHeight}
              >
                {renderDetailPanel({
                  ...rowContext,
                  expanded: true,
                  collapse: () => onExpandedRowToggle?.(row.id, false),
                })}
              </DataGridDetailRow>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
