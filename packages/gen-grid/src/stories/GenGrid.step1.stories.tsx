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
  title: 'gen-grid/Step1.Basic',
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
          enableRowSelection
          enableRowNumber
          enableVirtualization
          overscan={12}
        />
    </div>
  )
};
