import { forwardRef, useId } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@gen-office/utils';
import type { InputProps } from './Input.types'; 
import styles from './Input.module.css';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      error = false,
      fullWidth = false,
      label,
      helperText,
      required,
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;

    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidthWrapper)}>
        {label && (
          <LabelPrimitive.Root 
            htmlFor={id}
            className={cn(
              styles.label,
              error && styles.labelError,
              required && styles.labelRequired
            )}
          >
            {label}
            {required && <span className={styles.requiredMark}>*</span>}
          </LabelPrimitive.Root>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          className={cn(
            styles.input,
            error && styles.error,
            fullWidth && styles.fullWidth,
            className
          )}
          aria-invalid={error}
          aria-describedby={helperText ? helperId : undefined}
          aria-required={required}
          {...props}
        />
        {helperText && (
          <span
            id={helperId}
            className={cn(
              styles.helperText,
              error && styles.helperTextError
            )}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';