// packages/gen-calendar/src/index.ts
// Public entry for @gen-office/gen-calendar.
import './index.css';

export { GenCalendar } from './GenCalendar';
export type {
  GenCalendarProps,
  GenCalendarView,
  GenCalendarEvent,
  GenCalendarEventStatus,
  GenCalendarRecurrenceFrequency,
  GenCalendarRecurrenceRule,
  GenCalendarMoreEventsClick,
  GenCalendarEditChange,
  GenCalendarSlotSelection,
  CalendarDayCell,
  NormalizedCalendarEvent,
  PositionedWeekEvent,
} from './GenCalendar.types';

export {
  buildMonthMatrix,
  getWeekDays,
  getVisibleRange,
  buildTimeSlots,
  snapDate,
  shiftAnchor,
  toDate,
  toDateKey,
  DEFAULT_SNAP_MINUTES,
} from './core/dateRange';
export { normalizeEvent, normalizeEvents, groupEventsByDateKey } from './core/normalizeEvents';
export { expandRecurrence, expandEventsForRange } from './core/recurrence';
export { layoutWeekTimedEvents, layoutWeekAllDayEvents } from './core/weekLayout';
