import type { ColumnDef, RowData } from '@tanstack/react-table';
import type { Alignment, PinDirection } from './common.types';

/**
 * Extended column meta information
 */
export interface DataGridColumnMeta {
  /**
   * Column header alignment
   */
  align?: Alignment;

  /**
   * Column width
   */
  width?: number | string;

  /**
   * Minimum width
   */
  minWidth?: number;

  /**
   * Maximum width
   */
  maxWidth?: number;

  /**
   * Pin column to left or right
   */
  pinned?: PinDirection;

  /**
   * Custom header class name
   */
  headerClassName?: string;

  /**
   * Custom cell class name
   */
  cellClassName?: string;

  /**
   * Disable sorting for this column
   */
  disableSorting?: boolean;

  /**
   * Disable filtering for this column
   */
  disableFiltering?: boolean;

  /**
   * Custom tooltip for header
   */
  headerTooltip?: string;
}

/**
 * DataGrid Column Definition
 * Simply extends ColumnDef with optional meta
 */
export type DataGridColumnDef<TData extends RowData, TValue = any> = ColumnDef<TData, TValue>;

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> extends DataGridColumnMeta {}
}