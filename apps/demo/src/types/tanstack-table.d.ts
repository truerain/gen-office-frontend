import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    renderCell?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
      commitValue?: (nextValue: unknown) => void;
    }) => React.ReactNode;
    renderEditor?: (props: {
      value: TValue;
      onChange: (v: TValue) => void;
      onCommit: () => void;
      onCancel: () => void;
      onTab?: (dir: 1 | -1) => void;
      commitValue?: (nextValue: unknown) => void;
      applyValue?: (nextValue: unknown) => void;
    }) => React.ReactNode;
    onSpace?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
      commitValue?: (nextValue: unknown) => void;
    }) => void;
  }

  interface TableMeta<TData extends unknown> {
    genGridCrud?: {
      deleteRow?: (rowId: string) => void;
    };
  }
}
