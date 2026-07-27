// packages/gen-calendar/test/dateRange.test.ts
// Unit tests for month/week date helpers.
import { describe, expect, it } from 'vitest';
import {
  buildMonthMatrix,
  buildTimeSlots,
  getWeekDays,
  snapDate,
  toDateKey,
} from '../src/core/dateRange';

describe('buildMonthMatrix', () => {
  it('pads previous and next month days', () => {
    const weeks = buildMonthMatrix(new Date(2026, 6, 15), 0);
    expect(weeks.length).toBeGreaterThanOrEqual(5);
    expect(weeks[0]).toHaveLength(7);
    expect(weeks.flat().some((cell) => !cell.inCurrentMonth)).toBe(true);
    expect(weeks.flat().some((cell) => cell.dateKey.startsWith('2026-07'))).toBe(true);
  });

  it('respects weekStartsOn Monday', () => {
    const weeks = buildMonthMatrix(new Date(2026, 6, 1), 1);
    expect(weeks[0][0].date.getDay()).toBe(1);
  });
});

describe('getWeekDays', () => {
  it('returns seven days for the week', () => {
    const days = getWeekDays(new Date(2026, 6, 27), 0);
    expect(days).toHaveLength(7);
    expect(toDateKey(days[0])).toBe('2026-07-26');
    expect(toDateKey(days[6])).toBe('2026-08-01');
  });
});

describe('buildTimeSlots / snapDate', () => {
  it('builds 48 half-hour slots by default', () => {
    expect(buildTimeSlots(30)).toHaveLength(48);
  });

  it('snaps to 30 minutes', () => {
    const snapped = snapDate(new Date(2026, 6, 27, 10, 14), 30);
    expect(snapped.getMinutes()).toBe(0);
    const snappedUp = snapDate(new Date(2026, 6, 27, 10, 20), 30);
    expect(snappedUp.getMinutes()).toBe(30);
  });
});
