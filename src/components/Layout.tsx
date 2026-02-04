import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faLocationDot, faPlay } from '@fortawesome/free-solid-svg-icons'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
}

interface LayoutProps {
  navItems: NavItem[]
  children: ReactNode
}

function DrawerIcon({ name }: { name: string }) {
  switch (name) {
    case 'Home':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 11L12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />
        </svg>
      )
    case 'Watch':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="12" rx="2" />
          <path d="M10 9l5 3-5 3z" />
        </svg>
      )
    case 'About':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6" />
          <circle cx="12" cy="7" r="1" />
        </svg>
      )
    case 'Connect':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="7" cy="12" r="3" />
          <circle cx="17" cy="12" r="3" />
          <path d="M10 12h4" />
        </svg>
      )
    case 'Groups':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M4 20c0-3 3-5 6-5s6 2 6 5" />
          <path d="M14.5 15.5c2.2.4 4 1.8 4 4.5" />
        </svg>
      )
    case 'Serve':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21c-4-2.5-7-5.5-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 3.5-3 6.5-7 9z" />
        </svg>
      )
    case 'Events':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18" />
          <path d="M8 3v4M16 3v4" />
        </svg>
      )
    case 'Give':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21c-4-2.5-7-5.5-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 3.5-3 6.5-7 9z" />
        </svg>
      )
    case 'WatchLive':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="14" height="12" rx="2" />
          <path d="M8 9l5 3-5 3z" />
          <path d="M19 8a3 3 0 0 1 0 6" />
          <path d="M21 6a5 5 0 0 1 0 10" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
        </svg>
      )
  }
}

export default function Layout({ navItems, children }: LayoutProps) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isWatch = location.pathname === '/watch'
  const headerRef = useRef<HTMLElement | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPortraitMobile, setIsPortraitMobile] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const updateQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
  }

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
      document.documentElement.style.setProperty(
        '--header-height',
        `${header.offsetHeight}px`
      )
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

  useEffect(() => {
    const update = () => {
      setIsPortraitMobile(window.innerHeight > window.innerWidth)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    const scrollY = window.scrollY || window.pageYOffset
    const body = document.body
    const html = document.documentElement

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.height = '100%'

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      const top = body.style.top
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      body.style.width = ''
      body.style.overflow = ''
      html.style.height = ''
      body.style.height = ''
      const y = top ? -parseInt(top, 10) : 0
      window.scrollTo(0, y)
    }
  }, [isMenuOpen])

  const toggleMenu = () => {
    setIsMenuOpen((current) => !current)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const mobileDrawerItems = navItems

  return (
    <div className={`app-shell ${isPortraitMobile ? 'is-portrait' : ''}`}>
      {isHome ? (
        <div className="video-hero" aria-hidden="true">
          <video className="hero-video" autoPlay loop muted playsInline>
            <source src="/Video/TEAM%20Church%20Banner.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay" />
            <div className="hero-service-banner" aria-live="polite">
              <div className="hero-service-banner-inner">
                <div className="hero-service-info">
                  <span className="hero-service-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faClock} />
                  </span>
                  <span className="hero-service-text">
                    Every Sunday at 11:00 AM {'\u00B7'} 12 Whitehill Street, Glasgow G31 2LH
                  </span>
                </div>
                <NavLink to="/watch" className="hero-service-button">
                  <span className="hero-service-button-icon" aria-hidden="true">
                    <FontAwesomeIcon icon={faPlay} />
                  </span>
                  Watch Live Sunday
                </NavLink>
              </div>
            </div>
            <NavLink to="/connect" className="hero-cta">
              <span className="hero-cta-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faLocationDot} />
            </span>
            Plan a Visit
          </NavLink>
        </div>
      ) : null}

      <header className="site-header" ref={headerRef}>
        <NavLink to="/" className="brand" aria-label="Home" onClick={closeMenu}>
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
        </NavLink>
        {isWatch ? (
          <div className="nav-search" aria-label="Search videos">
            <input
              className="watch-search"
              type="search"
              placeholder="Search videos"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
          </div>
        ) : null}
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
            <span className="action-icon">{'\u25B6'}</span>Watch Live
          </a>
          <a className="action-button action-give" href="/give">
            <span className="action-icon">{'\u2661'}</span>Give
          </a>
        </div>
        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          onClick={toggleMenu}
        >
          <span className="nav-toggle-line" />
          <span className="nav-toggle-line" />
          <span className="nav-toggle-line" />
        </button>
      </header>

      <div
        className={`nav-drawer ${isMenuOpen ? 'nav-drawer-open' : ''}`}
        aria-hidden={isMenuOpen ? 'false' : 'true'}
      >
        <button
          className="nav-drawer-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
        <div
          className="nav-drawer-panel"
          role="dialog"
          aria-modal="true"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="nav-drawer-header">
            <span>Menu</span>
          </div>
          <nav className="nav-mobile-links">
            {mobileDrawerItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  ['nav-mobile-link', isActive ? 'nav-link-active' : ''].join(' ')
                }
                end={item.path === '/'}
                onClick={closeMenu}
              >
                <span className="nav-link-icon">
                  <DrawerIcon name={item.label} />
                </span>
                <span className="nav-link-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="nav-mobile-actions">
            <a
              className="action-button action-watch"
              href="/watch"
              onClick={closeMenu}
            >
              <span className="action-icon">{'\u25B6'}</span>Watch Live
            </a>
            <a
              className="action-button action-give"
              href="/give"
              onClick={closeMenu}
            >
              <span className="action-icon">{'\u2661'}</span>Give
            </a>
          </div>
        </div>
      </div>

      <main className="page-content">{children}</main>

      <footer className="site-footer">
        <p>{'\u00A9'} 2026 Team Church Glasgow</p>
      </footer>
    </div>
  )
}
