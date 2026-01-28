// packages/gen-grid/src/features/editing/columnMeta.ts

import type * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

export type CellEditorRenderArgs<TValue> = {
  value: TValue;
  onChange: (v: TValue) => void;
  onCommit: () => void;
  onCancel: () => void;
  onTab?: (dir: 1 | -1) => void;
  commitValue?: (nextValue: unknown) => void;
  applyValue?: (nextValue: unknown) => void;
};

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    editable?: boolean;
    renderEditor?: (props: {
      value: TValue;
      onChange: (v: TValue) => void;
      onCommit: () => void;
      onCancel: () => void;
      onTab?: (dir: 1 | -1) => void;
      commitValue?: (nextValue: unknown) => void;
      applyValue?: (nextValue: unknown) => void;
    }) => React.ReactNode;
  }
}

export function collectEditableAccessorKeys<TData>(columns: ColumnDef<TData, any>[]) {
  const out: string[] = [];

  const walk = (cols: ColumnDef<TData, any>[]) => {
    for (const c of cols as any[]) {
      if (c.columns) walk(c.columns);
      else {
        const editable = c.meta?.editable;
        const key = c.accessorKey;
        if (editable && typeof key === 'string') out.push(key);
      }
    }
  };

  walk(columns);
  return out;
}
