import '../styles/admin.css'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { isMissingJwtUserError, requiresPasswordChange } from '../admin/authUtils'
import { supabase } from '../services/supabaseClient'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const supabaseAvailable = Boolean(supabase)

  const locationState = location.state as
    | { from?: string; forcePasswordChange?: boolean }
    | null
  const requestedPath = locationState?.from
  const redirectPath =
    requestedPath && requestedPath.startsWith('/admin') && requestedPath !== '/admin/login'
      ? requestedPath
      : '/admin'
  const mustChangePassword = requiresPasswordChange(user)
  const wasRedirectedForPasswordChange = Boolean(locationState?.forcePasswordChange)

  useEffect(() => {
    if (!supabase) {
      setError('Admin login is unavailable. Configure Supabase environment variables.')
      return
    }
    const client = supabase

    let mounted = true

    client.auth.getSession().then(async ({ data, error: sessionError }) => {
      if (sessionError && isMissingJwtUserError(sessionError)) {
        await client.auth.signOut()
      }
      if (mounted) {
        setUser(data.session?.user ?? null)
      }
    })

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user && !mustChangePassword) {
      navigate(redirectPath, { replace: true })
    }
  }, [user, mustChangePassword, navigate, redirectPath])

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

  const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!supabase || !user) return

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsUpdatingPassword(true)

    const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
      data: {
        ...userMetadata,
        must_change_password: false,
        password_changed_at: new Date().toISOString(),
      },
    })

    if (updateError) {
      setError(updateError.message)
      setIsUpdatingPassword(false)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setIsUpdatingPassword(false)
    navigate(redirectPath, { replace: true })
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

            <p className="admin-footnote">Need an account? Contact the site administrator.</p>
          </div>
        </div>
      </section>
    )
  }

  if (mustChangePassword) {
    return (
      <section className="admin-page">
        <div className="admin-container admin-auth">
          <div className="admin-card">
            <h1 className="admin-title">Change Password</h1>
            <p className="admin-subtitle">
              {wasRedirectedForPasswordChange
                ? 'Your temporary password must be changed before accessing admin pages.'
                : 'Set a new password to continue.'}
            </p>

            <form className="admin-form" onSubmit={handleUpdatePassword}>
              <label className="admin-label">
                New Password
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </label>
              <label className="admin-label">
                Confirm New Password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat new password"
                  required
                  minLength={8}
                />
              </label>
              {error && <p className="admin-error">{error}</p>}
              <button type="submit" className="admin-primary" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating...' : 'Update password'}
              </button>
            </form>

            <p className="admin-footnote">
              Signed in as {user.email ?? 'account'}. Not you?{' '}
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={handleSignOut}
                disabled={isUpdatingPassword}
              >
                Sign out
              </button>
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
