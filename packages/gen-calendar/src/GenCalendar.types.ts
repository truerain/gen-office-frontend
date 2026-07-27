// packages/gen-calendar/src/GenCalendar.types.ts
// Public types for GenCalendar events, views, and callbacks.

export type GenCalendarView = 'month' | 'week';

export type GenCalendarEventStatus =
  | 'draft'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type GenCalendarRecurrenceFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly';

export interface GenCalendarRecurrenceRule {
  frequency: GenCalendarRecurrenceFrequency;
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  until?: string;
  count?: number;
  exceptions?: string[];
}

export interface GenCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  timezone?: string;
  description?: string;
  location?: string;
  status?: GenCalendarEventStatus;
  color?: string;
  editable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  recurrence?: GenCalendarRecurrenceRule;
  recurrenceId?: string;
  originalStart?: string;
  resourceId?: string;
  ownerId?: string;
  attendeeIds?: string[];
  meta?: Record<string, unknown>;
}

export interface GenCalendarMoreEventsClick {
  date: string;
  events: GenCalendarEvent[];
  hiddenCount: number;
}

export interface GenCalendarEditChange {
  eventId: string;
  start: string;
  end: string;
  allDay?: boolean;
  originalEvent: GenCalendarEvent;
}

export interface GenCalendarSlotSelection {
  start: string;
  end: string;
  allDay?: boolean;
  view: GenCalendarView;
}

export interface GenCalendarProps {
  date?: Date | string;
  defaultDate?: Date | string;
  view?: GenCalendarView;
  defaultView?: GenCalendarView;
  events?: GenCalendarEvent[];
  editable?: boolean;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  snapMinutes?: number;
  maxVisibleEventsPerDay?: number;
  className?: string;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: GenCalendarView) => void;
  onEventClick?: (event: GenCalendarEvent) => void;
  onSlotSelect?: (selection: GenCalendarSlotSelection) => void;
  onEventMove?: (change: GenCalendarEditChange) => void;
  onEventResize?: (change: GenCalendarEditChange) => void;
  onMoreEventsClick?: (payload: GenCalendarMoreEventsClick) => void;
}

export interface CalendarDayCell {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
  isToday: boolean;
}

export interface NormalizedCalendarEvent extends GenCalendarEvent {
  startDate: Date;
  endDate: Date;
  instanceId: string;
  isOccurrence: boolean;
}

export interface PositionedWeekEvent {
  event: NormalizedCalendarEvent;
  dayIndex: number;
  topPx: number;
  heightPx: number;
  column: number;
  columnCount: number;
  leftPercent: number;
  widthPercent: number;
}
