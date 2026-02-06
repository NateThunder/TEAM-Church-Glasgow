import '../styles/events.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type ToolbarProps,
  type View,
} from 'react-big-calendar'
import {
  format,
  getDay,
  isSameDay,
  isValid,
  parse,
  startOfWeek,
} from 'date-fns'
import { enGB } from 'date-fns/locale'
import { useEvents, type EventCategory, type EventItem } from '../services/events'

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: EventItem
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-GB': enGB },
})

const categories: EventCategory[] = ['All', 'Worship', 'Community', 'Youth', 'Kids']

const toDate = (value: string) => {
  const date = new Date(value)
  return isValid(date) ? date : null
}

const buildGoogleCalendarUrl = (event: EventItem) => {
  const start = toDate(event.start)
  const end = toDate(event.end)
  if (!start || !end) return '#'
  const formatUtc = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.[0-9]{3}Z$/, 'Z')
  const details = [event.description, event.location].filter(Boolean).join('\n\n')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details,
    location: event.location ?? '',
    dates: `${formatUtc(start)}/${formatUtc(end)}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const buildIcsContent = (event: EventItem) => {
  const start = toDate(event.start)
  const end = toDate(event.end)
  if (!start || !end) return null
  const formatUtc = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.[0-9]{3}Z$/, 'Z')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Team Church Glasgow//Events//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}`,
    `DTSTAMP:${formatUtc(new Date())}`,
    `DTSTART:${formatUtc(start)}`,
    `DTEND:${formatUtc(end)}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description}` : null,
    event.location ? `LOCATION:${event.location}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean)
  return lines.join('\r\n')
}

const downloadIcs = (event: EventItem) => {
  const content = buildIcsContent(event)
  if (!content) return
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`
  link.click()
  URL.revokeObjectURL(url)
}

const formatEventRange = (event: EventItem) => {
  const start = toDate(event.start)
  const end = toDate(event.end)
  if (!start || !end) return 'Date to be confirmed'
  if (isSameDay(start, end)) {
    return `${format(start, 'MMM d, yyyy')} - ${format(start, 'p')}-${format(end, 'p')}`
  }
  return `${format(start, 'MMM d, p')} - ${format(end, 'MMM d, p')}`
}

const formatEventMeta = (event: EventItem) => {
  const start = toDate(event.start)
  const end = toDate(event.end)
  if (!start || !end) return { date: 'TBD', time: '' }
  if (isSameDay(start, end)) {
    return {
      date: format(start, 'MMM d, yyyy'),
      time: `${format(start, 'p')}-${format(end, 'p')}`,
    }
  }
  return {
    date: `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`,
    time: `${format(start, 'p')}-${format(end, 'p')}`,
  }
}

