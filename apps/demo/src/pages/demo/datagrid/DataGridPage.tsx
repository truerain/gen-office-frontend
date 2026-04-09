import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { GenGrid, ModalEditor } from '@gen-office/gen-grid';
import type { ModalEditorSelection } from '@gen-office/gen-grid';
import styles from './DataGridPage.module.css';

/*<ModalEditor<MyRow, UserDto>
  editor={editor}
  title="사용자 검색"
  searchPlaceholder="이름/사번"
  fetchItems={async (keyword) => {
    const list = await userApi.search({ q: keyword }); // 서버 조회
    return list.map((u) => ({
      value: String(u.userId),
      label: u.empName,
      description: `${u.empNo} · ${u.orgName}`,
      data: u,
      keywords: [u.empName, u.empNo, u.orgName],
    }));
  }}
  listColumns={[
    { key: 'name', header: '이름', render: (item) => item.label },
    { key: 'empNo', header: '사번', render: (item) => item.data?.empNo ?? '-' },
    { key: 'org', header: '조직', render: (item) => item.data?.orgName ?? '-' },
  ]}
  mapSelectedItemToValue={(selectedItem) => selectedItem?.value ?? ''}
/>*/

type Employee = {
  id: string;
  name: string;
  dept: string;
  email: string;
};

type DemoRow = {
  id: string;
  title: string;
  assignee: string;
  status: 'Open' | 'In Progress' | 'Done';
  updatedAt: string;
};

const employees: Employee[] = [
  { id: 'E1001', name: 'Olivia Harper', dept: 'Finance', email: 'olivia.harper@corp.local' },
  { id: 'E1002', name: 'Noah Kim', dept: 'Sales', email: 'noah.kim@corp.local' },
  { id: 'E1003', name: 'Emma Park', dept: 'Operations', email: 'emma.park@corp.local' },
  { id: 'E1004', name: 'Liam Choi', dept: 'Engineering', email: 'liam.choi@corp.local' },
  { id: 'E1005', name: 'Ava Lee', dept: 'HR', email: 'ava.lee@corp.local' },
];

const initialRows: DemoRow[] = [
  { id: 'T-1001', title: 'Monthly closing checklist', assignee: 'Olivia Harper', status: 'Open', updatedAt: '2026-04-01' },
  { id: 'T-1002', title: 'Prepare launch memo', assignee: 'Noah Kim', status: 'In Progress', updatedAt: '2026-04-03' },
  { id: 'T-1003', title: 'Onboarding workflow review', assignee: 'Emma Park', status: 'Done', updatedAt: '2026-03-29' },
  { id: 'T-1004', title: 'Grid editor QA', assignee: 'Liam Choi', status: 'Open', updatedAt: '2026-04-05' },
];

function toSelection(employee: Employee): ModalEditorSelection<Employee> {
  return {
    value: employee.id,
    label: `${employee.name} (${employee.id})`,
    description: `${employee.id} · ${employee.dept}`,
    keywords: [employee.name, employee.id, employee.dept, employee.email],
    data: employee,
  };
}

function fetchAssignees(keyword: string): Promise<ModalEditorSelection<Employee>[]> {
  const normalized = keyword.trim().toLowerCase();
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = employees.filter((employee) => {
        if (!normalized) return true;
        return (
          employee.name.toLowerCase().includes(normalized) ||
          employee.id.toLowerCase().includes(normalized) ||
          employee.dept.toLowerCase().includes(normalized) ||
          employee.email.toLowerCase().includes(normalized)
        );
      });
      resolve(filtered.map((employee) => toSelection(employee)));
    }, 200);
  });
}

function DataGridPage() {
  const [rows, setRows] = useState<DemoRow[]>(initialRows);

  const columns = useMemo<ColumnDef<DemoRow>[]>(
    () => [
      {
        id: 'id',
        header: 'Task ID',
        accessorKey: 'id',
        size: 110,
        meta: {
          editable: false,
          mono: true,
        },
      },
      {
        id: 'title',
        header: 'Task Title',
        accessorKey: 'title',
        size: 320,
        meta: {
          editable: true,
          editType: 'text',
        },
      },
      {
        id: 'assignee',
        header: 'Assignee',
        accessorKey: 'assignee',
        size: 220,
        meta: {
          editable: true,
          renderEditor: (editor) => (
            <ModalEditor<DemoRow, Employee>
              editor={editor}
              mode="single"
              title="Search Assignee"
              placeholder="Select assignee"
              searchPlaceholder="Type name, id, department..."
              modalHeight={320}
              fetchItems={fetchAssignees}
              searchOnInputChange={true}
              listColumns={[
                {
                  key: 'name',
                  header: 'Name',
                  width: 'minmax(180px, 1.5fr)',
                  render: (item) => item.data?.name ?? item.label,
                },
                {
                  key: 'empId',
                  header: 'Employee ID',
                  width: 'minmax(110px, 0.8fr)',
                  render: (item) => item.value,
                },
                {
                  key: 'dept',
                  header: 'Department',
                  width: 'minmax(140px, 1fr)',
                  render: (item) => item.data?.dept ?? '-',
                },
              ]}
              mapSelectedItemToValue={(selectedItem) => selectedItem?.label ?? ''}
              confirmOnDoubleClick={true}
            />
          ),
        },
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 140,
        meta: {
          editable: true,
          editType: 'select',
          editOptions: [
            { label: 'Open', value: 'Open' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Done', value: 'Done' },
          ],
        },
      },
      {
        id: 'updatedAt',
        header: 'Updated At',
        accessorKey: 'updatedAt',
        size: 150,
        meta: {
          editable: true,
          editType: 'date',
        },
      },
    ],
    []
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>DataGrid Component</h1>
        <p>GenGrid editor sample using ModalEditor. Double-click the Assignee cell to open modal search.</p>
      </div>

      <section className={styles.section}>
        <h2>GenGrid + ModalEditor</h2>
        <div className={styles.gridWrap}>
          <GenGrid<DemoRow>
            data={rows}
            onDataChange={setRows}
            columns={columns}
            getRowId={(row) => row.id}
            dataVersion={rows.length}
            rowHeight={36}
            enablePinning={true}
            enableColumnSizing={true}
            enableVirtualization={true}
            enableRowNumber={true}
            checkboxSelection={true}
            editOnActiveCell={false}
            keepEditingOnNavigate={true}
            noRowsMessage="No tasks"
            height={420}
          />
        </div>
      </section>
    </div>
  );
}

export default DataGridPage;
