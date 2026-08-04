// apps/demo/src/pages/approval/inbox/api/approvalInbox.ts
// React Query API client for approval inbox.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { http } from '@/shared/api/http';
import type {
  ApprovalDecisionRequest,
  ApprovalDocument,
  ApprovalInboxListParams,
} from '@/pages/approval/inbox/model/types';

function buildQuery(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const query = sp.toString();
  return query ? `?${query}` : '';
}

export const approvalInboxKeys = {
  all: () => ['approval-inbox'] as const,
  list: (params: ApprovalInboxListParams) => ['approval-inbox', 'list', params] as const,
  detail: (docId: string) => ['approval-inbox', 'detail', docId] as const,
};

export const approvalInboxApi = {
  list: (params: ApprovalInboxListParams = {}) => {
    const url = `/api/approvals${buildQuery({
      box: params.box,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      q: params.q,
      docType: params.docType || undefined,
      fromDate: params.fromDate,
      toDate: params.toDate,
    })}`;

    return http<ApprovalDocument[] | { items: ApprovalDocument[] }>(url, { method: 'GET' }).then(
      (res) => (Array.isArray(res) ? res : res.items ?? [])
    );
  },

  get: (docId: string) =>
    http<ApprovalDocument>(`/api/approvals/${encodeURIComponent(docId)}`, {
      method: 'GET',
    }),

  approve: (docId: string, input: ApprovalDecisionRequest = {}) =>
    http<ApprovalDocument>(`/api/approvals/${encodeURIComponent(docId)}/approve`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  reject: (docId: string, input: ApprovalDecisionRequest) =>
    http<ApprovalDocument>(`/api/approvals/${encodeURIComponent(docId)}/reject`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};

export function useApprovalInboxListQuery(params: ApprovalInboxListParams) {
  return useQuery({
    queryKey: approvalInboxKeys.list(params),
    queryFn: () => approvalInboxApi.list(params),
  });
}

export function useApprovalInboxDetailQuery(docId: string | null, enabled = true) {
  return useQuery({
    queryKey: approvalInboxKeys.detail(docId ?? ''),
    queryFn: () => approvalInboxApi.get(docId!),
    enabled: Boolean(docId) && enabled,
  });
}

export function useApprovalDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      docId: string;
      decision: 'approve' | 'reject';
      comment?: string;
    }) => {
      if (args.decision === 'approve') {
        return approvalInboxApi.approve(args.docId, { comment: args.comment });
      }
      return approvalInboxApi.reject(args.docId, { comment: args.comment ?? '' });
    },
    onSuccess: async (doc) => {
      await queryClient.invalidateQueries({ queryKey: approvalInboxKeys.all() });
      queryClient.setQueryData(approvalInboxKeys.detail(doc.docId), doc);
    },
  });
}
