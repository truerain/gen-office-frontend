// packages/gen-datagrid/src/renderers/div-grid/DataGridHeader.tsx
// Renders the baseline header row for the div-based DataGrid renderer.

import * as React from 'react';
import { flexRender, type Column, type HeaderGroup, type Table } from '@tanstack/react-table';
import { Funnel, GripVertical } from 'lucide-react';

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
  const [openFilterColumnId, setOpenFilterColumnId] = React.useState<string | null>(null);
  const columnPinning = enablePinning ? table.getState().columnPinning : undefined;

  return (
    <div role="rowgroup" data-gen-datagrid-header="true" className="gen-datagrid__header">
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
            const filterValue = column.getFilterValue();
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
                <div className="gen-datagrid__filter">
                  <button
                    type="button"
                    aria-label={`Filter ${columnId}`}
                    aria-expanded={openFilterColumnId === columnId}
                    data-column-filter-trigger="true"
                    data-filter-active={
                      filterValue !== undefined && filterValue !== '' ? 'true' : undefined
                    }
                    className="gen-datagrid__filter-trigger"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setOpenFilterColumnId((current) =>
                        current === columnId ? null : columnId
                      );
                    }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <Funnel aria-hidden="true" size={13} strokeWidth={1.8} />
                  </button>
                  {openFilterColumnId === columnId ? (
                    <div
                      role="dialog"
                      aria-label={`Filter ${columnId}`}
                      data-column-filter-popover="true"
                      className="gen-datagrid__filter-popover"
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      <input
                        aria-label={`Filter ${columnId} value`}
                        className="gen-datagrid__filter-input"
                        value={filterValue == null ? '' : String(filterValue)}
                        onChange={(event) => {
                          column.setFilterValue(event.target.value || undefined);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            setOpenFilterColumnId(null);
                          }
                        }}
                      />
                      <button
                        type="button"
                        aria-label={`Clear filter ${columnId}`}
                        className="gen-datagrid__filter-clear"
                        onClick={(event) => {
                          event.preventDefault();
                          column.setFilterValue(undefined);
                          setOpenFilterColumnId(null);
                        }}
                      >
                        Clear
                      </button>
                    </div>
                  ) : null}
                </div>
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
