import { useEffect, useMemo, useState } from 'react';
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '../../core/Button';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from '../../core/Popover';
import type { MonthPickerProps } from './MonthPicker.types';
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

const parseYearMonth = (raw: string) => {
  const normalized = raw.trim();
  const match = normalized.match(/^(\d{4})[-/.]?(\d{1,2})$/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return undefined;
  return new Date(year, month - 1, 1);
};

const normalizeMonth = (date?: Date) =>
  date ? new Date(date.getFullYear(), date.getMonth(), 1) : undefined;

const monthKey = (date: Date) => date.getFullYear() * 12 + date.getMonth();

export function MonthPicker({
  value,
  onChange,
  fromMonth,
  toMonth,
  placeholder = 'Select month',
  disabled,
  align = 'start',
  locale,
  format,
  clearable = true,
  parse,
  className,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const normalizedFromMonth = normalizeMonth(fromMonth);
  const normalizedToMonth = normalizeMonth(toMonth);
  const [displayYear, setDisplayYear] = useState(() => value?.getFullYear() ?? new Date().getFullYear());
  const [draftValue, setDraftValue] = useState<Date | undefined>(value);

  const isWithinRange = (date?: Date) => {
    if (!date) return true;
    const key = monthKey(date);
    if (normalizedFromMonth && key < monthKey(normalizedFromMonth)) return false;
    if (normalizedToMonth && key > monthKey(normalizedToMonth)) return false;
    return true;
  };

  const minYear = normalizedFromMonth?.getFullYear();
  const maxYear = normalizedToMonth?.getFullYear();

  const label = useMemo(() => {
    if (!value) return '';
    return format ? format(value) : defaultFormatter(value, locale);
  }, [value, format, locale]);

  useEffect(() => {
    if (!isEditing) setInputValue(label);
  }, [label, isEditing]);

  useEffect(() => {
    if (open) {
      setDraftValue(value);
      const fallbackYear = new Date().getFullYear();
      const baseYear = value?.getFullYear() ?? fallbackYear;
      const boundedYear =
        minYear !== undefined && baseYear < minYear
          ? minYear
          : maxYear !== undefined && baseYear > maxYear
            ? maxYear
            : baseYear;
      setDisplayYear(boundedYear);
    }
  }, [maxYear, minYear, open, value]);

  const parseInput = (rawValue: string) => {
    if (!rawValue.trim()) return undefined;
    if (parse) return parse(rawValue.trim());
    return parseYearMonth(rawValue);
  };

  const commitInput = () => {
    const next = parseInput(inputValue);
    if (!inputValue.trim()) {
      onChange?.(undefined);
      return true;
    }
    if (next && isWithinRange(next)) {
      onChange?.(next);
      setDisplayYear(next.getFullYear());
      return true;
    }
    return false;
  };

  const selectedValue = open ? draftValue : value;
  const isSelectedMonth = (month: number) =>
    Boolean(selectedValue && selectedValue.getFullYear() === displayYear && selectedValue.getMonth() === month);
  const canGoPrevYear = minYear === undefined || displayYear > minYear;
  const canGoNextYear = maxYear === undefined || displayYear < maxYear;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
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
              aria-label="Open month picker"
              disabled={disabled}
            >
              <CalendarIcon className={styles.triggerIcon} />
            </button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent
        align={align}
        className={`${styles.monthPopover} ${className ?? ''}`.trim()}
      >
        <div className={styles.monthContent}>
          <div className={styles.monthHeader}>
            <button
              type="button"
              className={styles.yearNav}
              aria-label="Previous year"
              disabled={!canGoPrevYear}
              onClick={() => setDisplayYear((prev) => prev - 1)}
            >
              <ChevronLeft className={styles.yearNavIcon} />
            </button>
            <span className={styles.yearLabel}>{displayYear}</span>
            <button
              type="button"
              className={styles.yearNav}
              aria-label="Next year"
              disabled={!canGoNextYear}
              onClick={() => setDisplayYear((prev) => prev + 1)}
            >
              <ChevronRight className={styles.yearNavIcon} />
            </button>
          </div>

          <div className={styles.monthGrid}>
            {Array.from({ length: 12 }, (_, month) => {
              const candidate = new Date(displayYear, month, 1);
              const disabledMonth = !isWithinRange(candidate);
              return (
                <button
                  key={month}
                  type="button"
                  className={styles.monthCell}
                  data-selected={isSelectedMonth(month) ? 'true' : 'false'}
                  disabled={disabledMonth}
                  onClick={() => {
                    setDraftValue(candidate);
                  }}
                >
                  {monthLabelFormatter(month, locale)}
                </button>
              );
            })}
          </div>

          <div className={styles.monthActions}>
            {clearable && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Clear month"
                onClick={() => setDraftValue(undefined)}
                disabled={!draftValue}
              >
                <X className={styles.monthActionIcon} />
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="primary"
              aria-label="Confirm month"
              onClick={() => {
                onChange?.(draftValue);
                setOpen(false);
              }}
              disabled={!isWithinRange(draftValue)}
            >
              <Check className={styles.monthActionIcon} />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
