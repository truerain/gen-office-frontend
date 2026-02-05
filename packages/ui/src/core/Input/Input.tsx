import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, ChangeEventHandler } from 'react';
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
      suffix,
      suffixClassName,
      clearable = false,
      clearLabel = 'Clear',
      onClear,
      autoSelect = true,
      prefixContent,
      prefixClassName,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [uncontrolledValue, setUncontrolledValue] = useState(
      defaultValue !== undefined ? String(defaultValue) : ''
    );

    useEffect(() => {
      if (value !== undefined) {
        setUncontrolledValue(String(value ?? ''));
      }
    }, [value]);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? String(value ?? '') : uncontrolledValue;
    const hasValue = currentValue.length > 0;
    const canClear = clearable && hasValue && !props.disabled;

    const hasSuffix = Boolean(suffix) || canClear;
    const hasPrefix = Boolean(prefixContent);

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      if (!isControlled) {
        setUncontrolledValue(event.target.value);
      }
      onChange?.(event);
    };

    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
      if (autoSelect && event.target) {
        event.target.select();
      }
      props.onFocus?.(event);
    };

    const handleClear = () => {
      const nextValue = '';
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      if (inputRef.current) {
        inputRef.current.value = nextValue;
      }

      if (onChange) {
        onChange({
          target: { value: nextValue },
        } as ChangeEvent<HTMLInputElement>);
      }

      onClear?.();
      window.setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    };

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
        <div className={styles.inputWrapper}>
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            id={id}
            type={type}
            className={cn(
              styles.input,
              hasPrefix && styles.inputWithPrefix,
              hasSuffix && styles.inputWithSuffix,
              error && styles.error,
              fullWidth && styles.fullWidth,
              className
            )}
            aria-invalid={error}
            aria-describedby={helperText ? helperId : undefined}
            aria-required={required}
            value={isControlled ? (value ?? '') : undefined}
            defaultValue={!isControlled ? (defaultValue ?? undefined) : undefined}
            onChange={handleChange}
            onFocus={handleFocus}
            {...props}
          />
          {hasPrefix && (
            <div className={cn(styles.prefix, prefixClassName)}>
              {prefixContent}
            </div>
          )}
          {hasSuffix && (
            <div className={cn(styles.suffix, suffixClassName)}>
              {canClear && (
                <button
                  type="button"
                  className={styles.clearButton}
                  aria-label={clearLabel}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleClear}
                >
                  ×
                </button>
              )}
              {suffix}
            </div>
          )}
        </div>
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
