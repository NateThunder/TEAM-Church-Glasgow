import '../styles/events.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Navigate,
  Views,
  dateFnsLocalizer,
} from 'react-big-calendar'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  isValid,
  parse,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
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
const monthWeekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const toDate = (value: string) => {
  const date = new Date(value)
  return isValid(date) ? date : null
}

const isCurrentOrUpcomingEvent = (event: EventItem, now: Date) => {
  const end = toDate(event.end)
  if (!end) return true
  return end.getTime() >= now.getTime()
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

const categoryClassName = (category: EventCategory) =>
  category.toLowerCase().replace(/\s+/g, '-')

const dayKey = (date: Date) => format(date, 'yyyy-MM-dd')

const isStartOfDay = (date: Date) =>
  date.getHours() === 0 &&
  date.getMinutes() === 0 &&
  date.getSeconds() === 0 &&
  date.getMilliseconds() === 0

const mapEventsToDays = (events: CalendarEvent[]) => {
  const grouped = new Map<string, CalendarEvent[]>()

  events.forEach((event) => {
    const firstDay = startOfDay(event.start)
    const endDay = startOfDay(event.end)
    const lastDay =
      isStartOfDay(event.end) && event.end.getTime() > event.start.getTime()
        ? subDays(endDay, 1)
        : endDay
    const visibleEnd = lastDay.getTime() < firstDay.getTime() ? firstDay : lastDay

    eachDayOfInterval({ start: firstDay, end: visibleEnd }).forEach((day) => {
      const key = dayKey(day)
      const dayEvents = grouped.get(key)
      if (dayEvents) {
        dayEvents.push(event)
      } else {
        grouped.set(key, [event])
      }
    })
  })

  grouped.forEach((dayEvents) => {
    dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime())
  })

  return grouped
}

function AgendaEvent({
  event,
}: {
  event: CalendarEvent
}) {
  const categoryClass = categoryClassName(event.resource.category)
  return <span className={`events-agenda-label events-agenda-label--${categoryClass}`}>{event.title}</span>
}

