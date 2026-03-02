import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/api/http';

export type CommonCodeItem = {
  lkupClssCd: string;
  code: string;
  name: string;
  sortOrder: number;
  useYn: string;
};

export function useCommonCodesQuery(lkupClssCd: string) {
  const codeClass = String(lkupClssCd ?? '').trim();

  return useQuery({
    queryKey: ['common-codes', codeClass],
    queryFn: () =>
      http<CommonCodeItem[]>(`/api/common/codes/${encodeURIComponent(codeClass)}`, {
        method: 'GET',
      }),
    enabled: codeClass.length > 0,
  });
}

