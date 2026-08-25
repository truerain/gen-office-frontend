// packages/gen-grid-crud/src/GenGridCrudHandle.ts
// Imperative handle for GenGridCrud (external row add/update/delete).

import type { CrudRowId } from './crud/types';

export type GenGridCrudRowUpdate<TData> = {
  rowId: CrudRowId;
  patch: Partial<TData>;
};

export type GenGridCrudHandle<TData> = {
  /**
   * Add a fully formed row as a pending create.
   * Does not require the `createRow` prop (that prop is only for ActionBar Add).
   */
  addRow: (
    row: TData,
    opts?: { tempId?: CrudRowId; focus?: boolean }
  ) => CrudRowId;
  /**
   * Add multiple rows (e.g. picker multi-select). Focuses the last row when focusLast is true.
   */
  addRows: (
    rows: readonly TData[],
    opts?: { focusLast?: boolean }
  ) => CrudRowId[];
  /** Apply a pending update patch to an existing or created row. */
  updateRow: (rowId: CrudRowId, patch: Partial<TData>) => void;
  /** Apply pending update patches to multiple rows. */
  updateRows: (updates: readonly GenGridCrudRowUpdate<TData>[]) => void;
  /** Mark rows as pending delete by id (no selection UI required). */
  deleteRowIds: (rowIds: readonly CrudRowId[]) => void;
  /** Discard pending create/update/delete (same as ActionBar reset). */
  reset: () => void;
};
