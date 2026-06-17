// packages/gen-datagrid/src/renderers/div-grid/DataGridVirtualBody.tsx
// Renders a fixed-height virtualized body for the div-based DataGrid renderer.

import * as React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Row } from '@tanstack/react-table';

import type {
  GenDataGridActiveCell,
  GenDataGridCellValueChange,
  GenDataGridEditableContext,
  GenDataGridEditorFactory,
} from '../../GenDataGrid.types';
import { createEditableContext } from '../../features/editing/editableCell';
import type { GenDataGridEditingCell } from '../../features/editing/useCellEditing';
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
  editSelectOnFocus?: boolean;
  editCommitOnBlur?: boolean;
  editorFactory?: GenDataGridEditorFactory<TData>;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  dirtyCellIds?: ReadonlySet<string>;
  dirtyRowIds?: ReadonlySet<string>;
  deletedRowIds?: ReadonlySet<string>;
  activeCell: GenDataGridActiveCell;
  onActiveCellChange: (next: Exclude<GenDataGridActiveCell, null>) => void;
  editingCell: GenDataGridEditingCell | null;
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  onEditStart: (args: GenDataGridEditingCell & { value: unknown }) => void;
  onEditCancel: () => void;
  virtualBodyRef: React.MutableRefObject<DataGridVirtualBodyHandle | null>;
};

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
  editSelectOnFocus,
  editCommitOnBlur,
  editorFactory,
  onCellValueChange,
  dirtyCellIds,
  dirtyRowIds,
  deletedRowIds,
  activeCell,
  onActiveCellChange,
  editingCell,
  draftValue,
  setDraftValue,
  onEditStart,
  onEditCancel,
  virtualBodyRef,
}: DataGridVirtualBodyProps<TData>) {
  const activateCell = React.useCallback(
    (next: Exclude<GenDataGridActiveCell, null>) => {
      if (
        editingCell &&
        (editingCell.rowId !== next.rowId || editingCell.columnId !== next.columnId)
      ) {
        const editingRow = rows.find((item) => item.id === editingCell.rowId);
        const editingTanStackCell = editingRow
          ?.getVisibleCells()
          .find((cell) => cell.column.id === editingCell.columnId);
        if (editingRow && editingTanStackCell) {
          const editableContext = createEditableContext({
            row: editingRow,
            column: editingTanStackCell.column,
          });
          const meta = editingTanStackCell.column.columnDef.meta;
          const commitOnBlur = meta?.editCommitOnBlur ?? editCommitOnBlur ?? false;
          if (commitOnBlur) {
            onCellValueChange?.({
              row: editingRow.original,
              rowId: editingRow.id,
              rowIndex: editingRow.index,
              columnId: editingTanStackCell.column.id,
              previousValue: editableContext.value,
              value: draftValue,
            });
          }
        }
        onEditCancel();
      }

      onActiveCellChange(next);
    },
    [draftValue, editCommitOnBlur, editingCell, onActiveCellChange, onCellValueChange, onEditCancel, rows]
  );

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
            editSelectOnFocus={editSelectOnFocus}
            editCommitOnBlur={editCommitOnBlur}
            editorFactory={editorFactory}
            onCellValueChange={onCellValueChange}
            dirtyCellIds={dirtyCellIds}
            dirtyRowIds={dirtyRowIds}
            deletedRowIds={deletedRowIds}
            activeCell={activeCell}
            onActiveCellChange={activateCell}
            editingCell={editingCell}
            draftValue={draftValue}
            setDraftValue={setDraftValue}
            onEditStart={onEditStart}
            onEditCancel={onEditCancel}
            virtualized
            style={{
              position: 'absolute',
              top: `${virtualItem.start}px`,
              left: 0,
            }}
          />
        );
      })}
    </div>
  );
}
