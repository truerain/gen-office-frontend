import { useState } from 'react';
import { 
  DataGrid, 
  createColumnHelper, 
  createSelectionColumn,
  type DataGridColumnDef 
} from '@gen-office/datagrid';
import { Badge, Button } from '@gen-office/ui';
import type { SortingState, PaginationState, RowSelectionState } from '@tanstack/react-table';
import "@gen-office/datagrid/index.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
}

const columnHelper = createColumnHelper<User>();

export default function DataGridPage() {
  const [users] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', joinDate: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'active', joinDate: '2024-02-20' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'inactive', joinDate: '2024-03-10' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'active', joinDate: '2024-04-05' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'active', joinDate: '2024-05-12' },
    { id: 6, name: 'Eva Davis', email: 'eva@example.com', role: 'User', status: 'active', joinDate: '2024-06-18' },
    { id: 7, name: 'Frank Miller', email: 'frank@example.com', role: 'Manager', status: 'inactive', joinDate: '2024-07-22' },
    { id: 8, name: 'Grace Lee', email: 'grace@example.com', role: 'User', status: 'active', joinDate: '2024-08-30' },
  ]);

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });
  
  // Row Selection state
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  
  const selectedCount = Object.keys(rowSelection).length;
  
  const handleDeleteSelected = () => {
    const selectedUsers = users.filter((_, index) => rowSelection[index]);
    console.log('선택된 사용자:', selectedUsers);
    alert(`${selectedCount}개 항목이 선택되었습니다.`);
    setRowSelection({});
  };

  const columns: DataGridColumnDef<User>[] = [
    columnHelper.accessor('id', {
      header: 'ID',
      meta: {
        width: 80,
        align: 'right' as const,
      },
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      meta: {
        width: 200,
      },
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      meta: {
        width: 250,
      },
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      meta: {
        width: 120,
      },
      cell: (info) => {
        const role = info.getValue();
        const variant = role === 'Admin' ? 'primary' : role === 'Manager' ? 'secondary' : 'default';
        return <Badge variant={variant}>{role}</Badge>;
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      meta: {
        width: 120,
        align: 'center' as const,
      },
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge variant={status === 'active' ? 'success' : 'error'}>
            {status}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('joinDate', {
      header: 'Join Date',
      meta: {
        width: 120,
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      meta: {
        width: 150,
        align: 'center' as const,
      },
      cell: () => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <Button size="sm" variant="outline">Edit</Button>
          <Button size="sm" variant="ghost">Delete</Button>
        </div>
      ),
    }),
  ];

  // Row Selection용 컬럼 (체크박스 포함)
  const columnsWithSelection: DataGridColumnDef<User>[] = [
    createSelectionColumn<User>(),
    ...columns,
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>DataGrid Component</h1>
        <p className="subtitle">
          Powerful data grid with sorting, filtering, pagination, and virtual scrolling
        </p>
      </div>

      <div className="content">
        <section className="section">
          <h2>Basic DataGrid</h2>
          <div className="datagrid-container">
            <DataGrid
              data={users}
              columns={columns}
              height="400px"
              enableSorting={true}
              sorting={sorting}
              onSortingChange={setSorting}
              striped
              hoverable
              stickyHeader
            />
          </div>
        </section>

        <section className="section">
          <h2>DataGrid with Pagination</h2>
          <div className="datagrid-container">
            <DataGrid
              data={users}
              columns={columns}
              enablePagination={true}
              pagination={pagination}
              onPaginationChange={setPagination}
              showPagination={true}
              enableSorting={true}
              sorting={sorting}
              onSortingChange={setSorting}
              striped
              hoverable
            />
          </div>
        </section>

        <section className="section">
          <h2>Uncontrolled DataGrid (자동 모드)</h2>
          <p style={{ marginBottom: '1rem', color: 'var(--color-fg-secondary)' }}>
            State 관리 없이 자동으로 동작하는 DataGrid
          </p>
          <div className="datagrid-container">
            <DataGrid
              data={users}
              columns={columns}
              enableSorting={true}
              enablePagination={true}
              pageSize={3}
              showPagination={true}
              striped
              hoverable
            />
          </div>
        </section>

        <section className="section">
          <h2>DataGrid with Row Selection</h2>
          <p style={{ marginBottom: '1rem', color: 'var(--color-fg-secondary)' }}>
            체크박스로 행을 선택하고 일괄 작업 수행
          </p>
          
          {selectedCount > 0 && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem 1rem', 
              background: 'var(--color-brand-bg-subtle)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}>
              <span style={{ fontWeight: 500 }}>
                <strong>{selectedCount}개</strong> 항목 선택됨
              </span>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={handleDeleteSelected}
              >
                선택 항목 삭제
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setRowSelection({})}
              >
                선택 해제
              </Button>
            </div>
          )}
          
          <div className="datagrid-container">
            <DataGrid
              data={users}
              columns={columnsWithSelection}
              enableRowSelection={true}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              enableSorting={true}
              sorting={sorting}
              onSortingChange={setSorting}
              striped
              hoverable
            />
          </div>
        </section>

        <section className="section">
          <h2>Features</h2>
          <ul>
            <li>✅ Sorting (click column headers)</li>
            <li>✅ Pagination</li>
            <li>✅ Virtual scrolling for large datasets</li>
            <li>✅ Row selection</li>
            <li>✅ Sticky headers and columns</li>
            <li>✅ Custom cell rendering</li>
            <li>✅ Responsive design</li>
            <li>✅ TypeScript support</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
