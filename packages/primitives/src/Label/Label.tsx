import { forwardRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@gen-office/utils';
import type { LabelProps } from './Label.types';
import styles from './Label.module.css';

export const Label = forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, required = false, error = false, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      styles.root,
      error && styles.error,
      required && styles.required,
      className
    )}
    {...props}
  >
    {children}
    {required && <span className={styles.requiredMark}>*</span>}
  </LabelPrimitive.Root>
));

Label.displayName = LabelPrimitive.Root.displayName;