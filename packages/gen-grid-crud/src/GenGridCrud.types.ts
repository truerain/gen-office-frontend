// packages/gen-grid-crud/src/GenGridCrud.types.ts
import type * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { GenGridEditorFactory } from '@gen-office/gen-grid';
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
  showActionBar?: boolean;
  actionBarPosition?: 'top' | 'bottom' | 'both';

  /** selection (GenGrid API가 ?�르�??�기�?바꾸�??? */
  selectedRowIds?: readonly CrudRowId[];
  onSelectedRowIdsChange?: (rowIds: readonly CrudRowId[]) => void;

  /** active cell (?�택) */
  activeCell?: { rowId: CrudRowId; columnId: string } | null;
  onActiveCellChange?: (next: { rowId: CrudRowId; columnId: string } | null) => void;

  /** editor factory (GenGrid) */
  editorFactory?: GenGridEditorFactory<TData>;

  /** UI hooks */
  onStateChange?: (state: CrudUiState<TData>) => void;
  onCellEdit?: (event: CrudCellEditEvent<TData>) => void;

  /** pass-through (GenGrid props???�로?�트??맞게 ?�??치환) */
  gridProps?: Record<string, any>;
};
