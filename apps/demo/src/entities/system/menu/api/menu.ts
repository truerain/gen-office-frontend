// apps/demo/src/entities/system/menu/api/menu.ts
import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { Menu, MenuListParams } from '@/entities/system/menu/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

export const menuKeys = {
  all: () => ['menu'] as const,
  list: (params: MenuListParams) => ['menu', 'list', params] as const,
};

export const menuApi = {
  list: (params: MenuListParams = {}) => {
    const url = `/api/menus${buildQuery({
      q: params.q,
      page: params.page ? String(params.page) : undefined,
      pageSize: params.pageSize ? String(params.pageSize) : undefined,
    })}`;
    return http<Menu[] | { items: Menu[] }>(url, { method: 'GET' }).then((res) =>
      Array.isArray(res) ? res : res.items ?? []
    );
  },
  children: (parentId: number | null) => {
    const url =
      parentId == null
        ? '/api/menus/submenu'
        : `/api/menus/submenu/${encodeURIComponent(String(parentId))}`;
    return http<Menu[] | { items: Menu[] }>(url, { method: 'GET' }).then((res) =>
      Array.isArray(res) ? res : res.items ?? []
    );
  },
  create: (input: Partial<Menu>) =>
    http<Menu>('/api/menus', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (id: number, input: Partial<Menu>) =>
    http<Menu>(`/api/menus/${encodeURIComponent(String(id))}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  remove: (id: number) =>
    http<{ ok: true }>(`/api/menus/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    }),
};

// -------- Queries --------
export function useMenuListQuery(params: MenuListParams) {
  return useQuery({
    queryKey: menuKeys.list(params),
    queryFn: () => menuApi.list(params),
  });
}
