import type { InputHTMLAttributes } from 'react';

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
}