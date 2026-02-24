import { http, HttpResponse } from 'msw';
import { mockMessages } from '@/mocks/data/message';
import type {
  Message,
  MessageCreateRequest,
  MessageUpdateRequest,
} from '@/entities/system/message/model/types';

function normalize(input: unknown) {
  return String(input ?? '').trim();
}

function parsePath(param: string | readonly string[] | undefined) {
  return decodeURIComponent(String(param ?? ''));
}

function isValidLangCd(langCd: string) {
  return /^[a-z]{2}(?:-[A-Z]{2})?$/.test(langCd);
}

function findIndex(namespace: string, messageCd: string, langCd: string) {
  return mockMessages.findIndex((item) =>
    item.namespace === namespace && item.messageCd === messageCd && item.langCd === langCd
  );
}

function toSortableValue(item: Message, field: string) {
  switch (field) {
    case 'namespace':
      return item.namespace;
    case 'message_cd':
      return item.messageCd;
    case 'lang_cd':
      return item.langCd;
    case 'creation_date':
      return item.createdAt ?? '';
    case 'last_updated_date':
      return item.updatedAt ?? '';
    default:
      return '';
  }
}

function applySort(items: Message[], sortRaw: string | null) {
  if (!sortRaw?.trim()) return items;

  const sorters = sortRaw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [field, dirRaw] = entry.split(/\s+/);
      const direction = String(dirRaw ?? 'asc').toLowerCase() === 'desc' ? -1 : 1;
      return { field, direction };
    });

  if (!sorters.length) return items;

  return items.sort((a, b) => {
    for (const sorter of sorters) {
      const va = toSortableValue(a, sorter.field);
      const vb = toSortableValue(b, sorter.field);
      if (va < vb) return -1 * sorter.direction;
      if (va > vb) return 1 * sorter.direction;
    }
    return 0;
  });
}

export const messageHandlers = [
  http.get('/api/mis/admin/messages', ({ request }) => {
    const url = new URL(request.url);
    const namespace = normalize(url.searchParams.get('namespace'));
    const langCd = normalize(url.searchParams.get('langCd'));
    const messageCd = normalize(url.searchParams.get('messageCd')).toLowerCase();
    const q = normalize(url.searchParams.get('q')).toLowerCase();
    const page = Number(url.searchParams.get('page') ?? 0);
    const sizeParam = Number(url.searchParams.get('size') ?? 20);
    const size = Number.isFinite(sizeParam) ? Math.max(1, Math.min(200, sizeParam)) : 20;
    const sortRaw = url.searchParams.get('sort');

    let items = mockMessages.slice();
    if (namespace) {
      items = items.filter((item) => item.namespace === namespace);
    }
    if (langCd) {
      items = items.filter((item) => item.langCd === langCd);
    }
    if (messageCd) {
      items = items.filter((item) => item.messageCd.toLowerCase().includes(messageCd));
    }
    if (q) {
      items = items.filter((item) => item.messageTxt.toLowerCase().includes(q));
    }

    items = applySort(items, sortRaw);

    const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
    const start = safePage * size;
    const paged = items.slice(start, start + size);

    return HttpResponse.json({
      items: paged,
      page: safePage,
      size,
      total: items.length,
    });
  }),

  http.get('/api/mis/admin/messages/:namespace/:messageCd/:langCd', ({ params }) => {
    const namespace = parsePath(params.namespace);
    const messageCd = parsePath(params.messageCd);
    const langCd = parsePath(params.langCd);

    const idx = findIndex(namespace, messageCd, langCd);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });
    return HttpResponse.json(mockMessages[idx]);
  }),

  http.post('/api/mis/admin/messages', async ({ request }) => {
    const body = (await request.json()) as MessageCreateRequest;
    const namespace = normalize(body.namespace);
    const messageCd = normalize(body.messageCd);
    const langCd = normalize(body.langCd);
    const messageTxt = normalize(body.messageTxt);

    if (!namespace || !messageCd || !langCd || !messageTxt) {
      return new HttpResponse('namespace, messageCd, langCd, messageTxt are required', { status: 400 });
    }
    if (/\s/.test(messageCd)) {
      return new HttpResponse('messageCd cannot contain whitespace', { status: 400 });
    }
    if (!isValidLangCd(langCd)) {
      return new HttpResponse('invalid langCd', { status: 400 });
    }
    if (findIndex(namespace, messageCd, langCd) !== -1) {
      return new HttpResponse(
        JSON.stringify({
          code: 'CONFLICT',
          messageKey: 'message.duplicate',
          message: '이미 존재하는 메시지 키입니다',
          locale: 'ko',
          path: '/api/mis/admin/messages',
          timestamp: new Date().toISOString(),
          traceId: null,
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    const created: Message = {
      namespace,
      messageCd,
      langCd,
      messageTxt,
      createdAt: now,
      updatedAt: now,
    };
    mockMessages.unshift(created);
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put('/api/mis/admin/messages/:namespace/:messageCd/:langCd', async ({ params, request }) => {
    const namespace = parsePath(params.namespace);
    const messageCd = parsePath(params.messageCd);
    const langCd = parsePath(params.langCd);

    const idx = findIndex(namespace, messageCd, langCd);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    const body = (await request.json()) as MessageUpdateRequest;
    const messageTxt = normalize(body.messageTxt);
    if (!messageTxt) {
      return new HttpResponse('messageTxt is required', { status: 400 });
    }

    mockMessages[idx] = {
      ...mockMessages[idx],
      messageTxt,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(mockMessages[idx]);
  }),

  http.delete('/api/mis/admin/messages/:namespace/:messageCd/:langCd', ({ params }) => {
    const namespace = parsePath(params.namespace);
    const messageCd = parsePath(params.messageCd);
    const langCd = parsePath(params.langCd);

    const idx = findIndex(namespace, messageCd, langCd);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    mockMessages.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
