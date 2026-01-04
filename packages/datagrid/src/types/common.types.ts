//import type { RowData } from '@tanstack/react-table';

/**
 * Alignment options
 */
export type Alignment = 'left' | 'center' | 'right';

/**
 * Border style options
 */
export type BorderStyle = 'none' | 'horizontal' | 'vertical' | 'all';

/**
 * Column pinning options
 */
export type PinDirection = 'left' | 'right';

/**
 * Size variants
 */
export type SizeVariant = 'sm' | 'md' | 'lg';

/**
 * Base props for all datagrid components
 */
export interface BaseDataGridProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Loading state
 */
export interface LoadingState {
  loading?: boolean;
  loadingMessage?: string;
}

/**
 * Empty state
 */
export interface EmptyState {
  empty?: boolean;
  emptyMessage?: string;
  emptyComponent?: React.ReactNode;
}