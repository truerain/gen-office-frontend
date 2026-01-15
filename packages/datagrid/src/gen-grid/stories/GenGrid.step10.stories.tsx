// packages/datagrid/src/gen-grid/GenGrid.step10.stories.tsx
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

function makeData(count: number): Person[] {
  const first = ['Ada', 'Grace', 'Alan', 'Katherine', 'Linus', 'Ken', 'Dennis', 'Margaret'];
  const last = ['Lovelace', 'Hopper', 'Turing', 'Johnson', 'Torvalds', 'Thompson', 'Ritchie', 'Hamilton'];
  const status: Person['status'][] = ['single', 'relationship', 'complicated'];

  return Array.from({ length: count }).map((_, i) => ({
    id: String(i + 1),
    firstName: first[i % first.length],
    lastName: last[i % last.length],
    age: 18 + ((i * 7) % 70),
    visits: (i * 13) % 5000,
    status: status[i % status.length],
    progress: (i * 9) % 100
  }));
}

const columns: ColumnDef<Person>[] = [
  {
    header: 'Name',
    columns: [
      { accessorKey: 'firstName', header: 'First Name', size: 180, meta: { editable: true } },
      { accessorKey: 'lastName', header: 'Last Name', size: 180, meta: { editable: true }  }
    ]
  },
  {
    header: 'Info',
    columns: [
      { accessorKey: 'age', header: 'Age', size: 90 },
      { accessorKey: 'visits', header: 'Visits', size: 120 },
      { accessorKey: 'status', header: 'Status', size: 160, meta: { editable: true }  },
      { accessorKey: 'progress', header: 'Progress', size: 140 }
    ]
  }
];

const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step10.Virtualization',
  component: GenGrid<Person>,
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;
type Story = StoryObj<typeof GenGrid<Person>>;

export const Virtualization50k: Story = {
  render: () => {
    // ✅ 50,000 rows for virtualization test
    const data = React.useMemo(() => makeData(50_000), []);

    return (
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
          enableColumnSizing
          enablePinning
          enableFiltering
          enableGlobalFilter
          enableRowSelection
          enableRowNumber
          enableVirtualization
          overscan={12}
        />

        <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
          <div>- 50,000 rows, internal vertical scroll</div>
          <div>- Try: fast wheel scroll / drag scrollbar / resize columns / pin columns</div>
        </div>
      </div>
    );
  }
};
