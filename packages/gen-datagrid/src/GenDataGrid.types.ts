// packages/gen-datagrid/src/GenDataGrid.types.ts
// Defines the baseline public props for GenDataGrid.

import type * as React from 'react';
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  PaginationState,
  Table,
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
  resetDirtyState: (rowIds?: readonly string[]) => void;
  commitDirtyState: (rowIds?: readonly string[]) => void;
  deleteRows: (rowIds: readonly string[]) => void;
  getDirtyState: () => GenDataGridDirtyState;
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
  editType?: GenDataGridEditType;
  editOptions?: readonly GenDataGridEditOption[];
  placeholder?: string;
  selectOnFocus?: boolean;
  commitOnBlur?: boolean;
  tabNavigate?: (direction: 1 | -1) => void;
};

export type GenDataGridEditorFactory<TData> = (
  ctx: GenDataGridEditorContext<TData>
) => React.ReactNode;

export type GenDataGridCellValueChange<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  previousValue: unknown;
  value: unknown;
};

export type GenDataGridDirtyCell = {
  rowId: string;
  columnId: string;
  previousValue: unknown;
  value: unknown;
};

export type GenDataGridDirtyState = {
  cells: GenDataGridDirtyCell[];
  rowIds: string[];
  deletedRowIds: string[];
};

export type GenDataGridRenderContext<TData> = {
  table: Table<TData>;
  rows: TData[];
  dirtyState: GenDataGridDirtyState;
  pagination: PaginationState;
};

export type GenDataGridProps<TData> = {
  data?: TData[];
  defaultData?: TData[];
  columns: ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  readOnly?: boolean;
  readonly?: boolean;
  editSelectOnFocus?: boolean;
  editCommitOnBlur?: boolean;
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
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableColumnReorder?: boolean;
  enableColumnFilters?: boolean;
  enableGlobalFilter?: boolean;
  enableFooterRow?: boolean;
  enableStickyFooterRow?: boolean;
  enableFooter?: boolean;
  enablePagination?: boolean;
  enableDirtyState?: boolean;
  clipboardOptions?: {
    includeHeader?: boolean;
  };
  columnFilters?: ColumnFiltersState;
  defaultColumnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: (next: ColumnFiltersState) => void;
  globalFilter?: unknown;
  defaultGlobalFilter?: unknown;
  onGlobalFilterChange?: (next: unknown) => void;
  pagination?: PaginationState;
  defaultPagination?: PaginationState;
  onPaginationChange?: (next: PaginationState) => void;
  columnOrder?: ColumnOrderState;
  defaultColumnOrder?: ColumnOrderState;
  onColumnOrderChange?: (next: ColumnOrderState) => void;
  columnVisibility?: VisibilityState;
  defaultColumnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (next: VisibilityState) => void;
  columnSizing?: ColumnSizingState;
  defaultColumnSizing?: ColumnSizingState;
  onColumnSizingChange?: (next: ColumnSizingState) => void;
  columnPinning?: ColumnPinningState;
  defaultColumnPinning?: ColumnPinningState;
  onColumnPinningChange?: (next: ColumnPinningState) => void;
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
  footerRowHeight?: number;
  footer?: React.ReactNode;
  renderFooter?: (ctx: GenDataGridRenderContext<TData>) => React.ReactNode;
  onDirtyStateChange?: (next: GenDataGridDirtyState) => void;
  onRowsDelete?: (rowIds: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
};
