import type { Meta, StoryObj } from '@storybook/react';
import { SimpleRadioGroup } from './SimpleRadioGroup';

const meta: Meta<typeof SimpleRadioGroup> = {
  title: 'Primitives/SimpleRadioGroup',
  component: SimpleRadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SimpleRadioGroup>;

/**
 * Basic vertical RadioGroup
 */
export const Basic: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
};

/**
 * RadioGroup with default value
 */
export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'option2',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
};

/**
 * Horizontal layout
 */
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'maybe', label: 'Maybe' },
    ],
  },
};

/**
 * Disabled RadioGroup
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'option1',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
};

/**
 * RadioGroup with some disabled options
 */
export const WithDisabledOptions: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2 (disabled)', disabled: true },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4 (disabled)', disabled: true },
    ],
  },
};

/**
 * RadioGroup with error state
 */
export const Error: Story = {
  args: {
    error: true,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
};

/**
 * RadioGroup with many options
 */
export const ManyOptions: Story = {
  args: {
    options: [
      { value: '1', label: 'Strongly Disagree' },
      { value: '2', label: 'Disagree' },
      { value: '3', label: 'Neutral' },
      { value: '4', label: 'Agree' },
      { value: '5', label: 'Strongly Agree' },
    ],
  },
};

/**
 * RadioGroup with emojis
 */
export const WithEmojis: Story = {
  args: {
    orientation: 'horizontal',
    options: [
      { value: 'bad', label: '😞 Bad' },
      { value: 'okay', label: '😐 Okay' },
      { value: 'good', label: '😊 Good' },
      { value: 'great', label: '😄 Great' },
    ],
  },
};

/**
 * Required RadioGroup
 */
export const Required: Story = {
  args: {
    required: true,
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
};