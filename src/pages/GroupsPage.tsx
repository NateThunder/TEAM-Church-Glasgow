import '../styles/groups.css'
import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { createServeSignup } from '../services/serveSignups'

type GroupItem = {
  id: string
  title: string
  category: 'Young Adults' | 'Women' | 'Men' | 'Ministry'
  description: string
  day: string
  time: string
  location: string
}

const groups: GroupItem[] = [
  {
    id: 'young-adults',
    title: '20s to 30s (Fire Branded for Christ Group)',
    category: 'Young Adults',
    description:
      'A vibrant space for young adults to grow in faith, build friendships, and pursue Christ together.',
    day: 'Friday',
    time: '7:00 PM',
    location: 'City Centre',
  },
  {
    id: 'women',
    title: 'Women of Destiny',
    category: 'Women',
    description:
      'A supportive community for women to pray, learn, and encourage one another through every season.',
    day: 'Wednesday',
    time: '6:30 PM',
    location: 'Whitehill Hall',
  },
  {
    id: 'men',
    title: 'Men of Influence',
    category: 'Men',
    description:
      'A brotherhood focused on strengthening character, leadership, and purpose in Christ.',
    day: 'Monday',
    time: '7:30 PM',
    location: 'Glasgow East',
  },
  {
    id: 'prayer',
    title: 'Prayer',
    category: 'Ministry',
    description:
      'A dedicated group for intercession, worship, and standing together in faith for the church.',
    day: 'Saturday',
    time: '9:00 AM',
    location: 'Main Sanctuary',
  },
]

const filters = ['All', 'Young Adults', 'Women', 'Men', 'Ministry'] as const
type GroupFilter = (typeof filters)[number]

export default function GroupsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [activeFilter, setActiveFilter] = useState<GroupFilter>('All')
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)
  const [submittedGroups, setSubmittedGroups] = useState<Record<string, boolean>>({})
  const [submittingGroups, setSubmittingGroups] = useState<Record<string, boolean>>({})
  const [submitErrors, setSubmitErrors] = useState<Record<string, string | null>>({})

  const updateQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

  const visibleGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return groups.filter((group) => {
      const matchesFilter =
        activeFilter === 'All' || group.category === activeFilter
      const matchesQuery =
        !normalized ||
        group.title.toLowerCase().includes(normalized) ||
        group.description.toLowerCase().includes(normalized)
      return matchesFilter && matchesQuery
    })
  }, [query, activeFilter])

  const toggleGroupForm = (groupId: string) => {
    setOpenGroupId((current) => (current === groupId ? null : groupId))
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    group: GroupItem,
  ) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    if (!name || !email) {
      setSubmitErrors((prev) => ({
        ...prev,
        [group.id]: 'Please provide your name and email.',
      }))
      return
    }

    setSubmittingGroups((prev) => ({ ...prev, [group.id]: true }))
    setSubmitErrors((prev) => ({ ...prev, [group.id]: null }))

    try {
      await createServeSignup({
        teamKey: `group-${group.id}`,
        teamName: `Group: ${group.title}`,
        applicantName: name,
        email,
        phoneNumber: phone,
        message,
      })
      setSubmittedGroups((prev) => ({ ...prev, [group.id]: true }))
      form.reset()
    } catch (error) {
      setSubmitErrors((prev) => ({
        ...prev,
        [group.id]: 'Unable to submit right now. Please try again.',
      }))
      if (import.meta.env.DEV) {
        console.error('Group signup failed:', error)
      }
    } finally {
      setSubmittingGroups((prev) => ({ ...prev, [group.id]: false }))
    }
  }

  return (
    <div className="groups-page-wrapper">
      <section className="page groups-page">
        <div className="groups-controls">
          <label className="sr-only" htmlFor="groups-search">
            Search groups
          </label>
          <input
            id="groups-search"
            className="groups-search"
            type="search"
            placeholder="Search groups..."
            aria-label="Search groups"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
          />
          <div className="groups-filter-select-wrap">
            <label className="sr-only" htmlFor="groups-filter-mobile">
              Filter groups by category
            </label>
            <select
              id="groups-filter-mobile"
              className="groups-filter-select"
              value={activeFilter}
              onChange={(event) => setActiveFilter(event.target.value as GroupFilter)}
            >
              {filters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>
          <div className="groups-chips" role="listbox" aria-label="Filter groups">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`groups-chip${
                  activeFilter === filter ? ' is-active' : ''
                }`}
                aria-pressed={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="groups-grid">
          {visibleGroups.map((group) => (
            <article key={group.id} className="groups-card">
              <div className="groups-card-body">
                <span className="groups-pill">{group.category}</span>
                <h3 className="groups-title">{group.title}</h3>
                <p className="groups-subtext">Led by Team Lead</p>
                <p className="groups-description">{group.description}</p>
                <div className="groups-info">
                  <span>{group.day}</span>
                  <span>{group.time}</span>
                  <span>{group.location}</span>
                </div>
                <button
                  type="button"
                  className="groups-cta"
                  onClick={() => toggleGroupForm(group.id)}
                  aria-expanded={openGroupId === group.id}
                  aria-controls={`${group.id}-form`}
                >
                  Join this group
                </button>

                {openGroupId === group.id ? (
                  <div className="serve-join-panel" id={`${group.id}-form`}>
                    {submittedGroups[group.id] ? (
                      <div className="serve-success">Thanks! We&apos;ll be in touch soon.</div>
                    ) : null}
                    <form onSubmit={(event) => void handleSubmit(event, group)}>
                      <label>
                        Name
                        <input name="name" type="text" required placeholder="Your name" />
                      </label>
                      <label>
                        Email
                        <input name="email" type="email" required placeholder="you@email.com" />
                      </label>
                      <label>
                        Phone number (optional)
                        <input
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+44 7123 456789"
                        />
                      </label>
                      <label>
                        Message (optional)
                        <textarea
                          name="message"
                          rows={3}
                          placeholder="Tell us a little about yourself."
                        />
                      </label>
                      {submitErrors[group.id] ? (
                        <div className="serve-error">{submitErrors[group.id]}</div>
                      ) : null}
                      <button
                        type="submit"
                        className="serve-primary-button"
                        disabled={Boolean(submittingGroups[group.id])}
                      >
                        {submittingGroups[group.id] ? 'Submitting...' : 'Submit interest'}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
