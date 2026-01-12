// packages/datagrid/src/gen-grid/GenGrid.step2.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { GenGrid, type GenGridColumnMeta } from './GenGrid';
import styles from './GenGrid.module.css';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: 'single' | 'relationship' | 'complicated';
  progress: number; // 0~100
};

const data: Person[] = [
  { firstName: 'Ada', lastName: 'Lovelace', age: 36, visits: 100, status: 'single', progress: 50 },
  { firstName: 'Grace', lastName: 'Hopper', age: 85, visits: 40, status: 'complicated', progress: 80 },
  { firstName: 'Alan', lastName: 'Turing', age: 41, visits: 20, status: 'relationship', progress: 10 }
];

// Step2: accessorFn / header(cell) 커스터마이징 / meta 사용
const columns: ColumnDef<Person>[] = [
  {
    header: 'Name',
    columns: [
      { accessorKey: 'firstName', header: 'First Name' },
      { accessorKey: 'lastName', header: 'Last Name' },

      // accessorFn: 파생 컬럼(예: fullName)
      {
        id: 'fullName',
        header: () => <span>Full Name</span>,
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        cell: (info) => <strong>{info.getValue<string>()}</strong>
      }
    ]
  },
  {
    header: 'Info',
    columns: [
      // meta: 숫자 컬럼은 오른쪽 정렬 + mono
      {
        accessorKey: 'age',
        header: 'Age',
        meta: { align: 'right', mono: true } satisfies GenGridColumnMeta
      },
      {
        accessorKey: 'visits',
        header: 'Visits',
        meta: { align: 'right', mono: true } satisfies GenGridColumnMeta,
        cell: (info) => info.getValue<number>().toLocaleString()
      },

      // custom cell: status를 badge 형태로 렌더 (스타일은 module.css 재사용)
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => <span className={styles.badge}>{info.getValue<string>()}</span>
      },

      // custom cell: progress를 “텍스트 + 간단 시각화”
      {
        accessorKey: 'progress',
        header: 'Progress',
        meta: { align: 'right', mono: true } satisfies GenGridColumnMeta,
        cell: (info) => {
          const v = info.getValue<number>();
          return (
            <span>
              {v}%
            </span>
          );
        }
      }
    ]
  }
];

const meta: Meta<typeof GenGrid<Person>> = {
  title: 'gen-grid/Step2.ColumnDefs',
  component: GenGrid<Person>
};

export default meta;

type Story = StoryObj<typeof GenGrid<Person>>;

export const ColumnDefs: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <GenGrid<Person>
        caption="GenGrid Step2 - accessorFn / custom cell / column meta"
        data={data}
        columns={columns}
      />
    </div>
  )
};
