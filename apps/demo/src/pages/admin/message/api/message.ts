import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type {
  Message,
  MessageCreateRequest,
  MessageKey,
  MessageListParams,
  MessageListResponse,
  MessageUpdateRequest,
} from '@/pages/admin/message/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

function toPathKey(key: MessageKey) {
  return `${encodeURIComponent(key.namespace)}/${encodeURIComponent(key.messageCd)}/${encodeURIComponent(key.langCd)}`;
}

export const messageKeys = {
  all: () => ['message'] as const,
  list: (params: MessageListParams) => ['message', 'list', params] as const,
  detail: (key: MessageKey) => ['message', 'detail', key.namespace, key.messageCd, key.langCd] as const,
};

export const messageApi = {
  list: (params: MessageListParams = {}) => {
    const url = `/api/mis/admin/messages${buildQuery({
      namespace: params.namespace,
      langCd: params.langCd,
      messageCd: params.messageCd,
      q: params.q,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
      sort: params.sort,
    })}`;

    return http<Message[] | MessageListResponse | { items: Message[] }>(url, { method: 'GET' }).then((res) => {
      if (Array.isArray(res)) return res;
      return res.items ?? [];
    });
  },

  get: (key: MessageKey) =>
    http<Message>(`/api/mis/admin/messages/${toPathKey(key)}`, {
      method: 'GET',
    }),

  create: (input: MessageCreateRequest) =>
    http<Message>('/api/mis/admin/messages', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (key: MessageKey, input: MessageUpdateRequest) =>
    http<Message>(`/api/mis/admin/messages/${toPathKey(key)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  remove: (key: MessageKey) =>
    http<void>(`/api/mis/admin/messages/${toPathKey(key)}`, {
      method: 'DELETE',
    }),
};

export function useMessageListQuery(params: MessageListParams) {
  return useQuery({
    queryKey: messageKeys.list(params),
    queryFn: () => messageApi.list(params),
  });
}

export function useMessageQuery(key: MessageKey, enabled = true) {
  return useQuery({
    queryKey: messageKeys.detail(key),
    queryFn: () => messageApi.get(key),
    enabled,
  });
}
