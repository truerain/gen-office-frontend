// packages/gen-calendar/src/GenCalendar.tsx
// Public GenCalendar component with month/week views and edit callbacks.
import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  GenCalendarEditChange,
  GenCalendarEvent,
  GenCalendarProps,
  GenCalendarView,
  NormalizedCalendarEvent,
  PositionedWeekEvent,
} from './GenCalendar.types';
import {
  DEFAULT_SNAP_MINUTES,
  HOUR_HEIGHT_PX,
  buildMonthMatrix,
  format,
  getVisibleRange,
  getWeekDays,
  shiftAnchor,
  snapDate,
  startOfDay,
  toDate,
  toDateKey,
} from './core/dateRange';
import { expandEventsForRange } from './core/recurrence';
import { MonthCalendar } from './views/MonthCalendar';
import { WeekCalendar } from './views/WeekCalendar';

type DragState =
  | {
      mode: 'move';
      event: NormalizedCalendarEvent;
      originX: number;
      originY: number;
      durationMs: number;
    }
  | {
      mode: 'resize';
      event: NormalizedCalendarEvent;
      edge: 'start' | 'end';
      originY: number;
    };

function canDrag(event: GenCalendarEvent, editable: boolean): boolean {
  if (event.draggable === false) return false;
  if (event.editable === false) return false;
  return editable || event.draggable === true || event.editable === true;
}

function canResize(event: GenCalendarEvent, editable: boolean): boolean {
  if (event.resizable === false) return false;
  if (event.editable === false) return false;
  return editable || event.resizable === true || event.editable === true;
}

