// packages/gen-datagrid-crud/src/GenDataGridCrud.types.ts
// Defines public types for the GenDataGridCrud thin shell.

import type * as React from 'react';
import type { RowSelectionState } from '@tanstack/react-table';
import type {
  GenDataGridChangeSet,
  GenDataGridColumnDef,
  GenDataGridDirtyState,
  GenDataGridHandle,
  GenDataGridProps,
} from '@gen-office/gen-datagrid';

type GridPropsOwnedByCrud =
  | 'data'
  | 'defaultData'
  | 'columns'
  | 'getRowId'
  | 'readOnly'
  | 'readonly'
  | 'onDirtyStateChange'
  | 'rowStatusResolver'
  | 'onCurrentRowChange'
  | 'rowSelection'
  | 'onRowSelectionChange'
  | 'ref';

export type DataGridCrudBuiltInActionKey =
  | 'add'
  | 'delete'
  | 'save'
  | 'reset'
  | 'filter'
  | 'columnReorder'
  | 'excel';

export type DataGridCrudCommitResult<TData> =
  | void
  | {
      ok?: boolean;
      nextData?: readonly TData[];
      error?: unknown;
      fieldErrors?: DataGridCrudFieldErrors;
    };

export type DataGridCrudCreateRowContext<TData> = {
  data: readonly TData[];
};

export type DataGridCrudCreatedRowPosition = 'top' | 'bottom';
export type DataGridCrudFieldErrors = Record<string, string>;

export type DataGridCrudValidationResult =
  | void
  | boolean
  | {
      valid?: boolean;
      fieldErrors?: DataGridCrudFieldErrors;
      error?: unknown;
    };

export type DataGridCrudUiState<TData> = {
  readonly: boolean;
  canCreateRow: boolean;
  canExport: boolean;
  data: readonly TData[];
  sourceData: readonly TData[];
  createdRows: readonly TData[];
  createdRowIds: string[];
  dirtyState: GenDataGridDirtyState;
  dirty: boolean;
  isCommitting: boolean;
  fieldErrors: DataGridCrudFieldErrors;
  validationError?: unknown;
  currentRowId: string | null;
  selectedRowIds: string[];
  filterEnabled: boolean;
  columnReorderEnabled: boolean;
  lastChangeSet?: GenDataGridChangeSet<TData>;
};

export type DataGridCrudCommitArgs<TData> = {
  changeSet: GenDataGridChangeSet<TData>;
  state: DataGridCrudUiState<TData>;
  data: readonly TData[];
};

export type DataGridCrudExportArgs<TData> = {
  data: readonly TData[];
  sourceData: readonly TData[];
  createdRows: readonly TData[];
  lastChangeSet?: GenDataGridChangeSet<TData>;
  state: DataGridCrudUiState<TData>;
};

export type DataGridCrudActionApi = {
  addRow: () => void;
  deleteSelectedRows: () => void;
  save: () => Promise<void>;
  reset: () => void;
  clearFilters: () => void;
  toggleFilters: () => void;
  toggleColumnReorder: () => void;
  exportExcel: () => void | Promise<void>;
};

export type DataGridCrudActionContext<TData> = {
  state: DataGridCrudUiState<TData>;
  actionApi: DataGridCrudActionApi;
};

export type DataGridCrudActionItem<TData> = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  side?: 'left' | 'right';
  order?: number;
  hidden?: boolean | ((ctx: DataGridCrudActionContext<TData>) => boolean);
  disabled?: boolean | ((ctx: DataGridCrudActionContext<TData>) => boolean);
  loading?: boolean | ((ctx: DataGridCrudActionContext<TData>) => boolean);
  onClick?: (ctx: DataGridCrudActionContext<TData>) => void | Promise<void>;
};

export type DataGridCrudActionBarOptions<TData> = {
  enabled?: boolean;
  title?: React.ReactNode;
  includeBuiltIns?: readonly DataGridCrudBuiltInActionKey[];
  customActions?: readonly DataGridCrudActionItem<TData>[];
  showTotalRows?: boolean;
};

export type DataGridCrudController<TData> = {
  gridRef: React.RefObject<GenDataGridHandle<TData>>;
  state: DataGridCrudUiState<TData>;
  gridData: readonly TData[];
  actionApi: DataGridCrudActionApi;
  gridStateProps: Pick<
    GenDataGridProps<TData>,
    | 'enableDirtyState'
    | 'onDirtyStateChange'
    | 'enableRowStatus'
    | 'rowStatusResolver'
    | 'enableCurrentRowHighlight'
    | 'onCurrentRowChange'
    | 'enableRowSelection'
    | 'rowSelection'
    | 'onRowSelectionChange'
    | 'enableColumnFilters'
    | 'enableColumnReorder'
  >;
};

export type DataGridCrudGridFeatureOptions<TData> = Pick<
  GenDataGridProps<TData>,
  | 'enableDirtyState'
  | 'enableRowStatus'
  | 'enableCurrentRowHighlight'
  | 'enableRowSelection'
  | 'enableColumnFilters'
  | 'enableColumnReorder'
>;

export type GenDataGridCrudProps<TData> = {
  title?: React.ReactNode;
  readonly?: boolean;
  data: readonly TData[];
  columns: readonly GenDataGridColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  dataVersion?: string | number;
  createRow?: (ctx: DataGridCrudCreateRowContext<TData>) => TData;
  createdRowPosition?: DataGridCrudCreatedRowPosition;
  onCommit?: (args: DataGridCrudCommitArgs<TData>) => Promise<DataGridCrudCommitResult<TData>>;
  beforeCommit?: (
    args: DataGridCrudCommitArgs<TData>
  ) => boolean | Promise<boolean>;
  validateCommit?: (
    args: DataGridCrudCommitArgs<TData>
  ) => DataGridCrudValidationResult | Promise<DataGridCrudValidationResult>;
  onCommitSuccess?: (result: { nextData?: readonly TData[] }) => void;
  onCommitError?: (result: { error: unknown; fieldErrors?: DataGridCrudFieldErrors }) => void;
  onValidationError?: (result: {
    error?: unknown;
    fieldErrors: DataGridCrudFieldErrors;
  }) => void;
  onExport?: (args: DataGridCrudExportArgs<TData>) => void | Promise<void>;
  actionBar?: DataGridCrudActionBarOptions<TData>;
  onStateChange?: (state: DataGridCrudUiState<TData>) => void;
  gridProps?: Omit<GenDataGridProps<TData>, GridPropsOwnedByCrud>;
  className?: string;
  style?: React.CSSProperties;
};

export type DataGridCrudControllerArgs<TData> = Pick<
  GenDataGridCrudProps<TData>,
  | 'readonly'
  | 'data'
  | 'getRowId'
  | 'createRow'
  | 'createdRowPosition'
  | 'onCommit'
  | 'beforeCommit'
  | 'validateCommit'
  | 'onCommitSuccess'
  | 'onCommitError'
  | 'onValidationError'
  | 'onExport'
  | 'onStateChange'
> & {
  gridFeatureOptions?: Partial<DataGridCrudGridFeatureOptions<TData>>;
};

export type DataGridCrudRowSelectionState = RowSelectionState;
