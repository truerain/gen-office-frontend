import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { GenGrid, ModalEditor, MonthEditor } from '@gen-office/gen-grid';
import type { ModalEditorSelection } from '@gen-office/gen-grid';
import styles from './DataGridPage.module.css';


type Employee = {
  id: string;
  name: string;
  dept: string;
  email: string;
};

type DemoRow = {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  status: '' | 'Open' | 'In Progress' | 'Done';
  plannedMonth: string;
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
  { id: 'T-1001', title: 'Monthly closing checklist', assigneeId: 'E1001', assigneeName: 'Olivia Harper', status: '', plannedMonth: '', updatedAt: '2026-04-01' },
  { id: 'T-1002', title: 'Prepare launch memo', assigneeId: 'E1002', assigneeName: 'Noah Kim', status: 'In Progress', plannedMonth: '2026-05', updatedAt: '2026-04-03' },
  { id: 'T-1003', title: 'Onboarding workflow review', assigneeId: 'E1003', assigneeName: 'Emma Park', status: 'Done', plannedMonth: '2026-03', updatedAt: '2026-03-29' },
  { id: 'T-1004', title: 'Grid editor QA', assigneeId: 'E1004', assigneeName: 'Liam Choi', status: 'Open', plannedMonth: '2026-06', updatedAt: '2026-04-05' },
];

const assigneeOptions: ModalEditorSelection<Employee>[] = employees.map((employee) => ({
  value: employee.id,
  label: `${employee.name} (${employee.id})`,
  description: `${employee.id} / ${employee.dept}`,
  keywords: [employee.name, employee.id, employee.dept, employee.email],
  data: employee,
}));
function DataGridPage() {
  const [rows, setRows] = useState<DemoRow[]>(initialRows);
  const [lastDateEditEvent, setLastDateEditEvent] = useState<string>('No date edit yet');

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
        id: 'status',
        header: 'Status',
        accessorKey: 'status',
        size: 140,
        meta: {
          editable: true,
          editType: 'select',
          editOptions: [
            { label: '-', value: '' },
            { label: 'Open', value: 'Open' },
            { label: 'In Progress', value: 'In Progress' },
            { label: 'Done', value: 'Done' },
          ],
          cellClassName: ({value}) => {
            if(value === 'Open') return styles.statusCell;
          },
        },
      },
      {
        id: 'assigneeId',
        header: 'Assignee',
        accessorKey: 'assigneeId',
        size: 220,
        cell: ({ row }) => {
          const { assigneeId, assigneeName } = row.original;
          return assigneeId ? `${assigneeName} (${assigneeId})` : '';
        },
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
              items={assigneeOptions}
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
              mapSelectedItemToValue={(selectedItem) => selectedItem?.value ?? ''}
              confirmOnDoubleClick={true}
              clearable={true}
              confirmLabel="Apply"
              cancelLabel="Cancel"
            />
          ),
        },
      },
      {
        id: 'plannedMonth',
        header: 'Planned Month',
        accessorKey: 'plannedMonth',
        size: 170,
        meta: {
          editable: true,
          renderEditor: (editor) => (
            <MonthEditor editor={editor} placeholder="Select month" />
          ),
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
        <div className={styles.testGuide}>
          <strong>Date edit verification</strong>
          <ol>
            <li>Direct typing: edit Updated At and press Enter.</li>
            <li>Date picker select: open calendar and choose a date.</li>
            <li>Keyboard move: edit Updated At and press Tab.</li>
          </ol>
          <p className={styles.eventText}>Last date event: {lastDateEditEvent}</p>
        </div>
        <div className={styles.gridWrap}>
          <GenGrid<DemoRow>
            data={rows}
            onDataChange={(nextRows) => {
              setRows(
                nextRows.map((row) => {
                  const employee = employees.find((item) => item.id === row.assigneeId);
                  return {
                    ...row,
                    assigneeName: employee?.name ?? '',
                  };
                })
              );
            }}
            onCellValueChange={({ rowId, columnId, value }) => {
              if (columnId !== 'updatedAt') return;
              const row = rows.find((item) => item.id === rowId);
              const prev = row?.updatedAt ?? '';
              setLastDateEditEvent(
                `${rowId} | ${prev || '(empty)'} -> ${String(value || '(empty)')}`
              );
            }}
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
            enableActiveRowHighlight={true}
            height={420}
          />
        </div>
      </section>
    </div>
  );
}

export default DataGridPage;
