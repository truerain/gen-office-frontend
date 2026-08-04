// apps/demo/src/pages/approval/inbox/model/types.ts
// Approval inbox domain types for the demo app.

export type ApprovalBox = 'request' | 'inbox';

export type ApprovalInboxStatus = 'pending' | 'completed' | 'rejected';

export type ApprovalDocType =
  | 'expense'
  | 'leave'
  | 'purchase'
  | 'contract'
  | 'general';

export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected' | 'waiting';

export type ApprovalStep = {
  stepNo: number;
  approverName: string;
  approverDept: string;
  status: ApprovalStepStatus;
  actedAt?: string;
  comment?: string;
};

export type ApprovalDocument = {
  docId: string;
  box: ApprovalBox;
  title: string;
  docType: ApprovalDocType;
  requesterName: string;
  requesterDept: string;
  requestedAt: string;
  status: ApprovalInboxStatus;
  currentStep: number;
  amount?: number;
  summary: string;
  body: string;
  steps: ApprovalStep[];
};

export type ApprovalInboxListParams = {
  box?: ApprovalBox;
  status?: ApprovalInboxStatus | 'all';
  q?: string;
  docType?: ApprovalDocType | '';
  fromDate?: string;
  toDate?: string;
};

export type ApprovalDecisionRequest = {
  comment?: string;
};
