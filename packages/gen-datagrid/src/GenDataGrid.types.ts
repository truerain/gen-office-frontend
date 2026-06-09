// packages/gen-datagrid/src/GenDataGrid.types.ts
// Defines the baseline public props for GenDataGrid.

import type * as React from 'react';
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnSizingState,
  VisibilityState,
} from '@tanstack/react-table';

import type { GenDataGridRangeSelections } from './features/range-selection/rangeSelection';

export type GenDataGridActiveCell = {
  rowId: string;
  columnId: string;
} | null;

export type GenDataGridHandle = {
  rootElement: HTMLDivElement | null;
  clearSelection: () => void;
  copySelection: (options?: { includeHeader?: boolean }) => Promise<boolean>;
};

export type GenDataGridEditType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'checkbox';

export type GenDataGridEditOption = {
  label: string;
  value: string | number | boolean;
};

export type GenDataGridEditableContext<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
};

export type GenDataGridEditorContext<TData> = GenDataGridEditableContext<TData> & {
  draftValue: unknown;
  setDraftValue: (nextValue: unknown) => void;
  commit: (nextValue?: unknown) => void;
  cancel: () => void;
  applyValue: (nextValue: unknown) => void;
};

export type GenDataGridEditorFactory<TData> = (
  ctx: GenDataGridEditorContext<TData> & {
    editType?: GenDataGridEditType;
    editOptions?: readonly GenDataGridEditOption[];
    placeholder?: string;
  }
) => React.ReactNode;

export type GenDataGridCellValueChange<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  previousValue: unknown;
  value: unknown;
};

export type GenDataGridProps<TData> = {
  data?: TData[];
  defaultData?: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  readOnly?: boolean;
  readonly?: boolean;
  editOnActiveCell?: boolean;
  keepEditingOnNavigate?: boolean;
  editorFactory?: GenDataGridEditorFactory<TData>;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  enableRangeSelection?: boolean;
  selectedRanges?: GenDataGridRangeSelections;
  defaultSelectedRanges?: GenDataGridRangeSelections;
  onSelectedRangesChange?: (next: GenDataGridRangeSelections) => void;
  enableClipboard?: boolean;
  clipboardOptions?: {
    includeHeader?: boolean;
  };
  columnOrder?: ColumnOrderState;
  defaultColumnOrder?: ColumnOrderState;
  onColumnOrderChange?: (next: ColumnOrderState) => void;
  columnVisibility?: VisibilityState;
  defaultColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (next: VisibilityState) => void;
  columnSizing?: ColumnSizingState;
  defaultColumnSizing?: ColumnSizingState;
  onColumnSizingChange?: (next: ColumnSizingState) => void;
  gridId?: string;
  getGridId?: () => string;
  activeCell?: GenDataGridActiveCell;
  defaultActiveCell?: GenDataGridActiveCell;
  onActiveCellChange?: (next: GenDataGridActiveCell) => void;
  rowHeight?: number;
  getRowHeight?: (args: {
    row: TData;
    rowId: string;
    rowIndex: number;
  }) => number | undefined;
  headerHeight?: number;
  className?: string;
  style?: React.CSSProperties;
};
