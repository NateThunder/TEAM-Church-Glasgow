import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export type BelieversClassItem = {
  id: string
  durationLabel: string
  startsLabel: string
}

type BelieversClassRow = {
  id: string
  duration_label: string | null
  starts_label: string | null
  is_active: boolean
}

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

type BelieversClassState = {
  status: LoadStatus
  item: BelieversClassItem | null
  error: string | null
}

const toItem = (row: BelieversClassRow): BelieversClassItem => ({
  id: row.id,
  durationLabel: row.duration_label ?? '',
  startsLabel: row.starts_label ?? '',
})

export function useBelieversClass() {
  const [state, setState] = useState<BelieversClassState>({
    status: 'idle',
    item: null,
    error: null,
  })

  useEffect(() => {
    let isActive = true

    const load = async () => {
      if (!supabase) {
        setState({
          status: 'error',
          item: null,
          error: 'Believers Class is unavailable. Configure Supabase environment variables.',
        })
        return
      }

      setState((prev) => ({ ...prev, status: 'loading', error: null }))

      try {
        const { data, error } = await supabase
          .from('believers_classes')
          .select('id,duration_label,starts_label,is_active')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
          .limit(1)

        if (error) throw error
        if (!isActive) return
        const row = (data?.[0] as BelieversClassRow | undefined) ?? null
        setState({
          status: 'success',
          item: row ? toItem(row) : null,
          error: null,
        })
      } catch (error) {
        if (!isActive) return
        setState({
          status: 'error',
          item: null,
          error: error instanceof Error ? error.message : 'Unable to load Believers Class.',
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
