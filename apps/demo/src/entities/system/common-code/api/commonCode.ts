import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';
import type {
  CommonCodeClass,
  CommonCodeClassCreateRequest,
  CommonCodeClassKey,
  CommonCodeClassListParams,
  CommonCodeClassUpdateRequest,
  CommonCodeItem,
  CommonCodeItemCreateRequest,
  CommonCodeItemKey,
  CommonCodeItemListParams,
  CommonCodeItemUpdateRequest,
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
  classList: (params: CommonCodeClassListParams) => ['common-code', 'classes', params] as const,
  classDetail: (lkupClssCd: string) => ['common-code', 'class', lkupClssCd] as const,
  itemList: (lkupClssCd: string, params: CommonCodeItemListParams) =>
    ['common-code', 'items', lkupClssCd, params] as const,
  itemDetail: (key: CommonCodeItemKey) =>
    ['common-code', 'item', key.lkupClssCd, key.lkupCd] as const,
};

export const commonCodeApi = {
  listClasses: (params: CommonCodeClassListParams = {}) => {
    const url = `/api/mis/admin/lookups/classes${buildQuery({
      lkupClssCd: params.lkupClssCd,
      lkupClssName: params.lkupClssName,
      useYn: params.useYn,
      q: params.q,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
      sort: params.sort,
    })}`;

    return http<CommonCodeClass[] | ListResponse<CommonCodeClass> | { items: CommonCodeClass[] }>(url, {
      method: 'GET',
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },

  getClass: (key: CommonCodeClassKey) =>
    http<CommonCodeClass>(`/api/mis/admin/lookups/classes/${toEncoded(key.lkupClssCd)}`, {
      method: 'GET',
    }),

  createClass: (input: CommonCodeClassCreateRequest) =>
    http<CommonCodeClass>('/api/mis/admin/lookups/classes', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateClass: (key: CommonCodeClassKey, input: CommonCodeClassUpdateRequest) =>
    http<CommonCodeClass>(`/api/mis/admin/lookups/classes/${toEncoded(key.lkupClssCd)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  listItems: (lkupClssCd: string, params: CommonCodeItemListParams = {}) => {
    const url = `/api/mis/admin/lookups/${toEncoded(lkupClssCd)}/items${buildQuery({
      lkupCd: params.lkupCd,
      lkupName: params.lkupName,
      useYn: params.useYn,
      q: params.q,
      page: params.page != null ? String(params.page) : undefined,
      size: params.size != null ? String(params.size) : undefined,
      sort: params.sort,
    })}`;

    return http<CommonCodeItem[] | ListResponse<CommonCodeItem> | { items: CommonCodeItem[] }>(url, {
      method: 'GET',
    }).then((res) => (Array.isArray(res) ? res : res.items ?? []));
  },

  getItem: (key: CommonCodeItemKey) =>
    http<CommonCodeItem>(`/api/mis/admin/lookups/${toEncoded(key.lkupClssCd)}/items/${toEncoded(key.lkupCd)}`, {
      method: 'GET',
    }),

  createItem: (lkupClssCd: string, input: CommonCodeItemCreateRequest) =>
    http<CommonCodeItem>(`/api/mis/admin/lookups/${toEncoded(lkupClssCd)}/items`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updateItem: (key: CommonCodeItemKey, input: CommonCodeItemUpdateRequest) =>
    http<CommonCodeItem>(`/api/mis/admin/lookups/${toEncoded(key.lkupClssCd)}/items/${toEncoded(key.lkupCd)}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
};

export function useCommonCodeClassListQuery(params: CommonCodeClassListParams) {
  return useQuery({
    queryKey: commonCodeKeys.classList(params),
    queryFn: () => commonCodeApi.listClasses(params),
  });
}

export function useCommonCodeClassQuery(lkupClssCd: string, enabled = true) {
  return useQuery({
    queryKey: commonCodeKeys.classDetail(lkupClssCd),
    queryFn: () => commonCodeApi.getClass({ lkupClssCd }),
    enabled,
  });
}

export function useCommonCodeItemListQuery(
  lkupClssCd: string | undefined,
  params: CommonCodeItemListParams,
  enabled = true
) {
  return useQuery({
    queryKey: commonCodeKeys.itemList(lkupClssCd ?? '', params),
    queryFn: () => commonCodeApi.listItems(lkupClssCd ?? '', params),
    enabled: enabled && Boolean(lkupClssCd),
  });
}

export function useCommonCodeItemQuery(key: CommonCodeItemKey, enabled = true) {
  return useQuery({
    queryKey: commonCodeKeys.itemDetail(key),
    queryFn: () => commonCodeApi.getItem(key),
    enabled,
  });
}
