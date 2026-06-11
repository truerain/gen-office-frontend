// packages/gen-datagrid/src/stories/GenDataGrid.baseline.stories.tsx
// Provides Storybook pages for visually checking the GenDataGrid baseline gates.

import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';

import type { GenDataGridCellValueChange } from '../GenDataGrid.types';
import { GenDataGrid } from '../index';

type Person = {
  id: string;
  name: string;
  role: string;
  location: string;
  note: string;
};

const data: Person[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    role: 'Engineer',
    location: 'London',
    note: 'Default row height',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    role: 'Computer Scientist',
    location: 'Arlington',
    note: 'Tall row from getRowHeight',
  },
  {
    id: '3',
    name: 'Katherine Johnson',
    role: 'Mathematician',
    location: 'White Sulphur Springs',
    note: 'Use arrow keys after clicking a cell',
  },
  {
    id: '4',
    name: 'Alan Turing',
    role: 'Researcher',
    location: 'Wilmslow',
    note: 'Horizontal overflow appears on narrow containers',
  },
];

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name', size: 180 },
  { accessorKey: 'role', header: 'Role', size: 220 },
  { accessorKey: 'location', header: 'Location', size: 180 },
  { accessorKey: 'note', header: 'Note', size: 320 },
];

const editableColumns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name', size: 180, meta: { editable: true } },
  {
    accessorKey: 'role',
    header: 'Role',
    size: 220,
    meta: {
      editType: 'select',
      editOptions: [
        { label: 'Engineer', value: 'Engineer' },
        { label: 'Computer Scientist', value: 'Computer Scientist' },
        { label: 'Mathematician', value: 'Mathematician' },
        { label: 'Researcher', value: 'Researcher' },
      ],
    },
  },
  { accessorKey: 'location', header: 'Location', size: 180, meta: { editable: true } },
  {
    accessorKey: 'note',
    header: 'Note',
    size: 320,
    meta: { editType: 'textarea', editable: true },
  },
];

const meta: Meta<typeof GenDataGrid<Person>> = {
  title: 'gen-datagrid/Gates/Baseline',
  component: GenDataGrid<Person>,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof GenDataGrid<Person>>;

export const Gate1AndGate2: Story = {
  render: () => (
    <div style={{ width: 760, padding: 16 }}>
      <GenDataGrid<Person>
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        gridId="storybook-gen-datagrid-baseline"
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
        rowHeight={36}
        headerHeight={40}
        getRowHeight={({ rowId }) => (rowId === '2' ? 72 : undefined)}
        style={{
          height: 260,
          border: '1px solid #d0d7de',
          borderRadius: 6,
          background: '#fff',
        }}
      />
    </div>
  ),
};

export const Gate3RangeSelection: Story = {
  render: () => (
    <div style={{ width: 760, padding: 16 }}>
      <GenDataGrid<Person>
        data={data}
        columns={columns}
        getRowId={(row) => row.id}
        gridId="storybook-gen-datagrid-range-selection"
        defaultActiveCell={{ rowId: '1', columnId: 'name' }}
        rowHeight={36}
        headerHeight={40}
        style={{
          height: 260,
          border: '1px solid #d0d7de',
          borderRadius: 6,
          background: '#fff',
        }}
      />
    </div>
  ),
};

export const Gate4Editing: Story = {
  render: () => {
    const [editableData, setEditableData] = React.useState(data);
    const handleCellValueChange = React.useCallback(
      ({ rowId, columnId, value }: GenDataGridCellValueChange<Person>) => {
        setEditableData((previous) =>
          previous.map((row) =>
            row.id === rowId ? { ...row, [columnId]: value } : row
          )
        );
      },
      []
    );

    return (
      <div style={{ width: 760, padding: 16 }}>
        <GenDataGrid<Person>
          data={editableData}
          columns={editableColumns}
          getRowId={(row) => row.id}
          gridId="storybook-gen-datagrid-editing"
          defaultActiveCell={{ rowId: '1', columnId: 'name' }}
          rowHeight={36}
          headerHeight={40}
          editSelectOnFocus
          onCellValueChange={handleCellValueChange}
          style={{
            height: 260,
            border: '1px solid #d0d7de',
            borderRadius: 6,
            background: '#fff',
          }}
        />
      </div>
    );
  },
};
