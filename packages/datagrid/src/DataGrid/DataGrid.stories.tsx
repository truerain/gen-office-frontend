import type { Meta, StoryObj } from '@storybook/react';
import { DataGrid, createColumnHelper, type DataGridProps, type DataGridColumnDef } from '@gen-office/datagrid';

interface Person {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  status: 'active' | 'inactive';
}

const columnHelper = createColumnHelper<Person>();

const columns: DataGridColumnDef<Person>[] = [
  columnHelper.accessor('id', {
    header: 'ID',
    meta: {
      width: 80,
      align: 'right' as const,
    },
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    meta: {
      width: 200,
    },
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    meta: {
      width: 250,
    },
  }),
  columnHelper.accessor('age', {
    header: 'Age',
    meta: {
      width: 80,
      align: 'right' as const,
    },
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    meta: {
      width: 150,
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    meta: {
      width: 120,
      align: 'center' as const,
    },
    cell: (info) => {
      const status = info.getValue();
      return (
        <span
          style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 500,
            backgroundColor: status === 'active' ? '#dcfce7' : '#f3f4f6',
            color: status === 'active' ? '#166534' : '#6b7280',
          }}
        >
          {status}
        </span>
      );
    },
  }),
];

const sampleData: Person[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 28, role: 'Developer', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 32, role: 'Designer', status: 'active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 45, role: 'Manager', status: 'inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 29, role: 'Developer', status: 'active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 38, role: 'Designer', status: 'active' },
  { id: 6, name: 'David Lee', email: 'david@example.com', age: 41, role: 'Developer', status: 'inactive' },
  { id: 7, name: 'Emma Davis', email: 'emma@example.com', age: 26, role: 'Designer', status: 'active' },
  { id: 8, name: 'Frank Miller', email: 'frank@example.com', age: 52, role: 'Manager', status: 'active' },
  { id: 9, name: 'Grace Taylor', email: 'grace@example.com', age: 34, role: 'Developer', status: 'active' },
  { id: 10, name: 'Henry Anderson', email: 'henry@example.com', age: 30, role: 'Designer', status: 'inactive' },
];

// Generate large dataset for virtual scrolling
const largeData = Array.from({ length: 1000 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  email: `person${i + 1}@example.com`,
  age: 20 + (i % 40),
  role: ['Developer', 'Designer', 'Manager'][i % 3],
  status: (i % 3 === 0 ? 'inactive' : 'active') as 'active' | 'inactive',
}));

const meta: Meta<DataGridProps<Person>> = {
  title: 'DataGrid/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A powerful DataGrid component with sorting, filtering, pagination, and virtual scrolling support.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<DataGridProps<Person>>;

/**
 * Basic DataGrid with default settings
 */
export const Basic: Story = {
  args: {
    data: sampleData,
    columns,
    height: '400px',
  },
};

/**
 * DataGrid with virtual scrolling for large datasets (1000 rows)
 */
export const VirtualScrolling: Story = {
  args: {
    data: largeData,
    columns,
    enableVirtualization: true,
    rowHeight: 48,
    height: '600px',
  },
};

/**
 * DataGrid with pagination instead of virtual scrolling
 */
export const WithPagination: Story = {
  args: {
    data: largeData.slice(0, 100),
    columns,
    enablePagination: true,
    pageSize: 10,
    showPagination: true,
    enableVirtualization: false,
    height: 'auto',
  },
};

/**
 * DataGrid with sorting enabled (click column headers)
 */
export const WithSorting: Story = {
  args: {
    data: sampleData,
    columns,
    enableSorting: true,
    height: '400px',
  },
};

/**
 * DataGrid with row selection
 */
export const WithRowSelection: Story = {
  args: {
    data: sampleData,
    columns,
    enableRowSelection: true,
    height: '400px',
  },
};

/**
 * Compact mode with smaller padding
 */
export const Compact: Story = {
  args: {
    data: sampleData,
    columns,
    compact: true,
    height: '400px',
  },
};

/**
 * DataGrid without striped rows
 */
export const NoStriped: Story = {
  args: {
    data: sampleData,
    columns,
    striped: false,
    height: '400px',
  },
};

/**
 * DataGrid with sticky header and columns
 */
export const StickyHeaderAndColumns: Story = {
  args: {
    data: largeData.slice(0, 50),
    columns,
    stickyHeader: true,
    stickyColumns: 2,
    height: '600px',
  },
};

/**
 * DataGrid with all borders
 */
export const AllBorders: Story = {
  args: {
    data: sampleData,
    columns,
    bordered: 'all',
    height: '400px',
  },
};

/**
 * DataGrid in loading state
 */
export const Loading: Story = {
  args: {
    data: [],
    columns,
    loading: true,
    loadingMessage: 'Loading data...',
    height: '400px',
  },
};

/**
 * DataGrid with empty state
 */
export const Empty: Story = {
  args: {
    data: [],
    columns,
    emptyMessage: 'No users found',
    height: '400px',
  },
};

/**
 * DataGrid with row click handler
 */
export const WithRowClick: Story = {
  args: {
    data: sampleData,
    columns,
    onRowClick: (row) => {
      alert(`Clicked on: ${row.original.name}`);
    },
    height: '400px',
  },
};