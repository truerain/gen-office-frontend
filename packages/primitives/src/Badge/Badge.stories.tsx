import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Primitives/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    dot: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Error',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
};

export const WithDot: Story = {
  args: {
    variant: 'primary',
    dot: true,
    children: 'Active',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Badge variant="primary" size="sm">Small</Badge>
      <Badge variant="primary" size="md">Medium</Badge>
      <Badge variant="primary" size="lg">Large</Badge>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const WithDots: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="success" dot>Active</Badge>
      <Badge variant="warning" dot>Pending</Badge>
      <Badge variant="error" dot>Inactive</Badge>
      <Badge variant="info" dot>New</Badge>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const StatusExample: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Order Status:</span>
        <Badge variant="success" dot>Delivered</Badge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Payment Status:</span>
        <Badge variant="warning" dot>Pending</Badge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Server Status:</span>
        <Badge variant="error" dot>Offline</Badge>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>Account Status:</span>
        <Badge variant="success" dot>Active</Badge>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const TableExample: Story = {
  render: () => (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Role</th>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <td style={{ padding: '0.75rem' }}>John Doe</td>
          <td style={{ padding: '0.75rem' }}>
            <Badge variant="primary" size="sm">Admin</Badge>
          </td>
          <td style={{ padding: '0.75rem' }}>
            <Badge variant="success" size="sm" dot>Active</Badge>
          </td>
        </tr>
        <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <td style={{ padding: '0.75rem' }}>Jane Smith</td>
          <td style={{ padding: '0.75rem' }}>
            <Badge variant="default" size="sm">User</Badge>
          </td>
          <td style={{ padding: '0.75rem' }}>
            <Badge variant="success" size="sm" dot>Active</Badge>
          </td>
        </tr>
        <tr>
          <td style={{ padding: '0.75rem' }}>Bob Johnson</td>
          <td style={{ padding: '0.75rem' }}>
            <Badge variant="info" size="sm">Moderator</Badge>
          </td>
          <td style={{ padding: '0.75rem' }}>
            <Badge variant="warning" size="sm" dot>Pending</Badge>
          </td>
        </tr>
      </tbody>
    </table>
  ),
  parameters: {
    layout: 'padded',
  },
};