function EventsToolbar({
  label,
  onNavigate,
  onView,
  view,
}: ToolbarProps<CalendarEvent, object>) {
  const viewOptions: View[] = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]

  return (
    <div className="events-toolbar">
      <div className="events-toolbar-group">
        <button type="button" className="events-pill-btn" onClick={() => onNavigate('TODAY')}>
          Today
        </button>
        <button type="button" className="events-pill-btn" onClick={() => onNavigate('PREV')}>
          Back
        </button>
        <button type="button" className="events-pill-btn" onClick={() => onNavigate('NEXT')}>
          Next
        </button>
      </div>
      <span className="events-toolbar-label">{label}</span>
      <div className="events-toolbar-group">
        {viewOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={`events-pill-btn${view === option ? ' is-active' : ''}`}
            aria-pressed={view === option}
            onClick={() => onView(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { status, events, error } = useEvents()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarView, setCalendarView] = useState<View>(Views.MONTH)
  const [activeCategory, setActiveCategory] = useState<EventCategory>('All')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(media.matches)
    update()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    if (isMobile && calendarView === Views.MONTH) {
      setCalendarView(Views.AGENDA)
    }
    if (!isMobile && calendarView === Views.AGENDA) {
      setCalendarView(Views.MONTH)
    }
  }, [isMobile, calendarView])

  useEffect(() => {
    if (!selectedEvent) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedEvent(null)
    }
    document.addEventListener('keydown', onKeyDown)
    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      body.style.overflow = previousOverflow
    }
  }, [selectedEvent])

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') return events
    return events.filter((event) => event.category === activeCategory)
  }, [activeCategory, events])

  const listGroups = useMemo(() => {
    const sorted = [...filteredEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )
    const groups: Array<{ label: string; items: EventItem[] }> = []
    sorted.forEach((event) => {
      const date = toDate(event.start)
      const label = date ? format(date, 'MMMM yyyy') : 'Upcoming'
      const existing = groups.find((group) => group.label === label)
      if (existing) {
        existing.items.push(event)
      } else {
        groups.push({ label, items: [event] })
      }
    })
    return groups
  }, [filteredEvents])

  const calendarEvents = useMemo(() => {
    return filteredEvents
      .map((event) => {
        const start = toDate(event.start)
        const end = toDate(event.end)
        if (!start || !end) return null
        return { id: event.id, title: event.title, start, end, resource: event }
      })
      .filter(Boolean) as CalendarEvent[]
  }, [filteredEvents])

  return (
    <>
      <section className="page events-page">
        <header className="events-header">
          <div>
            <p className="events-kicker">Stay Connected</p>
            <h1>Events</h1>
            <p className="events-subtitle">
              Find upcoming gatherings, special services, and community moments.
            </p>
          </div>
        </header>
      </section>

      <section className="tone-section events-tone">
        <div className="tone-inner events-inner">
          <div className="events-controls">
            <div className="events-toggle" role="group" aria-label="Events view">
              <button
                type="button"
                className={`events-toggle-button${viewMode === 'list' ? ' is-active' : ''}`}
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                type="button"
                className={`events-toggle-button${
                  viewMode === 'calendar' ? ' is-active' : ''
                }`}
                aria-pressed={viewMode === 'calendar'}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
            </div>
            <label className="events-filter">
              <span className="sr-only">Filter events by category</span>
              <select
                value={activeCategory}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setActiveCategory(event.target.value as EventCategory)
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {status === 'loading' ? (
            <div className="events-state-card">
              <p>Loading events...</p>
            </div>
          ) : null}
          {status === 'error' ? (
            <div className="events-state-card events-state-card--error">
              <p>We couldn't load events right now.</p>
              <span>{error}</span>
            </div>
          ) : null}

          {status === 'success' && viewMode === 'list' ? (
            <div className="events-list">
              {listGroups.length === 0 ? (
                <div className="events-state-card">
                  <p>No events to show for this category.</p>
                </div>
              ) : (
                listGroups.map((group) => (
                  <div key={group.label} className="events-month">
                    <h2 className="events-month-title">{group.label}</h2>
                    <div className="events-cards">
                      {group.items.map((event) => {
                        const meta = formatEventMeta(event)
                        const date = toDate(event.start)
                        return (
                          <button
                            key={event.id}
                            type="button"
                            className="events-card"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="events-card-media">
                              {event.imageUrl ? (
                                <img src={event.imageUrl} alt="" />
                              ) : (
                                <div className="events-card-placeholder" aria-hidden="true" />
                              )}
                            </div>
                            <div className="events-card-body">
                              <span className="events-pill">{event.category}</span>
                              <h3>{event.title}</h3>
                              {event.description ? <p>{event.description}</p> : null}
                              <div className="events-meta">
                                <span>{meta.date}</span>
                                {meta.time ? <span>{meta.time}</span> : null}
                                {event.location ? <span>{event.location}</span> : null}
                              </div>
                            </div>
                            <div className="events-card-date">
                              <div className="events-card-day">
                                {date ? format(date, 'dd') : '--'}
                              </div>
                              <div className="events-card-weekday">
                                {date ? format(date, 'EEE') : ''}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : null}

          {status === 'success' && viewMode === 'calendar' ? (
            <div className="events-calendar">
              <Calendar<CalendarEvent, object>
                localizer={localizer}
                events={calendarEvents}
                view={calendarView}
                onView={setCalendarView}
                startAccessor="start"
                endAccessor="end"
                style={{ height: isMobile ? 520 : 720 }}
                popup
                onSelectEvent={(event: CalendarEvent) => setSelectedEvent(event.resource)}
                components={{ toolbar: EventsToolbar }}
              />
            </div>
          ) : null}
        </div>
      </section>

      {selectedEvent ? (
        <div className="events-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="events-modal-backdrop"
            onClick={() => setSelectedEvent(null)}
            aria-label="Close event details"
          />
          <div className="events-modal-panel" role="document">
            <div className="events-modal-header">
              <div>
                <span className="events-pill">{selectedEvent.category}</span>
                <h3>{selectedEvent.title}</h3>
              </div>
              <button
                type="button"
                className="events-modal-close"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close"
              >
                X
              </button>
            </div>
            {selectedEvent.imageUrl ? (
              <div className="events-modal-image">
                <img src={selectedEvent.imageUrl} alt="" />
              </div>
            ) : null}
            <div className="events-modal-meta">
              <span>{formatEventRange(selectedEvent)}</span>
              {selectedEvent.location ? <span>{selectedEvent.location}</span> : null}
            </div>
            {selectedEvent.description ? (
              <p className="events-modal-description">{selectedEvent.description}</p>
            ) : null}
            <div className="events-modal-actions">
              <a
                className="events-pill-btn is-primary"
                href={buildGoogleCalendarUrl(selectedEvent)}
                target="_blank"
                rel="noreferrer"
              >
                Add to Google Calendar
              </a>
              <button
                type="button"
                className="events-pill-btn"
                onClick={() => downloadIcs(selectedEvent)}
              >
                Download .ics
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
