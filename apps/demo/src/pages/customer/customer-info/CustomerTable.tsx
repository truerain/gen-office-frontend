// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerTable.tsx
import { useMemo } from 'react';
import { DataGrid } from '@gen-office/datagrid';
import { Badge } from '@gen-office/ui';
import type { ColumnDef } from '@gen-office/datagrid';
import type { CellEditEvent } from '@gen-office/datagrid';
import type { Customer } from '../../../entities/customer/model/types';
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
        meta: {
          width: 150,
          align: 'center',
        },
      },
      {
        id: 'name',
        header: '고객명',
        accessorKey: 'name',
        meta: {
          width: 120,
          align: "center",
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
            { label: '활성', value: 'active' },
            { label: '비활성', value: 'inactive' },
            { label: '대기중', value: 'pending' },
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
        cell: ({ row }) => (
          <span>{row.original.totalOrders.toLocaleString()}건</span>
        ),
      },
      {
        id: 'totalSpent',
        header: '총 구매액',
        accessorKey: 'totalSpent',
        meta: {
          width: 130,
          align: 'right',
        },
        cell: ({ row }) => (
          <span>₩{(row.original.totalSpent / 10000).toLocaleString()}만</span>
        ),
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
    ],
    []
  );

  const handleCellEdit = (event: CellEditEvent<Customer>) => {
    console.log('Cell edited:', event);
    // TODO: API 호출하여 서버에 데이터 업데이트
    // await updateCustomer(event.row.id, { [event.columnId]: event.newValue });
  };

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
        height="100%"
        bordered="all"
        onCellEdit={handleCellEdit}
      />
    </div>
  );
}

export default CustomerTable;
