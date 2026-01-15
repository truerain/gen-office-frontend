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
  status: 'single' | 'relationship' | 'complicated';
  progress: number;
};

const data: Person[] = Array.from({ length: 300 }).map((_, i) => ({
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
      { accessorKey: 'firstName', header: 'First Name', size: 180, meta: { editable: true } },
      { accessorKey: 'lastName', header: 'Last Name', size: 180 }
    ]
  },
  {
    header: 'Info',
    columns: [
      { accessorKey: 'age', header: 'Age', size: 100 },
      { accessorKey: 'visits', header: 'Visits', size: 120 },
      { accessorKey: 'status', header: 'Status', size: 160 },
      { accessorKey: 'progress', header: 'Progress', size: 140 }
    ]
  }
];

const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step9.VerticalScroll',
  component: GenGrid<Person>
};

export default meta;
type Story = StoryObj<typeof GenGrid<Person>>;

export const VerticalScroll: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<Person>
        caption="GenGrid Step9 - Vertical Scroll + Sticky Header"
        data={data}
        columns={columns}
        maxHeight={350}
        enableStickyHeader
        enableColumnSizing
        enablePinning
        enablePagination
        enableGlobalFilter
        enableFiltering
        enableRowSelection
        getRowId={(row) => row.id}
      />
      <p style={{ marginTop: 12, opacity: 0.7 }}>
        세로 스크롤 시 헤더는 고정되고, pinning된 컬럼은 좌우 고정된다.
      </p>
    </div>
  )
};
