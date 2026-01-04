import type { RowData, Row } from '@tanstack/react-table';
import type { UseDataGridOptions } from '../hooks';
import type { BorderStyle } from '../types';

export interface DataGridProps<TData extends RowData> extends UseDataGridOptions<TData> {
  /**
   * Enable virtual scrolling
   * @default true
   */
  enableVirtualization?: boolean;

  /**
   * Row height for virtual scrolling
   * @default 48
   */
  rowHeight?: number;

  /**
   * Table container height
   * @default '600px'
   */
  height?: string | number;

  /**
   * Striped rows
   * @default true
   */
  striped?: boolean;

  /**
   * Hover effect on rows
   * @default true
   */
  hoverable?: boolean;

  /**
   * Compact mode (smaller padding)
   * @default false
   */
  compact?: boolean;

  /**
   * Border style
   * @default 'horizontal'
   */
  bordered?: BorderStyle;

  /**
   * Sticky header
   * @default true
   */
  stickyHeader?: boolean;

  /**
   * Number of sticky columns from left
   * @default 0
   */
  stickyColumns?: number;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Loading message
   */
  loadingMessage?: string;

  /**
   * Empty message
   */
  emptyMessage?: string;

  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode;

  /**
   * Custom empty component
   */
  emptyComponent?: React.ReactNode;

  /**
   * Row click handler
   */
  onRowClick?: (row: Row<TData>) => void;

  /**
   * Custom row class name
   */
  getRowClassName?: (row: Row<TData>) => string;

  /**
   * Show footer
   */
  showFooter?: boolean;

  /**
   * Show pagination controls
   */
  showPagination?: boolean;

  /**
   * Custom class name
   */
  className?: string;
}