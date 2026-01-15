// packages/datagrid/src/gen-grid/features/editing/columnMeta.ts
import type * as React from 'react';

export type CellEditorRenderArgs<TValue> = {
  value: TValue;
  onChange: (v: TValue) => void;
  onCommit: () => void;
  onCancel: () => void;
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    editable?: boolean;
    renderEditor?: (args: CellEditorRenderArgs<TValue>) => React.ReactNode;
  }
}
