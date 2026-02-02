import type { DateRange } from 'react-day-picker';
import type { CalendarProps } from '../../core/Calendar/Calendar.types';

export interface RangeDatePickerProps {
  value?: DateRange;
  onChange?: (range?: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  format?: (date: Date) => string;
  formatOptions?: Intl.DateTimeFormatOptions;
  clearable?: boolean;
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;
  className?: string;
}
