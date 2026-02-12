import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { RoleMenu } from '@/entities/system/role-menu/model/types';

export const roleMenuKeys = {
  all: () => ['role-menu'] as const,
  view: (roleId: number) => ['role-menu', 'view', roleId] as const,
};

export const roleMenuApi = {
  view: (roleId: number) =>
    http<RoleMenu[] | { items: RoleMenu[] }>(
      `/api/role-menus/view/${encodeURIComponent(String(roleId))}`,
      { method: 'GET' }
    ).then((res) => (Array.isArray(res) ? res : res.items ?? [])),
};

export function useRoleMenuViewQuery(roleId: number | null) {
  return useQuery({
    queryKey: roleId == null ? roleMenuKeys.all() : roleMenuKeys.view(roleId),
    queryFn: () => roleMenuApi.view(roleId as number),
    enabled: roleId != null,

    // 캐시/재사용 최소화
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,

    // 이전 캐시 데이터 유지 안 함
    // placeholderData: keepPreviousData
  });
}
