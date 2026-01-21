// packages/gen-grid-crud/src/GenGridCrud.types.ts
import type * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { CrudChange, CrudRowId, UseMakePatch } from './crud/types';

export type CrudCommitContext<TData> = {
  baseData: readonly TData[];
  viewData: readonly TData[];
};

export type CrudCommitResult<TData> =
  | { ok: true; nextData?: readonly TData[] }
  | { ok: false; error: unknown; fieldErrors?: Record<string, string> };

export type CrudUiState<TData> = {
  baseData: readonly TData[];
  viewData: readonly TData[];
  changes: readonly CrudChange<TData>[];
  dirty: boolean;

  selectedRowIds: readonly CrudRowId[];
  activeRowId?: CrudRowId;
  activeColumnId?: string;

  isCommitting: boolean;
};


export type GenGridCrudProps<TData> = {
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

  /** selection (GenGrid API가 다르면 여기만 바꾸면 됨) */
  selectedRowIds?: readonly CrudRowId[];
  onSelectedRowIdsChange?: (rowIds: readonly CrudRowId[]) => void;

  /** active cell (선택) */
  activeCell?: { rowId: CrudRowId; columnId: string } | null;
  onActiveCellChange?: (next: { rowId: CrudRowId; columnId: string }) => void;

  /** UI hooks */
  onStateChange?: (state: CrudUiState<TData>) => void;

  /** pass-through (GenGrid props는 프로젝트에 맞게 타입 치환) */
  gridProps?: Record<string, any>;
};
