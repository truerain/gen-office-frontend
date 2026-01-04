import { forwardRef, useId } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@gen-office/utils';
import type { TextareaProps } from './Textarea.types';
import styles from './Textarea.module.css';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error = false,
      fullWidth = false,
      resize = 'vertical',
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
        <textarea
          ref={ref}
          id={id}
          className={cn(
            styles.textarea,
            styles[`resize-${resize}`],
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

Textarea.displayName = 'Textarea';