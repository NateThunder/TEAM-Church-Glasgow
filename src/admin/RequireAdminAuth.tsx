import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import { requiresPasswordChange } from './authUtils'

type AuthState = 'loading' | 'authorized' | 'unauthorized' | 'must_change_password'

export default function RequireAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const location = useLocation()

  useEffect(() => {
    if (!supabase) {
      setAuthState('unauthorized')
      return
    }

    let mounted = true
    const resolveAuthState = (session: Session | null) => {
      if (!mounted) return
      if (!session) {
        setAuthState('unauthorized')
        return
      }
      setAuthState(requiresPasswordChange(session.user) ? 'must_change_password' : 'authorized')
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        if (!mounted) return
        setAuthState('unauthorized')
        return
      }
      resolveAuthState(data.session)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      resolveAuthState(session)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  if (authState === 'loading') {
    return (
      <section className="admin-page">
        <div className="admin-container admin-auth">
          <div className="admin-card">
            <h1 className="admin-title">Admin</h1>
            <p className="admin-subtitle">Checking access...</p>
          </div>
        </div>
      </section>
    )
  }

  const from = `${location.pathname}${location.search}${location.hash}`

  if (authState === 'must_change_password') {
    return <Navigate to="/admin/login" replace state={{ from, forcePasswordChange: true }} />
  }

  if (authState !== 'authorized') {
    return <Navigate to="/admin/login" replace state={{ from }} />
  }

  return <Outlet />
}
