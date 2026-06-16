// packages/gen-datagrid/src/stories/GenDataGrid.baseline.stories.tsx
// Provides Storybook pages for visually checking the GenDataGrid baseline gates.

import type { Meta, StoryObj } from '@storybook/react';
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  PaginationState,
} from '@tanstack/react-table';
import * as React from 'react';

import type {
  GenDataGridCellValueChange,
  GenDataGridDirtyState,
  GenDataGridHandle,
} from '../GenDataGrid.types';
import { GenDataGrid } from '../index';

type Person = {
  id: string;
  name: string;
  role: string;
  score: number;
  location: string;
  note: string;
};

const data: Person[] = [
  {
    id: '1',
    name: 'Ada Lovelace',
    role: 'Engineer',
    score: 95,
    location: 'London',
    note: 'Default row height',
  },
  {
    id: '2',
    name: 'Grace Hopper',
    role: 'Computer Scientist',
    score: 91,
    location: 'Arlington',
    note: 'Tall row from getRowHeight',
  },
  {
    id: '3',
    name: 'Katherine Johnson',
    role: 'Mathematician',
    score: 98,
    location: 'White Sulphur Springs',
    note: 'Use arrow keys after clicking a cell',
  },
  {
    id: '4',
    name: 'Alan Turing',
    role: 'Researcher',
    score: 89,
    location: 'Wilmslow',
    note: 'Horizontal overflow appears on narrow containers',
  },
];

const gate6Data: Person[] = [
  ...data,
  {
    id: '5',
    name: 'Margaret Hamilton',
    role: 'Engineer',
    score: 94,
    location: 'Cambridge',
    note: 'Extra row for vertical scroll',
  },
  {
    id: '6',
    name: 'Dorothy Vaughan',
    role: 'Mathematician',
    score: 90,
    location: 'Hampton',
    note: 'Footer bar should stay fixed',
  },
  {
    id: '7',
    name: 'Mary Jackson',
    role: 'Engineer',
    score: 88,
    location: 'Hampton',
    note: 'Horizontal scrollbar belongs to viewport',
  },
  {
    id: '8',
    name: 'Radia Perlman',
    role: 'Computer Scientist',
    score: 93,
    location: 'Redmond',
    note: 'Scroll down to verify sticky footer row',
  },
  {
    id: '9',
    name: 'Barbara Liskov',
    role: 'Computer Scientist',
    score: 96,
    location: 'Boston',
    note: 'Pagination keeps more rows available',
  },
  {
    id: '10',
    name: 'Frances Allen',
    role: 'Researcher',
    score: 92,
    location: 'Poughkeepsie',
    note: 'Use footer bar buttons after scrolling',
  },
];

const columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name', size: 180 },
  { accessorKey: 'role', header: 'Role', size: 220 },
  { accessorKey: 'score', header: 'Score', size: 100 },
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
  {
    accessorKey: 'score',
    header: 'Score',
    size: 100,
    meta: { editable: true, editType: 'number' },
  },
  { accessorKey: 'location', header: 'Location', size: 180, meta: { editable: true } },
  {
    accessorKey: 'note',
    header: 'Note',
    size: 320,
    meta: { editType: 'textarea', editable: true },
  },
];

