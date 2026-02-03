import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    width?: number;
    pinned?: 'left' | 'right';
    editValidator?: (
      value: any,
      row: TData
    ) => string | null | undefined | { valid: boolean; error?: string };
    system?: string;
    align?: 'left' | 'center' | 'right';
    mono?: boolean;
    format?: 'text' | 'number' | 'currency' | 'percent' | 'date' | 'datetime' | 'boolean';
    formatLocale?: string;
    numberFormat?: Intl.NumberFormatOptions;
    dateFormat?: Intl.DateTimeFormatOptions;
    currency?: string;
    trueLabel?: string;
    falseLabel?: string;
    emptyLabel?: string;
    editable?: boolean;
    editType?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
    editOptions?: { label: string; value: string | number }[];
    getEditOptions?: (row: TData) => { label: string; value: string | number }[];
    editPlaceholder?: string;
    renderCell?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
      commitValue?: (nextValue: unknown) => void;
    }) => React.ReactNode;
    renderEditor?: (props: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
      onChange: (v: unknown) => void;
      onCommit: () => void;
      onCancel: () => void;
      onTab?: (dir: 1 | -1) => void;
      commitValue: (nextValue: unknown) => void;
      applyValue: (nextValue: unknown) => void;
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
