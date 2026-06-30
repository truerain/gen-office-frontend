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
  RowSelectionState,
  Table,
  VisibilityState,
} from '@tanstack/react-table';

import type {
  GenDataGridCellCoord,
  GenDataGridRangeSelections,
} from './features/range-selection/rangeSelection';

export type GenDataGridActiveCell = {
  rowId: string;
  columnId: string;
} | null;

export type GenDataGridHandle<TData = unknown> = {
  rootElement: HTMLDivElement | null;
  clearSelection: () => void;
  copySelection: (options?: { includeHeader?: boolean }) => Promise<boolean>;
  scrollToCell: (coord: GenDataGridCellCoord) => void;
  clearColumnFilters: () => void;
  clearGlobalFilter: () => void;
  clearFilters: () => void;
  flushEditing: () => Promise<void>;
  cancelEditing: () => void;
  getData: () => TData[];
  getRow: (rowId: string) => TData | undefined;
  getChangeSet: () => GenDataGridChangeSet<TData>;
  resetDirtyState: (rowIds?: readonly string[]) => void;
  commitDirtyState: (rowIds?: readonly string[]) => void;
  acceptChanges: (rowIds?: readonly string[]) => void;
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

export type GenDataGridEditEntryReason =
  | 'reclick'
  | 'doubleClick'
  | 'enter'
  | 'f2'
  | 'printableKey'
  | 'click'
  | 'tab'
  | 'arrowKey';

export type GenDataGridEditBlurOwnership = 'inline' | 'portal' | 'modal';

export type GenDataGridEditableContext<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
};

export type GenDataGridBodyColSpanContext<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
};

export type GenDataGridVisualRowMergeState =
  | 'single'
  | 'start'
  | 'middle'
  | 'end';

export type GenDataGridVisualRowMergeDisplayState =
  | GenDataGridVisualRowMergeState
  | 'visible-start';

export type GenDataGridVisualRowMergeContext<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
  columnId: string;
  value: unknown;
};

export type GenDataGridVisualRowMergeOption =
  | boolean
  | {
      enabled?: boolean;
      showContinuationValue?: boolean;
      stickyLabel?: boolean;
    };

export type GenDataGridValidationSeverity = 'error' | 'warning';

export type GenDataGridCellValidation = {
  severity: GenDataGridValidationSeverity;
  message?: string;
};

