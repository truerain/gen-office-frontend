import type { CrudChange, CrudRowId } from '@gen-office/gen-grid-crud';
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

function findNoticeById(rows: readonly Notice[], rowId: CrudRowId) {
  const id = Number(rowId);
  if (!Number.isFinite(id)) return undefined;
  return rows.find((row) => row.noticeId === id);
}

export async function commitNoticeChanges(
  changes: readonly CrudChange<Notice>[],
  ctxRows: readonly Notice[]
) {
  const created = new Map<CrudRowId, Notice>();
  const updated = new Map<CrudRowId, Partial<Notice>>();
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
    await noticeApi.save(toNoticeRequest(merged));
  }

  for (const [rowId, patch] of updated.entries()) {
    if (created.has(rowId)) continue;
    if (deleted.has(rowId)) continue;

    const baseRow = findNoticeById(ctxRows, rowId);
    const merged = baseRow ? { ...baseRow, ...patch } : patch;
    await noticeApi.save(toNoticeRequest(merged, rowId));
  }

  for (const rowId of deleted) {
    const id = Number(rowId);
    if (!Number.isFinite(id) || id <= 0) continue;
    await noticeApi.remove(id);
  }
}
