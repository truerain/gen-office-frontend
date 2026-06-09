// packages/gen-datagrid/src/features/editing/editableCell.ts
// Resolves whether a GenDataGrid cell can enter editing mode.

import type { Column, Row } from '@tanstack/react-table';

import type { GenDataGridEditableContext } from '../../GenDataGrid.types';

export type ResolveEditableCellArgs<TData> = {
  row: Row<TData>;
  column: Column<TData, unknown>;
  readOnly?: boolean;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
};

export function createEditableContext<TData>({
  row,
  column,
}: {
  row: Row<TData>;
  column: Column<TData, unknown>;
}): GenDataGridEditableContext<TData> {
  return {
    row: row.original,
    rowId: row.id,
    rowIndex: row.index,
    columnId: column.id,
    value: row.getValue(column.id),
  };
}

export function hasEditorCapability<TData>(column: Column<TData, unknown>) {
  const meta = column.columnDef.meta;
  return Boolean(
    meta?.renderEditor ||
      meta?.editType ||
      meta?.editOptions ||
      meta?.getEditOptions ||
      meta?.editable
  );
}

export function resolveEditableCell<TData>({
  row,
  column,
  readOnly,
  isCellEditable,
}: ResolveEditableCellArgs<TData>) {
  if (readOnly) return false;

  const ctx = createEditableContext({ row, column });
  if (isCellEditable && !isCellEditable(ctx)) return false;

  const editable = column.columnDef.meta?.editable;
  if (typeof editable === 'function') return Boolean(editable(ctx));
  if (editable === false) return false;
  if (editable === true) return true;

  return hasEditorCapability(column);
}
