// packages/datagrid/src/gen-grid/tanstack-table.d.ts
import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    mono?: boolean;
  }
}
