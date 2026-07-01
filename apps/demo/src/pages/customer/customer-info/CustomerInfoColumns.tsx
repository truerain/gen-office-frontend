import type { GenDataGridColumnDef } from '@gen-office/gen-datagrid';
import type { Customer } from './model/types';

import { Badge } from '@gen-office/ui';

export function createCustomerColumns(): GenDataGridColumnDef<Customer>[] {
  return [
    {
      id: 'id',
      header: '고객번호',
      accessorKey: 'id',
      size: 150,
      meta: {
        align: 'center',
      },
    },
    {
      id: 'name',
      header: '고객명',
      accessorKey: 'name',
      size: 120,
      meta: {
        align: 'center',
        editable: true,
        editType: 'text',
        editPlaceholder: '이름 입력',
      },
    },
    {
      id: 'email',
      header: '이메일',
      accessorKey: 'email',
      size: 200,
      meta: {
        editable: true,
        editType: 'text',
      },
    },
    {
      id: 'phone',
      header: '전화번호',
      accessorKey: 'phone',
      size: 130,
      meta: {
        editable: true,
        editType: 'text',
      },
    },
    {
      id: 'company',
      header: '회사',
      accessorKey: 'company',
      size: 150,
      meta: {
        editable: true,
        editType: 'text',
      },
    },
    {
      id: 'grade',
      header: '등급',
      accessorKey: 'grade',
      size: 100,
      meta: {
        align: 'center',
        editable: true,
        editType: 'select',
        editOptions: [
          { label: 'Platinum', value: 'platinum' },
          { label: 'Gold', value: 'gold' },
          { label: 'Silver', value: 'silver' },
          { label: 'Bronze', value: 'bronze' },
        ],
      },
      cell: ({ row }) => {
        const grade = row.original.grade;
        const gradeConfig = {
          platinum: { label: 'Platinum', variant: 'info' as const },
          gold: { label: 'Gold', variant: 'warning' as const },
          silver: { label: 'Silver', variant: 'secondary' as const },
          bronze: { label: 'Bronze', variant: 'secondary' as const },
        };

        const config = gradeConfig[grade];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: 'status',
      header: '상태',
      accessorKey: 'status',
      size: 100,
      meta: {
        align: 'center',
        editable: true,
        editType: 'select',
        editOptions: [
          { label: '활성', value: 'ACTIVE' },
          { label: '비활성', value: 'INACTIVE' },
          { label: '대기중', value: 'PENDING' },
        ],
      },
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          ACTIVE: { label: '활성', variant: 'success' as const },
          INACTIVE: { label: '비활성', variant: 'secondary' as const },
          PENDING: { label: '대기중', variant: 'warning' as const },
        };

        const config = statusConfig[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: 'totalOrders',
      header: '주문수',
      accessorKey: 'totalOrders',
      size: 100,
      meta: {
        align: 'right',
      },
      cell: ({ row }) => <span>{row.original.totalOrders.toLocaleString()}건</span>,
    },
    {
      id: 'totalSpent',
      header: '총 구매액',
      accessorKey: 'totalSpent',
      size: 130,
      meta: {
        align: 'right',
      },
      cell: ({ row }) => <span>₩{(row.original.totalSpent / 10000).toLocaleString()}만</span>,
    },
    {
      id: 'registeredAt',
      header: '가입일',
      accessorKey: 'registeredAt',
      size: 120,
      meta: {
        editable: true,
        editType: 'date',
        align: 'center',
      },
    },
    {
      id: 'lastContactAt',
      header: '최근 접촉일',
      accessorKey: 'lastContactAt',
      size: 120,
      meta: {
        align: 'center',
      },
    },
  ];
}
