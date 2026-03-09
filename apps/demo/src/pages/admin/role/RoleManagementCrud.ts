import { prepareCommitChanges, type CrudChange, type CrudRowId } from '@gen-office/gen-grid-crud';
import { roleApi } from '@/pages/admin/role/api/role';
import { roleMenuApi } from '@/pages/admin/role/api/roleMenu';
import type { RoleMenu } from '@/pages/admin/role/model/roleMenuTypes';
import type { Role, RoleRequest } from '@/pages/admin/role/model/types';

const defaultRoleAttributes = {
  attribute1: '',
  attribute2: '',
  attribute3: '',
  attribute4: '',
  attribute5: '',
  attribute6: '',
  attribute7: '',
  attribute8: '',
  attribute9: '',
  attribute10: '',
} as const;

export function createRoleRow(tempRoleId: number): Role {
  return {
    roleId: tempRoleId,
    roleCd: '',
    roleName: '',
    roleNameEng: '',
    roleDesc: '',
    sortOrder: 0,
    useYn: 'Y',
    createdBy: 'admin',
    lastUpdatedBy: 'admin',
    ...defaultRoleAttributes,
  } as Role;
}

const toRoleRequest = (input: Partial<Role>): RoleRequest => ({
  roleId: input.roleId,
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
  const updatesPayload: RoleRequest[] = [];
  const deletePayload: number[] = [];

  for (const row of creates) {
    createPayload.push(toRoleRequest(row));
  }

  for (const row of updates) {
    const id = Number(row.roleId);
    if (!Number.isFinite(id)) continue;
    updatesPayload.push(toRoleRequest(row));
  }

  for (const row of deletes) {
    const id = Number(row.roleId);
    if (!Number.isFinite(id)) continue;
    deletePayload.push(id);
  }

  await roleApi.bulkCommit({ creates: createPayload, updates: updatesPayload, deletes: deletePayload });
}

export async function commitRoleMenuChanges(
  roleId: number,
  changes: readonly CrudChange<RoleMenu>[],
  viewRows: readonly RoleMenu[]
) {
  const { updates } = prepareCommitChanges(changes, {
    viewData: viewRows,
    getRowId: (row: RoleMenu) => row.menuId,
  });

  const updatesPayload: Array<{ roleId: number; menuId: number; useYn: string }> = [];
  
  for (const row of updates) {
    const menuId = Number(row.menuId);
    if (!Number.isFinite(menuId)) continue;
    updatesPayload.push({
      roleId,
      menuId,
      useYn: String(row.useYn ?? 'N'),
    });
  }

  if (updatesPayload.length === 0) return;
  await roleMenuApi.bulkCommit({
    creates: [],
    updates: updatesPayload,
    deletes: [],
  });
}

function buildCreatedAndPatchedRows(changes: readonly CrudChange<Role>[]) {
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

  return { created, patches };
}

function hasMissingField(
  changes: readonly CrudChange<Role>[],
  field: keyof Pick<Role, 'roleCd' | 'roleName'>
) {
  const { created, patches } = buildCreatedAndPatchedRows(changes);

  const hasInvalidCreated = Array.from(created.entries()).some(([tempId, row]) => {
    const merged = { ...row, ...(patches.get(tempId) ?? {}) };
    return !String(merged[field] ?? '').trim();
  });
  if (hasInvalidCreated) return true;

  return Array.from(patches.values()).some((patch) => {
    if (!Object.prototype.hasOwnProperty.call(patch, field)) return false;
    return !String(patch[field] ?? '').trim();
  });
}

export type RoleValidationErrorCode = 'ROLE_CD_REQUIRED' | 'ROLE_NAME_REQUIRED';
export type RoleValidationMessage = {
  key: string;
  defaultValue: string;
};

export function getRoleValidationMessage(code: RoleValidationErrorCode): RoleValidationMessage {
  if (code === 'ROLE_CD_REQUIRED') {
    return {
      key: 'admin.role.validation.role_cd_required',
      defaultValue: 'Please enter Role Code.',
    };
  }

  return {
    key: 'admin.role.validation.role_name_required',
    defaultValue: 'Please enter Role Name.',
  };
}

export function validateRoleChanges(changes: readonly CrudChange<Role>[]): {
  ok: true;
  errors: [];
} | {
  ok: false;
  errors: Array<{ code: RoleValidationErrorCode }>;
} {
  if (hasMissingField(changes, 'roleCd')) {
    return {
      ok: false,
      errors: [{ code: 'ROLE_CD_REQUIRED' }],
    };
  }

  if (hasMissingField(changes, 'roleName')) {
    return {
      ok: false,
      errors: [{ code: 'ROLE_NAME_REQUIRED' }],
    };
  }

  return { ok: true, errors: [] };
}
