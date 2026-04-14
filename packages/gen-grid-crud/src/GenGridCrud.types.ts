// packages/gen-grid-crud/src/GenGridCrud.types.ts
import type * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { GenGridEditorFactory, GenGridProps } from '@gen-office/gen-grid';
import type { ButtonVariant } from '@gen-office/ui';
import type { CrudChange, CrudRowId, UseMakePatch } from './crud/types';

export type CrudValidationError = {
  code: string;
  messageKey?: string;
  defaultMessage?: string;
};

export type CrudFieldErrorMap = Record<string, CrudValidationError>;

export type CrudCommitContext<TData> = {
  baseData: readonly TData[];
  viewData: readonly TData[];
};

export type CrudPendingDiff<TData> = {
  added: TData[];
  modified: { id: CrudRowId; patch: Partial<TData> }[];
  deleted: { id: CrudRowId }[];
};

export type CrudCommitResult<TData> =
  | { ok: true; nextData?: readonly TData[] }
  | { ok: false; error: unknown; fieldErrors?: Record<string, string> };

export type CrudUiState<TData> = {
  baseData: readonly TData[];
  viewData: readonly TData[];
  changes: readonly CrudChange<TData>[];
  pendingDiff: CrudPendingDiff<TData>;
  dirty: boolean;

  rowSelection: readonly CrudRowId[];
  activeRowId?: CrudRowId;
  activeColumnId?: string;
  deleteMode?: 'selected' | 'activeRow';
  deletePolicy?: 'all' | 'createdOnly';

  isCommitting: boolean;
  fieldErrors: CrudFieldErrorMap;
  columnReorderEnabled?: boolean;
};

export type CrudCellEditEvent<TData> = {
  rowId: string;
  columnId: string;
  rowIndex: number;
  prevValue: unknown;
  nextValue: unknown;
  row: TData;
  viewData: readonly TData[];
};

export type CrudCellPatch<TData> = {
  rowId: CrudRowId;
  patch: Partial<TData>;
};

export type CrudActiveRowChangeEvent<TData> = {
  rowId: CrudRowId | null;
  row: TData | null;
  rowIndex: number;
};

export type CrudActionButtonStyle = 'text' | 'icon';
export type CrudActionControlStyle = 'combo' | 'checkbox';
export type CrudActionStyle = CrudActionButtonStyle | CrudActionControlStyle;
export type CrudActionSide = 'left' | 'right';
export type CrudBuiltInActionKey =
  | 'add'
  | 'delete'
  | 'save'
  | 'filter'
  | 'reset'
  | 'excel'
  | 'columnReorder';

export type ExcelExportMode = 'frontend' | 'backend';

export type ExcelExportBackendOptions<TData> = {
  endpoint: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  buildPayload?: (ctx: {
    state: CrudUiState<TData>;
    columns: readonly ColumnDef<TData, any>[];
    title?: string;
  }) => Record<string, unknown> | undefined;
};

export type ExcelExportFrontendOptions = {
  onlySelected?: boolean;
};

export type ExcelExportOptions<TData> = {
  mode: ExcelExportMode;
  fileName?: string;
  sheetName?: string;
  /** apply default thin border to all exported header/data cells */
  defaultBorder?: boolean;
  /** Excel row height in px (applies to both header and body rows in frontend mode) */
  rowHeight?: number;
  backend?: ExcelExportBackendOptions<TData>;
  frontend?: ExcelExportFrontendOptions;
};

export type AdditionalExportSource<TData, TRow = TData> = {
  columns: readonly ColumnDef<TRow, any>[];
  data: readonly TRow[];
  getRowId?: (row: TRow, index: number) => CrudRowId;
};

export type AdditionalExportContext<TData> = {
  state: CrudUiState<TData>;
  columns: readonly ColumnDef<TData, any>[];
  title?: string;
};

export type AdditionalExportDefinition<TData, TRow = TData> = {
  key: string;
  label?: React.ReactNode;
  fileName?: string;
  sheetName?: string;
  /** apply default thin border to all exported header/data cells */
  defaultBorder?: boolean;
  /** Excel row height in px */
  rowHeight?: number;
  source:
    | AdditionalExportSource<TData, TRow>
    | ((
        ctx: AdditionalExportContext<TData>
      ) =>
        | AdditionalExportSource<TData, TRow>
        | Promise<AdditionalExportSource<TData, TRow>>);
};

export type CrudActionApi = {
  add?: () => void;
  deleteSelected?: () => void;
  save?: () => Promise<void>;
  reset: () => void;
  toggleFilter?: () => void;
  toggleColumnReorder?: () => void;
  exportExcel?: () => Promise<void>;
  exportAdditional?: (key: string) => Promise<void>;
};

export type CrudActionContext<TData> = {
  state: CrudUiState<TData>;
  api: CrudActionApi;
};

