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
  const draftValueRef = React.useRef<unknown>(undefined);
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

  const updateDraftValue = React.useCallback((nextValue: unknown) => {
    draftValueRef.current = nextValue;
    setDraftValue(nextValue);
  }, []);

  const getDraftValue = React.useCallback(() => draftValueRef.current, []);

  const startEditing = React.useCallback(
    ({ rowId, columnId, value, suppressSelectOnFocus, entryReason }: StartCellEditingArgs) => {
      clearEditorSurfaces();
      setEditingCell({ rowId, columnId, suppressSelectOnFocus, entryReason });
      updateDraftValue(value);
    },
    [clearEditorSurfaces, updateDraftValue]
  );

  const cancelEditing = React.useCallback(() => {
    clearEditorSurfaces();
    setEditingCell(null);
    updateDraftValue(undefined);
  }, [clearEditorSurfaces, updateDraftValue]);

  const isEditingCell = React.useCallback(
    ({ rowId, columnId }: GenDataGridEditingCell) =>
      editingCell?.rowId === rowId && editingCell.columnId === columnId,
    [editingCell]
  );

  return {
    editingCell,
    draftValue,
    setDraftValue: updateDraftValue,
    getDraftValue,
    startEditing,
    cancelEditing,
    isEditingCell,
    getEditorSurfaces,
    registerEditorSurface,
    unregisterEditorSurface,
  };
}
