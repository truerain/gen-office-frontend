// packages/gen-datagrid/src/renderers/div-grid/DataGridHeader.tsx
// Renders the baseline header row for the div-based DataGrid renderer.

import * as React from 'react';
import { flexRender, type Column, type HeaderGroup, type Table } from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';

import { DataGridColumnFilter } from '../../features/filtering/DataGridColumnFilter';
import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';
import {
  getColumnPinningZone,
  reorderColumnOrder,
  reorderColumnPinning,
} from '../../features/reorder/columnReorder';

type DataGridHeaderProps<TData> = {
  table: Table<TData>;
  headerGroups: HeaderGroup<TData>[];
  columns: Column<TData, unknown>[];
  gridTemplateColumns: string;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableColumnReorder?: boolean;
  enableColumnFilters?: boolean;
};

export function DataGridHeader<TData>({
  table,
  headerGroups,
  columns,
  gridTemplateColumns,
  enablePinning = true,
  enableColumnSizing = true,
  enableColumnReorder = true,
  enableColumnFilters = false,
}: DataGridHeaderProps<TData>) {
  const dragColumnId = React.useRef<string | null>(null);
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const [openFilterColumnId, setOpenFilterColumnId] = React.useState<string | null>(null);
  const columnPinning = enablePinning ? table.getState().columnPinning : undefined;

  React.useEffect(() => {
    if (!openFilterColumnId) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      const header = headerRef.current;
      if (!header || header.contains(event.target as Node)) return;
      setOpenFilterColumnId(null);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown, true);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown, true);
    };
  }, [openFilterColumnId]);

  return (
    <div
      ref={headerRef}
      role="rowgroup"
      data-gen-datagrid-header="true"
      data-filter-open={openFilterColumnId ? 'true' : undefined}
      className="gen-datagrid__header"
    >
      {headerGroups.map((headerGroup) => (
        <div
          key={headerGroup.id}
          role="row"
          className="gen-datagrid__row"
          style={{ gridTemplateColumns }}
        >
          {columns.map((column) => {
            const header = headerGroup.headers.find((item) => item.column.id === column.id);
            if (!header) return null;

            const columnId = column.id;
            const pinning = enablePinning
              ? getColumnPinningInfo(column, { zIndex: 4 })
              : undefined;
            const canResize = enableColumnSizing && column.getCanResize();
            const canReorder = enableColumnReorder && !header.isPlaceholder;
            const canFilter =
              enableColumnFilters && !header.isPlaceholder && column.getCanFilter();
            return (
            <div
              key={header.id}
              role="columnheader"
              data-gen-datagrid-cell="true"
              data-cell-kind="header"
              data-colid={columnId}
              data-pinned-cell={pinning?.pinned || undefined}
              data-pinned-edge={
                pinning?.isLastLeftPinned
                  ? 'left-end'
                  : pinning?.isFirstRightPinned
                    ? 'right-start'
                    : undefined
              }
              data-resizable-column={canResize ? 'true' : undefined}
              data-reorderable-column={canReorder ? 'true' : undefined}
              data-filter-open={openFilterColumnId === columnId ? 'true' : undefined}
              className="gen-datagrid__header-cell"
              style={pinning?.style}
              onDragOver={(event) => {
                if (!canReorder || !dragColumnId.current) return;
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
              }}
              onDrop={(event) => {
                if (!canReorder) return;
                event.preventDefault();
                const movingColumnId =
                  dragColumnId.current || event.dataTransfer.getData('text/plain');
                dragColumnId.current = null;
                if (!movingColumnId) return;
                const currentOrder = table.getAllLeafColumns().map((column) => column.id);
                const movingZone = getColumnPinningZone(movingColumnId, columnPinning);
                const nextOrder = reorderColumnOrder({
                  columnOrder: currentOrder,
                  columnPinning,
                  movingColumnId,
                  targetColumnId: columnId,
                });
                const nextPinning = reorderColumnPinning({
                  columnPinning,
                  movingColumnId,
                  targetColumnId: columnId,
                });
                const didReorderColumnOrder = nextOrder !== currentOrder;
                const didReorderColumnPinning =
                  movingZone !== 'center' && nextPinning !== columnPinning;

                if (!didReorderColumnOrder && !didReorderColumnPinning) {
                  return;
                }
                if (didReorderColumnOrder) {
                  table.setColumnOrder([...nextOrder]);
                }
                if (didReorderColumnPinning) {
                  table.setColumnPinning(nextPinning);
                }
              }}
            >
              {canReorder ? (
                <button
                  type="button"
                  aria-label={`Reorder ${columnId}`}
                  data-column-reorder-handle="true"
                  className="gen-datagrid__reorder-handle"
                  draggable
                  onDragStart={(event) => {
                    dragColumnId.current = columnId;
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', columnId);
                  }}
                  onDragEnd={() => {
                    dragColumnId.current = null;
                  }}
                >
                  <GripVertical aria-hidden="true" size={14} strokeWidth={1.8} />
                </button>
              ) : null}
              <div className="gen-datagrid__header-content">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
              {canFilter ? (
                <DataGridColumnFilter
                  column={column}
                  columnId={columnId}
                  open={openFilterColumnId === columnId}
                  onOpenChange={(open) => {
                    setOpenFilterColumnId(open ? columnId : null);
                  }}
                />
              ) : null}
              {canResize ? (
                <button
                  type="button"
                  aria-label={`Resize ${columnId}`}
                  data-column-resize-handle="true"
                  className="gen-datagrid__resize-handle"
                  draggable={false}
                  onDragStart={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    header.getResizeHandler()(event);
                  }}
                  onTouchStart={(event) => {
                    event.stopPropagation();
                    header.getResizeHandler()(event);
                  }}
                />
              ) : null}
            </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
