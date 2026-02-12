import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { RoleMenu } from '@/entities/system/role-menu/model/types';

export type RoleMenuSaveRequest = {
  roleId: number;
  menuId: number;
  useYn: string;
};

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
  save: (input: RoleMenuSaveRequest) =>
    http<RoleMenu>('/api/role-menus', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export function useRoleMenuViewQuery(roleId: number | null) {
  return useQuery({
    queryKey: roleId == null ? roleMenuKeys.all() : roleMenuKeys.view(roleId),
    queryFn: () => roleMenuApi.view(roleId as number),
    enabled: roleId != null,
  });
}
