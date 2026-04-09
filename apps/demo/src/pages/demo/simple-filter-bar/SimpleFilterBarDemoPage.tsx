import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ModalInput,
  SimpleFilterBar,
  type FilterField,
  type ModalInputSelection,
} from '@gen-office/ui';
import styles from './SimpleFilterBarDemoPage.module.css';

type EmployeeData = {
  name: string;
  dept: string;
  email: string;
};

type DemoFilters = {
  keyword: string;
  status: string;
  statusList: string[];
  assigneeId: string;
  assigneeIds: string[];
};

const ALL_STATUS = 'ALL';

const defaultFilters: DemoFilters = {
  keyword: '',
  status: ALL_STATUS,
  statusList: [],
  assigneeId: '',
  assigneeIds: [],
};

const employeeItems: ModalInputSelection<EmployeeData>[] = [
  {
    value: 'E1001',
    label: 'Olivia Harper (E1001)',
    description: 'Finance',
    data: { name: 'Olivia Harper', dept: 'Finance', email: 'olivia.harper@corp.local' },
    keywords: ['finance', 'olivia'],
  },
  {
    value: 'E1002',
    label: 'Noah Kim (E1002)',
    description: 'Sales',
    data: { name: 'Noah Kim', dept: 'Sales', email: 'noah.kim@corp.local' },
    keywords: ['sales', 'noah'],
  },
  {
    value: 'E1003',
    label: 'Emma Park (E1003)',
    description: 'Operations',
    data: { name: 'Emma Park', dept: 'Operations', email: 'emma.park@corp.local' },
    keywords: ['operations', 'emma'],
  },
  {
    value: 'E1004',
    label: 'Liam Choi (E1004)',
    description: 'Engineering',
    data: { name: 'Liam Choi', dept: 'Engineering', email: 'liam.choi@corp.local' },
    keywords: ['engineering', 'liam'],
  },
];

function fetchEmployeeItems(keyword: string): Promise<ModalInputSelection<EmployeeData>[]> {
  const normalized = keyword.trim().toLowerCase();
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!normalized) {
        resolve(employeeItems);
        return;
      }
      resolve(
        employeeItems.filter((item) => {
          const text = [
            item.value,
            item.label,
            item.description ?? '',
            item.data?.dept ?? '',
            ...(item.keywords ?? []),
          ]
            .join(' ')
            .toLowerCase();
          return text.includes(normalized);
        })
      );
    }, 200);
  });
}

type DemoRow = {
  id: string;
  title: string;
  status: string;
  assigneeId: string;
};

const demoRows: DemoRow[] = [
  { id: 'DOC-1001', title: 'Budget report', status: 'ACTIVE', assigneeId: 'E1001' },
  { id: 'DOC-1002', title: 'Sales summary', status: 'PENDING', assigneeId: 'E1002' },
  { id: 'DOC-1003', title: 'Hiring plan', status: 'ARCHIVED', assigneeId: 'E1003' },
  { id: 'DOC-1004', title: 'Infra migration', status: 'ACTIVE', assigneeId: 'E1004' },
  { id: 'DOC-1005', title: 'Q2 operations', status: 'PENDING', assigneeId: 'E1003' },
];

function fetchDemoRows(filters: DemoFilters): Promise<DemoRow[]> {
  const keyword = filters.keyword.trim().toLowerCase();
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        demoRows.filter((row) => {
          const matchKeyword =
            !keyword ||
            row.id.toLowerCase().includes(keyword) ||
            row.title.toLowerCase().includes(keyword);
          const matchStatus = filters.status === ALL_STATUS || row.status === filters.status;
          const matchStatusMulti =
            filters.statusList.length === 0 || filters.statusList.includes(row.status);
          const matchAssigneeSingle = !filters.assigneeId || row.assigneeId === filters.assigneeId;
          const matchAssigneeMulti =
            filters.assigneeIds.length === 0 || filters.assigneeIds.includes(row.assigneeId);
          return (
            matchKeyword &&
            matchStatus &&
            matchStatusMulti &&
            matchAssigneeSingle &&
            matchAssigneeMulti
          );
        })
      );
    }, 250);
  });
}

