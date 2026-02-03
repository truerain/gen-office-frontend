// packages/datagrid/src/gen-grid/tanstack-table.d.ts
import '@tanstack/react-table';
import type * as React from 'react';


declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
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
    renderCell?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
      commitValue?: (nextValue: unknown) => void;
    }) => React.ReactNode;
    renderEditor?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
      onChange: (nextValue: unknown) => void;
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
    editType?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
    editOptions?: { label: string; value: string | number }[];
    getEditOptions?: (row: TData) => { label: string; value: string | number }[];
    editPlaceholder?: string;
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
    genGridCrud?: {
      deleteRow?: (rowId: string) => void;
    };
  }
}
