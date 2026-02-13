import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

type AuthState = 'loading' | 'authorized' | 'unauthorized'

export default function RequireAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>('loading')
  const location = useLocation()

  useEffect(() => {
    if (!supabase) {
      setAuthState('unauthorized')
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return
      if (error) {
        setAuthState('unauthorized')
        return
      }
      setAuthState(data.session ? 'authorized' : 'unauthorized')
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'authorized' : 'unauthorized')
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

  if (authState !== 'authorized') {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/admin/login" replace state={{ from }} />
  }

  return <Outlet />
}
