// packages/gen-datagrid/src/core/table/tanstack-table.ts
// Extends TanStack Table metadata with GenDataGrid public column meta.

import '@tanstack/react-table';
import type * as React from 'react';

import type {
  GenDataGridBodyColSpanContext,
  GenDataGridColumnAlign,
  GenDataGridEditBlurOwnership,
  GenDataGridEditableContext,
  GenDataGridEditorContext,
  GenDataGridEditPolicy,
  GenDataGridEditOption,
  GenDataGridEditType,
  GenDataGridSystemColumnKind,
  GenDataGridVisualRowMergeOption,
} from '../../GenDataGrid.types';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: GenDataGridColumnAlign;
    headerAlign?: GenDataGridColumnAlign;
    editable?:
      | boolean
      | ((ctx: GenDataGridEditableContext<TData>) => boolean);
    editType?: GenDataGridEditType;
    editOptions?: readonly GenDataGridEditOption[];
    getEditOptions?: (ctx: GenDataGridEditableContext<TData>) => readonly GenDataGridEditOption[];
    editPlaceholder?: string;
    editSelectOnFocus?: boolean;
    editCommitOnBlur?: boolean;
    editBlurOwnership?: GenDataGridEditBlurOwnership;
    editPolicy?: GenDataGridEditPolicy;
    renderEditor?: (ctx: GenDataGridEditorContext<TData>) => React.ReactNode;
    headerSpan?: number;
    bodyColSpan?: number | ((ctx: GenDataGridBodyColSpanContext<TData>) => number);
    visualRowMerge?: GenDataGridVisualRowMergeOption;
    systemColumn?: GenDataGridSystemColumnKind;
  }
}
