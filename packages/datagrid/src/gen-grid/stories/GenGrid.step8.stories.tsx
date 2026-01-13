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
      { accessorKey: 'firstName', header: 'First Name', size: 180 },
      { accessorKey: 'lastName', header: 'Last Name' }
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
  title: 'gen-grid/Step8.ColumnSizing',
  component: GenGrid<Person>
};

export default meta;
type Story = StoryObj<typeof GenGrid<Person>>;

export const ColumnSizing: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<Person>
        caption="GenGrid Step8 - Column Sizing"
        data={data}
        columns={columns}
        enableColumnSizing
        enablePinning
        enablePagination
        enableGlobalFilter
        //enableFiltering
        enableRowSelection
        getRowId={(row) => row.id}
      />
      <p style={{ marginTop: 12, opacity: 0.7 }}>
        헤더 오른쪽 경계(리사이저)를 드래그해서 컬럼 폭을 조절해봐.
      </p>
    </div>
  )
};
