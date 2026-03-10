import type { FormEvent } from 'react'
import type { ServingTeam } from '../../services/servingTeams'

type ServeTeamCardProps = {
  team: ServingTeam
  isOpen: boolean
  isSubmitted: boolean
  isSubmitting: boolean
  errorMessage: string | null
  onToggle: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>, team: ServingTeam) => void
}

export function ServeTeamCard({
  team,
  isOpen,
  isSubmitted,
  isSubmitting,
  errorMessage,
  onToggle,
  onSubmit,
}: ServeTeamCardProps) {
  return (
    <div className={`serve-card serve-team-card${isOpen ? ' is-open' : ''}`} data-team-id={team.id}>
      <div className="serve-team-body">
        <h4>{team.name}</h4>
        <p>{team.description}</p>
      </div>
      <button
        type="button"
        className="serve-secondary-button serve-join-button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${team.id}-form`}
      >
        Join this team
      </button>

      {isOpen && (
        <div className="serve-join-panel" id={`${team.id}-form`}>
          {isSubmitted && <div className="serve-success">Thanks! We'll be in touch soon.</div>}
          <form onSubmit={(event) => onSubmit(event, team)}>
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
            {errorMessage ? <div className="serve-error">{errorMessage}</div> : null}
            <button
              type="submit"
              className="serve-primary-button serve-submit-interest-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit interest'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