function EventsToolbar({
  label,
  onNavigate,
  onView,
  view,
}: {
  label: string
  onNavigate: (action: string) => void
  onView: (nextView: string) => void
  view: string
}) {
  const viewOptions: string[] = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]

  return (
    <div className="events-toolbar">
      <div className="events-toolbar-group">
        <button type="button" className="events-pill-btn" onClick={() => onNavigate(Navigate.TODAY)}>
          Today
        </button>
        <button type="button" className="events-pill-btn" onClick={() => onNavigate(Navigate.PREVIOUS)}>
          Back
        </button>
        <button type="button" className="events-pill-btn" onClick={() => onNavigate(Navigate.NEXT)}>
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

function MonthCalendarGrid({
  date,
  events,
  onNavigate,
  onView,
  onSelectEvent,
}: {
  date: Date
  events: CalendarEvent[]
  onNavigate: (action: string) => void
  onView: (nextView: string) => void
  onSelectEvent: (event: EventItem) => void
}) {
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(date)
    const monthEnd = endOfMonth(date)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [date])

  const eventsByDay = useMemo(() => mapEventsToDays(events), [events])

  return (
    <div className="events-calendar events-calendar-month">
      <EventsToolbar
        label={format(date, 'MMMM yyyy')}
        onNavigate={onNavigate}
        onView={onView}
        view={Views.MONTH}
      />

      <div className="events-month-grid" role="grid" aria-label={format(date, 'MMMM yyyy')}>
        <div className="events-month-weekdays" role="row">
          {monthWeekdayLabels.map((weekday) => (
            <div key={weekday} className="events-month-weekday" role="columnheader">
              {weekday}
            </div>
          ))}
        </div>

        <div className="events-month-days">
          {monthDays.map((day) => {
            const key = dayKey(day)
            const dayEvents = eventsByDay.get(key) ?? []
            const outsideMonth = !isSameMonth(day, date)
            const today = isToday(day)
            return (
              <div
                key={key}
                className={`events-month-day${outsideMonth ? ' is-outside' : ''}${
                  today ? ' is-today' : ''
                }`}
                role="gridcell"
                aria-label={format(day, 'EEEE d MMMM yyyy')}
              >
                <span className="events-month-date">{format(day, 'dd')}</span>
                <div
                  className="events-month-events"
                  style={{ gridTemplateRows: `repeat(${Math.max(dayEvents.length, 1)}, minmax(0, 1fr))` }}
                >
                  {dayEvents.map((event) => {
                    const categoryClass = categoryClassName(event.resource.category)
                    return (
                      <button
                        key={`${key}-${event.id}`}
                        type="button"
                        className={`events-month-event events-calendar-event--${categoryClass}`}
                        onClick={() => onSelectEvent(event.resource)}
                        title={event.title}
                      >
                        {event.title}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { status, events, error } = useEvents()
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarView, setCalendarView] = useState<string>(Views.MONTH)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date())
  const [now, setNow] = useState<Date>(() => new Date())
  const [activeCategory, setActiveCategory] = useState<EventCategory>('All')
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const update = () => {
      const isMobileView = media.matches
      setIsMobile(isMobileView)
      if (isMobileView) {
        setCalendarView((currentView) => (currentView === Views.MONTH ? Views.AGENDA : currentView))
      }
    }
    update()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }
    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedEvent(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedEvent])

  const visibleEvents = useMemo(() => {
    return events.filter((event) => isCurrentOrUpcomingEvent(event, now))
  }, [events, now])

  const filteredEvents = useMemo(() => {
    if (activeCategory === 'All') return visibleEvents
    return visibleEvents.filter((event) => event.category === activeCategory)
  }, [activeCategory, visibleEvents])

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

  const calendarEventProps = (event: CalendarEvent) => ({
    className: `events-calendar-event events-calendar-event--${categoryClassName(event.resource.category)}`,
  })

  const onMonthNavigate = (action: string) => {
    if (action === Navigate.TODAY) {
      setCalendarDate(new Date())
      return
    }

    if (action === Navigate.PREVIOUS) {
      setCalendarDate((currentDate) => addMonths(currentDate, -1))
      return
    }

    if (action === Navigate.NEXT) {
      setCalendarDate((currentDate) => addMonths(currentDate, 1))
    }
  }

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

          <div className="events-content-shell">
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
                          const categoryClass = categoryClassName(event.category)
                          return (
                            <button
                              key={event.id}
                              type="button"
                              className={`events-card events-card--${categoryClass}`}
                              onClick={() => setSelectedEvent(event)}
                            >
                              <div className="events-card-body">
                                <span className={`events-pill events-pill--${categoryClass}`}>
                                  {event.category}
                                </span>
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
              calendarView === Views.MONTH && isMobile ? (
                <MonthCalendarGrid
                  date={calendarDate}
                  events={calendarEvents}
                  onNavigate={onMonthNavigate}
                  onView={setCalendarView}
                  onSelectEvent={setSelectedEvent}
                />
              ) : (
                <div className="events-calendar">
                  <Calendar<CalendarEvent, object>
                    localizer={localizer}
                    events={calendarEvents}
                    date={calendarDate}
                    view={calendarView}
                    onView={setCalendarView}
                    onNavigate={(nextDate: Date) => setCalendarDate(nextDate)}
                    startAccessor="start"
                    endAccessor="end"
                    eventPropGetter={calendarEventProps}
                    style={{ height: isMobile ? 520 : 720 }}
                    popup
                    onSelectEvent={(event: CalendarEvent) => setSelectedEvent(event.resource)}
                    components={{ toolbar: EventsToolbar, agenda: { event: AgendaEvent } }}
                  />
                </div>
              )
            ) : null}
          </div>
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
                <span
                  className={`events-pill events-pill--${categoryClassName(selectedEvent.category)}`}
                >
                  {selectedEvent.category}
                </span>
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
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
