// packages/gen-grid-crud/src/GenGridCrud.types.ts
import type * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { GenGridEditorFactory, GenGridProps } from '@gen-office/gen-grid';
import type { ButtonVariant } from '@gen-office/ui';
import type { CrudChange, CrudRowId, UseMakePatch } from './crud/types';

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

  selectedRowIds: readonly CrudRowId[];
  activeRowId?: CrudRowId;
  activeColumnId?: string;

  isCommitting: boolean;
};

export type CrudCellEditEvent<TData> = {
  rowId: string;
  columnId: string;
  rowIndex: number;
  prevValue: unknown;
  nextValue: unknown;
  row: TData;
};

export type CrudActionButtonStyle = 'text' | 'icon';
export type CrudActionSide = 'left' | 'right';
export type CrudBuiltInActionKey = 'add' | 'delete' | 'save' | 'filter' | 'reset';

export type CrudActionApi = {
  add?: () => void;
  deleteSelected?: () => void;
  save?: () => Promise<void>;
  reset: () => void;
  toggleFilter?: () => void;
};

export type CrudActionContext<TData> = {
  state: CrudUiState<TData>;
  api: CrudActionApi;
};

export type CrudActionItem<TData> = {
  key: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
  style?: CrudActionButtonStyle;
  variant?: ButtonVariant;
  side?: CrudActionSide;
  order?: number;
  visible?: boolean | ((ctx: CrudActionContext<TData>) => boolean);
  disabled?: boolean | ((ctx: CrudActionContext<TData>) => boolean);
  onClick?: (ctx: CrudActionContext<TData>) => void | Promise<void>;
};

export type CrudActionBarOptions<TData> = {
  enabled?: boolean;
  position?: 'top' | 'bottom' | 'both';
  defaultStyle?: CrudActionButtonStyle;
  includeBuiltIns?: readonly CrudBuiltInActionKey[];
  customActions?: readonly CrudActionItem<TData>[];
};

export type GenGridCrudProps<TData> = {
  title?: string;
  data: readonly TData[];
  columns: readonly ColumnDef<TData, any>[];
  getRowId: (row: TData, index: number) => CrudRowId;

  /** CRUD */
  createRow?: () => TData;
  makePatch?: UseMakePatch<TData>;
  deleteMode?: 'selected' | 'activeRow';

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

  /** selection (GenGrid API가 ?�르�??�기�?바꾸�??? */
  selectedRowIds?: readonly CrudRowId[];
  onSelectedRowIdsChange?: (rowIds: readonly CrudRowId[]) => void;

  /** active cell (?�택) */
  activeCell?: { rowId: CrudRowId; columnId: string } | null;
  onActiveCellChange?: (next: { rowId: CrudRowId; columnId: string } | null) => void;

  /** editor factory (GenGrid) */
  editorFactory?: GenGridEditorFactory<TData>;

  /** when true, reverting a cell to its base value clears dirty for that field */
  clearDirtyOnRevert?: boolean;

  /** UI hooks */
  onStateChange?: (state: CrudUiState<TData>) => void;
  onCellEdit?: (event: CrudCellEditEvent<TData>) => void;

  /** pass-through (GenGrid props???�로?�트??맞게 ?�??치환) */
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
