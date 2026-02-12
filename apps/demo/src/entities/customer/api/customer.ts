// apps/demo/src/entities/customer/api/customer.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type {
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CreateCustomerInput,
  UpdateCustomerInput,
} from '@/entities/customer/model/types';

function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, v);
    });
  }
  return url.toString();
}

export const customerKeys = {
  all: () => ['customer'] as const,
  list: (params: CustomerListParams) => ['customer', 'list', params] as const,
};

export const customerApi = {
  list: (params: CustomerListParams = {}) => {
    const url = buildUrl('/api/customers', {
      q: params.q,
      status: params.status,
      page: params.page ? String(params.page) : undefined,
      pageSize: params.pageSize ? String(params.pageSize) : undefined,
    });
    return http<CustomerListResponse>(url, { method: 'GET' });
  },

  create: (input: CreateCustomerInput) =>
    http<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateCustomerInput) =>
    http<Customer>(`/api/customers/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    http<{ ok: true }>(`/api/customers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

// -------- Queries --------
export function useCustomerListQuery(params: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.list(params),
  });
}

// -------- Mutations --------
export function useCreateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCustomerInput) => customerApi.create(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: customerKeys.all() });
    },
  });
}

export function useUpdateCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; input: UpdateCustomerInput }) =>
      customerApi.update(vars.id, vars.input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: customerKeys.all() });
    },
  });
}

export function useDeleteCustomerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: customerKeys.all() });
    },
  });
}
