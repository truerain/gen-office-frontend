import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import type { DateRange, PropsRange } from 'react-day-picker';
import { Button } from '../../core/Button';
import { Calendar } from '../../core/Calendar';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../core/Popover';
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
  const [draftValue, setDraftValue] = useState<DateRange | undefined>(value);

  useEffect(() => {
    if (open) setDraftValue(value);
  }, [open, value]);

  const handleSelect: PropsRange['onSelect'] = (next) => {
    setDraftValue(next ?? undefined);
  };

  const handleClear = () => {
    setDraftValue(undefined);
  };

  const selectedValue = open ? draftValue : value;
  const label = useMemo(
    () => formatRange(selectedValue, locale, format, formatOptions),
    [selectedValue, locale, format, formatOptions]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={styles.field} data-disabled={disabled}>
          <input
            type="text"
            className={styles.input}
            value={label}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              className={styles.triggerButton}
              aria-label="Open range calendar"
              disabled={disabled}
            >
              <CalendarIcon className={styles.triggerIcon} />
            </button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent align={align} className={className}>
        <div className={styles.content}>
          <Calendar
            mode="range"
            selected={selectedValue}
            onSelect={handleSelect}
            locale={locale as CalendarProps['locale']}
            {...calendarProps}
          />
          <div className={styles.monthActions}>
            {clearable && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Clear range"
                onClick={handleClear}
                disabled={!draftValue?.from}
              >
                <X className={styles.monthActionIcon} />
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="primary"
              aria-label="Confirm range"
              onClick={() => {
                onChange?.(draftValue);
                setOpen(false);
              }}
            >
              <Check className={styles.monthActionIcon} />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
