import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export type ServingTeam = {
  id: string
  name: string
  description: string
}

export type ServingTeamGroup = {
  title: string
  teams: ServingTeam[]
}

type ServingTeamRow = {
  team_key: string
  group_name: string
  group_sort: number
  team_sort: number
  name: string
  description: string
  is_active: boolean
}

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

type ServingTeamsState = {
  status: LoadStatus
  groups: ServingTeamGroup[]
  error: string | null
}

const toGroups = (rows: ServingTeamRow[]): ServingTeamGroup[] => {
  const grouped = new Map<string, ServingTeamGroup>()

  rows.forEach((row) => {
    const existing = grouped.get(row.group_name)
    const team: ServingTeam = {
      id: row.team_key,
      name: row.name,
      description: row.description,
    }
    if (existing) {
      existing.teams.push(team)
      return
    }
    grouped.set(row.group_name, {
      title: row.group_name,
      teams: [team],
    })
  })

  return Array.from(grouped.values())
}

export function useServingTeams() {
  const [state, setState] = useState<ServingTeamsState>({
    status: 'idle',
    groups: [],
    error: null,
  })

  useEffect(() => {
    let isActive = true

    const load = async () => {
      if (!supabase) {
        setState({
          status: 'error',
          groups: [],
          error: 'Serving teams are unavailable. Configure Supabase environment variables.',
        })
        return
      }

      setState((prev) => ({ ...prev, status: 'loading', error: null }))

      try {
        const { data, error } = await supabase
          .from('serving_teams')
          .select('team_key,group_name,group_sort,team_sort,name,description,is_active')
          .eq('is_active', true)
          .order('group_sort', { ascending: true })
          .order('team_sort', { ascending: true })
          .order('name', { ascending: true })

        if (error) throw error
        if (!isActive) return

        const groups = toGroups((data ?? []) as ServingTeamRow[])
        setState({ status: 'success', groups, error: null })
      } catch (error) {
        if (!isActive) return
        setState({
          status: 'error',
          groups: [],
          error: error instanceof Error ? error.message : 'Unable to load serving teams.',
        })
      }
    }

    load()

    return () => {
      isActive = false
    }
  }, [])

  return state
}
