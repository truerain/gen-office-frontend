// packages/gen-calendar/src/core/dateRange.ts
// Pure date helpers for month matrices, week ranges, and time slots.
import {
  addDays,
  addMinutes,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getHours,
  getMinutes,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

import type { CalendarDayCell } from '../GenCalendar.types';

export const DEFAULT_SNAP_MINUTES = 30;
export const HOUR_HEIGHT_PX = 48;

export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : parseISO(value);
}

export function toDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function buildMonthMatrix(
  anchor: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): CalendarDayCell[][] {
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const cells: CalendarDayCell[] = days.map((date) => ({
    date,
    dateKey: toDateKey(date),
    inCurrentMonth: isSameMonth(date, anchor),
    isToday: isToday(date),
  }));

  const weeks: CalendarDayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function getWeekDays(
  anchor: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): Date[] {
  const weekStart = startOfWeek(anchor, { weekStartsOn });
  const weekEnd = endOfWeek(anchor, { weekStartsOn });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

export function getVisibleRange(
  anchor: Date,
  view: 'month' | 'week',
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): { start: Date; end: Date } {
  if (view === 'week') {
    return {
      start: startOfWeek(anchor, { weekStartsOn }),
      end: endOfWeek(anchor, { weekStartsOn }),
    };
  }
  const monthStart = startOfMonth(anchor);
  const monthEnd = endOfMonth(anchor);
  return {
    start: startOfWeek(monthStart, { weekStartsOn }),
    end: endOfWeek(monthEnd, { weekStartsOn }),
  };
}

export function buildTimeSlots(snapMinutes = DEFAULT_SNAP_MINUTES): Date[] {
  const base = startOfDay(new Date());
  const slots: Date[] = [];
  const totalMinutes = 24 * 60;
  for (let minute = 0; minute < totalMinutes; minute += snapMinutes) {
    slots.push(addMinutes(base, minute));
  }
  return slots;
}

export function snapDate(date: Date, snapMinutes = DEFAULT_SNAP_MINUTES): Date {
  const total = getHours(date) * 60 + getMinutes(date);
  const snapped = Math.round(total / snapMinutes) * snapMinutes;
  return addMinutes(startOfDay(date), snapped);
}

export function minutesFromStartOfDay(date: Date): number {
  return getHours(date) * 60 + getMinutes(date);
}

export function shiftAnchor(
  anchor: Date,
  view: 'month' | 'week',
  direction: -1 | 1
): Date {
  return view === 'month'
    ? addMonths(anchor, direction)
    : addWeeks(anchor, direction);
}

export function eventOverlapsDay(start: Date, end: Date, day: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  return start < dayEnd && end > dayStart;
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export { addDays, addMinutes, endOfDay, format, startOfDay };
