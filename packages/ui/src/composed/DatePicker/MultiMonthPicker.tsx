// packages/ui/src/composed/DatePicker/MultiMonthPicker.tsx
// Multi-select month picker with toggle draft, clear, and confirm.

import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../core/Button';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../core/Popover';
import type { MultiMonthPickerProps } from './MultiMonthPicker.types';
import { formatMultiSelectionDisplay } from './multiSelectionDisplay';
import styles from './DatePicker.module.css';

const defaultFormatter = (date: Date, locale?: string) => {
  const formatter = new Intl.DateTimeFormat(locale || undefined, {
    year: 'numeric',
    month: '2-digit',
  });
  return formatter.format(date);
};

const monthLabelFormatter = (month: number, locale?: string) =>
  new Intl.DateTimeFormat(locale || undefined, { month: 'short' }).format(new Date(2000, month, 1));

const normalizeMonth = (date?: Date) =>
  date ? new Date(date.getFullYear(), date.getMonth(), 1) : undefined;

const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();

const normalizeMonths = (months?: Date[]): Date[] => {
  if (!months?.length) return [];
  const byKey = new Map<number, Date>();
  for (const item of months) {
    const next = normalizeMonth(item);
    if (!next) continue;
    byKey.set(monthKey(next), next);
  }
  return Array.from(byKey.values()).sort((a, b) => monthKey(a) - monthKey(b));
};

const monthsSignature = (months?: Date[]) =>
  normalizeMonths(months)
    .map((date) => monthKey(date))
    .join(',');

export function MultiMonthPicker({
  value,
  onChange,
  fromMonth,
  toMonth,
  placeholder = 'Select months',
  disabled,
  align = 'start',
  locale,
  format,
  summaryThreshold,
  formatSummary,
  clearable = true,
  visibleYears = 1,
  className,
}: MultiMonthPickerProps) {
  const panelCount = visibleYears === 2 ? 2 : 1;
  const [open, setOpen] = useState(false);
  const normalizedFromMonth = useMemo(() => normalizeMonth(fromMonth), [fromMonth]);
  const normalizedToMonth = useMemo(() => normalizeMonth(toMonth), [toMonth]);
  const valueSignature = monthsSignature(value);
  const normalizedValue = useMemo(() => normalizeMonths(value), [valueSignature]);
  const [displayYear, setDisplayYear] = useState(
    () => normalizedValue[0]?.getFullYear() ?? new Date().getFullYear()
  );
  const [draftValue, setDraftValue] = useState<Date[]>(normalizedValue);

  const isWithinRange = (date?: Date) => {
    if (!date) return true;
    const key = monthKey(date);
    if (normalizedFromMonth && key < monthKey(normalizedFromMonth)) return false;
    if (normalizedToMonth && key > monthKey(normalizedToMonth)) return false;
    return true;
  };

  const minYear = normalizedFromMonth?.getFullYear();
  const maxYear = normalizedToMonth?.getFullYear();

  const clampDisplayYear = (year: number) => {
    let next = year;
    if (minYear !== undefined && next < minYear) next = minYear;
    if (maxYear !== undefined) {
      const maxStartYear = maxYear - (panelCount - 1);
      const upper = Math.max(minYear ?? maxStartYear, maxStartYear);
      if (next > upper) next = upper;
    }
    return next;
  };

  useEffect(() => {
    if (!open) return;
    setDraftValue(normalizedValue);
    const fallbackYear = new Date().getFullYear();
    const baseYear = normalizedValue[0]?.getFullYear() ?? fallbackYear;
    setDisplayYear(clampDisplayYear(baseYear));
  }, [maxYear, minYear, normalizedValue, open, panelCount]);

  const selectedValue = open ? draftValue : normalizedValue;
  const selectedKeys = useMemo(() => new Set(selectedValue.map(monthKey)), [selectedValue]);

  const { label, title } = useMemo(() => {
    const formatItem = (date: Date) => (format ? format(date) : defaultFormatter(date, locale));
    return formatMultiSelectionDisplay(selectedValue, {
      summaryThreshold,
      formatItem,
      formatSummary,
    });
  }, [selectedValue, locale, format, summaryThreshold, formatSummary]);

  const canGoPrevYear = minYear === undefined || displayYear > minYear;
  const canGoNextYear =
    maxYear === undefined || displayYear + panelCount - 1 < maxYear;

  const handleMonthToggle = (year: number, month: number) => {
    const candidate = new Date(year, month, 1);
    if (!isWithinRange(candidate)) return;
    const key = monthKey(candidate);

    setDraftValue((prev) => {
      const exists = prev.some((item) => monthKey(item) === key);
      if (exists) return normalizeMonths(prev.filter((item) => monthKey(item) !== key));
      return normalizeMonths([...prev, candidate]);
    });
  };

  const yearPanels = Array.from({ length: panelCount }, (_, offset) => displayYear + offset);

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
              aria-label="Open multi month picker"
              disabled={disabled}
            >
              <CalendarIcon className={styles.triggerIcon} />
            </button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align={align}
        className={`${styles.monthPopover} ${panelCount === 2 ? styles.monthPopoverWide : ''} ${className ?? ''}`.trim()}
      >
        <div className={styles.monthContent}>
          <div className={styles.monthHeader}>
            <button
              type="button"
              className={styles.yearNav}
              aria-label="Previous year"
              disabled={!canGoPrevYear}
              onClick={() => setDisplayYear((prev) => clampDisplayYear(prev - 1))}
            >
              <ChevronLeft className={styles.yearNavIcon} />
            </button>
            {panelCount === 1 ? (
              <span className={styles.yearLabel}>{displayYear}</span>
            ) : (
              <div className={styles.monthHeaderYears}>
                {yearPanels.map((year) => (
                  <span key={year} className={styles.yearLabel}>
                    {year}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              className={styles.yearNav}
              aria-label="Next year"
              disabled={!canGoNextYear}
              onClick={() => setDisplayYear((prev) => clampDisplayYear(prev + 1))}
            >
              <ChevronRight className={styles.yearNavIcon} />
            </button>
          </div>

          <div className={styles.monthYears}>
            {yearPanels.map((year) => (
              <div key={year} className={styles.monthYearPanel}>
                <div className={styles.monthGrid}>
                  {Array.from({ length: 12 }, (_, month) => {
                    const candidate = new Date(year, month, 1);
                    const disabledMonth = !isWithinRange(candidate);
                    const selected = selectedKeys.has(monthKey(candidate));
                    return (
                      <button
                        key={month}
                        type="button"
                        className={styles.monthCell}
                        data-selected={selected ? 'true' : 'false'}
                        disabled={disabledMonth}
                        onClick={() => handleMonthToggle(year, month)}
                      >
                        {monthLabelFormatter(month, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.monthActions}>
            {clearable ? (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Clear months"
                onClick={() => setDraftValue([])}
                disabled={draftValue.length === 0}
              >
                <X className={styles.monthActionIcon} />
              </Button>
            ) : null}
            <Button
              type="button"
              size="icon"
              variant="primary"
              aria-label="Confirm months"
              onClick={() => {
                const next = normalizeMonths(draftValue);
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
