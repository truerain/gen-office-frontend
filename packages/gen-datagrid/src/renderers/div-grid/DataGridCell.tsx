// packages/gen-datagrid/src/renderers/div-grid/DataGridCell.tsx
// Renders a baseline body cell for the div-based DataGrid renderer.

import * as React from 'react';

const interactiveTargetSelector =
  'input,select,textarea,button,[contenteditable="true"]';

type DataGridCellProps = {
  rowId: string;
  columnId: string;
  isActive: boolean;
  isSelected: boolean;
  isEditable: boolean;
  isEditing: boolean;
  onActivate: (coord: { rowId: string; columnId: string }) => void;
  onEditStart?: (coord: { rowId: string; columnId: string }) => void;
  children: React.ReactNode;
};

export function DataGridCell({
  rowId,
  columnId,
  isActive,
  isSelected,
  isEditable,
  isEditing,
  onActivate,
  onEditStart,
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
      data-editable-cell={isEditable ? 'true' : undefined}
      data-editing-cell={isEditing ? 'true' : undefined}
      className="gen-datagrid__cell"
      tabIndex={isActive ? 0 : -1}
      onMouseDown={(event) => {
        if (event.button !== 0) return;
        if ((event.target as HTMLElement | null)?.closest(interactiveTargetSelector)) {
          return;
        }
        if (isActive && isEditable && !isEditing) {
          onEditStart?.({ rowId, columnId });
          return;
        }
        onActivate({ rowId, columnId });
      }}
      onDoubleClick={() => {
        if (!isEditable) return;
        onEditStart?.({ rowId, columnId });
      }}
    >
      {children}
    </div>
  );
}
