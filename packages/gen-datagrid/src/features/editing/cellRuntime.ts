// packages/gen-datagrid/src/features/editing/cellRuntime.ts
// Resolves per-cell editing runtime metadata for GenDataGrid.

import type { Row } from '@tanstack/react-table';

import type {
  GenDataGridEditableContext,
  GenDataGridEditPolicy,
} from '../../GenDataGrid.types';
import { createEditableContext, resolveEditableCell } from './editableCell';
import { resolveBlurOwnership } from './blurPolicy';
import { resolveEditPolicy, type ResolvedGenDataGridEditPolicy } from './editPolicy';

export type GenDataGridCellEditingRuntime<TData> = {
  row: Row<TData>;
  editableContext: GenDataGridEditableContext<TData>;
  isEditable: boolean;
  resolvedEditPolicy: ResolvedGenDataGridEditPolicy;
  commitOnBlur: boolean;
  blurOwnership: ReturnType<typeof resolveBlurOwnership>;
};

type ResolveCellEditingRuntimeArgs<TData> = {
  rows: Row<TData>[];
  coord: { rowId: string; columnId: string };
  readOnly?: boolean;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
  editPolicy?: GenDataGridEditPolicy;
  editCommitOnBlur?: boolean;
};

export function resolveCellEditingRuntime<TData>({
  rows,
  coord,
  readOnly,
  isCellEditable,
  editPolicy,
  editCommitOnBlur,
}: ResolveCellEditingRuntimeArgs<TData>): GenDataGridCellEditingRuntime<TData> | null {
  const row = rows.find((item) => item.id === coord.rowId);
  const tanstackCell = row?.getVisibleCells().find((cell) => cell.column.id === coord.columnId);
  if (!row || !tanstackCell) {
    return null;
  }

  const editableContext = createEditableContext({
    row,
    column: tanstackCell.column,
  });
  const meta = tanstackCell.column.columnDef.meta;

  return {
    row,
    editableContext,
    isEditable: resolveEditableCell({
      row,
      column: tanstackCell.column,
      readOnly,
      isCellEditable,
    }),
    resolvedEditPolicy: resolveEditPolicy(editPolicy, meta?.editPolicy),
    commitOnBlur: meta?.editCommitOnBlur ?? editCommitOnBlur ?? false,
    blurOwnership: resolveBlurOwnership({
      editType: meta?.editType,
      gridPolicy: editPolicy,
      columnPolicy: meta?.editPolicy,
      columnBlurOwnership: meta?.editBlurOwnership,
    }),
  };
}