const gate6Columns: ColumnDef<Person, unknown>[] = [
  { accessorKey: 'name', header: 'Name', footer: 'Visible rows', size: 180, meta: { editable: true } },
  {
    accessorKey: 'role',
    header: 'Role',
    footer: 'Filterable',
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
  {
    accessorKey: 'score',
    header: 'Score',
    footer: ({ table }) =>
      table
        .getFilteredRowModel()
        .rows.reduce((sum, row) => sum + Number(row.getValue('score') ?? 0), 0),
    size: 100,
    meta: { editable: true, editType: 'number' },
  },
  { accessorKey: 'location', header: 'Location', footer: 'Pinned footer', size: 180, meta: { editable: true } },
  {
    accessorKey: 'note',
    header: 'Note',
    footer: 'Dirty state',
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
            row.id === rowId
              ? {
                  ...row,
                  [columnId]: columnId === 'score' ? Number(value) : value,
                }
              : row
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
          editCommitOnBlur
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

export const Gate5PinningSizingReorder: Story = {
  render: () => {
    const [gridData, setGridData] = React.useState(gate6Data);
    const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([
      'name',
      'role',
      'score',
      'location',
      'note',
    ]);
    const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
      left: ['name', 'role'],
    });

    const handleCellValueChange = React.useCallback(
      ({ rowId, columnId, value }: GenDataGridCellValueChange<Person>) => {
        setGridData((previous) =>
          previous.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  [columnId]: columnId === 'score' ? Number(value) : value,
                }
              : row
          )
        );
      },
      []
    );

    return (
      <div style={{ width: 620, padding: 16 }}>
        <GenDataGrid<Person>
          data={gridData}
          columns={editableColumns}
          getRowId={(row) => row.id}
          gridId="storybook-gen-datagrid-gate-5"
          defaultActiveCell={{ rowId: '1', columnId: 'name' }}
          defaultSelectedRanges={[
            {
              anchor: { rowId: '1', columnId: 'name' },
              focus: { rowId: '2', columnId: 'score' },
            },
          ]}
          columnPinning={columnPinning}
          onColumnPinningChange={setColumnPinning}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
          rowHeight={36}
          headerHeight={40}
          editSelectOnFocus
          editCommitOnBlur
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

export const Gate6FilteringFooterPaginationDirtyState: Story = {
  render: () => {
    const gridRef = React.useRef<GenDataGridHandle>(null);
    const [gridData, setGridData] = React.useState(data);
    const [dirtyState, setDirtyState] = React.useState<GenDataGridDirtyState>({
      cells: [],
      rowIds: [],
      deletedRowIds: [],
    });
    const [pagination, setPagination] = React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 8,
    });

    const handleCellValueChange = React.useCallback(
      ({ rowId, columnId, value }: GenDataGridCellValueChange<Person>) => {
        setGridData((previous) =>
          previous.map((row) =>
            row.id === rowId
              ? {
                  ...row,
                  [columnId]: columnId === 'score' ? Number(value) : value,
                }
              : row
          )
        );
      },
      []
    );

    return (
      <div style={{ width: 820, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button type="button" onClick={() => gridRef.current?.deleteRows(['10'])}>
            Mark row 10 deleted
          </button>
          <button type="button" onClick={() => gridRef.current?.resetDirtyState()}>
            Reset dirty markers
          </button>
        </div>
        <GenDataGrid<Person>
          ref={gridRef}
          data={gridData}
          columns={gate6Columns}
          getRowId={(row) => row.id}
          gridId="storybook-gen-datagrid-gate-6"
          defaultActiveCell={{ rowId: '1', columnId: 'name' }}
          defaultSelectedRanges={[
            {
              anchor: { rowId: '1', columnId: 'name' },
              focus: { rowId: '2', columnId: 'score' },
            },
          ]}
          defaultColumnPinning={{ left: ['name'] }}
          enableColumnFilters
          enableGlobalFilter
          enableFooterRow
          enableStickyFooterRow
          enablePagination
          enableFooter
          pagination={pagination}
          onPaginationChange={setPagination}
          rowHeight={36}
          headerHeight={40}
          footerRowHeight={36}
          editSelectOnFocus
          editCommitOnBlur
          onCellValueChange={handleCellValueChange}
          onDirtyStateChange={setDirtyState}
          style={{
            height: 360,
            border: '1px solid #d0d7de',
            borderRadius: 6,
            background: '#fff',
          }}
          renderFooter={({ table }) => (
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span>Filtered rows: {table.getFilteredRowModel().rows.length}</span>
              <span>Dirty rows: {dirtyState.rowIds.join(', ') || 'none'}</span>
              <span>Deleted rows: {dirtyState.deletedRowIds.join(', ') || 'none'}</span>
            </div>
          )}
        />
      </div>
    );
  },
};