function SimpleFilterBarDemoPage() {
  const [draftFilters, setDraftFilters] = useState<DemoFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<DemoFilters>(defaultFilters);
  const [rows, setRows] = useState<DemoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const requestSeqRef = useRef(0);

  const filterFields = useMemo<FilterField<DemoFilters>[]>(() => {
    return [
      {
        key: 'keyword',
        title: 'Keyword',
        type: 'search',
        placeholder: 'Type keyword',
        enterToSearch: true,
        flex: 1,
      },
      {
        key: 'status',
        title: 'Status',
        type: 'select',
        placeholder: 'Select status',
        options: [
          { label: 'All', value: ALL_STATUS },
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        width: '180px',
        flex: 0,
      },
      {
        key: 'statusList',
        title: 'Status (Multi)',
        type: 'multi-combo',
        placeholder: 'Select statuses',
        options: [
          { label: 'Active', value: 'ACTIVE' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Archived', value: 'ARCHIVED' },
        ],
        width: '220px',
        flex: 0,
      },
      {
        key: 'assigneeId',
        title: 'Assignee (Single)',
        type: 'custom',
        width: '320px',
        flex: 0,
        render: (value, onChange) => {
          const selected =
            employeeItems.find((item) => item.value === String(value ?? '')) ?? null;
          return (
            <ModalInput<EmployeeData>
              mode="single"
              placeholder="Select assignee"
              title="Select Assignee"
              searchPlaceholder="Search by name, id, department"
              fetchItems={fetchEmployeeItems}
              readOnly={false}
              openOnInputFocus={true}
              searchOnInputChange={true}
              selectedItem={selected}
              onSelectedItemChange={(selectedItem) => onChange(selectedItem?.value ?? '')}
              modalHeight={360}
              listColumns={[
                { key: 'id', header: 'ID', width: '96px', render: (item) => item.value },
                {
                  key: 'name',
                  header: 'Name',
                  width: '1.5fr',
                  render: (item) => item.data?.name ?? item.label,
                },
                {
                  key: 'dept',
                  header: 'Department',
                  width: '1fr',
                  render: (item) => item.data?.dept ?? '-',
                },
              ]}
              confirmLabel='확인'
              fullWidth
            />
          );
        },
      },
      {
        key: 'assigneeIds',
        title: 'Assignees (Multi)',
        type: 'custom',
        width: '360px',
        flex: 0,
        render: (value, onChange) => {
          const selectedItems = employeeItems.filter((item) =>
            Array.isArray(value) ? value.includes(item.value) : false
          );
          return (
            <ModalInput<EmployeeData>
              mode="multi"
              placeholder="Select assignees"
              title="Select Assignees"
              searchPlaceholder="Search by name, id, department"
              fetchItems={fetchEmployeeItems}
              readOnly={true}
              selectedItems={selectedItems}
              onSelectedItemsChange={(nextItems) => onChange(nextItems.map((item) => item.value))}
              modalHeight={360}
              listColumns={[
                { key: 'id', header: 'ID', width: '96px', render: (item) => item.value },
                {
                  key: 'name',
                  header: 'Name',
                  width: '1.5fr',
                  render: (item) => item.data?.name ?? item.label,
                },
                {
                  key: 'dept',
                  header: 'Department',
                  width: '1fr',
                  render: (item) => item.data?.dept ?? '-',
                },
              ]}
              fullWidth
            />
          );
        },
      },
    ];
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const requestId = ++requestSeqRef.current;
      setLoading(true);
      setAppliedFilters(draftFilters);
      void fetchDemoRows(draftFilters)
        .then((nextRows) => {
          if (requestSeqRef.current !== requestId) return;
          setRows(nextRows);
        })
        .finally(() => {
          if (requestSeqRef.current === requestId) {
            setLoading(false);
          }
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [draftFilters]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>SimpleFilterBar Demo</h1>
        <p>Declarative filter fields with built-in search/select and custom render support.</p>
      </div>

      <section className={styles.section}>
        <h2>With ModalInput Custom Field</h2>
        <div className={styles.card}>
          <SimpleFilterBar
            value={draftFilters}
            fields={filterFields}
            onChange={setDraftFilters}
            onSearch={() => {
              // Keep onSearch for explicit Enter/button trigger.
              setDraftFilters((prev) => ({ ...prev }));
            }}
            searchLabel="Search"
          />
          <div className={styles.meta}>Draft: {JSON.stringify(draftFilters)}</div>
          <div className={styles.meta}>Applied: {JSON.stringify(appliedFilters)}</div>
          <div className={styles.meta}>Loading: {loading ? 'true' : 'false'}</div>
          <div className={styles.result}>
            {rows.map((row) => (
              <div key={row.id} className={styles.resultRow}>
                {row.id} | {row.title} | {row.status} | {row.assigneeId}
              </div>
            ))}
            {!loading && rows.length === 0 ? (
              <div className={styles.resultRow}>No results</div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

export default SimpleFilterBarDemoPage;
