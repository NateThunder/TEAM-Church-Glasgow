import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
}

interface LayoutProps {
  navItems: NavItem[]
  children: ReactNode
}

export default function Layout({ navItems, children }: LayoutProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-strong">Team</span>
          <span className="brand-light">Church</span>
        </div>
        <div className="nav-center">
          <nav className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  ['nav-link', isActive ? 'nav-link-active' : ''].join(' ')
                }
                end={item.path === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="nav-actions">
          <a className="action-button action-watch" href="/watch">
            <span className="action-icon">▶</span>
            Watch Live
          </a>
          <a className="action-button action-give" href="/give">
            <span className="action-icon">♡</span>
            Give
          </a>
        </div>
      </header>

      <main className="page-content">{children}</main>

      <footer className="site-footer">
        <p>© 2026 Team Church Glasgow</p>
      </footer>
    </div>
  )
}
