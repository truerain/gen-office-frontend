// apps/demo/src/entities/system/menu/api/menu.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { AppMenu } from '../model/types';

export const menuKeys = {
  all: () => ['menu'] as const,
  list: () => ['menu', 'list'] as const,
};

export const menuApi = {
  list: () => {
    const url = `/api/app-menus`;
    return http<AppMenu[] | { items: AppMenu[] }>(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${btoa('admin:admin123')}`,
      },
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },
};

// -------- Queries --------
export function useAppMenuListQuery() {
  return useQuery({
    queryKey: ["app-menu"],
    queryFn: () => menuApi.list(),
    placeholderData: keepPreviousData, // v5 "keep previous data"
  });
}
