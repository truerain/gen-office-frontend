// packages/gen-calendar/src/views/MonthCalendar.tsx
// Month grid view with overflow "+N more" action.
import type {
  CalendarDayCell,
  GenCalendarEvent,
  GenCalendarMoreEventsClick,
  NormalizedCalendarEvent,
} from '../GenCalendar.types';
import { groupEventsByDateKey } from '../core/normalizeEvents';
import { format } from '../core/dateRange';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface MonthCalendarProps {
  weeks: CalendarDayCell[][];
  events: NormalizedCalendarEvent[];
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  maxVisibleEventsPerDay?: number;
  onEventClick?: (event: GenCalendarEvent) => void;
  onDayClick?: (date: Date) => void;
  onMoreEventsClick?: (payload: GenCalendarMoreEventsClick) => void;
  onEventDragStart?: (event: NormalizedCalendarEvent, e: React.PointerEvent) => void;
}

export function MonthCalendar({
  weeks,
  events,
  weekStartsOn = 0,
  maxVisibleEventsPerDay = 3,
  onEventClick,
  onDayClick,
  onMoreEventsClick,
  onEventDragStart,
}: MonthCalendarProps) {
  const byDate = groupEventsByDateKey(events);
  const labels = [
    ...WEEKDAY_LABELS.slice(weekStartsOn),
    ...WEEKDAY_LABELS.slice(0, weekStartsOn),
  ];

  return (
    <div className="gen-calendar-month">
      <div className="gen-calendar-month__weekdays">
        {labels.map((label) => (
          <div key={label} className="gen-calendar-month__weekday">
            {label}
          </div>
        ))}
      </div>
      <div className="gen-calendar-month__body">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="gen-calendar-month__week">
            {week.map((cell) => {
              const dayEvents = byDate.get(cell.dateKey) ?? [];
              const visible = dayEvents.slice(0, maxVisibleEventsPerDay);
              const hiddenCount = Math.max(0, dayEvents.length - visible.length);

              return (
                <div
                  key={cell.dateKey}
                  className={[
                    'gen-calendar-month__cell',
                    cell.inCurrentMonth ? '' : 'is-outside',
                    cell.isToday ? 'is-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onDayClick?.(cell.date)}
                >
                  <div className="gen-calendar-month__day-number">
                    {format(cell.date, 'd')}
                  </div>
                  <div className="gen-calendar-month__events">
                    {visible.map((event) => (
                      <button
                        key={event.instanceId}
                        type="button"
                        className="gen-calendar-event-chip"
                        style={event.color ? { backgroundColor: event.color } : undefined}
                        title={event.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          onEventDragStart?.(event, e);
                        }}
                      >
                        {event.title}
                      </button>
                    ))}
                    {hiddenCount > 0 ? (
                      <button
                        type="button"
                        className="gen-calendar-month__more"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoreEventsClick?.({
                            date: cell.dateKey,
                            events: dayEvents,
                            hiddenCount,
                          });
                        }}
                      >
                        +{hiddenCount} more
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
