// packages/gen-datagrid/src/core/table/tanstack-table.ts
// Extends TanStack Table metadata with GenDataGrid public column meta.

import '@tanstack/react-table';

import type { GenDataGridColumnMeta } from '../../GenDataGrid.types';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> extends GenDataGridColumnMeta<TData, TValue> {}
}

export type GenDataGridTanStackTableMetaAugmentation = true;
