import type { ColumnDef } from '@tanstack/react-table';
import type { Customer } from '../../../entities/customer/model/types';

import { Badge, Button } from '@gen-office/ui';

export function createCustomerColumns(): ColumnDef<Customer>[] {
  return [
    {
      id: 'id',
      header: '고객번호',
      accessorKey: 'id',
      meta: {
        width: 150,
        align: 'center',
        pinned: 'left',
      },
    },
    {
      id: 'name',
      header: '고객명',
      accessorKey: 'name',
      meta: {
        width: 120,
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
      meta: {
        width: 200,
        editable: true,
        editType: 'text',
        editValidator: (value: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return { valid: false, error: '올바른 이메일 형식이 아닙니다' };
          }
          return { valid: true };
        },
      },
    },
    {
      id: 'phone',
      header: '전화번호',
      accessorKey: 'phone',
      meta: {
        width: 130,
        editable: true,
        editType: 'text',
      },
    },
    {
      id: 'company',
      header: '회사',
      accessorKey: 'company',
      meta: {
        width: 150,
        editable: true,
        editType: 'text',
      },
    },
    {
      id: 'grade',
      header: '등급',
      accessorKey: 'grade',
      meta: {
        width: 100,
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
      meta: {
        width: 100,
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
      meta: {
        width: 100,
        align: 'right',
      },
      cell: ({ row }) => <span>{row.original.totalOrders.toLocaleString()}건</span>,
    },
    {
      id: 'totalSpent',
      header: '총 구매액',
      accessorKey: 'totalSpent',
      meta: {
        width: 130,
        align: 'right',
      },
      cell: ({ row }) => <span>₩{(row.original.totalSpent / 10000).toLocaleString()}만</span>,
    },
    {
      id: 'registeredAt',
      header: '가입일',
      accessorKey: 'registeredAt',
      meta: {
        width: 110,
        align: 'center',
      },
    },
    {
      id: 'lastContactAt',
      header: '최근 접촉일',
      accessorKey: 'lastContactAt',
      meta: {
        width: 120,
        align: 'center',
      },
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      enableSorting: false,
      meta: {
        system: 'actions',
        align: 'center',
        pinned: 'right',
      },
      cell: ({ row, table }) => {
        const api = (table.options.meta as any)?.genGrid as
          | { deleteRow?: (rowId: string) => void }
          | undefined;
        return (
          <Button
            type="button"
            size="sm"
            variant="danger"
            onClick={() => api?.deleteRow?.(String(row.id))}
          >
            Delete
          </Button>
        );
      },
    },
  ];
}
