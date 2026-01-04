import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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
   * Full width textarea
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Resize behavior
   * @default 'vertical'
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}