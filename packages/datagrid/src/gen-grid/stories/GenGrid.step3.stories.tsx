import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGrid, type GenGridColumnMeta } from '../GenGrid';



type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: 'single' | 'relationship' | 'complicated';
  progress: number;
};

const data: Person[] = [
  { firstName: 'Ada', lastName: 'Lovelace', age: 36, visits: 100, status: 'single', progress: 50 },
  { firstName: 'Grace', lastName: 'Hopper', age: 85, visits: 40, status: 'complicated', progress: 80 },
  { firstName: 'Alan', lastName: 'Turing', age: 41, visits: 20, status: 'relationship', progress: 10 },
  { firstName: 'Katherine', lastName: 'Johnson', age: 101, visits: 12, status: 'single', progress: 90 }
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
      {
        accessorKey: 'age',
        header: 'Age',
        meta: { align: 'right', mono: true } satisfies GenGridColumnMeta
      },
      { accessorKey: 'visits', header: 'Visits' },
      { accessorKey: 'status', header: 'Status' },
      { accessorKey: 'progress', header: 'Progress' }
    ]
  }
];

// Step3 핵심: sorting을 켜려면 enableSorting이 true인 컬럼이어야 함.
// accessorKey가 있으면 기본적으로 canSort=true (환경/설정에 따라 다를 수 있어),
// 확실히 하려면 column에 enableSorting: true를 줄 수도 있음.
const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step3.Sorting',
  component: GenGrid<Person>
};

export default meta;
type Story = StoryObj<typeof GenGrid<Person>>;

export const Sorting: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<Person>
        caption="GenGrid Step3 - Sorting (click headers)"
        data={data}
        columns={columns}
      />
      <p style={{ marginTop: 12, opacity: 0.7 }}>
        헤더 클릭: 오름차순 → 내림차순 → 해제
      </p>
    </div>
  )
};
