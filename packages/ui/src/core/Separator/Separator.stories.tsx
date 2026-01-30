import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Separator';

const meta = {
  title: 'Primitives/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: 'radio',
      options: ['subtle', 'default', 'strong'],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    variant: 'default',
  },
  render: (args) => (
    <div style={{ width: '100%' }}>
      <div style={{ padding: '8px 0' }}>Section A</div>
      <Separator {...args} />
      <div style={{ padding: '8px 0' }}>Section B</div>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    variant: 'default',
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', height: '40px' }}>
      <span style={{ padding: '0 12px' }}>Left</span>
      <Separator {...args} />
      <span style={{ padding: '0 12px' }}>Right</span>
    </div>
  ),
};
