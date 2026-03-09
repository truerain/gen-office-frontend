import { http, HttpResponse } from 'msw';
import { mockNotices } from '@/mocks/data/notice';
import type { Notice, NoticeRequest } from '@/pages/admin/notice/model/types';

function parseNoticeId(value: string) {
  const noticeId = Number(value);
  return Number.isFinite(noticeId) ? noticeId : null;
}

function nextNoticeId() {
  const maxId = mockNotices.reduce((max, notice) => (notice.noticeId > max ? notice.noticeId : max), 0);
  return maxId + 1;
}

export const noticeHandlers = [
  http.get('/api/notices', ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();

    let items = mockNotices.slice();
    if (q) {
      items = items.filter((notice) => {
        return (
          String(notice.title ?? '').toLowerCase().includes(q) ||
          String(notice.content ?? '').toLowerCase().includes(q)
        );
      });
    }

    return HttpResponse.json(items);
  }),

  http.get('/api/notices/:id', ({ params }) => {
    const noticeId = parseNoticeId(String(params.noticeId));
    if (noticeId == null) return new HttpResponse('invalid id', { status: 400 });

    const found = mockNotices.find((notice) => notice.noticeId === noticeId);
    if (!found) return new HttpResponse('not found', { status: 404 });

    return HttpResponse.json(found);
  }),

  http.post('/api/notices', async ({ request }) => {
    const body = (await request.json()) as NoticeRequest;
    const title = String(body.title ?? '').trim();
    if (!title) return new HttpResponse('title is required', { status: 400 });

    const now = new Date().toISOString();
    const requestedId = Number(body.noticeId);
    const hasRequestedId = Number.isFinite(requestedId) && requestedId > 0;

    if (hasRequestedId) {
      const idx = mockNotices.findIndex((notice) => notice.noticeId === requestedId);
      if (idx !== -1) {
        mockNotices[idx] = {
          ...mockNotices[idx],
          title,
          content: String(body.content ?? ''),
          dispStartDate: String(body.dispStartDate ?? ''),
          dispEndDate: String(body.dispEndDate ?? ''),
          popupYn: String(body.popupYn ?? 'N'),
          useYn: String(body.useYn ?? 'Y'),
          fileSetId: String(body.fileSetId ?? ''),
          lastUpdatedBy: String(body.lastUpdatedBy ?? 'admin'),
          lastUpdatedDate: now,
        };
        return HttpResponse.json(mockNotices[idx]);
      }
    }

    const created: Notice = {
      noticeId: nextNoticeId(),
      title,
      content: String(body.content ?? ''),
      dispStartDate: String(body.dispStartDate ?? ''),
      dispEndDate: String(body.dispEndDate ?? ''),
      popupYn: String(body.popupYn ?? 'N'),
      useYn: String(body.useYn ?? 'Y'),
      fileSetId: String(body.fileSetId ?? ''),
      readCount: 0,
      createdBy: String(body.createdBy ?? 'admin'),
      creationDate: now,
      lastUpdatedBy: String(body.lastUpdatedBy ?? body.createdBy ?? 'admin'),
      lastUpdatedDate: now,
    };
    mockNotices.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post('/api/notices/bulk', async ({ request }) => {
    const body = (await request.json()) as {
      creates?: NoticeRequest[];
      updates?: Array<{ id: number; input: NoticeRequest }>;
      deletes?: number[];
    };
    const creates = body.creates ?? [];
    const updates = body.updates ?? [];
    const deletes = body.deletes ?? [];
    const next = mockNotices.slice();
    let nextId = nextNoticeId();
    const now = new Date().toISOString();
    let created = 0;
    let updated = 0;
    let deleted = 0;

    for (const item of creates) {
      const title = String(item?.title ?? '').trim();
      if (!title) return new HttpResponse('title is required', { status: 400 });
      next.unshift({
        noticeId: nextId++,
        title,
        content: String(item?.content ?? ''),
        dispStartDate: String(item?.dispStartDate ?? ''),
        dispEndDate: String(item?.dispEndDate ?? ''),
        popupYn: String(item?.popupYn ?? 'N'),
        useYn: String(item?.useYn ?? 'Y'),
        fileSetId: String(item?.fileSetId ?? ''),
        readCount: 0,
        createdBy: String(item?.createdBy ?? 'admin'),
        creationDate: now,
        lastUpdatedBy: String(item?.lastUpdatedBy ?? item?.createdBy ?? 'admin'),
        lastUpdatedDate: now,
      });
      created++;
    }

    for (const item of updates) {
      const id = Number(item?.id);
      if (!Number.isFinite(id)) return new HttpResponse('invalid id', { status: 400 });
      const idx = next.findIndex((notice) => notice.noticeId === id);
      if (idx === -1) return new HttpResponse('not found', { status: 404 });
      const payload = item.input ?? ({} as NoticeRequest);
      const title = String(payload.title ?? '').trim();
      if (!title) return new HttpResponse('title is required', { status: 400 });
      next[idx] = {
        ...next[idx]!,
        title,
        content: String(payload.content ?? ''),
        dispStartDate: String(payload.dispStartDate ?? ''),
        dispEndDate: String(payload.dispEndDate ?? ''),
        popupYn: String(payload.popupYn ?? 'N'),
        useYn: String(payload.useYn ?? 'Y'),
        fileSetId: String(payload.fileSetId ?? ''),
        lastUpdatedBy: String(payload.lastUpdatedBy ?? 'admin'),
        lastUpdatedDate: now,
      };
      updated++;
    }

    for (const rawId of deletes) {
      const id = Number(rawId);
      if (!Number.isFinite(id)) return new HttpResponse('invalid id', { status: 400 });
      const idx = next.findIndex((notice) => notice.noticeId === id);
      if (idx === -1) return new HttpResponse('not found', { status: 404 });
      next.splice(idx, 1);
      deleted++;
    }

    mockNotices.splice(0, mockNotices.length, ...next);
    return HttpResponse.json({ created, updated, deleted });
  }),

  http.patch('/api/notices/:id/read-count', async ({ params, request }) => {
    const noticeId = parseNoticeId(String(params.noticeId));
    if (noticeId == null) return new HttpResponse('invalid id', { status: 400 });

    const idx = mockNotices.findIndex((notice) => notice.noticeId === noticeId);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    let incrementBy = 1;
    try {
      const body = (await request.json()) as { incrementBy?: number };
      if (Number.isFinite(body?.incrementBy)) {
        incrementBy = Number(body.incrementBy);
      }
    } catch {
      incrementBy = 1;
    }

    mockNotices[idx] = {
      ...mockNotices[idx],
      readCount: Number(mockNotices[idx].readCount ?? 0) + incrementBy,
      lastUpdatedDate: new Date().toISOString(),
    };

    return HttpResponse.json(mockNotices[idx]);
  }),

  http.delete('/api/notices/:id', ({ params }) => {
    const noticeId = parseNoticeId(String(params.id));
    if (noticeId == null) return new HttpResponse('invalid id', { status: 400 });

    const idx = mockNotices.findIndex((notice) => notice.noticeId === noticeId);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    mockNotices.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
