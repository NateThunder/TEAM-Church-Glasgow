import { createContext, useContext, useMemo, useState } from 'react'

type EventItem = {
  id: string
  title: string
  date: string
  location: string
}

type TeamItem = {
  id: string
  name: string
  leader: string
  description: string
}

type GroupItem = {
  id: string
  name: string
  meetingTime: string
  description: string
}

type AnnouncementItem = {
  id: string
  title: string
  content: string
  status: 'Draft' | 'Published'
}

type AdminDataContextValue = {
  events: EventItem[]
  teams: TeamItem[]
  groups: GroupItem[]
  announcements: AnnouncementItem[]
  createEvent: (item: Omit<EventItem, 'id'>) => void
  updateEvent: (id: string, item: Omit<EventItem, 'id'>) => void
  removeEvent: (id: string) => void
  createTeam: (item: Omit<TeamItem, 'id'>) => void
  updateTeam: (id: string, item: Omit<TeamItem, 'id'>) => void
  removeTeam: (id: string) => void
  createGroup: (item: Omit<GroupItem, 'id'>) => void
  updateGroup: (id: string, item: Omit<GroupItem, 'id'>) => void
  removeGroup: (id: string) => void
  createAnnouncement: (item: Omit<AnnouncementItem, 'id'>) => void
  updateAnnouncement: (id: string, item: Omit<AnnouncementItem, 'id'>) => void
  removeAnnouncement: (id: string) => void
}

const AdminDataContext = createContext<AdminDataContextValue | undefined>(undefined)

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

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

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) {
    throw new Error('useAdminData must be used within AdminDataProvider')
  }
  return context
}

export type { EventItem, TeamItem, GroupItem, AnnouncementItem }
