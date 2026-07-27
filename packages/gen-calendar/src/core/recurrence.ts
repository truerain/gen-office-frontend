// packages/gen-calendar/src/core/recurrence.ts
// Expands recurrence rules into visible event instances for a date range.
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
  startOfDay,
} from 'date-fns';

import type {
  GenCalendarEvent,
  NormalizedCalendarEvent,
} from '../GenCalendar.types';
import { toDateKey } from './dateRange';
import { normalizeEvent } from './normalizeEvents';

function parseOptionalDate(value?: string): Date | undefined {
  return value ? parseISO(value) : undefined;
}

function matchesWeekly(day: Date, daysOfWeek?: number[]): boolean {
  if (!daysOfWeek || daysOfWeek.length === 0) return true;
  return daysOfWeek.includes(day.getDay());
}

function nextOccurrence(
  current: Date,
  frequency: GenCalendarEvent['recurrence'] extends infer R
    ? R extends { frequency: infer F }
      ? F
      : never
    : never,
  interval: number
): Date {
  switch (frequency) {
    case 'daily':
      return addDays(current, interval);
    case 'weekly':
      return addWeeks(current, interval);
    case 'monthly':
      return addMonths(current, interval);
    case 'yearly':
      return addYears(current, interval);
    default:
      return addDays(current, interval);
  }
}

export function expandRecurrence(
  event: GenCalendarEvent,
  range: { start: Date; end: Date }
): NormalizedCalendarEvent[] {
  if (!event.recurrence) {
    return [normalizeEvent(event)];
  }

  const rule = event.recurrence;
  const interval = Math.max(1, rule.interval ?? 1);
  const until = parseOptionalDate(rule.until);
  const exceptions = new Set(
    (rule.exceptions ?? []).map((value) => toDateKey(parseISO(value)))
  );
  const seedStart = parseISO(event.start);
  const results: NormalizedCalendarEvent[] = [];

  let cursor = seedStart;
  let count = 0;
  const maxIterations = 1000;

  for (let i = 0; i < maxIterations; i += 1) {
    if (until && isAfter(startOfDay(cursor), startOfDay(until))) break;
    if (rule.count != null && count >= rule.count) break;

    const inRange =
      !isAfter(cursor, range.end) && !isBefore(cursor, addDays(range.start, -1));

    if (inRange) {
      const weeklyOk =
        rule.frequency !== 'weekly' || matchesWeekly(cursor, rule.daysOfWeek);
      const monthlyOk =
        rule.frequency !== 'monthly' ||
        rule.dayOfMonth == null ||
        cursor.getDate() === rule.dayOfMonth;

      if (weeklyOk && monthlyOk && !exceptions.has(toDateKey(cursor))) {
        results.push(
          normalizeEvent(event, {
            instanceStart: cursor,
            isOccurrence: !isEqual(cursor, seedStart),
          })
        );
        count += 1;
      } else if (weeklyOk && monthlyOk) {
        count += 1;
      }
    } else if (isAfter(cursor, range.end)) {
      break;
    } else {
      // Still count occurrences before range when count is used.
      const weeklyOk =
        rule.frequency !== 'weekly' || matchesWeekly(cursor, rule.daysOfWeek);
      const monthlyOk =
        rule.frequency !== 'monthly' ||
        rule.dayOfMonth == null ||
        cursor.getDate() === rule.dayOfMonth;
      if (weeklyOk && monthlyOk) count += 1;
    }

    cursor = nextOccurrence(cursor, rule.frequency, interval);
  }

  return results;
}

export function expandEventsForRange(
  events: GenCalendarEvent[],
  range: { start: Date; end: Date }
): NormalizedCalendarEvent[] {
  const exceptionsBySeries = new Map<string, GenCalendarEvent[]>();
  const masters: GenCalendarEvent[] = [];

  for (const event of events) {
    if (event.status === 'cancelled' && !event.recurrenceId) continue;
    if (event.recurrenceId) {
      const list = exceptionsBySeries.get(event.recurrenceId) ?? [];
      list.push(event);
      exceptionsBySeries.set(event.recurrenceId, list);
      continue;
    }
    masters.push(event);
  }

  const expanded: NormalizedCalendarEvent[] = [];

  for (const master of masters) {
    const occurrences = expandRecurrence(master, range);
    const overrides = exceptionsBySeries.get(master.id) ?? [];

    for (const occurrence of occurrences) {
      const override = overrides.find((item) => {
        if (!item.originalStart) return false;
        return toDateKey(parseISO(item.originalStart)) === toDateKey(occurrence.startDate);
      });

      if (!override) {
        expanded.push(occurrence);
        continue;
      }
      if (override.status === 'cancelled') continue;
      expanded.push(
        normalizeEvent({
          ...override,
          id: override.id,
          recurrenceId: master.id,
          originalStart: override.originalStart,
        })
      );
    }
  }

  // Standalone non-recurring already handled via masters without recurrence.
  return expanded.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}
