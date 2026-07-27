// packages/gen-calendar/test/normalizeEvents.test.ts
// Unit tests for event normalization and day grouping.
import { describe, expect, it } from 'vitest';
import { groupEventsByDateKey, normalizeEvents } from '../src/core/normalizeEvents';

describe('normalizeEvents', () => {
  it('parses ISO dates and skips cancelled events', () => {
    const events = normalizeEvents([
      {
        id: '1',
        title: 'A',
        start: '2026-07-27T09:00:00.000Z',
        end: '2026-07-27T10:00:00.000Z',
      },
      {
        id: '2',
        title: 'B',
        start: '2026-07-27T11:00:00.000Z',
        end: '2026-07-27T12:00:00.000Z',
        status: 'cancelled',
      },
    ]);
    expect(events).toHaveLength(1);
    expect(events[0].startDate).toBeInstanceOf(Date);
  });
});

describe('groupEventsByDateKey', () => {
  it('groups multi-day events across days', () => {
    const [event] = normalizeEvents([
      {
        id: '1',
        title: 'Trip',
        start: '2026-07-27T00:00:00',
        end: '2026-07-29T00:00:00',
        allDay: true,
      },
    ]);
    const map = groupEventsByDateKey([event]);
    expect(map.get('2026-07-27')?.[0].id).toBe('1');
    expect(map.get('2026-07-28')?.[0].id).toBe('1');
    expect(map.get('2026-07-29')).toBeUndefined();
  });
});
