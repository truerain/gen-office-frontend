// packages/gen-datagrid/src/features/editing/useCellEditing.ts
// Manages the active cell editing draft state for GenDataGrid.

import * as React from 'react';

import type { GenDataGridEditEntryReason } from '../../GenDataGrid.types';

export type GenDataGridEditingCell = {
  rowId: string;
  columnId: string;
  suppressSelectOnFocus?: boolean;
  entryReason?: GenDataGridEditEntryReason;
};

export type StartCellEditingArgs = GenDataGridEditingCell & {
  value: unknown;
};

export function useCellEditing() {
  const [editingCell, setEditingCell] = React.useState<GenDataGridEditingCell | null>(null);
  const [draftValue, setDraftValue] = React.useState<unknown>(undefined);
  const editorSurfacesRef = React.useRef<Set<HTMLElement>>(new Set());

  const clearEditorSurfaces = React.useCallback(() => {
    editorSurfacesRef.current = new Set();
  }, []);

  const getEditorSurfaces = React.useCallback(() => editorSurfacesRef.current, []);

  const registerEditorSurface = React.useCallback((element: HTMLElement) => {
    editorSurfacesRef.current.add(element);
  }, []);

  const unregisterEditorSurface = React.useCallback((element: HTMLElement) => {
    editorSurfacesRef.current.delete(element);
  }, []);

  const startEditing = React.useCallback(
    ({ rowId, columnId, value, suppressSelectOnFocus, entryReason }: StartCellEditingArgs) => {
      clearEditorSurfaces();
      setEditingCell({ rowId, columnId, suppressSelectOnFocus, entryReason });
      setDraftValue(value);
    },
    [clearEditorSurfaces]
  );

  const cancelEditing = React.useCallback(() => {
    clearEditorSurfaces();
    setEditingCell(null);
    setDraftValue(undefined);
  }, [clearEditorSurfaces]);

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
    getEditorSurfaces,
    registerEditorSurface,
    unregisterEditorSurface,
  };
}
