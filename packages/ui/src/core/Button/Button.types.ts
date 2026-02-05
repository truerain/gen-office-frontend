import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'default' | 'primary' | 'brand' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Change the default rendered element for the one passed as a child
   * @default false
   */
  asChild?: boolean;
}
