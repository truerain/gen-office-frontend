import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './Textarea';

const meta = {
  title: 'Primitives/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    resize: {
      control: 'select',
      options: ['none', 'vertical', 'horizontal', 'both'],
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Message',
    placeholder: 'Type your message here...',
  },
};

export const WithLabelAndHelper: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter description...',
    helperText: 'Provide a detailed description of your request.',
  },
};

export const Required: Story = {
  args: {
    label: 'Comments',
    placeholder: 'Enter your comments...',
    required: true,
    helperText: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Feedback',
    placeholder: 'Enter your feedback...',
    defaultValue: 'Too short',
    error: true,
    helperText: 'Feedback must be at least 50 characters.',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Textarea',
    placeholder: 'This is disabled',
    disabled: true,
    helperText: 'This field is currently disabled',
  },
};

export const ResizeNone: Story = {
  args: {
    label: 'No Resize',
    placeholder: 'Cannot be resized',
    resize: 'none',
  },
};

export const ResizeHorizontal: Story = {
  args: {
    label: 'Horizontal Resize',
    placeholder: 'Can be resized horizontally',
    resize: 'horizontal',
  },
};

export const ResizeBoth: Story = {
  args: {
    label: 'Resize Both',
    placeholder: 'Can be resized in both directions',
    resize: 'both',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Textarea',
    placeholder: 'Full width textarea',
    fullWidth: true,
    helperText: 'This textarea takes the full width of its container',
  },
  parameters: {
    layout: 'padded',
  },
};

export const FormExample: Story = {
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Textarea 
        label="Summary" 
        placeholder="Brief summary..."
        required
        rows={3}
        resize="none"
      />
      <Textarea 
        label="Details" 
        placeholder="Provide detailed information..."
        helperText="Be as specific as possible"
        rows={5}
      />
      <Textarea 
        label="Additional Notes" 
        placeholder="Any additional notes..."
        rows={4}
      />
    </form>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Textarea 
        label="Normal State" 
        placeholder="Normal textarea"
        helperText="This is a normal textarea"
      />
      <Textarea 
        label="Disabled State" 
        placeholder="Disabled textarea"
        disabled 
        helperText="This textarea is disabled"
      />
      <Textarea 
        label="Error State" 
        placeholder="Error textarea"
        error 
        defaultValue="Invalid input"
        helperText="This field has an error"
      />
      <Textarea 
        label="Required Field" 
        placeholder="Required textarea"
        required
        helperText="This field is required"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};