export function GenCalendar({
  date,
  defaultDate,
  view,
  defaultView = 'month',
  events = [],
  editable = false,
  weekStartsOn = 0,
  snapMinutes = DEFAULT_SNAP_MINUTES,
  maxVisibleEventsPerDay = 3,
  className,
  onDateChange,
  onViewChange,
  onEventClick,
  onSlotSelect,
  onEventMove,
  onEventResize,
  onMoreEventsClick,
}: GenCalendarProps) {
  const [uncontrolledDate, setUncontrolledDate] = useState(() =>
    toDate(defaultDate ?? date ?? new Date())
  );
  const [uncontrolledView, setUncontrolledView] = useState<GenCalendarView>(
    view ?? defaultView
  );
  const [drag, setDrag] = useState<DragState | null>(null);
  const [previewMove, setPreviewMove] = useState<NormalizedCalendarEvent | null>(null);
  const [previewResize, setPreviewResize] = useState<PositionedWeekEvent | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const previewMoveRef = useRef<NormalizedCalendarEvent | null>(null);
  const previewResizeRef = useRef<PositionedWeekEvent | null>(null);

  const currentDate = date != null ? toDate(date) : uncontrolledDate;
  const currentView = view ?? uncontrolledView;

  const setDate = (next: Date) => {
    if (date == null) setUncontrolledDate(next);
    onDateChange?.(next);
  };

  const setView = (next: GenCalendarView) => {
    if (view == null) setUncontrolledView(next);
    onViewChange?.(next);
  };

  const range = useMemo(
    () => getVisibleRange(currentDate, currentView, weekStartsOn),
    [currentDate, currentView, weekStartsOn]
  );

  const visibleEvents = useMemo(
    () => expandEventsForRange(events, range),
    [events, range]
  );

  const displayEvents = useMemo(() => {
    if (!previewMove) return visibleEvents;
    return visibleEvents.map((event) =>
      event.instanceId === previewMove.instanceId ? previewMove : event
    );
  }, [visibleEvents, previewMove]);

  const weeks = useMemo(
    () => buildMonthMatrix(currentDate, weekStartsOn),
    [currentDate, weekStartsOn]
  );
  const weekDays = useMemo(
    () => getWeekDays(currentDate, weekStartsOn),
    [currentDate, weekStartsOn]
  );

  useEffect(() => {
    previewMoveRef.current = previewMove;
  }, [previewMove]);

  useEffect(() => {
    previewResizeRef.current = previewResize;
  }, [previewResize]);

  useEffect(() => {
    if (!drag) return;

    const onPointerMove = (e: PointerEvent) => {
      if (drag.mode === 'move') {
        if (currentView === 'month') {
          const dayDelta = Math.round((e.clientX - drag.originX) / 120);
          const start = new Date(drag.event.startDate.getTime() + dayDelta * 86_400_000);
          const end = new Date(start.getTime() + drag.durationMs);
          const next = {
            ...drag.event,
            startDate: start,
            endDate: end,
            start: start.toISOString(),
            end: end.toISOString(),
          };
          previewMoveRef.current = next;
          setPreviewMove(next);
          return;
        }

        const dayWidth =
          (rootRef.current?.querySelector('.gen-calendar-week__columns') as HTMLElement | null)
            ?.clientWidth ?? 700;
        const colWidth = dayWidth / 7;
        const dayDelta = Math.round((e.clientX - drag.originX) / colWidth);
        const minuteDelta =
          Math.round(((e.clientY - drag.originY) / HOUR_HEIGHT_PX) * 60 / snapMinutes) *
          snapMinutes;
        const start = snapDate(
          new Date(
            drag.event.startDate.getTime() + dayDelta * 86_400_000 + minuteDelta * 60_000
          ),
          snapMinutes
        );
        const end = new Date(start.getTime() + drag.durationMs);
        const next = {
          ...drag.event,
          startDate: start,
          endDate: end,
          start: start.toISOString(),
          end: end.toISOString(),
          allDay: drag.event.allDay,
        };
        previewMoveRef.current = next;
        setPreviewMove(next);
        return;
      }

      const minuteDelta =
        Math.round(((e.clientY - drag.originY) / HOUR_HEIGHT_PX) * 60 / snapMinutes) *
        snapMinutes;
      let start = drag.event.startDate;
      let end = drag.event.endDate;
      if (drag.edge === 'start') {
        start = snapDate(
          new Date(drag.event.startDate.getTime() + minuteDelta * 60_000),
          snapMinutes
        );
        if (start >= end) start = new Date(end.getTime() - snapMinutes * 60_000);
      } else {
        end = snapDate(
          new Date(drag.event.endDate.getTime() + minuteDelta * 60_000),
          snapMinutes
        );
        if (end <= start) end = new Date(start.getTime() + snapMinutes * 60_000);
      }
      const dayIndex = weekDays.findIndex(
        (day) => toDateKey(day) === toDateKey(drag.event.startDate)
      );
      const next: PositionedWeekEvent = {
        event: {
          ...drag.event,
          startDate: start,
          endDate: end,
          start: start.toISOString(),
          end: end.toISOString(),
        },
        dayIndex: Math.max(0, dayIndex),
        topPx: ((start.getHours() * 60 + start.getMinutes()) / 60) * HOUR_HEIGHT_PX,
        heightPx: Math.max(
          16,
          ((end.getTime() - start.getTime()) / 3_600_000) * HOUR_HEIGHT_PX
        ),
        column: 0,
        columnCount: 1,
        leftPercent: 0,
        widthPercent: 100,
      };
      previewResizeRef.current = next;
      setPreviewResize(next);
    };

    const onPointerUp = () => {
      if (drag.mode === 'move' && previewMoveRef.current) {
        const moved = previewMoveRef.current;
        const change: GenCalendarEditChange = {
          eventId: drag.event.id,
          start: moved.start,
          end: moved.end,
          allDay: moved.allDay,
          originalEvent: drag.event,
        };
        onEventMove?.(change);
      }
      if (drag.mode === 'resize' && previewResizeRef.current) {
        const resized = previewResizeRef.current;
        const change: GenCalendarEditChange = {
          eventId: drag.event.id,
          start: resized.event.start,
          end: resized.event.end,
          allDay: resized.event.allDay,
          originalEvent: drag.event,
        };
        onEventResize?.(change);
      }
      setDrag(null);
      setPreviewMove(null);
      setPreviewResize(null);
      previewMoveRef.current = null;
      previewResizeRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [drag, currentView, snapMinutes, onEventMove, onEventResize, weekDays]);

  const handleEventDragStart = (
    event: NormalizedCalendarEvent,
    e: React.PointerEvent
  ) => {
    if (!canDrag(event, editable)) return;
    e.preventDefault();
    setDrag({
      mode: 'move',
      event,
      originX: e.clientX,
      originY: e.clientY,
      durationMs: Math.max(
        snapMinutes * 60_000,
        event.endDate.getTime() - event.startDate.getTime()
      ),
    });
    setPreviewMove(event);
    previewMoveRef.current = event;
  };

  const handleEventResizeStart = (
    event: NormalizedCalendarEvent,
    edge: 'start' | 'end',
    e: React.PointerEvent
  ) => {
    if (!canResize(event, editable)) return;
    e.preventDefault();
    setDrag({
      mode: 'resize',
      event,
      edge,
      originY: e.clientY,
    });
  };

  const title =
    currentView === 'month'
      ? format(currentDate, 'yyyy MMMM')
      : `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`;

  return (
    <div
      ref={rootRef}
      className={['gen-calendar', className].filter(Boolean).join(' ')}
    >
      <div className="gen-calendar__toolbar">
        <div className="gen-calendar__nav">
          <button type="button" onClick={() => setDate(new Date())}>
            Today
          </button>
          <button
            type="button"
            onClick={() => setDate(shiftAnchor(currentDate, currentView, -1))}
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setDate(shiftAnchor(currentDate, currentView, 1))}
          >
            Next
          </button>
        </div>
        <div className="gen-calendar__title">{title}</div>
        <div className="gen-calendar__views">
          <button
            type="button"
            className={currentView === 'month' ? 'is-active' : ''}
            onClick={() => setView('month')}
          >
            Month
          </button>
          <button
            type="button"
            className={currentView === 'week' ? 'is-active' : ''}
            onClick={() => setView('week')}
          >
            Week
          </button>
        </div>
      </div>

      {currentView === 'month' ? (
        <MonthCalendar
          weeks={weeks}
          events={displayEvents}
          weekStartsOn={weekStartsOn}
          maxVisibleEventsPerDay={maxVisibleEventsPerDay}
          onEventClick={onEventClick}
          onDayClick={(day) => {
            const start = startOfDay(day);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            onSlotSelect?.({
              start: start.toISOString(),
              end: end.toISOString(),
              allDay: true,
              view: 'month',
            });
          }}
          onMoreEventsClick={onMoreEventsClick}
          onEventDragStart={handleEventDragStart}
        />
      ) : (
        <WeekCalendar
          weekDays={weekDays}
          events={displayEvents}
          snapMinutes={snapMinutes}
          onEventClick={onEventClick}
          onSlotSelect={onSlotSelect}
          onEventDragStart={handleEventDragStart}
          onEventResizeStart={handleEventResizeStart}
          preview={previewResize}
        />
      )}
    </div>
  );
}
