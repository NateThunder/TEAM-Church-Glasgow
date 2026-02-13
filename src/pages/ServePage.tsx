import '../styles/serve.css'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBelieversClass } from '../services/believersClass'
import { useServingTeams } from '../services/servingTeams'

type Eligibility = 'yes' | 'no' | null

const DEFAULT_BELIEVERS_CLASS = {
  durationLabel: '6 weeks',
  startsLabel: 'Sunday, 16 March 2026',
}

export default function ServePage() {
  const [eligibility, setEligibility] = useState<Eligibility>(null)
  const [openTeamId, setOpenTeamId] = useState<string | null>(null)
  const [submittedTeams, setSubmittedTeams] = useState<Record<string, boolean>>({})
  const { status: believersClassStatus, item: believersClassItem } = useBelieversClass()
  const { status: teamsStatus, groups: teams, error: teamsError } = useServingTeams()
  const believersClass = believersClassItem ?? DEFAULT_BELIEVERS_CLASS
  const teamsHeaderRef = useRef<HTMLDivElement | null>(null)
  const believersBottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!eligibility) {
      return
    }

    const raf = requestAnimationFrame(() => {
      if (eligibility === 'yes') {
        const target = teamsHeaderRef.current
        if (!target) {
          return
        }
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
        return
      }

      const scrollTarget =
        document.documentElement?.scrollHeight ?? document.body.scrollHeight
      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth',
      })
    })

    return () => cancelAnimationFrame(raf)
  }, [eligibility])

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
          <div className="serve-card serve-step-card">
            <h2>Have you completed Believers Class?</h2>
            <p className="serve-step-helper">
              This helps us show the right serving opportunities.
            </p>
            <div
              className="serve-step-actions"
              role="group"
              aria-label="Believers Class eligibility"
            >
              <button
                type="button"
                className={`serve-primary-button${
                  eligibility === 'yes' ? ' is-active' : ''
                }`}
                onClick={() => setEligibility('yes')}
              >
                Yes, I&apos;ve completed it
              </button>
              <button
                type="button"
                className={`serve-secondary-button${
                  eligibility === 'no' ? ' is-active' : ''
                }`}
                onClick={() => setEligibility('no')}
              >
                Not yet
              </button>
            </div>
            <p className="serve-step-micro">You can update this later.</p>
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
                    <span className="serve-pill">{believersClass.durationLabel}</span>
                  </div>
                  <p>Find out when the next class starts and plan ahead.</p>
                </div>
              </div>

              <div className="serve-cohort">
                <h3>Next cohort</h3>
                <div className="serve-cohort-grid">
                  <div>
                    <span className="serve-cohort-label">Starts</span>
                    <p>{believersClass.startsLabel}</p>
                  </div>
                  <div>
                    <span className="serve-cohort-label">Duration</span>
                    <p>{believersClass.durationLabel}</p>
                  </div>
                </div>
              </div>

              <div className="serve-believers-actions">
                <Link to="/connect" className="serve-primary-button">
                  Register for Believers Class
                </Link>
              </div>
              {believersClassStatus === 'loading' ? (
                <p className="serve-step-micro">Loading class details...</p>
              ) : null}
              <div ref={believersBottomRef} />
            </div>
          </div>

        </>
      )}

      {eligibility === 'yes' && (
        <div className="serve-container serve-teams">
          <div className="serve-section-header" ref={teamsHeaderRef}>
            <h2>Serving Teams</h2>
            <p>Find the area where your gifts and passion can make a difference.</p>
          </div>

          {teamsStatus === 'loading' ? (
            <div className="serve-card serve-state-card">Loading serving teams...</div>
          ) : null}

          {teamsStatus === 'error' ? (
            <div className="serve-card serve-state-card">
              {teamsError ?? 'Unable to load serving teams right now.'}
            </div>
          ) : null}

          {teamsStatus === 'success' && teams.length === 0 ? (
            <div className="serve-card serve-state-card">No serving teams are published yet.</div>
          ) : null}

          {teamsStatus === 'success'
            ? teams.map((group) => (
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
              ))
            : null}
        </div>
      )}
    </section>
  )
}

