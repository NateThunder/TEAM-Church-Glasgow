import { useMemo, useState } from 'react'
import {
  adminDataContext,
  createId,
  type AdminDataContextValue,
  type EventItem,
  type GroupItem,
  type TeamItem,
} from './adminDataStore'

type WithId = { id: string }

const appendItem = <T extends WithId>(items: T[], item: Omit<T, 'id'>): T[] => [
  ...items,
  { id: createId(), ...item } as T,
]

const replaceItem = <T extends WithId>(items: T[], id: string, item: Omit<T, 'id'>): T[] =>
  items.map((entry) => (entry.id === id ? ({ id, ...item } as T) : entry))

const removeItem = <T extends WithId>(items: T[], id: string): T[] =>
  items.filter((entry) => entry.id !== id)

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [teams, setTeams] = useState<TeamItem[]>([])
  const [groups, setGroups] = useState<GroupItem[]>([])

  const value = useMemo<AdminDataContextValue>(
    () => ({
      events,
      teams,
      groups,
      createEvent: (item) => setEvents((prev) => appendItem(prev, item)),
      updateEvent: (id, item) => setEvents((prev) => replaceItem(prev, id, item)),
      removeEvent: (id) => setEvents((prev) => removeItem(prev, id)),
      createTeam: (item) => setTeams((prev) => appendItem(prev, item)),
      updateTeam: (id, item) => setTeams((prev) => replaceItem(prev, id, item)),
      removeTeam: (id) => setTeams((prev) => removeItem(prev, id)),
      createGroup: (item) => setGroups((prev) => appendItem(prev, item)),
      updateGroup: (id, item) => setGroups((prev) => replaceItem(prev, id, item)),
      removeGroup: (id) => setGroups((prev) => removeItem(prev, id)),
    }),
    [events, teams, groups]
  )

  return <adminDataContext.Provider value={value}>{children}</adminDataContext.Provider>
}
