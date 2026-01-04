import type { ColumnFiltersState } from '@tanstack/react-table';

/**
 * Filter type
 */
export type FilterType = 'text' | 'number' | 'select' | 'date' | 'boolean';

/**
 * Filter operator
 */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'
  | 'isEmpty'
  | 'isNotEmpty';

/**
 * Filter value
 */
export type FilterValue = string | number | boolean | Date | null | undefined;

/**
 * Column filter definition
 */
export interface ColumnFilterDef {
  columnId: string;
  type: FilterType;
  operator?: FilterOperator;
  value?: FilterValue;
  values?: FilterValue[];
}

/**
 * Filter bar props
 */
export interface FilterBarProps {
  /**
   * Column filters
   */
  filters: ColumnFiltersState;

  /**
   * On filter change
   */
  onFiltersChange: (filters: ColumnFiltersState) => void;

  /**
   * Available filter columns
   */
  filterableColumns?: string[];

  /**
   * Show clear all button
   */
  showClearAll?: boolean;

  /**
   * Compact mode
   */
  compact?: boolean;
}

/**
 * Column filter props
 */
export interface ColumnFilterProps {
  /**
   * Column ID
   */
  columnId: string;

  /**
   * Filter type
   */
  type: FilterType;

  /**
   * Current filter value
   */
  value?: FilterValue;

  /**
   * On filter value change
   */
  onChange: (value: FilterValue) => void;

  /**
   * Filter options (for select type)
   */
  options?: Array<{ label: string; value: FilterValue }>;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Clear filter
   */
  onClear: () => void;
}