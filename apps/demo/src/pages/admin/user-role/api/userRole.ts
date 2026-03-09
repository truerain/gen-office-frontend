import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type {
  UserRole,
  UserRoleCreateRequest,
  UserRoleBulkRequest,
  UserRoleKey,
  UserRoleListParams,
  UserRoleOption,
  UserRoleUpdateRequest,
} from '@/pages/admin/user-role/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

function toPathKey(key: UserRoleKey) {
  return `${encodeURIComponent(String(key.userId))}/${encodeURIComponent(String(key.roleId))}`;
}

export const userRoleKeys = {
  all: () => ['user-role'] as const,
  list: (params: UserRoleListParams) => ['user-role', 'list', params] as const,
  detail: (key: UserRoleKey) => ['user-role', 'detail', key.userId, key.roleId] as const,
  roleOptions: () => ['role', 'options'] as const,
};

export const userRoleApi = {
  list: (params: UserRoleListParams = {}) => {
    const url = `/api/mis/admin/user-roles${buildQuery({
      userId: params.userId != null ? String(params.userId) : undefined,
      roleId: params.roleId != null ? String(params.roleId) : undefined,
      useYn: params.useYn,
      sort: params.sort,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
    })}`;

    return http<UserRole[] | { items: UserRole[] }>(url, { method: 'GET' }).then((res) =>
      Array.isArray(res) ? res : res.items ?? []
    );
  },

  get: (key: UserRoleKey) =>
    http<UserRole>(`/api/mis/admin/user-roles/${toPathKey(key)}`, {
      method: 'GET',
    }),

  create: (input: UserRoleCreateRequest) =>
    http<UserRole>('/api/mis/admin/user-roles', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (key: UserRoleKey, input: UserRoleUpdateRequest) =>
    http<UserRole>(`/api/mis/admin/user-roles/${toPathKey(key)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  remove: (key: UserRoleKey) =>
    http<void>(`/api/mis/admin/user-roles/${toPathKey(key)}`, {
      method: 'DELETE',
    }),

  roleOptions: () =>
    http<UserRoleOption[]>('/api/roles/options', {
      method: 'GET',
    }),
  bulkCommit: (input: UserRoleBulkRequest) =>
    http<{ created: number; updated: number; deleted: number }>('/api/mis/admin/user-roles/bulk', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export function useUserRoleListQuery(params: UserRoleListParams) {
  return useQuery({
    queryKey: userRoleKeys.list(params),
    queryFn: () => userRoleApi.list(params),
  });
}

export function useUserRoleQuery(key: UserRoleKey, enabled = true) {
  return useQuery({
    queryKey: userRoleKeys.detail(key),
    queryFn: () => userRoleApi.get(key),
    enabled,
  });
}

export function useUserRoleOptionsQuery() {
  return useQuery({
    queryKey: userRoleKeys.roleOptions(),
    queryFn: () => userRoleApi.roleOptions(),
  });
}
