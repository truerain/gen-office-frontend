import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, Radio } from './Radio';

const meta = {
  title: 'Primitives/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="option1" id="r1" />
        <label htmlFor="r1" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Option 1
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="option2" id="r2" />
        <label htmlFor="r2" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Option 2
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="option3" id="r3" />
        <label htmlFor="r3" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="option1" id="d1" disabled />
        <label htmlFor="d1" style={{ fontSize: '14px', opacity: 0.5 }}>
          Disabled Unchecked
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="option2" id="d2" disabled />
        <label htmlFor="d2" style={{ fontSize: '14px', opacity: 0.5 }}>
          Disabled Checked
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Error: Story = {
  render: () => (
    <RadioGroup error>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="option1" id="e1" error />
        <label htmlFor="e1" style={{ fontSize: '14px', color: 'var(--color-status-error)' }}>
          Error Option 1
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="option2" id="e2" error />
        <label htmlFor="e2" style={{ fontSize: '14px', color: 'var(--color-status-error)' }}>
          Error Option 2
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="small" style={{ flexDirection: 'row', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="small" id="h1" />
        <label htmlFor="h1" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Small
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="medium" id="h2" />
        <label htmlFor="h2" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Medium
        </label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Radio value="large" id="h3" />
        <label htmlFor="h3" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Large
        </label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    layout: 'padded',
  },
};