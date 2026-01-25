import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    genGridCrud?: {
      deleteRow?: (rowId: string) => void;
    };
  }
}
