// packages/gen-calendar/src/GenCalendar.stories.tsx
// Storybook stories for GenCalendar month/week and edit demos.
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { GenCalendar } from './GenCalendar';
import type { GenCalendarEvent, GenCalendarView } from './GenCalendar.types';
import './index.css';

const meta: Meta<typeof GenCalendar> = {
  title: 'GenCalendar/GenCalendar',
  component: GenCalendar,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof GenCalendar>;

function sampleEvents(anchor = new Date()): GenCalendarEvent[] {
  const y = anchor.getFullYear();
  const m = String(anchor.getMonth() + 1).padStart(2, '0');
  const d = String(anchor.getDate()).padStart(2, '0');
  return [
    {
      id: '1',
      title: 'Standup',
      start: `${y}-${m}-${d}T09:00:00`,
      end: `${y}-${m}-${d}T09:30:00`,
      color: '#a50034',
    },
    {
      id: '2',
      title: 'Design review',
      start: `${y}-${m}-${d}T09:15:00`,
      end: `${y}-${m}-${d}T10:15:00`,
      color: '#2563eb',
    },
    {
      id: '3',
      title: 'Company holiday',
      start: `${y}-${m}-${d}T00:00:00`,
      end: `${y}-${m}-${String(anchor.getDate() + 1).padStart(2, '0')}T00:00:00`,
      allDay: true,
      color: '#059669',
    },
    {
      id: '4',
      title: 'Weekly sync',
      start: `${y}-${m}-${d}T14:00:00`,
      end: `${y}-${m}-${d}T15:00:00`,
      recurrence: { frequency: 'weekly', interval: 1 },
      color: '#7c3aed',
    },
  ];
}

function InteractiveCalendar() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<GenCalendarView>('month');
  const [events, setEvents] = useState(() => sampleEvents());
  const [panel, setPanel] = useState<string>('Ready');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', height: '100vh' }}>
      <GenCalendar
        date={date}
        view={view}
        events={events}
        editable
        onDateChange={setDate}
        onViewChange={setView}
        onEventClick={(event) => setPanel(`Clicked: ${event.title}`)}
        onSlotSelect={(selection) =>
          setPanel(`Slot: ${selection.start} → ${selection.end}`)
        }
        onMoreEventsClick={(payload) =>
          setPanel(`More on ${payload.date}: ${payload.events.map((e) => e.title).join(', ')}`)
        }
        onEventMove={(change) => {
          setEvents((prev) =>
            prev.map((event) =>
              event.id === change.eventId
                ? { ...event, start: change.start, end: change.end, allDay: change.allDay }
                : event
            )
          );
          setPanel(`Moved ${change.eventId}`);
        }}
        onEventResize={(change) => {
          setEvents((prev) =>
            prev.map((event) =>
              event.id === change.eventId
                ? { ...event, start: change.start, end: change.end, allDay: change.allDay }
                : event
            )
          );
          setPanel(`Resized ${change.eventId}`);
        }}
      />
      <aside style={{ padding: 16, borderLeft: '1px solid #e5e5e5', fontSize: 13 }}>
        <strong>Side panel</strong>
        <p>{panel}</p>
      </aside>
    </div>
  );
}

export const Default: Story = {
  render: () => <InteractiveCalendar />,
};

export const WeekView: Story = {
  render: () => {
    const [date, setDate] = useState(new Date());
    return (
      <div style={{ height: '100vh' }}>
        <GenCalendar
          date={date}
          view="week"
          events={sampleEvents()}
          editable
          onDateChange={setDate}
        />
      </div>
    );
  },
};
