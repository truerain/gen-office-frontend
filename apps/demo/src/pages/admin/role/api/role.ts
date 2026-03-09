import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { Role, RoleListParams, RoleRequest } from '@/pages/admin/role/model/types';

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
  list: (params: RoleListParams) => ['role', 'list', params] as const,
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

  bulkCommit: (input: {
    creates: RoleRequest[];
    updates: RoleRequest[];
    deletes: number[];
  }) =>
    http<{ created: number; updated: number; deleted: number }>('/api/roles/bulk', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export function useRoleListQuery(params: RoleListParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => roleApi.list(params),
  });
}
