// apps/demo/src/entities/system/menu/api/menu.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { Menu, MenuListParams } from '@/entities/system/menu/model/types';

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

export const menuKeys = {
  all: () => ['menu'] as const,
  list: (params: MenuListParams) => ['menu', 'list', params] as const,
};

export const menuApi = {
  list: (params: MenuListParams = {}) => {
    const url = buildUrl('/api/menus', {
      q: params.q,
      page: params.page ? String(params.page) : undefined,
      pageSize: params.pageSize ? String(params.pageSize) : undefined,
    });
    return http<Menu[]>(url, { method: 'GET' });
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
