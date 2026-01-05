import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@gen-office/utils';
import type { ButtonProps } from './Button.types';
import styles from './Button.module.css';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      asChild = false,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    
    const buttonClassName = cn(
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
      className
    );
    
    // asChild일 때는 Slot을 사용하고 children만 렌더링
    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={buttonClassName}
          aria-disabled={isDisabled ? true : undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }
    
    // 일반 button일 때는 icon과 함께 렌더링
    return (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={isDisabled}
        {...props}
      >
        {leftIcon && !loading && (
          <span className={styles.iconWrapper}>{leftIcon}</span> 
        )}
        {children}
        {rightIcon && !loading && ( 
          <span className={styles.iconWrapper}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';