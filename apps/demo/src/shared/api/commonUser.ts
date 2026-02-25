import { http } from '@/shared/api/http';

export type CommonUser = {
  userId: number;
  empNo?: string;
  empName?: string;
  titleCd?: string;
  titleName?: string;
  orgId?: string;
  orgName?: string;
};

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

export const commonUserApi = {
  list: (params: { q?: string } = {}) =>
    http<CommonUser[]>(`/api/common/users${buildQuery({ q: params.q })}`, {
      method: 'GET',
    }),
};

