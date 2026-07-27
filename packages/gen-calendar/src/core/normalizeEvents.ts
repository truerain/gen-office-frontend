// packages/gen-calendar/src/core/normalizeEvents.ts
// Normalizes raw calendar events into computation-friendly instances.
import { isValid, parseISO } from 'date-fns';

import type { GenCalendarEvent, NormalizedCalendarEvent } from '../GenCalendar.types';
import { toDateKey } from './dateRange';

function parseEventDate(value: string): Date {
  const parsed = parseISO(value);
  if (!isValid(parsed)) {
    throw new Error(`Invalid calendar event date: ${value}`);
  }
  return parsed;
}

export function normalizeEvent(
  event: GenCalendarEvent,
  options?: { instanceStart?: Date; isOccurrence?: boolean }
): NormalizedCalendarEvent {
  const startDate = options?.instanceStart ?? parseEventDate(event.start);
  const durationMs =
    parseEventDate(event.end).getTime() - parseEventDate(event.start).getTime();
  const endDate = new Date(startDate.getTime() + Math.max(durationMs, 0));
  const instanceId = options?.isOccurrence
    ? `${event.id}::${toDateKey(startDate)}`
    : event.id;

  return {
    ...event,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startDate,
    endDate,
    instanceId,
    isOccurrence: Boolean(options?.isOccurrence),
    allDay: Boolean(event.allDay),
  };
}

export function normalizeEvents(events: GenCalendarEvent[]): NormalizedCalendarEvent[] {
  return events
    .filter((event) => event.status !== 'cancelled')
    .map((event) => normalizeEvent(event))
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export function groupEventsByDateKey(
  events: NormalizedCalendarEvent[]
): Map<string, NormalizedCalendarEvent[]> {
  const map = new Map<string, NormalizedCalendarEvent[]>();

  for (const event of events) {
    const cursor = new Date(event.startDate);
    cursor.setHours(0, 0, 0, 0);
    const endDay = new Date(event.endDate);
    // Exclusive end at midnight means previous day for all-day ranges ending at 00:00.
    if (
      event.allDay &&
      endDay.getHours() === 0 &&
      endDay.getMinutes() === 0 &&
      endDay.getSeconds() === 0 &&
      endDay.getTime() > event.startDate.getTime()
    ) {
      endDay.setDate(endDay.getDate() - 1);
    }
    endDay.setHours(0, 0, 0, 0);

    while (cursor.getTime() <= endDay.getTime()) {
      const key = toDateKey(cursor);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  for (const list of map.values()) {
    list.sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      return a.startDate.getTime() - b.startDate.getTime();
    });
  }

  return map;
}
