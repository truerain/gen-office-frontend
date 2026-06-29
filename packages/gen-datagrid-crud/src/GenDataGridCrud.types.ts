// packages/gen-datagrid-crud/src/GenDataGridCrud.types.ts
// Defines public types for the GenDataGridCrud thin shell.

import type * as React from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import type {
  GenDataGridChangeSet,
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
  | 'enableDirtyState'
  | 'onDirtyStateChange'
  | 'enableRowStatus'
  | 'rowStatusResolver'
  | 'enableCurrentRowHighlight'
  | 'onCurrentRowChange'
  | 'enableRowSelection'
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
      fieldErrors?: Record<string, string>;
    };

export type DataGridCrudUiState<TData> = {
  readonly: boolean;
  data: readonly TData[];
  dirtyState: GenDataGridDirtyState;
  dirty: boolean;
  isCommitting: boolean;
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

export type DataGridCrudActionApi = {
  addRow: () => void;
  deleteSelectedRows: () => void;
  save: () => Promise<void>;
  reset: () => void;
  clearFilters: () => void;
  toggleFilters: () => void;
  toggleColumnReorder: () => void;
  exportExcel: () => void;
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

export type GenDataGridCrudProps<TData> = {
  title?: React.ReactNode;
  readonly?: boolean;
  data: readonly TData[];
  columns: readonly ColumnDef<TData, unknown>[];
  getRowId: (row: TData, index: number) => string;
  dataVersion?: string | number;
  onCommit?: (args: DataGridCrudCommitArgs<TData>) => Promise<DataGridCrudCommitResult<TData>>;
  beforeCommit?: (
    args: DataGridCrudCommitArgs<TData>
  ) => boolean | Promise<boolean>;
  onCommitSuccess?: (result: { nextData?: readonly TData[] }) => void;
  onCommitError?: (result: { error: unknown; fieldErrors?: Record<string, string> }) => void;
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
  | 'onCommit'
  | 'beforeCommit'
  | 'onCommitSuccess'
  | 'onCommitError'
  | 'onStateChange'
>;

export type DataGridCrudRowSelectionState = RowSelectionState;
