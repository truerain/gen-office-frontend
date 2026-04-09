import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta = {
  title: 'Primitives/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Tabs defaultValue="account">
        <TabsList variant="pills">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Account settings and profile preferences.
        </TabsContent>
        <TabsContent value="password">
          Password policy and security options.
        </TabsContent>
        <TabsContent value="notifications">
          Manage email and in-app notification settings.
        </TabsContent>
      </Tabs>
    </div>
  ),
};

export const DisabledTrigger: Story = {
  render: () => (
    <div style={{ width: 480 }}>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="advanced" disabled>
            Advanced
          </TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="general">General configuration panel.</TabsContent>
        <TabsContent value="advanced">Advanced configuration panel.</TabsContent>
        <TabsContent value="security">Security configuration panel.</TabsContent>
      </Tabs>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ width: 560, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Tabs defaultValue="account">
        <TabsList variant="pills">
          <TabsTrigger value="account">Pills</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Pills style tabs.</TabsContent>
        <TabsContent value="password">Password panel.</TabsContent>
        <TabsContent value="notifications">Notifications panel.</TabsContent>
      </Tabs>

      <Tabs defaultValue="account">
        <TabsList variant="underline">
          <TabsTrigger value="account">Underline</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Underline style tabs.</TabsContent>
        <TabsContent value="password">Password panel.</TabsContent>
        <TabsContent value="notifications">Notifications panel.</TabsContent>
      </Tabs>

      <Tabs defaultValue="account">
        <TabsList variant="boxed">
          <TabsTrigger value="account">Boxed</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Boxed style tabs.</TabsContent>
        <TabsContent value="password">Password panel.</TabsContent>
        <TabsContent value="notifications">Notifications panel.</TabsContent>
      </Tabs>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