type CrudActionBase<TData> = {
  key: string;
  label?: React.ReactNode;
  side?: CrudActionSide;
  order?: number;
  visible?: boolean | ((ctx: CrudActionContext<TData>) => boolean);
  disabled?: boolean | ((ctx: CrudActionContext<TData>) => boolean);
  itemClassName?: string;
  itemStyle?: React.CSSProperties;
};

export type CrudActionButtonItem<TData> = CrudActionBase<TData> & {
  style?: CrudActionButtonStyle;
  icon?: React.ReactNode;
  variant?: ButtonVariant;
  onClick?: (ctx: CrudActionContext<TData>) => void | Promise<void>;
};

export type CrudActionComboOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

export type CrudActionComboValue<TData> = string | undefined | ((ctx: CrudActionContext<TData>) => string | undefined);
export type CrudActionCheckboxValue<TData> = boolean | ((ctx: CrudActionContext<TData>) => boolean);

export type CrudActionComboItem<TData> = CrudActionBase<TData> & {
  style: 'combo';
  options: readonly CrudActionComboOption[];
  placeholder?: string;
  value?: CrudActionComboValue<TData>;
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
  onValueChange?: (value: string, ctx: CrudActionContext<TData>) => void | Promise<void>;
};

export type CrudActionCheckboxItem<TData> = CrudActionBase<TData> & {
  style: 'checkbox';
  checked?: CrudActionCheckboxValue<TData>;
  onCheckedChange?: (checked: boolean, ctx: CrudActionContext<TData>) => void | Promise<void>;
};

export type CrudActionItem<TData> =
  | CrudActionButtonItem<TData>
  | CrudActionComboItem<TData>
  | CrudActionCheckboxItem<TData>;

export type CrudActionBarOptions<TData> = {
  enabled?: boolean;
  position?: 'top' | 'bottom' | 'both';
  defaultStyle?: CrudActionButtonStyle;
  includeBuiltIns?: readonly CrudBuiltInActionKey[];
  customActions?: readonly CrudActionItem<TData>[];
};

export type GenGridCrudProps<TData> = {
  title?: string;
  'readonly'?: boolean;
  data: readonly TData[];
  columns: readonly ColumnDef<TData, any>[];
  getRowId: (row: TData, index: number) => CrudRowId;

  /** CRUD */
  createRow?: () => TData;
  makePatch?: UseMakePatch<TData>;
  deleteMode?: 'selected' | 'activeRow';
  deletePolicy?: 'all' | 'createdOnly';

  /** commit */
  onCommit: (args: {
    changes: readonly CrudChange<TData>[];
    ctx: CrudCommitContext<TData>;
  }) => Promise<CrudCommitResult<TData>>;

  isCommitting?: boolean;
  onCommitSuccess?: (result: { nextData?: readonly TData[] }) => void;
  onCommitError?: (result: { error: unknown; fieldErrors?: Record<string, string> }) => void;

  beforeCommit?: (state: CrudUiState<TData>) => boolean | Promise<boolean>;

  /** ActionBar */
  actionBar?: CrudActionBarOptions<TData>;
  /** @deprecated use actionBar.enabled */
  showActionBar?: boolean;
  /** @deprecated use actionBar.position */
  actionBarPosition?: 'top' | 'bottom' | 'both';
  /** @deprecated use actionBar.defaultStyle */
  actionButtonStyle?: 'text' | 'icon';

  /** row_select column(checkbox) selection */
  rowSelection?: readonly CrudRowId[];
  onRowSelectionChange?: (rowIds: readonly CrudRowId[]) => void;

  /** active cell */
  activeCell?: { rowId: CrudRowId; columnId: string } | null;
  onActiveCellChange?: (next: { rowId: CrudRowId; columnId: string } | null) => void;
  onActiveRowChange?: (event: CrudActiveRowChangeEvent<TData>) => void;

  /** editor factory (GenGrid) */
  editorFactory?: GenGridEditorFactory<TData>;

  /** when true, reverting a cell to its base value clears dirty for that field */
  clearDirtyOnRevert?: boolean;

  /** UI hooks */
  onStateChange?: (state: CrudUiState<TData>) => void;
  onCellEdit?: (event: CrudCellEditEvent<TData>) => void | readonly CrudCellPatch<TData>[];
  excelExport?: ExcelExportOptions<TData>;
  additionalExports?: readonly AdditionalExportDefinition<TData, any>[];

  /** pass-through (GenGrid props except controlled fields) */
  gridProps?: Omit<
    GenGridProps<TData>,
    | 'data'
    | 'defaultData'
    | 'columns'
    | 'getRowId'
    | 'onDataChange'
    | 'onCellValueChange'
    | 'rowSelection'
    | 'onRowSelectionChange'
    | 'activeCell'
    | 'onActiveCellChange'
    | 'rowStatusResolver'
  >;
};
