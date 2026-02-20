import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { Notice, NoticeListParams, NoticeRequest } from '@/entities/system/notice/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

export const noticeKeys = {
  all: () => ['notice'] as const,
  list: (params: NoticeListParams) => ['notice', 'list', params] as const,
  detail: (id: number) => ['notice', 'detail', id] as const,
};

export const noticeApi = {
  list: (params: NoticeListParams = {}) => {
    const url = `/api/notices${buildQuery({
      q: params.q,
      page: params.page ? String(params.page) : undefined,
      pageSize: params.pageSize ? String(params.pageSize) : undefined,
    })}`;

    return http<Notice[] | { items: Notice[] }>(url, { method: 'GET' }).then((res) =>
      Array.isArray(res) ? res : res.items ?? []
    );
  },

  get: (id: number) =>
    http<Notice>(`/api/notices/${encodeURIComponent(String(id))}`, {
      method: 'GET',
    }),

  save: (input: NoticeRequest) =>
    http<Notice>('/api/notices', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  patchReadCount: (id: number, incrementBy = 1) =>
    http<Notice>(`/api/notices/${encodeURIComponent(String(id))}/read-count`, {
      method: 'PATCH',
      body: JSON.stringify({ incrementBy }),
    }),
};

export function useNoticeListQuery(params: NoticeListParams) {
  return useQuery({
    queryKey: noticeKeys.list(params),
    queryFn: () => noticeApi.list(params),
  });
}

export function useNoticeDetailQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: noticeKeys.detail(id),
    queryFn: () => noticeApi.get(id),
    enabled,
  });
}
