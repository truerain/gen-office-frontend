import { forwardRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@gen-office/utils';
import type { TabsListProps, TabsTriggerProps, TabsContentProps } from './Tabs.types';
import styles from './Tabs.module.css';

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = 'pills', ...props }, ref) => {
  const variantClassName = {
    pills: styles.listPills,
    underline: styles.listUnderline,
    boxed: styles.listBoxed,
  }[variant];

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(styles.list, variantClassName, className)}
      {...props}
    />
  );
});

TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(styles.trigger, className)}
    {...props}
  />
));

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, forceMount = true, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(styles.content, className)}
    forceMount={forceMount}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;
