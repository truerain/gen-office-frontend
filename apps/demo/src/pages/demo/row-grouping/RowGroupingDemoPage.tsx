import { useMemo, useState } from 'react';
import type { ColumnDef, ExpandedState, GroupingState } from '@tanstack/react-table';

import { GenGrid } from '@gen-office/gen-grid';
import { PageHeader } from '@/components/PageHeader/PageHeader';

import styles from './RowGroupingDemoPage.module.css';

type DemoRow = {
  id: string;
  department: string;
  team: string;
  name: string;
  role: string;
  headcount: number;
  budget: number;
  score: number;
};

const seedData: DemoRow[] = [
  { id: '1', department: 'Engineering', team: 'Platform', name: 'Jin Park', role: 'Staff Engineer', headcount: 1, budget: 220000, score: 92 },
  { id: '2', department: 'Engineering', team: 'Platform', name: 'Sora Kim', role: 'Engineer', headcount: 1, budget: 140000, score: 81 },
  { id: '3', department: 'Engineering', team: 'Platform', name: 'Min Lee', role: 'Engineer', headcount: 1, budget: 135000, score: 78 },
  { id: '4', department: 'Engineering', team: 'Frontend', name: 'Ari Cho', role: 'Lead', headcount: 1, budget: 175000, score: 88 },
  { id: '5', department: 'Engineering', team: 'Frontend', name: 'Hyeon Jang', role: 'Engineer', headcount: 1, budget: 120000, score: 74 },
  { id: '6', department: 'Engineering', team: 'Frontend', name: 'Noah Seo', role: 'Engineer', headcount: 1, budget: 115000, score: 77 },
  { id: '7', department: 'Sales', team: 'Enterprise', name: 'Mina Yoo', role: 'Manager', headcount: 1, budget: 190000, score: 86 },
  { id: '8', department: 'Sales', team: 'Enterprise', name: 'Ryan Choi', role: 'AE', headcount: 1, budget: 150000, score: 82 },
  { id: '9', department: 'Sales', team: 'SMB', name: 'Eun Park', role: 'AE', headcount: 1, budget: 110000, score: 69 },
  { id: '10', department: 'Sales', team: 'SMB', name: 'Jae Han', role: 'AE', headcount: 1, budget: 105000, score: 71 },
  { id: '11', department: 'HR', team: 'People Ops', name: 'Yuna Oh', role: 'Partner', headcount: 1, budget: 98000, score: 84 },
  { id: '12', department: 'HR', team: 'Talent', name: 'Ji Moon', role: 'Recruiter', headcount: 1, budget: 90000, score: 79 },
  { id: '13', department: 'Finance', team: 'FP&A', name: 'Kyle Lim', role: 'Analyst', headcount: 1, budget: 125000, score: 83 },
  { id: '14', department: 'Finance', team: 'Accounting', name: 'Sally Bae', role: 'Accountant', headcount: 1, budget: 118000, score: 76 },
];

export default function RowGroupingDemoPage() {
  const [data, setData] = useState<DemoRow[]>(seedData);
  const [grouping, setGrouping] = useState<GroupingState>(['department', 'team']);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const columns = useMemo<ColumnDef<DemoRow, any>[]>(
    () => [
      {
        accessorKey: 'department',
        header: 'Department',
        cell: (info) => info.getValue(),
        enableGrouping: true,
      },
      {
        accessorKey: 'team',
        header: 'Team',
        cell: (info) => info.getValue(),
        enableGrouping: true,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: 'headcount',
        header: 'HC',
        aggregationFn: 'sum',
        aggregatedCell: (info) => info.getValue<number>(),
        meta: { align: 'right', mono: true },
      },
      {
        accessorKey: 'budget',
        header: 'Budget',
        aggregationFn: 'sum',
        aggregatedCell: (info) => {
          const value = info.getValue<number>() ?? 0;
          return value.toLocaleString();
        },
        cell: (info) => Number(info.getValue<number>()).toLocaleString(),
        meta: { align: 'right', mono: true, editType: 'number'},
      },
      {
        accessorKey: 'score',
        header: 'Score',
        aggregationFn: 'mean',
        aggregatedCell: (info) => {
          const value = info.getValue<number>() ?? 0;
          return value.toFixed(1);
        },
        cell: (info) => Number(info.getValue<number>()).toFixed(1),
        meta: { align: 'right', mono: true },
      },
    ],
    []
  );

  return (
    <div className={styles.page}>
      <PageHeader
        title="Row Grouping Demo"
        description="TanStack grouping + GenGrid group header row"
      />

      <div className={styles.toolbar}>
        <div className={styles.groupingLabel}>Grouping</div>
        <button
          type="button"
          className={grouping.length === 0 ? styles.activeBtn : styles.btn}
          onClick={() => setGrouping([])}
        >
          None
        </button>
        <button
          type="button"
          className={grouping.join(',') === 'department' ? styles.activeBtn : styles.btn}
          onClick={() => setGrouping(['department'])}
        >
          Department
        </button>
        <button
          type="button"
          className={grouping.join(',') === 'department,team' ? styles.activeBtn : styles.btn}
          onClick={() => setGrouping(['department', 'team'])}
        >
          Department �� Team
        </button>

        <div className={styles.spacer} />

        <button type="button" className={styles.btn} onClick={() => setExpanded({})}>
          Collapse All
        </button>
        <button type="button" className={styles.btn} onClick={() => setExpanded(true)}>
          Expand All
        </button>
      </div>

      <div className={styles.grid}>
        <GenGrid<DemoRow>
          data={data}
          onDataChange={setData}
          dataVersion={data.length}
          columns={columns}
          getRowId={(row) => row.id}
          enableGrouping
          grouping={grouping}
          onGroupingChange={setGrouping}
          expanded={expanded}
          onExpandedChange={setExpanded}
          enablePinning
          enableRowStatus={true}
          enableColumnSizing
          //enableVirtualization
          enableActiveRowHighlight={true}
          rowHeight={34}
          overscan={8}
        />
      </div>
    </div>
  );
}