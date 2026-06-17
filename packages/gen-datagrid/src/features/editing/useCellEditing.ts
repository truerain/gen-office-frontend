// packages/gen-datagrid/src/features/editing/useCellEditing.ts
// Manages the active cell editing draft state for GenDataGrid.

import * as React from 'react';

export type GenDataGridEditingCell = {
  rowId: string;
  columnId: string;
  suppressSelectOnFocus?: boolean;
};

export type StartCellEditingArgs = GenDataGridEditingCell & {
  value: unknown;
};

export function useCellEditing() {
  const [editingCell, setEditingCell] = React.useState<GenDataGridEditingCell | null>(null);
  const [draftValue, setDraftValue] = React.useState<unknown>(undefined);

  const startEditing = React.useCallback(
    ({ rowId, columnId, value, suppressSelectOnFocus }: StartCellEditingArgs) => {
      setEditingCell({ rowId, columnId, suppressSelectOnFocus });
      setDraftValue(value);
    },
    []
  );

  const cancelEditing = React.useCallback(() => {
    setEditingCell(null);
    setDraftValue(undefined);
  }, []);

  const isEditingCell = React.useCallback(
    ({ rowId, columnId }: GenDataGridEditingCell) =>
      editingCell?.rowId === rowId && editingCell.columnId === columnId,
    [editingCell]
  );

  return {
    editingCell,
    draftValue,
    setDraftValue,
    startEditing,
    cancelEditing,
    isEditingCell,
  };
}
