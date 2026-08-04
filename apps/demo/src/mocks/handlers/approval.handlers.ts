// apps/demo/src/mocks/handlers/approval.handlers.ts
// MSW handlers for approval inbox list/detail and decisions.

import { http, HttpResponse } from 'msw';

import { mockApprovalDocuments } from '@/mocks/data/approvalInbox';
import type {
  ApprovalBox,
  ApprovalDecisionRequest,
  ApprovalDocument,
  ApprovalInboxStatus,
} from '@/pages/approval/inbox/model/types';

function parseStatus(value: string | null): ApprovalInboxStatus | 'all' {
  if (value === 'pending' || value === 'completed' || value === 'rejected' || value === 'all') {
    return value;
  }
  return 'all';
}

function parseBox(value: string | null): ApprovalBox | 'all' {
  if (value === 'request' || value === 'inbox') return value;
  return 'all';
}

function applyDecision(
  doc: ApprovalDocument,
  decision: 'approve' | 'reject',
  comment: string
): ApprovalDocument {
  const now = new Date().toISOString();
  const steps = doc.steps.map((step) => {
    if (step.stepNo !== doc.currentStep) return step;
    return {
      ...step,
      status: decision === 'approve' ? ('approved' as const) : ('rejected' as const),
      actedAt: now,
      comment: comment || step.comment,
    };
  });

  if (decision === 'reject') {
    return {
      ...doc,
      status: 'rejected',
      steps,
    };
  }

  const nextPending = steps.find((step) => step.status === 'waiting' || step.status === 'pending');
  if (!nextPending) {
    return {
      ...doc,
      status: 'completed',
      currentStep: steps[steps.length - 1]?.stepNo ?? doc.currentStep,
      steps,
    };
  }

  const advancedSteps = steps.map((step) => {
    if (step.stepNo !== nextPending.stepNo) return step;
    return { ...step, status: 'pending' as const };
  });

  return {
    ...doc,
    status: 'pending',
    currentStep: nextPending.stepNo,
    steps: advancedSteps,
  };
}

export const approvalHandlers = [
  http.get('/api/approvals', ({ request }) => {
    const url = new URL(request.url);
    const box = parseBox(url.searchParams.get('box'));
    const status = parseStatus(url.searchParams.get('status'));
    const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
    const docType = (url.searchParams.get('docType') ?? '').trim();
    const fromDate = (url.searchParams.get('fromDate') ?? '').trim();
    const toDate = (url.searchParams.get('toDate') ?? '').trim();

    let items = mockApprovalDocuments.slice();
    if (box !== 'all') {
      items = items.filter((doc) => doc.box === box);
    }
    if (status !== 'all') {
      items = items.filter((doc) => doc.status === status);
    }
    if (docType) {
      items = items.filter((doc) => doc.docType === docType);
    }
    if (q) {
      items = items.filter((doc) => {
        return (
          doc.docId.toLowerCase().includes(q) ||
          doc.title.toLowerCase().includes(q) ||
          doc.requesterName.toLowerCase().includes(q) ||
          doc.summary.toLowerCase().includes(q)
        );
      });
    }
    if (fromDate) {
      items = items.filter((doc) => doc.requestedAt.slice(0, 10) >= fromDate);
    }
    if (toDate) {
      items = items.filter((doc) => doc.requestedAt.slice(0, 10) <= toDate);
    }

    items.sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
    return HttpResponse.json(items);
  }),

  http.get('/api/approvals/:docId', ({ params }) => {
    const docId = String(params.docId ?? '');
    const found = mockApprovalDocuments.find((doc) => doc.docId === docId);
    if (!found) return new HttpResponse('not found', { status: 404 });
    return HttpResponse.json(found);
  }),

  http.post('/api/approvals/:docId/approve', async ({ params, request }) => {
    const docId = String(params.docId ?? '');
    const idx = mockApprovalDocuments.findIndex((doc) => doc.docId === docId);
    if (idx < 0) return new HttpResponse('not found', { status: 404 });

    const current = mockApprovalDocuments[idx]!;
    if (current.box !== 'inbox' || current.status !== 'pending') {
      return new HttpResponse('document is not pending inbox item', { status: 409 });
    }

    const body = (await request.json().catch(() => ({}))) as ApprovalDecisionRequest;
    const next = applyDecision(current, 'approve', String(body.comment ?? '').trim());
    mockApprovalDocuments[idx] = next;
    return HttpResponse.json(next);
  }),

  http.post('/api/approvals/:docId/reject', async ({ params, request }) => {
    const docId = String(params.docId ?? '');
    const idx = mockApprovalDocuments.findIndex((doc) => doc.docId === docId);
    if (idx < 0) return new HttpResponse('not found', { status: 404 });

    const current = mockApprovalDocuments[idx]!;
    if (current.box !== 'inbox' || current.status !== 'pending') {
      return new HttpResponse('document is not pending inbox item', { status: 409 });
    }

    const body = (await request.json().catch(() => ({}))) as ApprovalDecisionRequest;
    const comment = String(body.comment ?? '').trim();
    if (!comment) {
      return new HttpResponse('comment is required for reject', { status: 400 });
    }

    const next = applyDecision(current, 'reject', comment);
    mockApprovalDocuments[idx] = next;
    return HttpResponse.json(next);
  }),
];
