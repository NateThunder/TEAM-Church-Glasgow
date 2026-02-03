import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
}

interface LayoutProps {
  navItems: NavItem[]
  children: ReactNode
}

export default function Layout({ navItems, children }: LayoutProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    let frameId = 0
    const fadeRange = 120

    const updateFrost = () => {
      frameId = 0
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0
      const progress = Math.min(Math.max(scrollTop / fadeRange, 0), 1)

      const alpha = 0.15 * progress
      const blur = 14 * progress
      const shadow = 0.2 * progress

      header.style.setProperty('--frost-alpha', alpha.toFixed(3))
      header.style.setProperty('--frost-blur', `${blur.toFixed(2)}px`)
      header.style.setProperty('--frost-shadow', shadow.toFixed(3))
    }

    const onScroll = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(updateFrost)
    }

    updateFrost()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameId) window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <div className="app-shell">
      {isHome ? (
        <div className="video-hero" aria-hidden="true">
          <video className="hero-video" autoPlay loop muted playsInline>
            <source src="/Video/TEAM%20Church%20Banner.mp4" type="video/mp4" />
          </video>
          <div className="video-overlay" />
        </div>
      ) : null}

      <header className="site-header" ref={headerRef}>
        <div className="brand">
          <img
            className="brand-logo logo-dark"
            src="/Logo/Logo-white.png"
            alt="Team Church"
          />
          <img
            className="brand-logo logo-light"
            src="/Logo/Logo-black.png"
            alt="Team Church"
          />
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
            <span className="action-icon">▶</span>Watch Live
          </a>
          <a className="action-button action-give" href="/give">
            <span className="action-icon">♡</span>Give
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
