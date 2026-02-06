import '../styles/serve.css'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Eligibility = 'yes' | 'no' | null

type Team = {
  id: string
  name: string
  description: string
}

type TeamGroup = {
  title: string
  teams: Team[]
}

const TEAM_GROUPS: TeamGroup[] = [
  {
    title: 'Frontline Teams',
    teams: [
      {
        id: 'ushering',
        name: 'Ushering Team',
        description: 'Create a welcoming first impression and help guests find their seats.',
      },
      {
        id: 'welcoming',
        name: 'Welcoming Team',
        description: 'Host new guests, answer questions, and help people feel at home.',
      },
      {
        id: 'hospitality',
        name: 'Hospitality',
        description: 'Serve refreshments and care for guests with warmth and kindness.',
      },
    ],
  },
  {
    title: 'Creative & Technical',
    teams: [
      {
        id: 'media',
        name: 'Media Team',
        description: 'Capture and share what God is doing through video, graphics, and lighting.',
      },
      {
        id: 'worship',
        name: 'Worship Team',
        description: 'Lead our church family into worship with skill and humility.',
      },
    ],
  },
  {
    title: 'Next Generation',
    teams: [
      {
        id: 'children',
        name: 'Children Ministry',
        description: 'Help kids discover Jesus in a safe and joyful environment.',
      },
      {
        id: 'youth',
        name: 'Youth Ministry',
        description: 'Invest in teenagers and help them grow in faith and community.',
      },
    ],
  },
  {
    title: 'Support',
    teams: [
      {
        id: 'maintenance',
        name: 'Maintenance',
        description: 'Care for our spaces so every gathering feels excellent.',
      },
    ],
  },
]

export default function ServePage() {
  const [eligibility, setEligibility] = useState<Eligibility>(null)
  const [openTeamId, setOpenTeamId] = useState<string | null>(null)
  const [submittedTeams, setSubmittedTeams] = useState<Record<string, boolean>>({})

  const teams = useMemo(() => TEAM_GROUPS, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>, teamId: string) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = Object.fromEntries(data.entries())
    // eslint-disable-next-line no-console
    console.log('Serve team interest:', teamId, payload)
    setSubmittedTeams((prev) => ({ ...prev, [teamId]: true }))
    form.reset()
  }

  return (
    <section className="serve-page">
      <div className="serve-container serve-header">
        <p className="serve-kicker">Serve</p>
        <h1>Serve</h1>
        <p className="serve-subtext">
          Serving is how we love God and love people together.
        </p>
      </div>

      <section className="serve-tone">
        <div className="serve-container serve-eligibility">
          <h2>Have you completed Believers Class?</h2>
          <div className="serve-toggle" role="group" aria-label="Believers Class eligibility">
            <button
              type="button"
              className={`serve-toggle-btn${eligibility === 'yes' ? ' is-active' : ''}`}
              onClick={() => setEligibility('yes')}
            >
              Yes, I have
            </button>
            <button
              type="button"
              className={`serve-toggle-btn${eligibility === 'no' ? ' is-active' : ''}`}
              onClick={() => setEligibility('no')}
            >
              Not yet
            </button>
          </div>
        </div>
      </section>

      {eligibility === 'no' && (
        <>
          <div className="serve-container">
            <div className="serve-card serve-believers-card">
              <div className="serve-believers-top">
                <div className="serve-icon-circle" aria-hidden="true">
                  <span className="serve-icon">BC</span>
                </div>
                <div className="serve-believers-copy">
                  <div className="serve-believers-title">
                    <h2>Believers Class</h2>
                    <span className="serve-pill">6 weeks</span>
                  </div>
                  <p>
                    A 6-week course teaching the foundations of being a believer and how to
                    live it out day to day.
                  </p>
                </div>
              </div>

              <div className="serve-cohort">
                <h3>Next cohort</h3>
                <div className="serve-cohort-grid">
                  <div>
                    <span className="serve-cohort-label">Starts</span>
                    <p>Sunday, 16 March 2026</p>
                  </div>
                  <div>
                    <span className="serve-cohort-label">Time</span>
                    <p>11:00</p>
                  </div>
                  <div>
                    <span className="serve-cohort-label">Location</span>
                    <p>12 Whitehill Street, Glasgow G31 2LH</p>
                  </div>
                </div>
              </div>

              <div className="serve-believers-actions">
                <Link to="/connect" className="serve-primary-button">
                  Register for Believers Class
                </Link>
                <details className="serve-details">
                  <summary>What you&apos;ll learn</summary>
                  <ul>
                    <li>Understanding salvation and identity in Christ</li>
                    <li>Building daily rhythms of prayer and scripture</li>
                    <li>Walking with the Holy Spirit and living on mission</li>
                  </ul>
                </details>
              </div>
            </div>
          </div>

        </>
      )}

      {eligibility === 'yes' && (
        <div className="serve-container serve-teams">
          <div className="serve-section-header">
            <h2>Serving Teams</h2>
            <p>Find the area where your gifts and passion can make a difference.</p>
          </div>

          {teams.map((group) => (
            <div key={group.title} className="serve-team-group">
              <h3>{group.title}</h3>
              <div className="serve-team-grid">
                {group.teams.map((team) => {
                  const isOpen = openTeamId === team.id
                  const isSubmitted = submittedTeams[team.id]
                  return (
                    <div key={team.id} className="serve-card serve-team-card">
                      <div className="serve-team-body">
                        <h4>{team.name}</h4>
                        <p>{team.description}</p>
                      </div>
                      <button
                        type="button"
                        className="serve-secondary-button"
                        onClick={() => setOpenTeamId(isOpen ? null : team.id)}
                        aria-expanded={isOpen}
                        aria-controls={`${team.id}-form`}
                      >
                        Join this team
                      </button>

                      {isOpen && (
                        <div className="serve-join-panel" id={`${team.id}-form`}>
                          {isSubmitted && (
                            <div className="serve-success">
                              Thanks! We'll be in touch soon.
                            </div>
                          )}
                          <form onSubmit={(event) => handleSubmit(event, team.id)}>
                            <label>
                              Name
                              <input name="name" type="text" required placeholder="Your name" />
                            </label>
                            <label>
                              Email
                              <input
                                name="email"
                                type="email"
                                required
                                placeholder="you@email.com"
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
                            <button type="submit" className="serve-primary-button">
                              Submit interest
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
