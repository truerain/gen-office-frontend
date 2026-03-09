import { prepareCommitChanges, type CrudChange, type CrudRowId } from '@gen-office/gen-grid-crud';
import { roleApi } from '@/pages/admin/role/api/role';
import type { Role, RoleRequest } from '@/pages/admin/role/model/types';

const toRoleRequest = (input: Partial<Role>): RoleRequest => ({
  roleCd: input.roleCd,
  roleName: input.roleName,
  roleNameEng: input.roleNameEng,
  roleDesc: input.roleDesc,
  sortOrder: input.sortOrder,
  useYn: input.useYn,
});

export async function commitRoleChanges(
  changes: readonly CrudChange<Role>[],
  ctxRows: readonly Role[]
) {
  const { creates, updates, deletes } = prepareCommitChanges(changes, {
    viewData: ctxRows,
    getRowId: (row: Role) => row.roleId,
  });

  const createPayload: RoleRequest[] = [];
  const updatesPayload: Array<{ id: number; input: RoleRequest }> = [];
  const deletePayload: number[] = [];

  for (const row of creates) {
    createPayload.push(toRoleRequest(row));
  }

  for (const row of updates) {
    const id = Number(row.roleId);
    if (!Number.isFinite(id)) continue;
    updatesPayload.push({ id, input: toRoleRequest(row) });
  }

  for (const row of deletes) {
    const id = Number(row.roleId);
    if (!Number.isFinite(id)) continue;
    deletePayload.push(id);
  }

  await roleApi.bulkCommit({ creates: createPayload, updates: updatesPayload, deletes: deletePayload });
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
