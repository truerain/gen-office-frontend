// packages/datagrid/src/gen-grid/tanstack-table.d.ts
import '@tanstack/react-table';


declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    mono?: boolean;
  }
}

export type GenGridTableActions<TData> = {
  setData: (updater: React.SetStateAction<TData[]>) => TData[];
  deleteRow: (rowId: string) => void;

  // 필요하면 확장
  // addRow?: (row: TData, opts?: { atIndex?: number }) => void;
  // updateCell?: (rowId: string, columnId: string, value: unknown) => void;
  // reset?: () => void;
};

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    genGrid?: GenGridTableActions<TData>;
  }
}