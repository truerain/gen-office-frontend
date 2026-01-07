// packages/ui/src/core/Breadcrumb/Breadcrumb.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Home, Folder, FileText, Settings, Users } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

const meta: Meta = {
  title: 'Core/Breadcrumb',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Electronics', href: '/products/electronics' },
        { label: 'Laptop' },
      ]}
    />
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', icon: <Home size={16} />, href: '/' },
        { label: 'Settings', icon: <Settings size={16} />, href: '/settings' },
        { label: 'Users', icon: <Users size={16} /> },
      ]}
    />
  ),
};

export const WithOnClick: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { 
          label: 'Home', 
          onClick: () => alert('Home clicked') 
        },
        { 
          label: 'Documents', 
          onClick: () => alert('Documents clicked') 
        },
        { 
          label: 'Report.pdf' 
        },
      ]}
    />
  ),
};

export const CustomSeparator: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Post Title' },
      ]}
      separator="›"
    />
  ),
};

export const MaxItems: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          maxItems = 3 (총 6개 아이템)
        </p>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Level 1', href: '/level1' },
            { label: 'Level 2', href: '/level1/level2' },
            { label: 'Level 3', href: '/level1/level2/level3' },
            { label: 'Level 4', href: '/level1/level2/level3/level4' },
            { label: 'Current Page' },
          ]}
          maxItems={3}
        />
      </div>
      
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
          maxItems = 5 (총 6개 아이템)
        </p>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Level 1', href: '/level1' },
            { label: 'Level 2', href: '/level1/level2' },
            { label: 'Level 3', href: '/level1/level2/level3' },
            { label: 'Level 4', href: '/level1/level2/level3/level4' },
            { label: 'Current Page' },
          ]}
          maxItems={5}
        />
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Small</p>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Laptop' },
          ]}
          size="sm"
        />
      </div>
      
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Medium (기본)</p>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Laptop' },
          ]}
          size="md"
        />
      </div>
      
      <div>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#666' }}>Large</p>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: 'Laptop' },
          ]}
          size="lg"
        />
      </div>
    </div>
  ),
};

export const LongPath: Story = {
  render: () => (
    <Breadcrumb
      items={[
        { label: 'Home', icon: <Home size={16} />, href: '/' },
        { label: 'Documents', icon: <Folder size={16} />, href: '/documents' },
        { label: 'Projects', icon: <Folder size={16} />, href: '/documents/projects' },
        { label: '2024', icon: <Folder size={16} />, href: '/documents/projects/2024' },
        { label: 'Q1', icon: <Folder size={16} />, href: '/documents/projects/2024/q1' },
        { label: 'Reports', icon: <Folder size={16} />, href: '/documents/projects/2024/q1/reports' },
        { label: 'Monthly Report', icon: <FileText size={16} /> },
      ]}
      maxItems={4}
    />
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div 
      style={{ 
        padding: '2rem', 
        backgroundColor: '#1a1a1a',
        borderRadius: '8px'
      }}
    >
      <Breadcrumb
        items={[
          { label: 'Home', icon: <Home size={16} />, href: '/' },
          { label: 'Settings', icon: <Settings size={16} />, href: '/settings' },
          { label: 'Profile' },
        ]}
      />
    </div>
  ),
};