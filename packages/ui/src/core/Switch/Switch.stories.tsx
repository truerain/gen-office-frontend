import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from './Switch';

const meta = {
  title: 'Primitives/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const Error: Story = {
  args: {
    error: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Switch id="airplane" />
      <label
        htmlFor="airplane"
        style={{
          fontSize: '14px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        Airplane Mode
      </label>
    </div>
  ),
};

export const Examples: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Switch id="s1" defaultChecked />
        <label htmlFor="s1" style={{ fontSize: '14px' }}>
          Enable Notifications
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Switch id="s2" />
        <label htmlFor="s2" style={{ fontSize: '14px' }}>
          Dark Mode
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Switch id="s3" defaultChecked />
        <label htmlFor="s3" style={{ fontSize: '14px' }}>
          Auto-save
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Switch id="s4" disabled />
        <label htmlFor="s4" style={{ fontSize: '14px', opacity: 0.5 }}>
          Disabled Option
        </label>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};