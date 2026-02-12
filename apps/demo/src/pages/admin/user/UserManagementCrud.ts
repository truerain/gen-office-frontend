import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
import { userApi } from '@/entities/system/user/api/user';
import type { User, UserRequest } from '@/entities/system/user/model/types';

const toUserRequest = (input: Partial<User>): UserRequest => ({
  empNo: input.empNo,
  empName: input.empName,
  empNameEng: input.empNameEng,
  password: input.password,
  email: input.email,
  orgId: input.orgId,
  title: input.title,
  langCd: input.langCd,
  createdBy: input.createdBy,
  lastUpdatedBy: input.lastUpdatedBy,
});

function findUserById(rows: readonly User[], rowId: CrudRowId) {
  const id = Number(rowId);
  if (!Number.isFinite(id)) return undefined;
  return rows.find((row) => row.userId === id);
}

export async function commitUserChanges(
  changes: readonly CrudChange<User>[],
  ctxRows: readonly User[]
) {
  const created = new Map<CrudRowId, User>();
  const updated = new Map<CrudRowId, Partial<User>>();
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
    await userApi.create(toUserRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;
    const baseRow = findUserById(ctxRows, rowId);
    const merged = baseRow ? { ...baseRow, ...patch } : patch;
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await userApi.update(id, toUserRequest(merged));
  }

  for (const rowId of deleted) {
    const id = Number(rowId);
    if (!Number.isFinite(id)) continue;
    await userApi.remove(id);
  }
}
