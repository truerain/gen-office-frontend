import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names
 * Combines clsx for conditional classes with CSS Modules support
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}