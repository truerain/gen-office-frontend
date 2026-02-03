import type { CalendarProps } from '../../core/Calendar/Calendar.types';

export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
  locale?: string;
  format?: (date: Date) => string;
  formatOptions?: Intl.DateTimeFormatOptions;
  parse?: (value: string) => Date | undefined;
  clearable?: boolean;
  calendarProps?: Omit<CalendarProps, 'mode' | 'selected' | 'onSelect'>;
  className?: string;
}
