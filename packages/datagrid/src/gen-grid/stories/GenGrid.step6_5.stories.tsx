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

const data: Person[] = Array.from({ length: 120 }).map((_, i) => ({
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
      { accessorKey: 'progress', header: 'Progress' }
    ]
  }
];

const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step6.5.GlobalFilter',
  component: GenGrid<Person>
};

export default meta;
type Story = StoryObj<typeof GenGrid<Person>>;

export const GlobalFilter: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<Person>
        caption="GenGrid Step6.5 - Global Filter"
        data={data}
        columns={columns}
        enableGlobalFilter
        enablePagination
        pageSizeOptions={[5, 10, 20]}
        enableRowSelection
        getRowId={(row) => row.id}
      />
    </div>
  )
};
