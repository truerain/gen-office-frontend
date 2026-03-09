import { prepareCommitChanges, type CrudChange, type CrudRowId } from '@gen-office/gen-grid-crud';
import { userRoleApi } from '@/pages/admin/user-role/api/userRole';
import type {
  UserRole,
  UserRoleCreateRequest,
  UserRoleKey,
  UserRoleUpdateRequest,
} from '@/pages/admin/user-role/model/types';

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
  };
}

export function toUserRoleRowId(row: Pick<UserRole, 'userId' | 'roleId'>) {
  return `key:${encodeURIComponent(String(row.userId))}|${encodeURIComponent(String(row.roleId))}`;
}

export async function commitUserRoleChanges(
  changes: readonly CrudChange<UserRoleGridRow>[],
  ctxRows: readonly UserRoleGridRow[]
) {
  const { creates, updates, deletes } = prepareCommitChanges(changes, {
    viewData: ctxRows,
    getRowId: (row: UserRoleGridRow) => row._rowId,
  });

  const createPayload: Array<ReturnType<typeof toCreateRequest>> = [];
  const updatesPayload: Array<{
    userId: number;
    roleId: number;
    input: ReturnType<typeof toUpdateRequest>;
  }> = [];
  const deletesPayload: Array<{ userId: number; roleId: number }> = [];

  for (const row of creates) {
    createPayload.push(toCreateRequest(row));
  }

  for (const row of updates) {
    const key = toUserRoleKey(row);
    if (!key) {
      throw new Error('userId and roleId must be positive integers.');
    }

    updatesPayload.push({
      userId: key.userId,
      roleId: key.roleId,
      input: toUpdateRequest(row),
    });
  }

  for (const row of deletes) {
    const key = toUserRoleKey(row);
    if (!key) continue;
    deletesPayload.push(key);
  }

  await userRoleApi.bulkCommit({
    creates: createPayload,
    updates: updatesPayload,
    deletes: deletesPayload,
  });
}

export function hasMissingUserRoleRequired(changes: readonly CrudChange<UserRoleGridRow>[]) {
  const created = new Map<CrudRowId, UserRoleGridRow>();
  const patches = new Map<CrudRowId, Partial<UserRoleGridRow>>();

  for (const change of changes) {
    console.log(change);
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
