// packages/gen-datagrid/src/renderers/div-grid/DataGridHeader.tsx
// Renders the baseline header row for the div-based DataGrid renderer.

import * as React from 'react';
import {
  flexRender,
  type Column,
  type Header,
  type HeaderGroup,
  type Table,
} from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';

import { DataGridColumnFilter } from '../../features/filtering/DataGridColumnFilter';
import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';
import {
  getColumnPinningZone,
  reorderColumnOrder,
  reorderColumnPinning,
} from '../../features/reorder/columnReorder';
import { isGenDataGridSystemColumnId } from '../../features/system-columns/systemColumns';

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

function getHeaderColSpan<TData>(header: Header<TData, unknown>) {
  return Number.isFinite(header.colSpan) && header.colSpan > 0 ? header.colSpan : 1;
}

function getPinningZone<TData>(
  column: Column<TData, unknown>,
  enablePinning: boolean
) {
  if (!enablePinning) return 'center';
  return column.getIsPinned() || 'center';
}

function clampHeaderSpan<TData>({
  columns,
  columnIndex,
  requestedSpan,
  enablePinning,
}: {
  columns: Column<TData, unknown>[];
  columnIndex: number;
  requestedSpan: number;
  enablePinning: boolean;
}) {
  const span = Math.max(1, Math.floor(requestedSpan));
  if (span <= 1) return 1;

  const currentColumn = columns[columnIndex];
  if (!currentColumn) return 1;

  const zone = getPinningZone(currentColumn, enablePinning);
  const availableInZone = columns
    .slice(columnIndex)
    .findIndex((column) => getPinningZone(column, enablePinning) !== zone);
  const maxSpan = availableInZone < 0 ? columns.length - columnIndex : availableInZone;

  return span <= maxSpan ? span : 1;
}

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
  const leafHeaderGroup = headerGroups[headerGroups.length - 1];

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

  const renderGroupHeaderRow = (headerGroup: HeaderGroup<TData>, depth: number) => (
    <div
      key={headerGroup.id}
      role="row"
      className="gen-datagrid__row gen-datagrid__header-row gen-datagrid__header-row--group"
      style={{ gridTemplateColumns }}
    >
      {headerGroup.headers.map((header) => {
        const colSpan = getHeaderColSpan(header);
        const headerAlign = header.column.columnDef.meta?.headerAlign ?? 'center';

        return (
          <div
            key={header.id}
            role="columnheader"
            data-gen-datagrid-cell="true"
            data-cell-kind="header"
            data-header-group-cell="true"
            data-header-depth={depth}
            data-header-colspan={colSpan > 1 ? String(colSpan) : undefined}
            data-align={headerAlign}
            aria-hidden={header.isPlaceholder ? 'true' : undefined}
            className="gen-datagrid__header-cell gen-datagrid__header-cell--group"
            style={{ gridColumn: 'span ' + String(colSpan) }}
          >
            <div className="gen-datagrid__header-content">
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLeafHeaderRow = (headerGroup: HeaderGroup<TData>) => {
    let coveredHeaderCount = 0;

    return (
      <div
        key={headerGroup.id}
        role="row"
        className="gen-datagrid__row gen-datagrid__header-row gen-datagrid__header-row--leaf"
        style={{ gridTemplateColumns }}
      >
        {columns.map((column, columnIndex) => {
        if (coveredHeaderCount > 0) {
          coveredHeaderCount -= 1;
          return null;
        }

        const header = headerGroup.headers.find((item) => item.column.id === column.id);
        if (!header) return null;

        const columnId = column.id;
        const isSystemColumn = isGenDataGridSystemColumnId(columnId);
        const headerAlign = column.columnDef.meta?.headerAlign ?? 'center';
        const requestedHeaderSpan = column.columnDef.meta?.headerSpan;
        const headerSpan = requestedHeaderSpan
          ? clampHeaderSpan({
              columns,
              columnIndex,
              requestedSpan: requestedHeaderSpan,
              enablePinning,
            })
          : 1;
        if (headerSpan > 1) {
          coveredHeaderCount = headerSpan - 1;
        }
        const pinning = enablePinning ? getColumnPinningInfo(column, { zIndex: 4 }) : undefined;
        const canResize = enableColumnSizing && !isSystemColumn && column.getCanResize();
        const canReorder = enableColumnReorder && !isSystemColumn && !header.isPlaceholder;
        const canFilter =
          enableColumnFilters && !isSystemColumn && !header.isPlaceholder && column.getCanFilter();

        return (
          <div
            key={header.id}
            role="columnheader"
            data-gen-datagrid-cell="true"
            data-cell-kind="header"
            data-colid={columnId}
            data-system-column={isSystemColumn ? 'true' : undefined}
            data-align={isSystemColumn ? undefined : headerAlign}
            data-header-colspan={headerSpan > 1 ? String(headerSpan) : undefined}
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
            style={{
              ...pinning?.style,
              gridColumn: String(columnIndex + 1) + ' / span ' + String(headerSpan),
            }}
            onDragOver={(event) => {
              if (!canReorder || !dragColumnId.current) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => {
              if (!canReorder) return;
              event.preventDefault();
              const movingColumnId = dragColumnId.current || event.dataTransfer.getData('text/plain');
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
              const didReorderColumnPinning = movingZone !== 'center' && nextPinning !== columnPinning;

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
                aria-label={'Reorder ' + columnId}
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
                aria-label={'Resize ' + columnId}
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
    );
  };

  return (
    <div
      ref={headerRef}
      role="rowgroup"
      data-gen-datagrid-header="true"
      data-filter-open={openFilterColumnId ? 'true' : undefined}
      data-header-row-count={headerGroups.length}
      className="gen-datagrid__header"
    >
      {headerGroups.map((headerGroup, index) =>
        headerGroup === leafHeaderGroup
          ? renderLeafHeaderRow(headerGroup)
          : renderGroupHeaderRow(headerGroup, index)
      )}
    </div>
  );
}
