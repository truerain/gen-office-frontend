import { prepareCommitChanges, type CrudChange } from '@gen-office/gen-grid-crud';
import { userApi } from '@/pages/admin/user/api/user';
import type { User, UserRequest } from '@/pages/admin/user/model/types';

const toUserRequest = (input: Partial<User>): UserRequest => ({
  empNo: input.empNo,
  empName: input.empName,
  empNameEng: input.empNameEng,
  email: input.email,
  orgId: input.orgId,
  titleCd: input.titleCd,
  langCd: input.langCd,
});

export async function commitUserChanges(
  changes: readonly CrudChange<User>[],
  ctxRows: readonly User[]
) {
  const { creates, updates, deletes } = prepareCommitChanges(changes, {
    viewData: ctxRows,
    getRowId: (row: User) => row.userId,
  });

  const createPayload: UserRequest[] = [];
  const updatesPayload: Array<{ id: number; input: UserRequest }> = [];
  const deletePayload: number[] = [];

  for (const row of creates) {
    createPayload.push(toUserRequest(row));
  }

  for (const row of updates) {
    const id = Number(row.userId);
    if (!Number.isFinite(id)) continue;
    updatesPayload.push({ id, input: toUserRequest(row) });
  }

  for (const row of deletes) {
    const id = Number(row.userId);
    if (!Number.isFinite(id)) continue;
    deletePayload.push(id);
  }

  await userApi.bulkCommit({ creates: createPayload, updates: updatesPayload, deletes: deletePayload });
}
