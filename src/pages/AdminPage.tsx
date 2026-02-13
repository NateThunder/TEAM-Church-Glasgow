import '../styles/admin.css'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

type AuthUser = {
  id: string
  email?: string | null
}

export default function AdminPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const supabaseAvailable = Boolean(supabase)
  const requestedPath = (location.state as { from?: string } | null)?.from
  const redirectPath =
    requestedPath && requestedPath.startsWith('/admin') && requestedPath !== '/admin/login'
      ? requestedPath
      : '/admin'

  useEffect(() => {
    if (!supabase) {
      setError('Admin login is unavailable. Configure Supabase environment variables.')
      return
    }
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true })
    }
  }, [user, navigate, redirectPath])

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!supabase) {
      setError('Admin login is unavailable. Configure Supabase environment variables.')
      setIsSubmitting(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
    }

    setIsSubmitting(false)
  }

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  if (!supabaseAvailable) {
    return (
      <section className="admin-page">
        <div className="admin-container admin-auth">
          <div className="admin-card">
            <h1 className="admin-title">Admin Sign In</h1>
            <p className="admin-subtitle">
              Admin login is unavailable. Configure Supabase environment variables.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="admin-page">
        <div className="admin-container admin-auth">
          <div className="admin-card">
            <div className="admin-icon" aria-hidden="true">
              <span className="admin-shield" />
            </div>
            <h1 className="admin-title">Admin Sign In</h1>
            <p className="admin-subtitle">Use your email and password to access admin tools.</p>

            <form className="admin-form" onSubmit={handleSignIn}>
              <label className="admin-label">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </label>
              <label className="admin-label">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  required
                />
              </label>
            {error && <p className="admin-error">{error}</p>}
            <button type="submit" className="admin-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

            <p className="admin-footnote">
              Need an account? Contact the site administrator.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>Admin</h1>
            <p>Signed in as {user.email ?? 'account'}</p>
          </div>
          <button type="button" className="admin-secondary" onClick={handleSignOut}>
            Sign out
          </button>
        </div>

        <div className="admin-grid">
          <div className="admin-card">
            <h2>Events</h2>
            <p>Add and update upcoming events.</p>
          </div>
          <div className="admin-card">
            <h2>Teams</h2>
            <p>Manage serving teams and details.</p>
          </div>
          <div className="admin-card">
            <h2>Groups</h2>
            <p>Publish and edit small groups.</p>
          </div>
          <div className="admin-card">
            <h2>Announcements</h2>
            <p>Post updates for the church.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
