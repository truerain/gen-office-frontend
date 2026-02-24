import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { userRoleApi } from '@/entities/system/user-role/api/userRole';
import type {
  UserRole,
  UserRoleCreateRequest,
  UserRoleKey,
  UserRoleUpdateRequest,
} from '@/entities/system/user-role/model/types';

export type UserRoleGridRow = UserRole & {
  _rowId: string;
};

function parsePositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const normalized = Math.trunc(parsed);
  if (normalized <= 0) return null;
  return normalized;
}

function normalizeUseYn(value: unknown) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

function normalizeYn(value: unknown) {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

function toUserRoleKey(input: Partial<UserRole>): UserRoleKey | null {
  const userId = parsePositiveInt(input.userId);
  const roleId = parsePositiveInt(input.roleId);
  if (userId == null || roleId == null) return null;
  return { userId, roleId };
}

function toCreateRequest(input: Partial<UserRole>): UserRoleCreateRequest {
  const key = toUserRoleKey(input);
  if (!key) throw new Error('userId and roleId must be positive integers.');
  const useYn = normalizeUseYn(input.useYn);
  const primaryYn = normalizeYn(input.primaryYn);
  if (primaryYn !== 'Y' && primaryYn !== 'N') {
    throw new Error('primaryYn must be Y or N.');
  }
  if (useYn !== 'Y' && useYn !== 'N') {
    throw new Error('useYn must be Y or N.');
  }

  return {
    ...key,
    primaryYn,
    useYn,
    attribute1: input.attribute1 ?? null,
    attribute2: input.attribute2 ?? null,
    attribute3: input.attribute3 ?? null,
    attribute4: input.attribute4 ?? null,
    attribute5: input.attribute5 ?? null,
    attribute6: input.attribute6 ?? null,
    attribute7: input.attribute7 ?? null,
    attribute8: input.attribute8 ?? null,
    attribute9: input.attribute9 ?? null,
    attribute10: input.attribute10 ?? null,
  };
}

function toUpdateRequest(input: Partial<UserRole>): UserRoleUpdateRequest {
  const useYn = normalizeUseYn(input.useYn);
  const primaryYn = normalizeYn(input.primaryYn);
  if (primaryYn !== 'Y' && primaryYn !== 'N') {
    throw new Error('primaryYn must be Y or N.');
  }
  if (useYn !== 'Y' && useYn !== 'N') {
    throw new Error('useYn must be Y or N.');
  }

  return {
    primaryYn,
    useYn,
    attribute1: input.attribute1 ?? null,
    attribute2: input.attribute2 ?? null,
    attribute3: input.attribute3 ?? null,
    attribute4: input.attribute4 ?? null,
    attribute5: input.attribute5 ?? null,
    attribute6: input.attribute6 ?? null,
    attribute7: input.attribute7 ?? null,
    attribute8: input.attribute8 ?? null,
    attribute9: input.attribute9 ?? null,
    attribute10: input.attribute10 ?? null,
  };
}

function isSameKey(a: UserRoleKey, b: UserRoleKey) {
  return a.userId === b.userId && a.roleId === b.roleId;
}

function findByRowId(rows: readonly UserRoleGridRow[], rowId: CrudRowId) {
  const id = String(rowId);
  return rows.find((row) => row._rowId === id);
}

export function toUserRoleRowId(row: Pick<UserRole, 'userId' | 'roleId'>) {
  return `key:${encodeURIComponent(String(row.userId))}|${encodeURIComponent(String(row.roleId))}`;
}

export async function commitUserRoleChanges(
  changes: readonly CrudChange<UserRoleGridRow>[],
  ctxRows: readonly UserRoleGridRow[]
) {
  const created = new Map<CrudRowId, UserRoleGridRow>();
  const updated = new Map<CrudRowId, Partial<UserRoleGridRow>>();
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
      default:
        break;
    }
  }

  for (const [tempId, row] of created.entries()) {
    if (deleted.has(tempId)) continue;
    const patch = updated.get(tempId);
    const merged = patch ? { ...row, ...patch } : row;
    await userRoleApi.create(toCreateRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;

    const base = findByRowId(ctxRows, rowId);
    if (!base) continue;

    const merged = { ...base, ...patch };
    const baseKey = toUserRoleKey(base);
    const nextKey = toUserRoleKey(merged);
    if (!baseKey || !nextKey) {
      throw new Error('userId and roleId must be positive integers.');
    }

    const keyChanged = !isSameKey(baseKey, nextKey);
    if (keyChanged) {
      await userRoleApi.create(toCreateRequest(merged));
      await userRoleApi.remove(baseKey);
      continue;
    }

    await userRoleApi.update(baseKey, toUpdateRequest(merged));
  }

  for (const rowId of deleted) {
    if (created.has(rowId)) continue;
    const row = findByRowId(ctxRows, rowId);
    if (!row) continue;
    const key = toUserRoleKey(row);
    if (!key) continue;
    await userRoleApi.remove(key);
  }
}

export function hasMissingUserRoleRequired(changes: readonly CrudChange<UserRoleGridRow>[]) {
  const created = new Map<CrudRowId, UserRoleGridRow>();
  const patches = new Map<CrudRowId, Partial<UserRoleGridRow>>();

  for (const change of changes) {
    if (change.type === 'create') {
      created.set(change.tempId, change.row);
      continue;
    }
    if (change.type === 'update') {
      patches.set(change.rowId, {
        ...(patches.get(change.rowId) ?? {}),
        ...change.patch,
      });
    }
  }

  const hasInvalidCreated = Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) };
    const key = toUserRoleKey(merged);
    const useYn = normalizeUseYn(merged.useYn);
    const primaryYn = normalizeYn(merged.primaryYn);
    return !key || (primaryYn !== 'Y' && primaryYn !== 'N') || (useYn !== 'Y' && useYn !== 'N');
  });
  if (hasInvalidCreated) return true;

  return Array.from(patches.values()).some((patch) => {
    if (Object.prototype.hasOwnProperty.call(patch, 'userId') && parsePositiveInt(patch.userId) == null) {
      return true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'roleId') && parsePositiveInt(patch.roleId) == null) {
      return true;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'useYn')) {
      const useYn = normalizeUseYn(patch.useYn);
      return useYn !== 'Y' && useYn !== 'N';
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'primaryYn')) {
      const primaryYn = normalizeYn(patch.primaryYn);
      return primaryYn !== 'Y' && primaryYn !== 'N';
    }
    return false;
  });
}
