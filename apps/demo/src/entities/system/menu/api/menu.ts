// apps/demo/src/entities/system/menu/api/menu.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
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
    return http<Menu[] | { items: Menu[] }>(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${btoa('admin:admin123')}`,
      },
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },
};

// -------- Queries --------
export function useMenuListQuery(params: MenuListParams) {
  return useQuery({
    queryKey: menuKeys.list(params),
    queryFn: () => menuApi.list(params),
    placeholderData: keepPreviousData, // v5 "keep previous data"
  });
}
