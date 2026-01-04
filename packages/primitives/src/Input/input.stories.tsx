import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta = {
  title: 'Primitives/Input',
  component: Input,
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username...',
  },
};

export const WithLabelAndHelperText: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    helperText: 'We will never share your email with anyone.',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'John Doe',
    required: true,
    helperText: 'This field is required',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'your@email.com',
    defaultValue: 'invalid-email',
    error: true,
    helperText: 'Please enter a valid email address',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Message',
    defaultValue: 'Hello World',
  },
};

export const Email: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'your@email.com',
    helperText: 'Enter your work email',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password...',
    helperText: 'Must be at least 8 characters',
  },
};

export const Number: Story = {
  args: {
    label: 'Age',
    type: 'number',
    placeholder: 'Enter your age...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Date: Story = {
  args: {
    label: 'Birth Date',
    type: 'date',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Disabled input',
    disabled: true,
    helperText: 'This field is disabled',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'Full width input',
    fullWidth: true,
    helperText: 'This input takes the full width of its container',
  },
  parameters: {
    layout: 'padded',
  },
};

export const FormExample: Story = {
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Input 
        label="Username" 
        placeholder="Enter username" 
        required
        helperText="Choose a unique username"
      />
      <Input 
        label="Email" 
        type="email"
        placeholder="your@email.com" 
        required
      />
      <Input 
        label="Password" 
        type="password"
        placeholder="Enter password" 
        required
        helperText="Must be at least 8 characters"
      />
      <Input 
        label="Confirm Password" 
        type="password"
        placeholder="Re-enter password"
        required
      />
    </form>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="Email input" />
      <Input label="Password" type="password" placeholder="Password input" />
      <Input label="Number" type="number" placeholder="Number input" />
      <Input label="Search" type="search" placeholder="Search input" />
      <Input label="Phone" type="tel" placeholder="Phone input" />
      <Input label="URL" type="url" placeholder="URL input" />
      <Input label="Date" type="date" />
      <Input label="Time" type="time" />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <Input 
        label="Normal State" 
        placeholder="Normal state" 
        helperText="This is a normal input"
      />
      <Input 
        label="Disabled State" 
        placeholder="Disabled state" 
        disabled 
        helperText="This input is disabled"
      />
      <Input 
        label="Error State" 
        placeholder="Error state" 
        error 
        defaultValue="Invalid input"
        helperText="This field has an error"
      />
      <Input 
        label="Required Field" 
        placeholder="Required field" 
        required
        helperText="This field is required"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};