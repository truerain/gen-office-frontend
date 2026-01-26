import type { MenuListParams } from "../model/types";


function buildUrl(path: string, params?: Record<string, string | undefined>) {
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, v);
    });
  }
  return url.toString();
}


export const customerApi = {
  list: (params: MenuListParams = {}) => {
    const url = buildUrl('/api/system/menu', {
      q: params.q,
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
