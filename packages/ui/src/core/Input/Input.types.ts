import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Helper text (description or error message)
   */
  helperText?: string;
  
  /**
   * Error state
   */
  error?: boolean;
  
  /**
   * Full width input
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Optional suffix content (icons, buttons, etc.)
   */
  suffix?: ReactNode;

  /**
   * Optional class for suffix wrapper
   */
  suffixClassName?: string;

  /**
   * Show clear (x) button when input has value.
   */
  clearable?: boolean;

  /**
   * Clear button aria-label.
   */
  clearLabel?: string;

  /**
   * Called after clear action.
   */
  onClear?: () => void;

  /**
   * Auto-select input text on focus.
   * @default true
   */
  autoSelect?: boolean;

  /**
   * Optional prefix content (icons, badges, etc.)
   */
  prefixContent?: ReactNode;

  /**
   * Optional class for prefix wrapper
   */
  prefixClassName?: string;
}
