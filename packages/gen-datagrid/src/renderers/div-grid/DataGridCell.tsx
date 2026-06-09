// packages/gen-datagrid/src/renderers/div-grid/DataGridCell.tsx
// Renders a baseline body cell for the div-based DataGrid renderer.

import * as React from 'react';

type DataGridCellProps = {
  rowId: string;
  columnId: string;
  isActive: boolean;
  isSelected: boolean;
  onActivate: (coord: { rowId: string; columnId: string }) => void;
  children: React.ReactNode;
};

export function DataGridCell({
  rowId,
  columnId,
  isActive,
  isSelected,
  onActivate,
  children,
}: DataGridCellProps) {
  return (
    <div
      role="gridcell"
      data-gen-datagrid-cell="true"
      data-cell-kind="body"
      data-rowid={rowId}
      data-colid={columnId}
      data-active-cell={isActive ? 'true' : undefined}
      data-selected-cell={isSelected ? 'true' : undefined}
      className="gen-datagrid__cell"
      tabIndex={isActive ? 0 : -1}
      onMouseDown={(event) => {
        if (event.button !== 0) return;
        onActivate({ rowId, columnId });
      }}
    >
      {children}
    </div>
  );
}
