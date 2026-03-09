import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type {
  LkupMaster,
  LkupMasterCreateRequest,
  LkupMasterKey,
  LkupMasterListParams,
  LkupMasterUpdateRequest,
  LkupDetail,
  LkupDetailCreateRequest,
  LkupDetailKey,
  LkupDetailListParams,
  LkupDetailUpdateRequest,
  ListResponse,
} from '@/pages/admin/lkup/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

const toEncoded = (value: string) => encodeURIComponent(value);

export const LkupKeys = {
  all: () => ['common-code'] as const,
  classList: (params: LkupMasterListParams) => ['common-code', 'masters', params] as const,
  classDetail: (lkupClssCd: string) => ['common-code', 'master', lkupClssCd] as const,
  itemList: (lkupClssCd: string, params: LkupDetailListParams) =>
    ['common-code', 'items', lkupClssCd, params] as const,
  itemDetail: (key: LkupDetailKey) =>
    ['common-code', 'item', key.lkupClssCd, key.lkupCd] as const,
};

export const LkupApi = {
  listMasters: (params: LkupMasterListParams = {}) => {
    const url = `/api/mis/admin/lookups/masters${buildQuery({
      lkupClssCd: params.lkupClssCd,
      lkupClssName: params.lkupClssName,
      useYn: params.useYn,
      q: params.q,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
      sort: params.sort,
    })}`;

    return http<LkupMaster[] | ListResponse<LkupMaster> | { items: LkupMaster[] }>(url, {
      method: 'GET',
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },

  getMaster: (key: LkupMasterKey) =>
    http<LkupMaster>(`/api/mis/admin/lookups/masters/${toEncoded(key.lkupClssCd)}`, {
      method: 'GET',
    }),

  createMaster: (input: LkupMasterCreateRequest) =>
    http<LkupMaster>('/api/mis/admin/lookups/masters', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateMaster: (key: LkupMasterKey, input: LkupMasterUpdateRequest) =>
    http<LkupMaster>(`/api/mis/admin/lookups/masters/${toEncoded(key.lkupClssCd)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  bulkCommitMasters: (input: {
    creates: LkupMasterCreateRequest[];
    updates: Array<{ lkupClssCd: string; input: LkupMasterUpdateRequest }>;
    deletes: string[];
  }) =>
    http<{ created: number; updated: number; deleted: number }>('/api/mis/admin/lookups/masters/bulk', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  listDetails: (lkupClssCd: string, params: LkupDetailListParams = {}) => {
    const url = `/api/mis/admin/lookups/${toEncoded(lkupClssCd)}/details${buildQuery({
      lkupCd: params.lkupCd,
      lkupName: params.lkupName,
      useYn: params.useYn,
      q: params.q,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
      sort: params.sort,
    })}`;

    return http<LkupDetail[] | ListResponse<LkupDetail> | { items: LkupDetail[] }>(url, {
      method: 'GET',
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },

  getDetail: (key: LkupDetailKey) =>
    http<LkupDetail>(`/api/mis/admin/lookups/${toEncoded(key.lkupClssCd)}/details/${toEncoded(key.lkupCd)}`, {
      method: 'GET',
    }),

  createDetail: (lkupClssCd: string, input: LkupDetailCreateRequest) =>
    http<LkupDetail>(`/api/mis/admin/lookups/${toEncoded(lkupClssCd)}/details`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateDetail: (key: LkupDetailKey, input: LkupDetailUpdateRequest) =>
    http<LkupDetail>(`/api/mis/admin/lookups/${toEncoded(key.lkupClssCd)}/details/${toEncoded(key.lkupCd)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  bulkCommitDetails: (
    lkupClssCd: string,
    input: {
      creates: LkupDetailCreateRequest[];
      updates: Array<{ lkupCd: string; input: LkupDetailUpdateRequest }>;
      deletes: string[];
    }
  ) =>
    http<{ created: number; updated: number; deleted: number }>(
      `/api/mis/admin/lookups/${toEncoded(lkupClssCd)}/details/bulk`,
      {
        method: 'POST',
        body: JSON.stringify(input),
      }
    ),
};

export function useLkupMasterListQuery(params: LkupMasterListParams) {
  return useQuery({
    queryKey: LkupKeys.classList(params),
    queryFn: () => LkupApi.listMasters(params),
  });
}

export function useLkupMasterQuery(lkupClssCd: string, enabled = true) {
  return useQuery({
    queryKey: LkupKeys.classDetail(lkupClssCd),
    queryFn: () => LkupApi.getMaster({ lkupClssCd }),
    enabled,
  });
}

export function useLkupDetailListQuery(
  lkupClssCd: string | undefined,
  params: LkupDetailListParams,
  enabled = true
) {
  return useQuery({
    queryKey: LkupKeys.itemList(lkupClssCd ?? '', params),
    queryFn: () => LkupApi.listDetails(lkupClssCd ?? '', params),
    enabled: enabled && Boolean(lkupClssCd),
  });
}

export function useLkupDetailQuery(key: LkupDetailKey, enabled = true) {
  return useQuery({
    queryKey: LkupKeys.itemDetail(key),
    queryFn: () => LkupApi.getDetail(key),
    enabled,
  });
}
