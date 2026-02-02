import { useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { DateRange, PropsRange } from 'react-day-picker';
import { Button } from '../../core/Button';
import { Calendar } from '../../core/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../core/Popover';
import type { CalendarProps } from '../../core/Calendar/Calendar.types';
import type { RangeDatePickerProps } from './RangeDatePicker.types';
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

function formatRange(
  range: DateRange | undefined,
  locale?: string,
  format?: (date: Date) => string,
  formatOptions?: Intl.DateTimeFormatOptions
) {
  if (!range?.from && !range?.to) return '';
  const formatDate = (date: Date) =>
    format ? format(date) : defaultFormatter(date, locale, formatOptions);
  if (range.from && range.to) return `${formatDate(range.from)} ~ ${formatDate(range.to)}`;
  if (range.from) return `${formatDate(range.from)} ~`;
  return '';
}

export function RangeDatePicker({
  value,
  onChange,
  placeholder = 'Select date range',
  disabled,
  align = 'start',
  locale,
  format,
  formatOptions,
  clearable = true,
  calendarProps,
  className,
}: RangeDatePickerProps) {
  const [open, setOpen] = useState(false);

  const label = useMemo(
    () => formatRange(value, locale, format, formatOptions),
    [value, locale, format, formatOptions]
  );

  const handleSelect: PropsRange['onSelect'] = (next) => {
    onChange?.(next ?? undefined);
    const wasSelectingEnd = value?.from && !value?.to;
    if (wasSelectingEnd && next?.to) setOpen(false);
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
            mode="range"
            selected={value}
            onSelect={handleSelect}
            locale={locale as CalendarProps['locale']}
            {...calendarProps}
          />
          {clearable && value?.from && (
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
