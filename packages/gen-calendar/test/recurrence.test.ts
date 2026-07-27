// packages/gen-calendar/test/recurrence.test.ts
// Unit tests for recurrence expansion and exception overrides.
import { describe, expect, it } from 'vitest';
import { expandEventsForRange, expandRecurrence } from '../src/core/recurrence';
import type { GenCalendarEvent } from '../src/GenCalendar.types';

describe('expandRecurrence', () => {
  it('expands daily events inside range only', () => {
    const event: GenCalendarEvent = {
      id: 'daily',
      title: 'Daily',
      start: '2026-07-01T09:00:00',
      end: '2026-07-01T09:30:00',
      recurrence: { frequency: 'daily', interval: 1, count: 5 },
    };
    const instances = expandRecurrence(event, {
      start: new Date(2026, 6, 1),
      end: new Date(2026, 6, 10),
    });
    expect(instances).toHaveLength(5);
  });

  it('skips exception dates', () => {
    const event: GenCalendarEvent = {
      id: 'daily',
      title: 'Daily',
      start: '2026-07-01T09:00:00',
      end: '2026-07-01T09:30:00',
      recurrence: {
        frequency: 'daily',
        interval: 1,
        count: 3,
        exceptions: ['2026-07-02'],
      },
    };
    const instances = expandRecurrence(event, {
      start: new Date(2026, 6, 1),
      end: new Date(2026, 6, 10),
    });
    expect(instances.map((item) => item.start.slice(0, 10))).toEqual([
      '2026-07-01',
      '2026-07-03',
    ]);
  });
});

describe('expandEventsForRange', () => {
  it('prefers exception override over occurrence', () => {
    const events: GenCalendarEvent[] = [
      {
        id: 'series',
        title: 'Weekly',
        start: '2026-07-06T10:00:00',
        end: '2026-07-06T11:00:00',
        recurrence: { frequency: 'weekly', interval: 1, count: 3 },
      },
      {
        id: 'series-exception',
        title: 'Weekly moved',
        start: '2026-07-13T15:00:00',
        end: '2026-07-13T16:00:00',
        recurrenceId: 'series',
        originalStart: '2026-07-13T10:00:00',
      },
    ];
    const expanded = expandEventsForRange(events, {
      start: new Date(2026, 6, 1),
      end: new Date(2026, 6, 31),
    });
    const july13 = expanded.find((item) => item.startDate.getDate() === 13);
    expect(july13?.title).toBe('Weekly moved');
    expect(july13?.startDate.getHours()).toBe(15);
  });
});
