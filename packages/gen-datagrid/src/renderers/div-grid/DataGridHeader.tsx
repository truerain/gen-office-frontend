// packages/gen-datagrid/src/renderers/div-grid/DataGridHeader.tsx
// Renders the baseline header row for the div-based DataGrid renderer.

import * as React from 'react';
import { flexRender, type HeaderGroup, type Table } from '@tanstack/react-table';

import { getColumnPinningInfo } from '../../features/pinning/pinningStyles';
import { reorderColumnOrder } from '../../features/reorder/columnReorder';

type DataGridHeaderProps<TData> = {
  table: Table<TData>;
  headerGroups: HeaderGroup<TData>[];
  gridTemplateColumns: string;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableColumnReorder?: boolean;
};

export function DataGridHeader<TData>({
  table,
  headerGroups,
  gridTemplateColumns,
  enablePinning = true,
  enableColumnSizing = true,
  enableColumnReorder = true,
}: DataGridHeaderProps<TData>) {
  const dragColumnId = React.useRef<string | null>(null);
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
          {headerGroup.headers.map((header) => {
            const columnId = header.column.id;
            const pinning = enablePinning ? getColumnPinningInfo(header.column) : undefined;
            const canResize = enableColumnSizing && header.column.getCanResize();
            const canReorder = enableColumnReorder && !header.isPlaceholder;
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
              draggable={canReorder}
              className="gen-datagrid__header-cell"
              style={pinning?.style}
              onDragStart={(event) => {
                if (!canReorder) return;
                dragColumnId.current = columnId;
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', columnId);
              }}
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
                const nextOrder = reorderColumnOrder({
                  columnOrder: currentOrder,
                  columnPinning,
                  movingColumnId,
                  targetColumnId: columnId,
                });
                if (nextOrder === currentOrder) return;
                table.setColumnOrder([...nextOrder]);
              }}
              onDragEnd={() => {
                dragColumnId.current = null;
              }}
            >
              <div className="gen-datagrid__header-content">
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
              {canResize ? (
                <button
                  type="button"
                  aria-label={`Resize ${columnId}`}
                  data-column-resize-handle="true"
                  className="gen-datagrid__resize-handle"
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
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
