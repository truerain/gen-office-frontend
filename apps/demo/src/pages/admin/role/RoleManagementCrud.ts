import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { roleApi } from '@/entities/system/role/api/role';
import type { Role, RoleRequest } from '@/entities/system/role/model/types';

const toRoleRequest = (input: Partial<Role>): RoleRequest => ({
  roleCd: input.roleCd,
  roleName: input.roleName,
  roleNameEng: input.roleNameEng,
  roleDesc: input.roleDesc,
  sortOrder: input.sortOrder,
  useYn: input.useYn,
  attribute1: input.attribute1 ?? '',
  attribute2: input.attribute2 ?? '',
  attribute3: input.attribute3 ?? '',
  attribute4: input.attribute4 ?? '',
  attribute5: input.attribute5 ?? '',
  attribute6: input.attribute6 ?? '',
  attribute7: input.attribute7 ?? '',
  attribute8: input.attribute8 ?? '',
  attribute9: input.attribute9 ?? '',
  attribute10: input.attribute10 ?? '',
  createdBy: input.createdBy,
  lastUpdatedBy: input.lastUpdatedBy,
});

function findRoleById(rows: readonly Role[], rowId: CrudRowId) {
  const id = Number(rowId);
  if (!Number.isFinite(id)) return undefined;
  return rows.find((row) => row.roleId === id);
}

export async function commitRoleChanges(
  changes: readonly CrudChange<Role>[],
  ctxRows: readonly Role[]
) {
  const created = new Map<CrudRowId, Role>();
  const updated = new Map<CrudRowId, Partial<Role>>();
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
    await roleApi.create(toRoleRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;
    const baseRow = findRoleById(ctxRows, rowId);
    const merged = baseRow ? { ...baseRow, ...patch } : patch;
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await roleApi.update(id, toRoleRequest(merged));
  }

  for (const rowId of deleted) {
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await roleApi.remove(id);
  }
}

export function hasMissingRoleName(changes: readonly CrudChange<Role>[]) {
  const created = new Map<CrudRowId, Role>();
  const patches = new Map<CrudRowId, Partial<Role>>();

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
    return !String(merged.roleName ?? '').trim();
  });
  if (hasInvalidCreated) return true;

  return Array.from(patches.values()).some((patch) => {
    if (!Object.prototype.hasOwnProperty.call(patch, 'roleName')) return false;
    return !String(patch.roleName ?? '').trim();
  });
}
