import type { FormEvent } from 'react'
import type { ServingTeam, ServingTeamGroup } from '../../services/servingTeams'
import { ServeTeamCard } from './ServeTeamCard'

type ServeTeamGroupProps = {
  group: ServingTeamGroup
  openTeamId: string | null
  submittedTeams: Record<string, boolean>
  submittingTeams: Record<string, boolean>
  submitErrors: Record<string, string | null>
  onToggleTeam: (teamId: string) => void
  onSubmitTeam: (event: FormEvent<HTMLFormElement>, team: ServingTeam) => void
}

export function ServeTeamGroup({
  group,
  openTeamId,
  submittedTeams,
  submittingTeams,
  submitErrors,
  onToggleTeam,
  onSubmitTeam,
}: ServeTeamGroupProps) {
  return (
    <div className="serve-team-group">
      <h3>{group.title}</h3>
      <div className="serve-team-grid">
        {group.teams.map((team) => (
          <ServeTeamCard
            key={team.id}
            team={team}
            isOpen={openTeamId === team.id}
            isSubmitted={Boolean(submittedTeams[team.id])}
            isSubmitting={Boolean(submittingTeams[team.id])}
            errorMessage={submitErrors[team.id] ?? null}
            onToggle={() => onToggleTeam(team.id)}
            onSubmit={onSubmitTeam}
          />
        ))}
      </div>
    </div>
  )
}
