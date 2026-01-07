import type { ColumnDef, RowData } from '@tanstack/react-table';
import type { Alignment, PinDirection } from './common.types';

/**
 * Cell edit validation result
 */
export interface CellEditValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Cell edit event data
 */
export interface CellEditEvent<TData extends RowData, TValue = any> {
  row: TData;
  columnId: string;
  oldValue: TValue;
  newValue: TValue;
}

/**
 * Extended column meta information
 */
export interface DataGridColumnMeta {
  /**
   * Column alignment
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

  /**
   * Enable cell editing
   */
  editable?: boolean;

  /**
   * Edit type (input, select, date, etc.)
   * @default 'text'
   */
  editType?: 'text' | 'number' | 'select' | 'date' | 'checkbox';

  /**
   * Options for select type
   */
  editOptions?: Array<{ label: string; value: any }>;

  /**
   * Validator function for cell edit
   */
  editValidator?: (value: any) => CellEditValidationResult | boolean;

  /**
   * Placeholder for edit input
   */
  editPlaceholder?: string;
}

/**
 * DataGrid Column Definition
 * Simply extends ColumnDef with optional meta
 */
export type DataGridColumnDef<TData extends RowData, TValue = any> = ColumnDef<TData, TValue>;

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> extends DataGridColumnMeta {}
}
