import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export type EventCategory = 'All' | 'Worship' | 'Community' | 'Youth' | 'Kids'

export type EventItem = {
  id: string
  title: string
  description?: string
  category: EventCategory
  location?: string
  start: string
  end: string
  imageUrl?: string
}

type EventRow = {
  id: string
  title: string
  description: string | null
  category: EventCategory
  location: string | null
  start: string
  end: string
  image_url: string | null
}

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

type EventsState = {
  status: LoadStatus
  events: EventItem[]
  error: string | null
}

export function useEvents() {
  const [state, setState] = useState<EventsState>({
    status: 'idle',
    events: [],
    error: null,
  })

  useEffect(() => {
    let isActive = true
    const controller = new AbortController()

    const load = async () => {
      setState((prev) => ({ ...prev, status: 'loading', error: null }))
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id,title,description,category,location,start,end,image_url')
          .order('start', { ascending: true })

        if (error) {
          throw error
        }

        const events: EventItem[] = (data ?? []).map((row: EventRow) => ({
          id: row.id,
          title: row.title,
          description: row.description ?? undefined,
          category: row.category,
          location: row.location ?? undefined,
          start: row.start,
          end: row.end,
          imageUrl: row.image_url ?? undefined,
        }))
        if (!isActive) return
        setState({ status: 'success', events, error: null })
      } catch (error) {
        if (!isActive) return
        if (error instanceof DOMException && error.name === 'AbortError') return
        setState({
          status: 'error',
          events: [],
          error: error instanceof Error ? error.message : 'Unable to load events.',
        })
      }
    }

    load()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [])

  return state
}
