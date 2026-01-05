// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerTable.tsx
import { useMemo } from 'react';
import { DataGrid } from '@gen-office/datagrid';
import { Badge } from '@gen-office/ui';
import type { ColumnDef } from '@gen-office/datagrid';
import type { Customer } from '../../../../features/customer/types/customer.types';
import styles from './CustomerTable.module.css';

interface CustomerTableProps {
  data: Customer[];
  loading?: boolean;
}

function CustomerTable({ data, loading }: CustomerTableProps) {
  const columns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        id: 'id',
        header: '고객번호',
        accessorKey: 'id',
        width: 120,
      },
      {
        id: 'name',
        header: '고객명',
        accessorKey: 'name',
        width: 120,
      },
      {
        id: 'email',
        header: '이메일',
        accessorKey: 'email',
        width: 200,
      },
      {
        id: 'phone',
        header: '전화번호',
        accessorKey: 'phone',
        width: 130,
      },
      {
        id: 'company',
        header: '회사',
        accessorKey: 'company',
        width: 150,
      },
      {
        id: 'grade',
        header: '등급',
        accessorKey: 'grade',
        width: 100,
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
        width: 100,
        cell: ({ row }) => {
          const status = row.original.status;
          const statusConfig = {
            active: { label: '활성', variant: 'success' as const },
            inactive: { label: '비활성', variant: 'secondary' as const },
            pending: { label: '대기중', variant: 'warning' as const },
          };
          
          const config = statusConfig[status];
          return <Badge variant={config.variant}>{config.label}</Badge>;
        },
      },
      {
        id: 'totalOrders',
        header: '주문수',
        accessorKey: 'totalOrders',
        width: 100,
        cell: ({ row }) => (
          <span>{row.original.totalOrders.toLocaleString()}건</span>
        ),
      },
      {
        id: 'totalSpent',
        header: '총 구매액',
        accessorKey: 'totalSpent',
        width: 130,
        cell: ({ row }) => (
          <span>₩{(row.original.totalSpent / 10000).toLocaleString()}만</span>
        ),
      },
      {
        id: 'registeredAt',
        header: '가입일',
        accessorKey: 'registeredAt',
        width: 110,
      },
      {
        id: 'lastContactAt',
        header: '최근 접촉일',
        accessorKey: 'lastContactAt',
        width: 120,
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <DataGrid
        data={data}
        columns={columns}
        enableSorting
        enableFiltering
        enableRowSelection
        pageSize={10}
      />
    </div>
  );
}

export default CustomerTable;