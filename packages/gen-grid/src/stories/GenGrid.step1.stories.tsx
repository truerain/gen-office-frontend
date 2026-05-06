// packages/datagrid/src/gen-grid/GenGrid.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGrid } from '../GenGrid';

type Person = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const data: Person[] = Array.from({ length: 80 }).map((_, i) => ({
  id: String(i + 1),
  firstName: ['Ada', 'Grace', 'Alan', 'Katherine'][i % 4],
  lastName: ['Lovelace', 'Hopper', 'Turing', 'Johnson'][i % 4],
  age: 20 + ((i * 7) % 60),
  visits: (i * 13) % 200,
  status: (['single', 'relationship', 'complicated'] as const)[i % 3],
  progress: (i * 9) % 100
}));

const columns: ColumnDef<Person>[] = [
  {
    header: 'Name',
    columns: [
      { accessorKey: 'firstName', header: 'First Name' },
      { accessorKey: 'lastName', header: 'Last Name' }
    ]
  },
  {
    header: 'Info',
    columns: [
      { accessorKey: 'age', header: 'Age' },
      { accessorKey: 'visits', header: 'Visits' },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'progress', header: 'Profile Progress' }
    ]
  }
];

const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step1/Basic',
  component: GenGrid<Person>
};

export default meta;

type Story = StoryObj<typeof GenGrid<Person>>;

export const Basic: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
        <GenGrid<Person>
          caption="GenGrid Step10 - Virtualization (50,000 rows)"
          data={data}
          columns={columns}
          getRowId={(row) => row.id}
          maxHeight={560}
          height={560}
          enableStickyHeader
          headerHeight={40}
          rowHeight={36}
          onDataChange={() => {}}
          enableColumnSizing
          enablePinning
          enableFiltering
          checkboxSelection
          enableRowNumber
          enableVirtualization
          overscan={12}
        />
    </div>
  )
};

type GroupToggleRow = {
  id: string;
  category: string;
  item: string;
  q1: number;
  q2: number;
  q3: number;
};

function GroupToggleReloadScenario() {
  const [seed, setSeed] = React.useState(0);
  const [rows, setRows] = React.useState<GroupToggleRow[]>(() => [
    { id: '1', category: 'A', item: 'Alpha', q1: 10, q2: 20, q3: 30 },
    { id: '2', category: 'A', item: 'Beta', q1: 11, q2: 21, q3: 31 },
    { id: '3', category: 'B', item: 'Gamma', q1: 12, q2: 22, q3: 32 },
  ]);

  const columns = React.useMemo<ColumnDef<GroupToggleRow>[]>(
    () => [
      { accessorKey: 'category', header: 'Category', size: 100 },
      { accessorKey: 'item', header: 'Item', size: 120 },
      {
        id: 'quarterGroup',
        header: 'Quarter',
        meta: {
          groupVisibilityToggle: {
            defaultExpanded: false,
            expandLabel: '+',
            collapseLabel: '-',
            ariaLabel: 'Toggle quarter columns',
          },
        } as any,
        columns: [
          { accessorKey: 'q1', header: 'Q1', size: 100 },
          { accessorKey: 'q2', header: 'Q2', size: 100 },
          { accessorKey: 'q3', header: 'Q3', size: 100 },
        ],
      },
    ],
    []
  );

  const reloadData = React.useCallback(() => {
    setSeed((prev) => prev + 1);
    setRows((prev) =>
      prev.map((row, index) => ({
        ...row,
        q1: row.q1 + 1 + index,
        q2: row.q2 + 1 + index,
        q3: row.q3 + 1 + index,
      }))
    );
  }, []);

  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button type="button" onClick={reloadData}>
          Reload Data
        </button>
        <span style={{ fontSize: 12, opacity: 0.8 }}>reloadCount: {seed}</span>
      </div>
      <GenGrid<GroupToggleRow>
        caption="GroupVisibilityToggle: defaultExpanded=false reload stability"
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        height={360}
        maxHeight={360}
        enableStickyHeader
        headerHeight={40}
        rowHeight={36}
        onDataChange={() => {}}
        enableColumnSizing
      />
    </div>
  );
}

