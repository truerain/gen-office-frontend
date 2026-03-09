import type { CrudChange, CrudRowId } from './types';

export type PreparedCommitChanges<TData> = {
  creates: TData[];
  updates: TData[];
  deletes: TData[];
};

function normalizeStringFields<TData>(row: TData): TData {
  if (row == null || typeof row !== 'object') return row;
  if (Array.isArray(row)) return row;

  const source = row as Record<string, unknown>;
  let changed = false;
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      normalized[key] = trimmed;
      if (trimmed !== value) changed = true;
      continue;
    }
    normalized[key] = value;
  }

  return (changed ? normalized : row) as TData;
}

export function prepareCommitChanges<TData>(
  changes: readonly CrudChange<TData>[],
  options: {
    viewData: readonly TData[];
    getRowId: (row: TData, index: number) => CrudRowId;
  }
): PreparedCommitChanges<TData> {
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

  const rowById = new Map<string, { id: CrudRowId; row: TData }>();
  for (let i = 0; i < options.viewData.length; i++) {
    const row = options.viewData[i]!;
    const id = options.getRowId(row, i);
    rowById.set(String(id), { id, row });
  }

  const creates: TData[] = [];
  for (const [rowId, row] of created.entries()) {
    if (deleted.has(rowId)) continue;
    const patch = updated.get(rowId);
    const next = (patch ? { ...row, ...patch } : row) as TData;
    creates.push(normalizeStringFields(next));
  }

  const updates: TData[] = [];
  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;
    const base = rowById.get(String(rowId))?.row;
    if (!base) continue;
    updates.push(normalizeStringFields({ ...base, ...patch } as TData));
  }

  const deletes: TData[] = [];
  for (const rowId of deleted.values()) {
    if (created.has(rowId)) continue;
    const base = rowById.get(String(rowId))?.row;
    if (!base) continue;
    deletes.push(normalizeStringFields(base));
  }

  return { creates, updates, deletes };
}
