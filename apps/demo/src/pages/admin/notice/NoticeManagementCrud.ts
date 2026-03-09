import { prepareCommitChanges, type CrudChange, type CrudRowId } from '@gen-office/gen-grid-crud';
import { noticeApi } from '@/pages/admin/notice/api/notice';
import type { Notice, NoticeRequest } from '@/pages/admin/notice/model/types';

const toNoticeRequest = (input: Partial<Notice>, rowId?: CrudRowId): NoticeRequest => {
  const requestId = Number(rowId ?? input.noticeId);
  const hasRequestId = Number.isFinite(requestId) && requestId > 0;

  return {
    noticeId: hasRequestId ? requestId : undefined,
    title: String(input.title ?? '').trim(),
    content: String(input.content ?? ''),
    dispStartDate: String(input.dispStartDate ?? '').trim() || undefined,
    dispEndDate: String(input.dispEndDate ?? '').trim() || undefined,
    popupYn: String(input.popupYn ?? 'Y'),
    useYn: String(input.useYn ?? 'Y'),
    fileSetId: String(input.fileSetId ?? '').trim() || undefined,
    createdBy: hasRequestId ? undefined : String(input.createdBy ?? 'admin'),
    lastUpdatedBy: String(input.lastUpdatedBy ?? 'admin'),
  };
};

export async function commitNoticeChanges(
  changes: readonly CrudChange<Notice>[],
  ctxRows: readonly Notice[]
) {
  const { creates, updates, deletes } = prepareCommitChanges(changes, {
    viewData: ctxRows,
    getRowId: (row: Notice) => row.noticeId,
  });

  const createPayload: NoticeRequest[] = [];
  const updatesPayload: Array<{ id: number; input: NoticeRequest }> = [];
  const deletePayload: number[] = [];

  for (const row of creates) {
    createPayload.push(toNoticeRequest(row));
  }

  for (const row of updates) {
    const id = Number(row.noticeId);
    if (!Number.isFinite(id) || id <= 0) continue;
    updatesPayload.push({ id, input: toNoticeRequest(row, id) });
  }

  for (const row of deletes) {
    const id = Number(row.noticeId);
    if (!Number.isFinite(id) || id <= 0) continue;
    deletePayload.push(id);
  }

  await noticeApi.bulkCommit({ creates: createPayload, updates: updatesPayload, deletes: deletePayload });
}
