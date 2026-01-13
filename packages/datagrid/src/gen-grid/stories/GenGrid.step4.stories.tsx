import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';

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

const data: Person[] = [
  { id: '1', firstName: 'Ada', lastName: 'Lovelace', age: 36, visits: 100, status: 'single', progress: 50 },
  { id: '2', firstName: 'Grace', lastName: 'Hopper', age: 85, visits: 40, status: 'complicated', progress: 80 },
  { id: '3', firstName: 'Alan', lastName: 'Turing', age: 41, visits: 20, status: 'relationship', progress: 10 },
  { id: '4', firstName: 'Katherine', lastName: 'Johnson', age: 101, visits: 12, status: 'single', progress: 90 }
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
      { accessorKey: 'progress', header: 'Progress' }
    ]
  }
];

const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step4.Selection',
  component: GenGrid<Person>
};

export default meta;
type Story = StoryObj<typeof GenGrid<Person>>;

export const Selection: Story = {
  render: () => {
    // controlled 예시: 선택 상태를 스토리에서 보여주기
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

    return (
      <div style={{ padding: 16 }}>
        <GenGrid<Person>
          caption="GenGrid Step4 - Row Selection"
          data={data}
          columns={columns}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          getRowId={(row) => row.id}
        />

        <pre style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
          rowSelection = {JSON.stringify(rowSelection, null, 2)}
        </pre>
      </div>
    );
  }
};
