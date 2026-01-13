// packages/datagrid/src/gen-grid/GenGrid.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGrid } from '../GenGrid';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const data: Person[] = [
  { firstName: 'Ada', lastName: 'Lovelace', age: 36, visits: 100, status: 'single', progress: 50 },
  { firstName: 'Grace', lastName: 'Hopper', age: 85, visits: 40, status: 'complicated', progress: 80 },
  { firstName: 'Alan', lastName: 'Turing', age: 41, visits: 20, status: 'relationship', progress: 10 }
];

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
  title: 'gen-grid/Step1.Basic',
  component: GenGrid<Person>
};

export default meta;

type Story = StoryObj<typeof GenGrid<Person>>;

export const Basic: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<Person> caption="TanStack Table Basic (GenGrid Step1)" data={data} columns={columns} />
    </div>
  )
};
