// Step2: column meta
import type * as React from 'react';
import type { GenGridFieldValidationMeta } from '../../validation/types';

export type GenGridColumnMeta = {
  semanticType?: 'amount' | 'percent';
  amountOptions?: {
    negativeStyle?: 'none' | 'text' | 'triangle' | 'both';
    negativeColor?: boolean;
  };
  percentOptions?: {
    mode?: 'plain' | 'delta';
    negativeStyle?: 'none' | 'text' | 'triangle' | 'both';
    negativeColor?: boolean;
    deltaFrom?:
      | string
      | ((args: {
          row: unknown;
          rowId: string;
          columnId: string;
          value: unknown;
        }) => unknown);
    invertDirection?: boolean;
  };
  editable?:
    | boolean
    | ((args: { row: unknown; rowId: string; columnId: string }) => boolean);
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
    commitValue?: (nextValue: unknown) => void;
  }) => React.ReactNode;
  tooltip?: string;
  getCellTooltip?: (args: {
    value: unknown;
    row: unknown;
    rowId: string;
    columnId: string;
  }) => string | undefined;
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
  exportValue?: (args: {
    value: unknown;
    row: unknown;
    rowId: string;
    columnId: string;
  }) => unknown;

  // editor
  editType?: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  editOptions?: { label: string; value: string | number }[];
  getEditOptions?: (row: unknown) => { label: string; value: string | number }[];
  editPlaceholder?: string;
  validation?: GenGridFieldValidationMeta<unknown>;

  // body row spanning (row merge)
  rowSpan?: boolean | ((args: { row: unknown; rowId: string; columnId: string }) => boolean);
  rowSpanValueGetter?: (args: {
    row: unknown;
    rowId: string;
    columnId: string;
    value: unknown;
  }) => unknown;
  rowSpanComparator?: (a: unknown, b: unknown, args: { columnId: string }) => boolean;
  // header horizontal span (merge adjacent leaf headers in the same row)
  headerSpan?: number;

  // group header toggle for child column visibility
  groupVisibilityToggle?: {
    columnIds?: string[];
    defaultExpanded?: boolean;
    expandLabel?: React.ReactNode;
    collapseLabel?: React.ReactNode;
    ariaLabel?: string;
  };
};

// Step2: columnDef meta getter
export function getMeta(columnDef: any): GenGridColumnMeta | undefined {
  return columnDef?.meta as GenGridColumnMeta | undefined;
}
