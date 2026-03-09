import type { CrudChange, CrudRowId } from './types';

export type NormalizedCrudChanges<TData> = {
  creates: Map<CrudRowId, TData>;
  updated: Map<CrudRowId, Partial<TData>>;
  deletes: Set<CrudRowId>;
};

/**
 * @deprecated Use prepareCommitChanges instead.
 */
export function normalizeChanges<TData>(
  changes: readonly CrudChange<TData>[]
): NormalizedCrudChanges<TData> {
  const created = new Map<CrudRowId, TData>();
  const updated = new Map<CrudRowId, Partial<TData>>();
  const deleted = new Set<CrudRowId>();

  for (const change of changes) {
    switch (change.type) {
      case 'create':
        created.set(change.tempId, change.row);
        break;
      case 'update':
        updated.set(change.rowId, { ...(updated.get(change.rowId) ?? {}), ...change.patch });
        break;
      case 'delete':
        deleted.add(change.rowId);
        break;
      case 'undelete':
        deleted.delete(change.rowId);
        break;
      default:
        break;
    }
  }

  const creates = new Map<CrudRowId, TData>();
  for (const [rowId, row] of created.entries()) {
    if (deleted.has(rowId)) continue;
    const patch = updated.get(rowId);
    creates.set(rowId, (patch ? { ...row, ...patch } : row) as TData);
  }

  const effectiveUpdated = new Map<CrudRowId, Partial<TData>>();
  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;
    effectiveUpdated.set(rowId, patch);
  }

  const deletes = new Set<CrudRowId>();
  for (const rowId of deleted.values()) {
    if (created.has(rowId)) continue;
    deletes.add(rowId);
  }

  return { creates, updated: effectiveUpdated, deletes };
}
