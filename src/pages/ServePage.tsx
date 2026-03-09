import '../styles/serve.css'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ServeTeamGroup } from '../components/serve/ServeTeamGroup'
import { useServeTeamExpansion } from '../hooks/useServeTeamExpansion'
import { useBelieversClass } from '../services/believersClass'
import { useServingTeams } from '../services/servingTeams'
import { createServeSignup } from '../services/serveSignups'

type Eligibility = 'yes' | 'no' | null

const DEFAULT_BELIEVERS_CLASS = {
  durationLabel: '6 weeks',
  startsLabel: 'Sunday, 16 March 2026',
}

export default function ServePage() {
  const [eligibility, setEligibility] = useState<Eligibility>(null)
  const [submittedTeams, setSubmittedTeams] = useState<Record<string, boolean>>({})
  const [submittingTeams, setSubmittingTeams] = useState<Record<string, boolean>>({})
  const [submitErrors, setSubmitErrors] = useState<Record<string, string | null>>({})
  const { status: believersClassStatus, item: believersClassItem } = useBelieversClass()
  const { status: teamsStatus, groups: teams, error: teamsError } = useServingTeams()
  const { openTeamId, teamsContainerRef, toggleTeam } = useServeTeamExpansion()
  const believersClass = believersClassItem ?? DEFAULT_BELIEVERS_CLASS
  const teamsHeaderRef = useRef<HTMLDivElement | null>(null)

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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    team: { id: string; name: string },
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
        [team.id]: 'Please provide your name and email.',
      }))
      return
    }

    setSubmittingTeams((prev) => ({ ...prev, [team.id]: true }))
    setSubmitErrors((prev) => ({ ...prev, [team.id]: null }))

    try {
      await createServeSignup({
        teamKey: team.id,
        teamName: team.name,
        applicantName: name,
        email,
        phoneNumber: phone,
        message,
      })
      setSubmittedTeams((prev) => ({ ...prev, [team.id]: true }))
      form.reset()
    } catch (error) {
      setSubmitErrors((prev) => ({
        ...prev,
        [team.id]: 'Unable to submit right now. Please try again.',
      }))
      if (import.meta.env.DEV) {
        console.error('Serve team signup failed:', error)
      }
    } finally {
      setSubmittingTeams((prev) => ({ ...prev, [team.id]: false }))
    }
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
              className={`serve-step-actions${eligibility ? ' has-selection' : ''}`}
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
          </div>
        </div>
      </section>

      {eligibility === 'no' && (
        <>
          <div className="serve-container">
            <div className="serve-card serve-believers-card">
              <div className="serve-believers-top">
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
            </div>
          </div>

        </>
      )}

      {eligibility === 'yes' && (
        <div className="serve-container serve-teams" ref={teamsContainerRef}>
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
                <ServeTeamGroup
                  key={group.title}
                  group={group}
                  openTeamId={openTeamId}
                  submittedTeams={submittedTeams}
                  submittingTeams={submittingTeams}
                  submitErrors={submitErrors}
                  onToggleTeam={toggleTeam}
                  onSubmitTeam={handleSubmit}
                />
              ))
            : null}
        </div>
      )}
    </section>
  )
}

