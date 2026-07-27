// packages/gen-calendar/test/weekLayout.test.ts
// Unit tests for week overlap column layout.
import { describe, expect, it } from 'vitest';
import { normalizeEvent } from '../src/core/normalizeEvents';
import { layoutWeekTimedEvents } from '../src/core/weekLayout';
import { getWeekDays } from '../src/core/dateRange';

describe('layoutWeekTimedEvents', () => {
  it('assigns separate columns for overlapping events', () => {
    const weekDays = getWeekDays(new Date(2026, 6, 27), 0);
    const a = normalizeEvent({
      id: 'a',
      title: 'A',
      start: '2026-07-27T09:00:00',
      end: '2026-07-27T10:00:00',
    });
    const b = normalizeEvent({
      id: 'b',
      title: 'B',
      start: '2026-07-27T09:30:00',
      end: '2026-07-27T10:30:00',
    });
    const layout = layoutWeekTimedEvents([a, b], weekDays);
    const dayLayout = layout.filter((item) => item.dayIndex === weekDays.findIndex((d) => d.getDate() === 27));
    expect(dayLayout).toHaveLength(2);
    expect(new Set(dayLayout.map((item) => item.column)).size).toBe(2);
    expect(dayLayout[0].columnCount).toBe(2);
  });
});
