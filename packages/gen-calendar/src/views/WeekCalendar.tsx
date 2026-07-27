// packages/gen-calendar/src/views/WeekCalendar.tsx
// Week timetable view with all-day row and overlapping timed events.
import type {
  GenCalendarEvent,
  GenCalendarSlotSelection,
  NormalizedCalendarEvent,
  PositionedWeekEvent,
} from '../GenCalendar.types';
import {
  HOUR_HEIGHT_PX,
  format,
  minutesFromStartOfDay,
  snapDate,
  toDateKey,
} from '../core/dateRange';
import { layoutWeekAllDayEvents, layoutWeekTimedEvents } from '../core/weekLayout';

export interface WeekCalendarProps {
  weekDays: Date[];
  events: NormalizedCalendarEvent[];
  snapMinutes?: number;
  onEventClick?: (event: GenCalendarEvent) => void;
  onSlotSelect?: (selection: GenCalendarSlotSelection) => void;
  onEventDragStart?: (event: NormalizedCalendarEvent, e: React.PointerEvent) => void;
  onEventResizeStart?: (
    event: NormalizedCalendarEvent,
    edge: 'start' | 'end',
    e: React.PointerEvent
  ) => void;
  preview?: PositionedWeekEvent | null;
}

export function WeekCalendar({
  weekDays,
  events,
  snapMinutes = 30,
  onEventClick,
  onSlotSelect,
  onEventDragStart,
  onEventResizeStart,
  preview,
}: WeekCalendarProps) {
  const timed = layoutWeekTimedEvents(events, weekDays, { snapMinutes });
  const allDay = layoutWeekAllDayEvents(events, weekDays);
  const hours = Array.from({ length: 24 }, (_, hour) => hour);

  const handleGridClick = (day: Date, e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minutes = Math.floor((offsetY / HOUR_HEIGHT_PX) * 60);
    const raw = new Date(day);
    raw.setHours(0, 0, 0, 0);
    raw.setMinutes(minutes);
    const start = snapDate(raw, snapMinutes);
    const end = new Date(start.getTime() + snapMinutes * 60_000);
    onSlotSelect?.({
      start: start.toISOString(),
      end: end.toISOString(),
      allDay: false,
      view: 'week',
    });
  };

  return (
    <div className="gen-calendar-week">
      <div className="gen-calendar-week__header">
        <div className="gen-calendar-week__gutter" />
        {weekDays.map((day) => (
          <div key={toDateKey(day)} className="gen-calendar-week__day-header">
            <div className="gen-calendar-week__day-name">{format(day, 'EEE')}</div>
            <div className="gen-calendar-week__day-date">{format(day, 'M/d')}</div>
          </div>
        ))}
      </div>

      <div className="gen-calendar-week__allday">
        <div className="gen-calendar-week__gutter">all-day</div>
        <div className="gen-calendar-week__allday-grid">
          {allDay.map(({ event, startIndex, span }) => (
            <button
              key={event.instanceId}
              type="button"
              className="gen-calendar-week__allday-event"
              style={{
                gridColumn: `${startIndex + 1} / span ${span}`,
                backgroundColor: event.color,
              }}
              onClick={() => onEventClick?.(event)}
              onPointerDown={(e) => onEventDragStart?.(event, e)}
            >
              {event.title}
            </button>
          ))}
        </div>
      </div>

      <div className="gen-calendar-week__scroll">
        <div className="gen-calendar-week__time-grid" style={{ height: 24 * HOUR_HEIGHT_PX }}>
          <div className="gen-calendar-week__hours">
            {hours.map((hour) => (
              <div
                key={hour}
                className="gen-calendar-week__hour"
                style={{ height: HOUR_HEIGHT_PX }}
              >
                {`${String(hour).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>
          <div className="gen-calendar-week__columns">
            {weekDays.map((day) => (
              <div
                key={toDateKey(day)}
                className="gen-calendar-week__column"
                onClick={(e) => handleGridClick(day, e)}
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="gen-calendar-week__slot"
                    style={{ height: HOUR_HEIGHT_PX }}
                  />
                ))}
              </div>
            ))}
            {[...timed, ...(preview ? [preview] : [])].map((item) => (
              <div
                key={`${item.event.instanceId}-${item.dayIndex}-${item.topPx}`}
                className={[
                  'gen-calendar-week__event',
                  preview?.event.instanceId === item.event.instanceId ? 'is-preview' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  left: `calc(${((item.dayIndex + item.leftPercent / 100) / weekDays.length) * 100}% + 2px)`,
                  width: `calc(${(item.widthPercent / 100 / weekDays.length) * 100}% - 4px)`,
                  top: item.topPx,
                  height: item.heightPx,
                  backgroundColor: item.event.color,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(item.event);
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onEventDragStart?.(item.event, e);
                }}
              >
                <div className="gen-calendar-week__event-title">{item.event.title}</div>
                <div className="gen-calendar-week__event-time">
                  {format(item.event.startDate, 'HH:mm')}
                  {' – '}
                  {format(item.event.endDate, 'HH:mm')}
                </div>
                <span
                  className="gen-calendar-week__resize gen-calendar-week__resize--start"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onEventResizeStart?.(item.event, 'start', e);
                  }}
                />
                <span
                  className="gen-calendar-week__resize gen-calendar-week__resize--end"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onEventResizeStart?.(item.event, 'end', e);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function minutesAtPointer(
  columnTop: number,
  clientY: number,
  snapMinutes: number
): number {
  const offsetY = clientY - columnTop;
  const rawMinutes = Math.max(0, Math.min(24 * 60, (offsetY / HOUR_HEIGHT_PX) * 60));
  return Math.round(rawMinutes / snapMinutes) * snapMinutes;
}

export { minutesFromStartOfDay };
