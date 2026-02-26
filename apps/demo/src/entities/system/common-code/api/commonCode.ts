import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type {
  CommonCodeMaster,
  CommonCodeMasterCreateRequest,
  CommonCodeMasterKey,
  CommonCodeMasterListParams,
  CommonCodeMasterUpdateRequest,
  CommonCodeDetail,
  CommonCodeDetailCreateRequest,
  CommonCodeDetailKey,
  CommonCodeDetailListParams,
  CommonCodeDetailUpdateRequest,
  ListResponse,
} from '@/entities/system/common-code/model/types';

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

export const commonCodeKeys = {
  all: () => ['common-code'] as const,
  classList: (params: CommonCodeMasterListParams) => ['common-code', 'masters', params] as const,
  classDetail: (lkupClssCd: string) => ['common-code', 'master', lkupClssCd] as const,
  itemList: (lkupClssCd: string, params: CommonCodeDetailListParams) =>
    ['common-code', 'items', lkupClssCd, params] as const,
  itemDetail: (key: CommonCodeDetailKey) =>
    ['common-code', 'item', key.lkupClssCd, key.lkupCd] as const,
};

export const commonCodeApi = {
  listMasters: (params: CommonCodeMasterListParams = {}) => {
    const url = `/api/mis/admin/lookups/masters${buildQuery({
      lkupClssCd: params.lkupClssCd,
      lkupClssName: params.lkupClssName,
      useYn: params.useYn,
      q: params.q,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
      sort: params.sort,
    })}`;

    return http<CommonCodeMaster[] | ListResponse<CommonCodeMaster> | { items: CommonCodeMaster[] }>(url, {
      method: 'GET',
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },

  getMaster: (key: CommonCodeMasterKey) =>
    http<CommonCodeMaster>(`/api/mis/admin/lookups/masters/${toEncoded(key.lkupClssCd)}`, {
      method: 'GET',
    }),

  createMaster: (input: CommonCodeMasterCreateRequest) =>
    http<CommonCodeMaster>('/api/mis/admin/lookups/masters', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateMaster: (key: CommonCodeMasterKey, input: CommonCodeMasterUpdateRequest) =>
    http<CommonCodeMaster>(`/api/mis/admin/lookups/masters/${toEncoded(key.lkupClssCd)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  listDetails: (lkupClssCd: string, params: CommonCodeDetailListParams = {}) => {
    const url = `/api/mis/admin/lookups/${toEncoded(lkupClssCd)}/details${buildQuery({
      lkupCd: params.lkupCd,
      lkupName: params.lkupName,
      useYn: params.useYn,
      q: params.q,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
      sort: params.sort,
    })}`;

    return http<CommonCodeDetail[] | ListResponse<CommonCodeDetail> | { items: CommonCodeDetail[] }>(url, {
      method: 'GET',
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },

  getDetail: (key: CommonCodeDetailKey) =>
    http<CommonCodeDetail>(`/api/mis/admin/lookups/${toEncoded(key.lkupClssCd)}/details/${toEncoded(key.lkupCd)}`, {
      method: 'GET',
    }),

  createDetail: (lkupClssCd: string, input: CommonCodeDetailCreateRequest) =>
    http<CommonCodeDetail>(`/api/mis/admin/lookups/${toEncoded(lkupClssCd)}/details`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateDetail: (key: CommonCodeDetailKey, input: CommonCodeDetailUpdateRequest) =>
    http<CommonCodeDetail>(`/api/mis/admin/lookups/${toEncoded(key.lkupClssCd)}/details/${toEncoded(key.lkupCd)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
};

export function useCommonCodeMasterListQuery(params: CommonCodeMasterListParams) {
  return useQuery({
    queryKey: commonCodeKeys.classList(params),
    queryFn: () => commonCodeApi.listMasters(params),
  });
}

export function useCommonCodeMasterQuery(lkupClssCd: string, enabled = true) {
  return useQuery({
    queryKey: commonCodeKeys.classDetail(lkupClssCd),
    queryFn: () => commonCodeApi.getMaster({ lkupClssCd }),
    enabled,
  });
}

export function useCommonCodeDetailListQuery(
  lkupClssCd: string | undefined,
  params: CommonCodeDetailListParams,
  enabled = true
) {
  return useQuery({
    queryKey: commonCodeKeys.itemList(lkupClssCd ?? '', params),
    queryFn: () => commonCodeApi.listDetails(lkupClssCd ?? '', params),
    enabled: enabled && Boolean(lkupClssCd),
  });
}

export function useCommonCodeDetailQuery(key: CommonCodeDetailKey, enabled = true) {
  return useQuery({
    queryKey: commonCodeKeys.itemDetail(key),
    queryFn: () => commonCodeApi.getDetail(key),
    enabled,
  });
}
