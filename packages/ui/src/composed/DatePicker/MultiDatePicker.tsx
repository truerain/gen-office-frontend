// packages/ui/src/composed/DatePicker/MultiDatePicker.tsx
// Multi-select date picker with toggle draft, clear, and confirm.

import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import type { PropsMulti } from 'react-day-picker';
import { Button } from '../../core/Button';
import { Calendar } from '../../core/Calendar';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../core/Popover';
import type { CalendarProps } from '../../core/Calendar/Calendar.types';
import type { MultiDatePickerProps } from './MultiDatePicker.types';
import { formatMultiSelectionDisplay } from './multiSelectionDisplay';
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

const normalizeDay = (date?: Date) =>
  date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()) : undefined;

const dayKey = (date: Date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const normalizeDates = (dates?: Date[]): Date[] => {
  if (!dates?.length) return [];
  const byKey = new Map<number, Date>();
  for (const item of dates) {
    const next = normalizeDay(item);
    if (!next) continue;
    byKey.set(dayKey(next), next);
  }
  return Array.from(byKey.values()).sort((a, b) => dayKey(a) - dayKey(b));
};

const datesSignature = (dates?: Date[]) =>
  normalizeDates(dates)
    .map((date) => dayKey(date))
    .join(',');

export function MultiDatePicker({
  value,
  onChange,
  placeholder = 'Select dates',
  disabled,
  align = 'start',
  locale,
  format,
  formatOptions,
  summaryThreshold,
  formatSummary,
  clearable = true,
  calendarProps,
  className,
}: MultiDatePickerProps) {
  const [open, setOpen] = useState(false);
  const valueSignature = datesSignature(value);
  const normalizedValue = useMemo(() => normalizeDates(value), [valueSignature]);
  const [draftValue, setDraftValue] = useState<Date[]>(normalizedValue);

  useEffect(() => {
    if (open) setDraftValue(normalizedValue);
  }, [open, normalizedValue]);

  const handleSelect: PropsMulti['onSelect'] = (next) => {
    setDraftValue(normalizeDates(next));
  };

  const handleClear = () => {
    setDraftValue([]);
  };

  const selectedValue = open ? draftValue : normalizedValue;
  const { label, title } = useMemo(() => {
    const formatItem = (date: Date) =>
      format ? format(date) : defaultFormatter(date, locale, formatOptions);
    return formatMultiSelectionDisplay(selectedValue, {
      summaryThreshold,
      formatItem,
      formatSummary,
    });
  }, [selectedValue, locale, format, formatOptions, summaryThreshold, formatSummary]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className={styles.field} data-disabled={disabled}>
          <input
            type="text"
            className={styles.input}
            value={label}
            title={title}
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
              aria-label="Open multi date picker"
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
            mode="multiple"
            selected={selectedValue}
            onSelect={handleSelect}
            locale={locale as CalendarProps['locale']}
            {...calendarProps}
          />
          <div className={styles.monthActions}>
            {clearable ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Clear dates"
                onClick={handleClear}
                disabled={draftValue.length === 0}
              >
                <X className={styles.monthActionIcon} />
              </Button>
            ) : null}
            <Button
              type="button"
              size="icon"
              variant="primary"
              aria-label="Confirm dates"
              onClick={() => {
                const next = normalizeDates(draftValue);
                onChange?.(next.length ? next : undefined);
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
