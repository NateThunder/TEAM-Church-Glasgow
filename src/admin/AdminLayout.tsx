import '../styles/admin.css'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

type AdminLayoutProps = {
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}

const navItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/teams', label: 'Teams' },
  { to: '/admin/believers-class', label: 'Believers Class' },
  { to: '/admin/groups', label: 'Groups' },
  { to: '/admin/announcements', label: 'Announcements' },
]

export default function AdminLayout({ title, description, action, children }: AdminLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const supabaseAvailable = Boolean(supabase)

  useEffect(() => {
    if (!isDrawerOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false)
      }
    }

    const scrollY = window.scrollY || window.pageYOffset
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      const top = body.style.top
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      const y = top ? -parseInt(top, 10) : 0
      window.scrollTo(0, y)
    }
  }, [isDrawerOpen])

  const handleSignOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span className="admin-sidebar-title">Manage</span>
        </div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                ['admin-nav-link', isActive ? 'is-active' : ''].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--signout"
            onClick={handleSignOut}
            disabled={!supabaseAvailable}
          >
            <span className="admin-btn-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path
                  d="M10 4a1 1 0 0 1 1-1h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7a1 1 0 1 1 0-2h7V5h-7a1 1 0 0 1-1-1Zm-1.293 4.293a1 1 0 0 1 1.414 0l3.5 3.5a1 1 0 0 1 0 1.414l-3.5 3.5a1 1 0 1 1-1.414-1.414L10.086 13H3a1 1 0 1 1 0-2h7.086L8.707 9.707a1 1 0 0 1 0-1.414Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-mobile-bar">
        <button
          type="button"
          className="admin-icon-btn"
          aria-label="Open admin navigation"
          onClick={() => setIsDrawerOpen(true)}
        >
          Menu
        </button>
        <span className="admin-mobile-title">Admin</span>
        <div className="admin-mobile-spacer" />
      </div>

      {isDrawerOpen ? (
        <div className="admin-drawer" role="dialog" aria-modal="true">
          <button className="admin-drawer-backdrop" type="button" onClick={closeDrawer} />
          <div className="admin-drawer-panel">
            <div className="admin-drawer-header">
              <span>Manage</span>
              <button type="button" className="admin-icon-btn" onClick={closeDrawer} aria-label="Close">
                X
              </button>
            </div>
            <nav className="admin-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/admin'}
                  onClick={closeDrawer}
                  className={({ isActive }) =>
                    ['admin-nav-link', isActive ? 'is-active' : ''].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="admin-sidebar-footer">
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--signout"
                onClick={handleSignOut}
                disabled={!supabaseAvailable}
              >
                <span className="admin-btn-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                    <path
                      d="M10 4a1 1 0 0 1 1-1h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7a1 1 0 1 1 0-2h7V5h-7a1 1 0 0 1-1-1Zm-1.293 4.293a1 1 0 0 1 1.414 0l3.5 3.5a1 1 0 0 1 0 1.414l-3.5 3.5a1 1 0 1 1-1.414-1.414L10.086 13H3a1 1 0 1 1 0-2h7.086L8.707 9.707a1 1 0 0 1 0-1.414Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {action ? <div className="admin-header-action">{action}</div> : null}
        </div>
        {children}
      </main>
    </div>
  )
}
