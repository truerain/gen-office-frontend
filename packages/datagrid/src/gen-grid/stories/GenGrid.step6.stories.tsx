import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGrid, type GenGridColumnMeta } from '../GenGrid';

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
      { accessorKey: 'firstName', header: 'First Name' },
      { accessorKey: 'lastName', header: 'Last Name' }
    ]
  },
  {
    header: 'Info',
    columns: [
      { accessorKey: 'age', header: 'Age' },
      {
        accessorKey: 'visits',
        header: 'Visits',
        meta: { align: 'right', mono: true } satisfies GenGridColumnMeta,
        cell: (info) => info.getValue<number>().toLocaleString()
      },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'progress', header: 'Progress' }
    ]
  }
];

const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step6.Filtering',
  component: GenGrid<Person>
};

export default meta;
type Story = StoryObj<typeof GenGrid<Person>>;

export const Filtering: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<Person>
        caption="GenGrid Step6 - Column Filtering"
        data={data}
        columns={columns}
        enableFiltering
        enablePagination
        pageSizeOptions={[5, 10, 20]}
        enableRowSelection
        getRowId={(row) => row.id}
      />
    </div>
  )
};
