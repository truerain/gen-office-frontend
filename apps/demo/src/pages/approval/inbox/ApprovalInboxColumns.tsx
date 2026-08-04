// apps/demo/src/pages/approval/inbox/ApprovalInboxColumns.tsx
// Column definitions for the approval inbox list grid.

import type { GenDataGridColumnDef } from '@gen-office/gen-datagrid';

import type { ApprovalDocument } from '@/pages/approval/inbox/model/types';

const DOC_TYPE_LABEL: Record<ApprovalDocument['docType'], string> = {
  expense: '경비',
  leave: '휴가',
  purchase: '구매',
  contract: '계약',
  general: '일반',
};

const STATUS_LABEL: Record<ApprovalDocument['status'], string> = {
  pending: '대기',
  completed: '완료',
  rejected: '반려',
};

function formatDateTime(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(value: number | undefined) {
  if (value == null) return '';
  return value.toLocaleString('ko-KR');
}

export function createApprovalInboxColumns(): GenDataGridColumnDef<ApprovalDocument, unknown>[] {
  return [
    {
      id: 'docId',
      accessorKey: 'docId',
      header: '문서번호',
      size: 140,
      meta: { align: 'left' },
    },
    {
      id: 'docType',
      accessorKey: 'docType',
      header: '유형',
      size: 80,
      cell: ({ getValue }) => DOC_TYPE_LABEL[getValue() as ApprovalDocument['docType']] ?? String(getValue() ?? ''),
      meta: { align: 'center' },
    },
    {
      id: 'title',
      accessorKey: 'title',
      header: '제목',
      size: 260,
      meta: { align: 'left' },
    },
    {
      id: 'requesterName',
      accessorKey: 'requesterName',
      header: '기안자',
      size: 100,
      meta: { align: 'center' },
    },
    {
      id: 'requesterDept',
      accessorKey: 'requesterDept',
      header: '부서',
      size: 110,
      meta: { align: 'left' },
    },
    {
      id: 'requestedAt',
      accessorKey: 'requestedAt',
      header: '기안일시',
      size: 150,
      cell: ({ getValue }) => formatDateTime(String(getValue() ?? '')),
      meta: { align: 'center' },
    },
    {
      id: 'amount',
      accessorKey: 'amount',
      header: '금액',
      size: 110,
      cell: ({ getValue }) => formatAmount(getValue() as number | undefined),
      meta: { align: 'right' },
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: '상태',
      size: 80,
      cell: ({ getValue }) => STATUS_LABEL[getValue() as ApprovalDocument['status']] ?? String(getValue() ?? ''),
      meta: { align: 'center' },
    },
    {
      id: 'currentStep',
      accessorKey: 'currentStep',
      header: '단계',
      size: 70,
      meta: { align: 'center' },
    },
  ];
}
