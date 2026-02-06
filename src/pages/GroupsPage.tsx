import '../styles/groups.css'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const groups = [
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

export default function GroupsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [activeFilter, setActiveFilter] =
    useState<(typeof filters)[number]>('All')

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
              <div className="groups-card-media" aria-hidden="true">
                <div className="groups-card-media-inner" />
              </div>
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
                <button type="button" className="groups-cta">
                  Join This Group
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
