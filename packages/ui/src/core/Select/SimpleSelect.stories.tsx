import type { Meta, StoryObj } from '@storybook/react';
import { SimpleSelect } from './SimpleSelect';

const meta: Meta<typeof SimpleSelect> = {
  title: 'Primitives/SimpleSelect',
  component: SimpleSelect,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SimpleSelect>;

/**
 * Basic SimpleSelect with options array
 */
export const Basic: Story = {
  args: {
    placeholder: 'Choose an option...',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
};

/**
 * SimpleSelect with default value
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
 * SimpleSelect with grouped options
 */
export const WithGroups: Story = {
  args: {
    placeholder: 'Choose a fruit or vegetable...',
    groups: [
      {
        label: 'Fruits',
        options: [
          { value: 'apple', label: '🍎 Apple' },
          { value: 'banana', label: '🍌 Banana' },
          { value: 'orange', label: '🍊 Orange' },
        ],
      },
      {
        label: 'Vegetables',
        options: [
          { value: 'carrot', label: '🥕 Carrot' },
          { value: 'potato', label: '🥔 Potato' },
          { value: 'tomato', label: '🍅 Tomato' },
        ],
      },
    ],
  },
};

/**
 * SimpleSelect with disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
};

/**
 * SimpleSelect with disabled options
 */
export const WithDisabledOptions: Story = {
  args: {
    placeholder: 'Some options are disabled',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2 (disabled)', disabled: true },
      { value: 'option3', label: 'Option 3' },
      { value: 'option4', label: 'Option 4 (disabled)', disabled: true },
    ],
  },
};

/**
 * SimpleSelect with error state
 */
export const Error: Story = {
  args: {
    error: true,
    placeholder: 'This field has an error',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
};

/**
 * Full width SimpleSelect
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    placeholder: 'Full width select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * SimpleSelect with many options
 */
export const ManyOptions: Story = {
  args: {
    placeholder: 'Choose a country...',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia' },
      { value: 'de', label: 'Germany' },
      { value: 'fr', label: 'France' },
      { value: 'it', label: 'Italy' },
      { value: 'es', label: 'Spain' },
      { value: 'jp', label: 'Japan' },
      { value: 'kr', label: 'South Korea' },
      { value: 'cn', label: 'China' },
      { value: 'in', label: 'India' },
    ],
  },
};

/**
 * Required SimpleSelect
 */
export const Required: Story = {
  args: {
    required: true,
    placeholder: 'This field is required',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
};