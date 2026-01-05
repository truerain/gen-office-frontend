import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './Label';
import { Input } from '../core/Input/Input';
import { Checkbox } from '../core/Checkbox/Checkbox';

const meta = {
  title: 'Primitives/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    required: {
      control: 'boolean',
    },
    error: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label Text',
  },
};

export const Required: Story = {
  args: {
    children: 'Required Field',
    required: true,
  },
};

export const Error: Story = {
  args: {
    children: 'Error Label',
    error: true,
  },
};

export const WithInput: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '300px' }}>
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter username" />
    </div>
  ),
};

export const WithRequiredInput: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '300px' }}>
      <Label htmlFor="email" required>
        Email Address
      </Label>
      <Input id="email" type="email" placeholder="your@email.com" />
    </div>
  ),
};

export const WithErrorInput: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '300px' }}>
      <Label htmlFor="password" error>
        Password
      </Label>
      <Input id="password" type="password" error defaultValue="short" />
      <span style={{ fontSize: '0.8125rem', color: 'var(--color-status-error)' }}>
        Password must be at least 8 characters
      </span>
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Checkbox id="terms" />
      <Label htmlFor="terms">I accept the terms and conditions</Label>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Label htmlFor="name" required>
          Full Name
        </Label>
        <Input id="name" placeholder="John Doe" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Label htmlFor="form-email" required>
          Email
        </Label>
        <Input id="form-email" type="email" placeholder="john@example.com" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Label htmlFor="form-password" required>
          Password
        </Label>
        <Input id="form-password" type="password" placeholder="••••••••" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Checkbox id="form-newsletter" />
        <Label htmlFor="form-newsletter">Subscribe to newsletter</Label>
      </div>
    </form>
  ),
  parameters: {
    layout: 'padded',
  },
};