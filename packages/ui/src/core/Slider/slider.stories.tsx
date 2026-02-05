import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';
import type { SliderProps } from './Slider.types';

const meta = {
  title: 'Primitives/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

const Wrapper = (args: SliderProps) => (
  <div style={{ width: 320 }}>
    <Slider {...args} />
  </div>
);

export const Default: Story = {
  args: {
    defaultValue: [40],
  },
  render: Wrapper,
};

export const Range: Story = {
  args: {
    defaultValue: [20, 80],
  },
  render: Wrapper,
};

export const Steps: Story = {
  args: {
    defaultValue: [25],
    step: 5,
  },
  render: Wrapper,
};

export const Sizes: Story = {
  render: () => (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Slider size="sm" defaultValue={[30]} />
      <Slider size="md" defaultValue={[50]} />
      <Slider size="lg" defaultValue={[70]} />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: [60],
    disabled: true,
  },
  render: Wrapper,
};

export const Error: Story = {
  args: {
    defaultValue: [70],
    error: true,
  },
  render: Wrapper,
};