export type GenDataGridValidationContext<TData> = {
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
  arrowNavigate?: (key: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') => void;
  openOnEditStart?: boolean;
  editEntryReason?: GenDataGridEditEntryReason;
  blurOwnership?: GenDataGridEditBlurOwnership;
  registerEditorSurface?: (element: HTMLElement) => void;
  unregisterEditorSurface?: (element: HTMLElement) => void;
  getGridRoot?: () => HTMLElement | null;
  getEditorSurfaces?: () => Iterable<HTMLElement>;
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

export type GenDataGridChangeSet<TData> = {
  created: TData[];
  updated: {
    rowId: string;
    row: TData;
    patch: Record<string, unknown>;
    cells: GenDataGridDirtyCell[];
  }[];
  deleted: {
    rowId: string;
    row?: TData;
  }[];
  dirtyState: GenDataGridDirtyState;
};

export type GenDataGridExpandedRowState = Record<string, boolean>;
export type GenDataGridTreeExpandedState = Record<string, boolean>;

export type GenDataGridRowContext<TData> = {
  row: TData;
  rowId: string;
  rowIndex: number;
};

export type GenDataGridDetailPanelContext<TData> = GenDataGridRowContext<TData> & {
  expanded: boolean;
  collapse: () => void;
};

export type GenDataGridTreeRowContext<TData> = GenDataGridRowContext<TData> & {
  depth: number;
  parentRowId?: string;
};

export type GenDataGridPasteErrorReason =
  | 'readOnly'
  | 'nonEditableCell'
  | 'outOfBounds'
  | 'parseError'
  | 'validationError';

export type GenDataGridPasteError = {
  reason: GenDataGridPasteErrorReason;
  rowId?: string;
  columnId?: string;
  rowIndex?: number;
  columnIndex?: number;
  value?: string;
};

export type GenDataGridPasteOptions = {
  errorMode?: 'silent' | 'report';
  failureBehavior?: 'skipCell' | 'cancelPaste';
  onError?: (errors: GenDataGridPasteError[]) => void;
};

export type GenDataGridScrollSeekingOptions = {
  enabled?: boolean;
  jumpThresholdRows?: number;
  jumpThresholdViewports?: number;
  resetDelayMs?: number;
};

export type GenDataGridEditStartTriggers = {
  reclick?: boolean;
  doubleClick?: boolean;
  enter?: boolean;
  f2?: boolean;
  printableKey?: boolean;
};

export type GenDataGridEditContinuationTriggers = {
  click?: boolean;
  tab?: boolean;
  arrowKey?: boolean;
};

export type GenDataGridEditPolicy = {
  startTriggers?: GenDataGridEditStartTriggers;
  continueTriggers?: GenDataGridEditContinuationTriggers;
  openOnEditStart?: boolean;
  blurOwnership?: GenDataGridEditBlurOwnership;
};

export type GenDataGridFilterMode = 'client' | 'manual';
export type GenDataGridPaginationMode = 'client' | 'manual';
export type GenDataGridDeleteRowsBehavior = 'mark' | 'removeUncontrolled';
export type GenDataGridColumnFitMode = 'none' | 'grow';
export type GenDataGridColumnAlign = 'left' | 'center' | 'right';
export type GenDataGridSystemColumnKind = 'rowStatus' | 'rowSelection' | 'rowNumber';
export type GenDataGridRowSelectionMode = 'all' | 'createdOnly';
export type GenDataGridRowStatus = 'clean' | 'created' | 'updated' | 'deleted';

export type GenDataGridRowStatusContext<TData> = GenDataGridRowContext<TData> & {
  dirty: boolean;
  deleted: boolean;
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
  editPolicy?: GenDataGridEditPolicy;
  editorFactory?: GenDataGridEditorFactory<TData>;
  isCellEditable?: (ctx: GenDataGridEditableContext<TData>) => boolean;
  onCellValueChange?: (args: GenDataGridCellValueChange<TData>) => void;
  enableRangeSelection?: boolean;
  selectedRanges?: GenDataGridRangeSelections;
  defaultSelectedRanges?: GenDataGridRangeSelections;
  onSelectedRangesChange?: (next: GenDataGridRangeSelections) => void;
  enableClipboard?: boolean;
  pasteOptions?: GenDataGridPasteOptions;
  enablePinning?: boolean;
  enableColumnSizing?: boolean;
  enableColumnReorder?: boolean;
  enableColumnFilters?: boolean;
  columnFitMode?: GenDataGridColumnFitMode;
  enableGlobalFilter?: boolean;
  enableFooterRow?: boolean;
  enableStickyFooterRow?: boolean;
  enableFooter?: boolean;
  enablePagination?: boolean;
  enableDirtyState?: boolean;
  enableRowNumber?: boolean;
  enableRowSelection?: boolean;
  rowSelectionMode?: GenDataGridRowSelectionMode;
  rowSelection?: RowSelectionState;
  defaultRowSelection?: RowSelectionState;
  onRowSelectionChange?: (next: RowSelectionState) => void;
  enableRowStatus?: boolean;
  rowStatusResolver?: (ctx: GenDataGridRowStatusContext<TData>) => GenDataGridRowStatus;
  enableCurrentRowHighlight?: boolean;
  onCurrentRowChange?: (rowId: string | null) => void;
  getCellValidation?: (
    ctx: GenDataGridValidationContext<TData>
  ) => GenDataGridCellValidation | null | undefined;
  enableVirtualization?: boolean;
  enableTreeRows?: boolean;
  getSubRows?: (row: TData, index: number) => readonly TData[] | undefined;
  treeExpandedRows?: GenDataGridTreeExpandedState;
  defaultTreeExpandedRows?: GenDataGridTreeExpandedState;
  onTreeExpandedRowsChange?: (next: GenDataGridTreeExpandedState) => void;
  getRowCanExpandTree?: (ctx: GenDataGridTreeRowContext<TData>) => boolean;
  treeIndentWidth?: number;
  enableMasterDetail?: boolean;
  expandedRows?: GenDataGridExpandedRowState;
  defaultExpandedRows?: GenDataGridExpandedRowState;
  onExpandedRowsChange?: (next: GenDataGridExpandedRowState) => void;
  getRowCanExpand?: (ctx: GenDataGridRowContext<TData>) => boolean;
  renderDetailPanel?: (ctx: GenDataGridDetailPanelContext<TData>) => React.ReactNode;
  detailPanelHeight?: number;
  scrollSeeking?: boolean | GenDataGridScrollSeekingOptions;
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
  filterMode?: GenDataGridFilterMode;
  paginationMode?: GenDataGridPaginationMode;
  totalRowCount?: number;
  pageSizeOptions?: readonly number[];
  deleteRowsBehavior?: GenDataGridDeleteRowsBehavior;
  dataVersion?: string | number;
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
