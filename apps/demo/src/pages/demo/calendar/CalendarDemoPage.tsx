// apps/demo/src/pages/demo/calendar/CalendarDemoPage.tsx
// Demo page for @gen-office/gen-calendar month/week editing flows.
import { useMemo, useState } from 'react';
import { GenCalendar } from '@gen-office/gen-calendar';
import type {
  GenCalendarEvent,
  GenCalendarMoreEventsClick,
  GenCalendarView,
} from '@gen-office/gen-calendar';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';

import styles from './CalendarDemoPage.module.css';

function createSampleEvents(anchor: Date): GenCalendarEvent[] {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const d = anchor.getDate();
  const iso = (day: number, hour: number, minute = 0) =>
    new Date(y, m, day, hour, minute).toISOString();

  return [
    {
      id: 'standup',
      title: 'Standup',
      start: iso(d, 9, 0),
      end: iso(d, 9, 30),
      color: '#a50034',
    },
    {
      id: 'overlap',
      title: 'Design review',
      start: iso(d, 9, 15),
      end: iso(d, 10, 15),
      color: '#2563eb',
    },
    {
      id: 'holiday',
      title: 'Team offsite',
      start: new Date(y, m, d).toISOString(),
      end: new Date(y, m, d + 2).toISOString(),
      allDay: true,
      color: '#059669',
    },
    {
      id: 'weekly',
      title: 'Weekly sync',
      start: iso(d, 14, 0),
      end: iso(d, 15, 0),
      recurrence: { frequency: 'weekly', interval: 1, count: 8 },
      color: '#7c3aed',
    },
    {
      id: 'busy-1',
      title: 'Vendor call',
      start: iso(d + 1, 11, 0),
      end: iso(d + 1, 12, 0),
    },
    {
      id: 'busy-2',
      title: 'Budget review',
      start: iso(d + 1, 11, 30),
      end: iso(d + 1, 12, 30),
    },
    {
      id: 'busy-3',
      title: 'Hiring interview',
      start: iso(d + 1, 13, 0),
      end: iso(d + 1, 14, 0),
    },
    {
      id: 'busy-4',
      title: 'Ops check-in',
      start: iso(d + 1, 15, 0),
      end: iso(d + 1, 16, 0),
    },
  ];
}

export default function CalendarDemoPage(_props: PageComponentProps) {
  const initial = useMemo(() => new Date(), []);
  const [date, setDate] = useState(initial);
  const [view, setView] = useState<GenCalendarView>('month');
  const [events, setEvents] = useState(() => createSampleEvents(initial));
  const [morePayload, setMorePayload] = useState<GenCalendarMoreEventsClick | null>(null);
  const [selected, setSelected] = useState<string>('이벤트를 클릭하거나 슬롯을 선택하세요.');

  return (
    <div className={styles.page}>
      <PageHeader
        title="Calendar Demo"
        description="GenCalendar 월간/주간 뷰, 선택, 드래그 이동/리사이즈, 반복 일정"
      />
      <div className={styles.layout}>
        <div className={styles.calendarPane}>
          <GenCalendar
            date={date}
            view={view}
            events={events}
            editable
            weekStartsOn={0}
            maxVisibleEventsPerDay={3}
            onDateChange={setDate}
            onViewChange={setView}
            onEventClick={(event) => setSelected(`일정: ${event.title} (${event.start} ~ ${event.end})`)}
            onSlotSelect={(selection) =>
              setSelected(
                `슬롯 선택: ${selection.start} ~ ${selection.end} (${selection.allDay ? '종일' : '시간'})`
              )
            }
            onMoreEventsClick={(payload) => {
              setMorePayload(payload);
              setSelected(`${payload.date} 초과 일정 ${payload.hiddenCount}건`);
            }}
            onEventMove={(change) => {
              setEvents((prev) =>
                prev.map((event) =>
                  event.id === change.eventId
                    ? {
                        ...event,
                        start: change.start,
                        end: change.end,
                        allDay: change.allDay,
                      }
                    : event
                )
              );
              setSelected(`이동: ${change.eventId}`);
            }}
            onEventResize={(change) => {
              setEvents((prev) =>
                prev.map((event) =>
                  event.id === change.eventId
                    ? {
                        ...event,
                        start: change.start,
                        end: change.end,
                        allDay: change.allDay,
                      }
                    : event
                )
              );
              setSelected(`기간 변경: ${change.eventId}`);
            }}
          />
        </div>
        <aside className={styles.sidePanel}>
          <h3 className={styles.sideTitle}>상세 / More</h3>
          <p className={styles.sideText}>{selected}</p>
          {morePayload ? (
            <div className={styles.moreList}>
              <div className={styles.moreHeader}>{morePayload.date}</div>
              <ul>
                {morePayload.events.map((event) => (
                  <li key={event.id}>{event.title}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
