// apps/demo/src/entities/system/user/api/user.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { User, UserListParams, UserRequest } from '@/entities/system/user/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

export const userKeys = {
  all: () => ['user'] as const,
  list: (params: UserListParams) => ['user', 'list', params] as const,
};

export const userApi = {
  list: (params: UserListParams = {}) => {
    const url = `/api/users${buildQuery({
      empName: params.empName,
      page: params.page ? String(params.page) : undefined,
      pageSize: params.pageSize ? String(params.pageSize) : undefined,
    })}`;
    return http<User[]>(url, { method: 'GET' });
  },

  get: (id: number) =>
    http<User>(`/api/users/${encodeURIComponent(String(id))}`, {
      method: 'GET',
    }),

  create: (input: UserRequest) =>
    http<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: number, input: UserRequest) =>
    http<User>(`/api/users/${encodeURIComponent(String(id))}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  remove: (id: number) =>
    http<{ ok: true }>(`/api/users/${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    }),
};

// -------- Queries --------
export function useUserListQuery(params: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.list(params),
  });
}

// -------- Mutations --------
export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserRequest) => userApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; input: UserRequest }) => userApi.update(vars.id, vars.input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => userApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: userKeys.all() });
    },
  });
}
