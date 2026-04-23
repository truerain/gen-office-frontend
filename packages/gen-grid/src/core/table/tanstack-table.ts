import '@tanstack/react-table';
import type * as React from 'react';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    semanticType?:
      | 'amount'
      | 'percent'
      | ((args: { row: TData; rowId: string; columnId: string; value: unknown }) => 'amount' | 'percent' | undefined);
    amountOptions?:
      | {
          negativeStyle?: 'none' | 'text' | 'triangle' | 'both';
          negativeColor?: boolean;
        }
      | ((args: { row: TData; rowId: string; columnId: string; value: unknown }) => {
          negativeStyle?: 'none' | 'text' | 'triangle' | 'both';
          negativeColor?: boolean;
        } | undefined);
    percentOptions?:
      | {
          mode?: 'plain' | 'delta';
          negativeStyle?: 'none' | 'text' | 'triangle' | 'both';
          negativeColor?: boolean;
          deltaFrom?:
            | string
            | ((args: {
                row: TData;
                rowId: string;
                columnId: string;
                value: unknown;
              }) => unknown);
          invertDirection?: boolean;
        }
      | ((args: { row: TData; rowId: string; columnId: string; value: unknown }) => {
          mode?: 'plain' | 'delta';
          negativeStyle?: 'none' | 'text' | 'triangle' | 'both';
          negativeColor?: boolean;
          deltaFrom?:
            | string
            | ((args: {
                row: TData;
                rowId: string;
                columnId: string;
                value: unknown;
              }) => unknown);
          invertDirection?: boolean;
        } | undefined);
    width?: number;
    pinned?: 'left' | 'right';
    editValidator?: (
      value: any,
      row: TData
    ) => string | null | undefined | { valid: boolean; error?: string };
    system?: string;
    editable?:
      | boolean
      | ((args: { row: TData; rowId: string; columnId: string }) => boolean);
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
    tooltip?: string;
    getCellTooltip?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
    }) => string | undefined;
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
    exportValue?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
    }) => unknown;
    editType?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
    editOptions?: { label: string; value: string | number }[];
    getEditOptions?: (row: TData) => { label: string; value: string | number }[];
    editPlaceholder?: string;
    editValueNormalizer?: (args: {
      value: unknown;
      row: TData;
      rowId: string;
      columnId: string;
    }) => unknown;
    rowSpan?: boolean | ((args: { row: TData; rowId: string; columnId: string }) => boolean);
    rowSpanValueGetter?: (args: {
      row: TData;
      rowId: string;
      columnId: string;
      value: unknown;
    }) => unknown;
    rowSpanComparator?: (a: unknown, b: unknown, args: { columnId: string }) => boolean;
    headerSpan?: number;
    groupVisibilityToggle?: {
      columnIds?: string[];
      defaultExpanded?: boolean;
      expandLabel?: React.ReactNode;
      collapseLabel?: React.ReactNode;
      ariaLabel?: string;
    };
  }
}

export type GenGridTableActions<TData> = {
  setData: (updater: React.SetStateAction<TData[]>) => TData[];
  deleteRow: (rowId: string) => void;
};

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends unknown> {
    genGrid?: GenGridTableActions<TData>;
    genGridCrud?: {
      deleteRow?: (rowId: string) => void;
    };
  }
}
