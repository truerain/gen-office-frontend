import { forwardRef } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@gen-office/utils';
import type { SwitchProps } from './Switch.types';
import styles from './Switch.module.css';

export const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, error = false, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(styles.root, error && styles.error, className)}
    {...props}
  >
    <SwitchPrimitive.Thumb className={styles.thumb} />
  </SwitchPrimitive.Root>
));

Switch.displayName = SwitchPrimitive.Root.displayName;