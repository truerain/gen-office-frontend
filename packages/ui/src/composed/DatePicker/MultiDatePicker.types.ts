// packages/ui/src/composed/DatePicker/MultiDatePicker.types.ts
// Public props for MultiDatePicker (non-contiguous multi-date selection).

import type { CalendarProps } from '../../core/Calendar/Calendar.types';

export interface MultiDatePickerProps {
  value?: Date[];
  onChange?: (dates?: Date[]) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  format?: (date: Date) => string;
  formatOptions?: Intl.DateTimeFormatOptions;
  /** When selection count exceeds this, the field shows `{first} +{n} more`. Default: 2. */
  summaryThreshold?: number;
  /** Custom overflow label when count exceeds summaryThreshold. */
  formatSummary?: (firstLabel: string, restCount: number) => string;
  /** When true, shows a clear button in the popover. Default: true. */
  clearable?: boolean;
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;
  className?: string;
}
