import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import type { PropsSingle } from 'react-day-picker';
import { Calendar } from '../../core/Calendar';
import { Button } from '../../core/Button';
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
  parse,
  calendarProps,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const label = useMemo(() => {
    if (!value) return '';
    return format ? format(value) : defaultFormatter(value, locale, formatOptions);
  }, [value, format, locale, formatOptions]);

  useEffect(() => {
    if (!isEditing) setInputValue(label);
  }, [label, isEditing]);

  const handleSelect: PropsSingle['onSelect'] = (next) => {
    onChange?.(next ?? undefined);
    setOpen(false);
  };

  const parseInput = (rawValue: string) => {
    if (!rawValue.trim()) return undefined;
    if (parse) return parse(rawValue.trim());
    const parsed = new Date(rawValue.trim());
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const commitInput = () => {
    const next = parseInput(inputValue);
    if (!inputValue.trim()) {
      onChange?.(undefined);
      return true;
    }
    if (next) {
      onChange?.(next);
      return true;
    }
    return false;
  };

  const handleClear = () => {
    onChange?.(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={styles.field} data-disabled={disabled}>
        <input
          type="text"
          className={styles.input}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsEditing(true)}
          onBlur={() => {
            setIsEditing(false);
            const committed = commitInput();
            if (!committed) setInputValue(label);
          }}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            const committed = commitInput();
            if (committed) setOpen(false);
          }}
        />
        <PopoverTrigger asChild>
          <button
            type="button"
            className={styles.triggerButton}
            aria-label="Open calendar"
            disabled={disabled}
          >
            <CalendarIcon className={styles.triggerIcon} />
          </button>
        </PopoverTrigger>
      </div>
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
