import '../styles/admin.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isMissingJwtUserError } from '../admin/authUtils'
import { supabase } from '../services/supabaseClient'

export default function AdminResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'success'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const supabaseAvailable = Boolean(supabase)

  useEffect(() => {
    if (!supabase) {
      setStatus('invalid')
      setError('Password reset is unavailable. Configure Supabase environment variables.')
      return
    }
    const client = supabase

    let mounted = true
    const validateRecoverySession = async () => {
      const { data, error: sessionError } = await client.auth.getSession()
      if (!mounted) return
      if (sessionError || !data.session) {
        if (isMissingJwtUserError(sessionError)) {
          await client.auth.signOut()
          setStatus('invalid')
          setError(
            'This reset link is tied to an old or removed account session. Request a new password reset email and try again.'
          )
          return
        }
        setStatus('invalid')
        setError('Reset link is invalid or has expired. Request a new reset email.')
        return
      }
      setStatus('ready')
      setError(null)
    }

    void validateRecoverySession()

    const { data: subscription } = client.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setStatus('ready')
        setError(null)
        return
      }
      if (!session) {
        setStatus('invalid')
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!supabase) {
      setError('Password reset is unavailable. Configure Supabase environment variables.')
      return
    }
    const client = supabase

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    const { error: updateError } = await client.auth.updateUser({
      password: newPassword,
      data: {
        must_change_password: false,
        password_changed_at: new Date().toISOString(),
      },
    })

    if (updateError) {
      if (isMissingJwtUserError(updateError)) {
        await client.auth.signOut()
        setStatus('invalid')
        setError(
          'This reset session is no longer valid for an existing user. Request a new password reset email.'
        )
        setIsSubmitting(false)
        return
      }
      setError(updateError.message)
      setIsSubmitting(false)
      return
    }

    setStatus('success')
    setIsSubmitting(false)
    window.setTimeout(() => navigate('/admin/login', { replace: true }), 1200)
  }

  return (
    <section className="admin-page">
      <div className="admin-container admin-auth">
        <div className="admin-card">
          <h1 className="admin-title">Reset Password</h1>

          {status === 'checking' ? (
            <p className="admin-subtitle">Validating reset link...</p>
          ) : null}

          {status === 'invalid' ? (
            <>
              <p className="admin-subtitle">
                {error ?? 'Reset link is invalid or has expired. Request a new reset email.'}
              </p>
              <p className="admin-footnote">
                <Link to="/admin/login">Back to admin login</Link>
              </p>
            </>
          ) : null}

          {status === 'ready' ? (
            <>
              <p className="admin-subtitle">Set a new password for your account.</p>
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
                {error ? <p className="admin-error">{error}</p> : null}
                <button type="submit" className="admin-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          ) : null}

          {status === 'success' ? (
            <>
              <p className="admin-subtitle">Password updated successfully. Redirecting to login...</p>
              <p className="admin-footnote">
                <Link to="/admin/login">Go to admin login</Link>
              </p>
            </>
          ) : null}

          {!supabaseAvailable ? (
            <p className="admin-error">
              Password reset is unavailable. Configure Supabase environment variables.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
