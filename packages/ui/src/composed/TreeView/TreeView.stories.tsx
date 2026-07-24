// packages/ui/src/composed/TreeView/TreeView.stories.tsx
// Documents TreeView expansion modes and connector variants for Storybook.

import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TreeView } from './TreeView';

type MenuNode = {
  id: number;
  parent_id: number | null;
  label: string;
};

const sampleTreeData: MenuNode[] = [
  { id: 1, parent_id: null, label: 'System' },
  { id: 2, parent_id: 1, label: 'Users' },
  { id: 3, parent_id: 2, label: 'User List' },
  { id: 4, parent_id: 2, label: 'Roles' },
  { id: 5, parent_id: 1, label: 'Menus' },
  { id: 6, parent_id: 5, label: 'Menu Management' },
  { id: 7, parent_id: null, label: 'Sales' },
  { id: 8, parent_id: 7, label: 'Orders' },
  { id: 9, parent_id: 8, label: 'Order List' },
  { id: 10, parent_id: 8, label: 'Returns' },
  { id: 11, parent_id: 7, label: 'Customers' },
];

const meta = {
  title: 'Composed/TreeView',
  component: TreeView<MenuNode>,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    expansionMode: {
      control: 'select',
      options: ['collapsible', 'fixed-expanded'],
    },
    connectorVariant: {
      control: 'select',
      options: ['none', 'line'],
    },
    showControls: {
      control: 'boolean',
    },
    showRefresh: {
      control: 'boolean',
    },
    indent: {
      control: 'number',
    },
  },
} satisfies Meta<typeof TreeView<MenuNode>>;

export default meta;
type Story = StoryObj<typeof meta>;

function TreeViewFrame(props: ComponentProps<typeof TreeView<MenuNode>>) {
  const [selectedId, setSelectedId] = useState<number | undefined>(1);

  return (
    <div style={{ width: '320px', height: '420px' }}>
      <TreeView<MenuNode>
        {...props}
        selectedId={selectedId}
        onSelect={(node) => setSelectedId(node.id)}
      />
    </div>
  );
}

export const Collapsible: Story = {
  args: {
    title: 'Menu Tree',
    data: sampleTreeData,
    defaultExpandedIds: [1, 2, 7],
    showControls: true,
  },
  render: (args) => <TreeViewFrame {...args} />,
};

export const WithRefresh: Story = {
  args: {
    title: 'Menu Tree',
    data: sampleTreeData,
    defaultExpandedIds: [1, 2, 7],
    showControls: true,
    showRefresh: true,
  },
  render: (args) => (
    <TreeViewFrame
      {...args}
      onRefresh={() => {
        // Storybook action placeholder — replace with refetch in real usage.
        console.log('TreeView refresh');
      }}
    />
  ),
};

export const FixedExpandedWithLines: Story = {
  args: {
    title: 'Menu Tree',
    data: sampleTreeData,
    expansionMode: 'fixed-expanded',
    connectorVariant: 'line',
    showControls: true,
  },
  render: (args) => <TreeViewFrame {...args} />,
};

export const FixedExpandedWithoutLines: Story = {
  args: {
    title: 'Menu Tree',
    data: sampleTreeData,
    expansionMode: 'fixed-expanded',
    connectorVariant: 'none',
    showControls: true,
  },
  render: (args) => <TreeViewFrame {...args} />,
};
