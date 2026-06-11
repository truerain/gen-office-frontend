// packages/gen-datagrid/src/core/table/tanstack-table.ts
// Extends TanStack Table metadata with GenDataGrid public column meta.

import '@tanstack/react-table';
import type * as React from 'react';

import type {
  GenDataGridEditableContext,
  GenDataGridEditorContext,
  GenDataGridEditOption,
  GenDataGridEditType,
} from '../../GenDataGrid.types';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    editable?:
      | boolean
      | ((ctx: GenDataGridEditableContext<TData>) => boolean);
    editType?: GenDataGridEditType;
    editOptions?: readonly GenDataGridEditOption[];
    getEditOptions?: (ctx: GenDataGridEditableContext<TData>) => readonly GenDataGridEditOption[];
    editPlaceholder?: string;
    editSelectOnFocus?: boolean;
    editCommitOnBlur?: boolean;
    renderEditor?: (ctx: GenDataGridEditorContext<TData>) => React.ReactNode;
  }
}
