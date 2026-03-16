import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type { CoActual, CoActualsListParams } from '@/pages/co/actuals/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

export const coActualsKeys = {
  all: () => ['co-actuals'] as const,
  list: (params: CoActualsListParams) => ['co-actuals', 'list', params] as const,
};

export const coActualsApi = {
  list: (params: CoActualsListParams = {}) => {
    const url = `/api/co/actuals${buildQuery({
      fiscalYr: params.fiscalYr,
      fiscalPrd: params.fiscalPrd,
      orgCd: params.orgCd,
      acctCd: params.acctCd,
    })}`;
    return http<CoActual[]>(url, { method: 'GET' });
  },
};

export function useCoActualsListQuery(params: CoActualsListParams) {
  return useQuery({
    queryKey: coActualsKeys.list(params),
    queryFn: () => coActualsApi.list(params),
  });
}