export const GroupToggleReloadStability: Story = {
  render: () => <GroupToggleReloadScenario />,
};

type ThreeLevelHeaderRow = {
  id: string;
  org: string;
  org2: string;
  team: string;
  member: string;
  kpiA: number;
  kpiB: number;
  scoreA: number;
  scoreB: number;
};

const threeLevelHeaderData: ThreeLevelHeaderRow[] = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  org: `Org-${(i % 3) + 1}`,
  org2: `Org2-${(i % 2) + 1}`,
  team: `Team-${(i % 4) + 1}`,
  member: `Member-${i + 1}`,
  kpiA: 60 + (i % 20),
  kpiB: 70 + (i % 20),
  scoreA: 80 + (i % 10),
  scoreB: 75 + (i % 10),
}));

const threeLevelHeaderColumns: ColumnDef<ThreeLevelHeaderRow>[] = [
  { accessorKey: 'org', header: 'Org' , meta: { headerSpan: 2 } as any },
  { accessorKey: 'org2', header: 'Org 2'},
  {
    header: 'Organization',
    columns: [
          { accessorKey: 'team', header: 'Team' },
          { accessorKey: 'member', header: 'Member' },
    ],
  },
  {
    header: 'Metrics',
    columns: [
      {
        header: 'KPI',
        columns: [
          {
            accessorKey: 'kpiA',
            header: 'KPI A',
            meta: { headerSpan: 2 } as any,
          },
          { accessorKey: 'kpiB', header: 'KPI B' },
        ],
      },
      {
        header: 'Score',
        columns: [
          { accessorKey: 'scoreA', header: 'Score A' },
          { accessorKey: 'scoreB', header: 'Score B' },
        ],
      },
    ],
  },
];

export const ThreeLevelHeaderSpanRegression: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<ThreeLevelHeaderRow>
        caption="3-level header spanning regression check (1->2->3)"
        data={threeLevelHeaderData}
        columns={threeLevelHeaderColumns}
        getRowId={(row) => row.id}
        height={360}
        maxHeight={360}
        enableStickyHeader
        headerHeight={40}
        rowHeight={36}
        onDataChange={() => {}}
        enableColumnSizing
      />
    </div>
  ),
};

type BodyColSpanRow = {
  id: string;
  type: 'group' | 'item';
  name: string;
  detail: string;
  amount: number;
  note: string;
};

const bodyColSpanData: BodyColSpanRow[] = [
  { id: 'g-1', type: 'group', name: 'Q1 Summary', detail: 'North + East', amount: 0, note: 'merged' },
  { id: '1', type: 'item', name: 'Alpha', detail: 'North', amount: 120, note: 'normal' },
  { id: '2', type: 'item', name: 'Beta', detail: 'East', amount: 95, note: 'normal' },
  { id: 'g-2', type: 'group', name: 'Q2 Summary', detail: 'West + South', amount: 0, note: 'merged' },
  { id: '3', type: 'item', name: 'Gamma', detail: 'West', amount: 140, note: 'normal' },
  { id: '4', type: 'item', name: 'Delta', detail: 'South', amount: 110, note: 'normal' },
];

const bodyColSpanColumns: ColumnDef<BodyColSpanRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      bodyColSpan: ({ row }: { row: BodyColSpanRow }) => (row.type === 'group' ? 3 : 1),
    } as any,
  },
  { accessorKey: 'detail', header: 'Detail' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'note', header: 'Note' },
];

export const BodyColSpanConditional: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<BodyColSpanRow>
        caption="Body colspan: conditional merge on group rows"
        data={bodyColSpanData}
        columns={bodyColSpanColumns}
        getRowId={(row) => row.id}
        height={320}
        maxHeight={320}
        enableStickyHeader
        headerHeight={40}
        rowHeight={36}
        onDataChange={() => {}}
        enableColumnSizing
      />
    </div>
  ),
};
