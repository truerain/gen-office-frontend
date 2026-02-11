// apps/demo/src/entities/system/role/api/role.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { Role, RoleListParams, RoleRequest } from '@/entities/system/role/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

export const roleKeys = {
  all: () => ['role'] as const,
  list: (params: RoleListParams) => ['role', 'list', params] as const,
  detail: (id: number) => ['role', 'detail', id] as const,
};

export const roleApi = {
  list: (params: RoleListParams = {}) => {
    const url = `/api/roles${buildQuery({
      q: params.q,
      page: params.page ? String(params.page) : undefined,
      pageSize: params.pageSize ? String(params.pageSize) : undefined,
    })}`;

    return http<Role[] | { items: Role[] }>(url, { method: 'GET' }).then((res) =>
      Array.isArray(res) ? res : res.items ?? []
    );
  },

  get: (id: number) =>
    http<Role>(`/api/roles/${encodeURIComponent(String(id))}`, {
      method: 'GET',
    }),

  create: (input: RoleRequest) =>
    http<Role>('/api/roles', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: number, input: RoleRequest) =>
    http<Role>(`/api/roles/${encodeURIComponent(String(id))}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    http<{ ok: true }>(`/api/roles/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    }),
};

export function useRoleListQuery(params: RoleListParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => roleApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useRoleQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: () => roleApi.get(id),
    enabled,
  });
}
