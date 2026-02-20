import { useMemo, useState } from 'react'
import {
  adminDataContext,
  createId,
  type AdminDataContextValue,
  type AnnouncementItem,
  type EventItem,
  type GroupItem,
  type TeamItem,
} from './adminDataStore'

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [teams, setTeams] = useState<TeamItem[]>([])
  const [groups, setGroups] = useState<GroupItem[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])

  const value = useMemo<AdminDataContextValue>(
    () => ({
      events,
      teams,
      groups,
      announcements,
      createEvent: (item) => setEvents((prev) => [...prev, { id: createId(), ...item }]),
      updateEvent: (id, item) =>
        setEvents((prev) => prev.map((entry) => (entry.id === id ? { id, ...item } : entry))),
      removeEvent: (id) => setEvents((prev) => prev.filter((entry) => entry.id !== id)),
      createTeam: (item) => setTeams((prev) => [...prev, { id: createId(), ...item }]),
      updateTeam: (id, item) =>
        setTeams((prev) => prev.map((entry) => (entry.id === id ? { id, ...item } : entry))),
      removeTeam: (id) => setTeams((prev) => prev.filter((entry) => entry.id !== id)),
      createGroup: (item) => setGroups((prev) => [...prev, { id: createId(), ...item }]),
      updateGroup: (id, item) =>
        setGroups((prev) => prev.map((entry) => (entry.id === id ? { id, ...item } : entry))),
      removeGroup: (id) => setGroups((prev) => prev.filter((entry) => entry.id !== id)),
      createAnnouncement: (item) =>
        setAnnouncements((prev) => [...prev, { id: createId(), ...item }]),
      updateAnnouncement: (id, item) =>
        setAnnouncements((prev) =>
          prev.map((entry) => (entry.id === id ? { id, ...item } : entry))
        ),
      removeAnnouncement: (id) =>
        setAnnouncements((prev) => prev.filter((entry) => entry.id !== id)),
    }),
    [events, teams, groups, announcements]
  )

  return <adminDataContext.Provider value={value}>{children}</adminDataContext.Provider>
}
