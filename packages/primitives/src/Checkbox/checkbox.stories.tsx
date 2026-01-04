import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
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
} satisfies Meta<typeof Checkbox>;

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
  },
};

export const WithLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        style={{
          fontSize: '14px',
          fontFamily: 'inherit',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const MultipleCheckboxes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="option1" defaultChecked />
        <label htmlFor="option1" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Option 1
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="option2" />
        <label htmlFor="option2" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Option 2
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="option3" />
        <label htmlFor="option3" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Option 3
        </label>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="unchecked" />
        <label htmlFor="unchecked" style={{ fontSize: '14px' }}>Unchecked</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="checked" defaultChecked />
        <label htmlFor="checked" style={{ fontSize: '14px' }}>Checked</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="disabled" disabled />
        <label htmlFor="disabled" style={{ fontSize: '14px', opacity: 0.5 }}>Disabled</label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <label htmlFor="disabled-checked" style={{ fontSize: '14px', opacity: 0.5 }}>
          Disabled Checked
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox id="error" error />
        <label htmlFor="error" style={{ fontSize: '14px', color: 'var(--color-status-error)' }}>
          Error State
        </label>
      </div>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};