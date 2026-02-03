// Step2: column meta
import type * as React from 'react';

export type GenGridColumnMeta = {
  align?: 'left' | 'center' | 'right';
  mono?: boolean;

  // renderer
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
    row: unknown;
    rowId: string;
    columnId: string;
  }) => React.ReactNode;
  renderEditor?: (args: {
    value: unknown;
    row: unknown;
    rowId: string;
    columnId: string;
    onChange: (nextValue: unknown) => void;
    onCommit: () => void;
    onCancel: () => void;
    onTab?: (dir: 1 | -1) => void;
    commitValue: (nextValue: unknown) => void;
    applyValue: (nextValue: unknown) => void;
  }) => React.ReactNode;

  // editor
  editType?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  editOptions?: { label: string; value: string | number }[];
  getEditOptions?: (row: unknown) => { label: string; value: string | number }[];
  editPlaceholder?: string;
};

// Step2: columnDef meta getter
export function getMeta(columnDef: any): GenGridColumnMeta | undefined {
  return columnDef?.meta as GenGridColumnMeta | undefined;
}
