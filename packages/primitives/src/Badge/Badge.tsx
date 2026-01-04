import { forwardRef } from 'react';
import { cn } from '@gen-office/utils';
import type { BadgeProps } from './Badge.types';
import styles from './Badge.module.css';

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          styles.badge,
          styles[variant],
          styles[size],
          dot && styles.withDot,
          className
        )}
        {...props}
      >
        {dot && <span className={styles.dot} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';