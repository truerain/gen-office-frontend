import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Calendar, DatePicker, RangeDatePicker } from '@gen-office/ui';
import styles from './DatePickerDemoPage.module.css';

function DatePickerDemoPage() {
  const [basicDate, setBasicDate] = useState<Date | undefined>(new Date());
  const [clearableDate, setClearableDate] = useState<Date | undefined>();
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());
  const [rangeDate, setRangeDate] = useState<DateRange | undefined>();
  const [rangeCalendar, setRangeCalendar] = useState<DateRange | undefined>();

  const formatted = useMemo(() => {
    if (!basicDate) return '';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(basicDate);
  }, [basicDate]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Calendar & DatePicker Demo</h1>
        <p>
          Shadcn-style components built with Radix Popover and react-day-picker.
        </p>
      </div>

      <section className={styles.section}>
        <h2>DatePicker</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Basic</h3>
            <DatePicker value={basicDate} onChange={setBasicDate} />
            <div className={styles.meta}>Selected: {formatted || 'None'}</div>
          </div>

          <div className={styles.card}>
            <h3>Clearable + Placeholder</h3>
            <DatePicker
              value={clearableDate}
              onChange={setClearableDate}
              placeholder="Select a date"
              clearable
            />
            <div className={styles.meta}>
              Value: {clearableDate ? clearableDate.toDateString() : 'None'}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Range DatePicker</h3>
            <RangeDatePicker value={rangeDate} onChange={setRangeDate} />
            <div className={styles.meta}>
              Range: {rangeDate?.from ? rangeDate.from.toDateString() : 'None'}{rangeDate?.to ? ` ~ ${rangeDate.to.toDateString()}` : ''}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Calendar</h2>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Single Selection</h3>
            <Calendar
              mode="single"
              selected={calendarDate}
              onSelect={(next) => setCalendarDate(next as Date | undefined)}
              showOutsideDays
            />
            <div className={styles.meta}>
              Selected: {calendarDate ? calendarDate.toDateString() : 'None'}
            </div>
          </div>

          <div className={styles.card}>
            <h3>Range Selection</h3>
            <Calendar
              mode="range"
              selected={rangeCalendar}
              onSelect={(next) => setRangeCalendar(next as DateRange | undefined)}
              showOutsideDays
            />
            <div className={styles.meta}>
              Range: {rangeCalendar?.from ? rangeCalendar.from.toDateString() : 'None'}
              {rangeCalendar?.to ? ` ~ ${rangeCalendar.to.toDateString()}` : ''}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DatePickerDemoPage;
