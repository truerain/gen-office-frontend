import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { PropsSingle } from 'react-day-picker';
import { Button } from '../../core/Button';
import { Calendar } from '../../core/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../core/Popover';
import type { CalendarProps } from '../../core/Calendar/Calendar.types';
import type { DatePickerProps } from './DatePicker.types';
import styles from './DatePicker.module.css';

const defaultFormatter = (date: Date, locale?: string, options?: Intl.DateTimeFormatOptions) => {
  const formatter = new Intl.DateTimeFormat(locale || undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  });
  return formatter.format(date);
};

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled,
  align = 'start',
  locale,
  format,
  formatOptions,
  clearable = true,
  calendarProps,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (!value) return '';
    return format ? format(value) : defaultFormatter(value, locale, formatOptions);
  }, [value, format, locale, formatOptions]);

  const handleSelect: PropsSingle['onSelect'] = (next) => {
    onChange?.(next ?? undefined);
    setOpen(false);
  };

  const handleClear = () => {
    onChange?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="md"
          className={styles.trigger}
          data-empty={!label}
          disabled={disabled}
        >
          <CalendarIcon className={styles.icon} />
          {label || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className={className}>
        <div className={styles.content}>
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            locale={locale as CalendarProps['locale']}
            {...calendarProps}
          />
          {clearable && value && (
            <div className={styles.actions}>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClear}
                className={styles.clearButton}
              >
                <X className={styles.clearIcon} />
                Clear
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
