import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Save, ArrowRight, Download, Trash2, Plus, Search, Star } from 'lucide-react';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'brand', 'secondary', 'outline', 'ghost', 'danger', 'destructive', 'link'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Brand: Story = {
  args: {
    children: 'Brand Button',
    variant: 'brand',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Destructive Button',
    variant: 'destructive',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Save',
    leftIcon: <Save />,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Next',
    rightIcon: <ArrowRight />,
  },
};

export const IconExamples: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="primary" leftIcon={<Save />}>Save</Button>
      <Button variant="brand" leftIcon={<Star />}>Brand</Button>
      <Button variant="secondary" leftIcon={<Download />}>Download</Button>
      <Button variant="outline" leftIcon={<Search />}>Search</Button>
      <Button variant="danger" leftIcon={<Trash2 />}>Delete</Button>
      <Button variant="primary" rightIcon={<ArrowRight />}>Next</Button>
      <Button variant="secondary" leftIcon={<Plus />}>Add New</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="brand">Brand</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Button 
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z" />
          </svg>
        }
      >
        Add Item
      </Button>
      <Button 
        variant="outline"
        rightIcon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 4l4 4-4 4V4z" />
          </svg>
        }
      >
        Next
      </Button>
      <Button 
        variant="ghost"
        leftIcon={
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.5 8a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z" />
          </svg>
        }
      >
        Remove
      </Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

export const LoadingStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <Button variant="primary" loading>Primary Loading</Button>
      <Button variant="brand" loading>Brand Loading</Button>
      <Button variant="secondary" loading>Secondary Loading</Button>
      <Button variant="outline" loading>Outline Loading</Button>
      <Button variant="ghost" loading>Ghost Loading</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
