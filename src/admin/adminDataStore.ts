import { createContext } from 'react'

export type EventItem = {
  id: string
  title: string
  date: string
  location: string
}

export type TeamItem = {
  id: string
  name: string
  leader: string
  description: string
}

export type GroupItem = {
  id: string
  name: string
  meetingTime: string
  description: string
}

export type AnnouncementItem = {
  id: string
  title: string
  content: string
  status: 'Draft' | 'Published'
}

export type AdminDataContextValue = {
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

export const adminDataContext = createContext<AdminDataContextValue | undefined>(undefined)

export const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
