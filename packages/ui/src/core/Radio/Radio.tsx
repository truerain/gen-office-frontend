import { forwardRef } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { cn } from '@gen-office/utils';
import type { RadioGroupProps, RadioProps } from './Radio.types';
import styles from './Radio.module.css';

export const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, error = false, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={cn(styles.group, error && styles.groupError, className)}
    {...props}
  />
));

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export const Radio = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioProps
>(({ className, error = false, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(styles.item, error && styles.error, className)}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className={styles.indicator}>
      <Circle className={styles.icon} />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));

Radio.displayName = RadioGroupPrimitive.Item.displayName;