// packages/gen-calendar/src/core/weekLayout.ts
// Computes overlapping week-view event columns and vertical positions.
import type { NormalizedCalendarEvent, PositionedWeekEvent } from '../GenCalendar.types';
import {
  DEFAULT_SNAP_MINUTES,
  HOUR_HEIGHT_PX,
  eventOverlapsDay,
  minutesFromStartOfDay,
} from './dateRange';

function overlaps(a: NormalizedCalendarEvent, b: NormalizedCalendarEvent): boolean {
  return a.startDate < b.endDate && b.startDate < a.endDate;
}

export function layoutWeekTimedEvents(
  events: NormalizedCalendarEvent[],
  weekDays: Date[],
  options?: { snapMinutes?: number; hourHeightPx?: number }
): PositionedWeekEvent[] {
  const hourHeight = options?.hourHeightPx ?? HOUR_HEIGHT_PX;
  const snapMinutes = options?.snapMinutes ?? DEFAULT_SNAP_MINUTES;
  const positioned: PositionedWeekEvent[] = [];

  weekDays.forEach((day, dayIndex) => {
    const dayEvents = events
      .filter((event) => !event.allDay && eventOverlapsDay(event.startDate, event.endDate, day))
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const columnById = new Map<string, number>();
    const columns: NormalizedCalendarEvent[][] = [];

    for (const event of dayEvents) {
      let column = 0;
      while (true) {
        const bucket = columns[column] ?? [];
        const conflict = bucket.some((placed) => overlaps(placed, event));
        if (!conflict) {
          if (!columns[column]) columns[column] = [];
          columns[column].push(event);
          columnById.set(event.instanceId, column);
          break;
        }
        column += 1;
      }
    }

    const columnCount = Math.max(1, columns.length);

    for (const event of dayEvents) {
      const column = columnById.get(event.instanceId) ?? 0;
      const startMinutes = Math.max(0, minutesFromStartOfDay(event.startDate));
      const endMinutes = Math.max(
        startMinutes + snapMinutes,
        minutesFromStartOfDay(event.endDate)
      );
      positioned.push({
        event,
        dayIndex,
        topPx: (startMinutes / 60) * hourHeight,
        heightPx: Math.max(16, ((endMinutes - startMinutes) / 60) * hourHeight),
        column,
        columnCount,
        leftPercent: (column / columnCount) * 100,
        widthPercent: 100 / columnCount,
      });
    }
  });

  return positioned;
}

export function layoutWeekAllDayEvents(
  events: NormalizedCalendarEvent[],
  weekDays: Date[]
): Array<{ event: NormalizedCalendarEvent; startIndex: number; span: number }> {
  const result: Array<{ event: NormalizedCalendarEvent; startIndex: number; span: number }> =
    [];

  for (const event of events.filter((item) => item.allDay)) {
    let startIndex = -1;
    let endIndex = -1;
    weekDays.forEach((day, index) => {
      if (eventOverlapsDay(event.startDate, event.endDate, day)) {
        if (startIndex === -1) startIndex = index;
        endIndex = index;
      }
    });
    if (startIndex === -1 || endIndex === -1) continue;
    result.push({
      event,
      startIndex,
      span: endIndex - startIndex + 1,
    });
  }

  return result.sort((a, b) => {
    if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
    return b.span - a.span;
  });
}
