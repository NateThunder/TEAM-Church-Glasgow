import '../styles/home.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLocationDot,
  faPeopleGroup,
  faHandHoldingHeart,
  faHandsPraying,
} from '@fortawesome/free-solid-svg-icons'
import welcomeImage from '../assets/join.png'
import { getLatestVideos, type YouTubeVideo } from '../services/youtube'

type LoadState = 'idle' | 'loading' | 'error'

export default function HomePage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [status, setStatus] = useState<LoadState>('idle')

  useEffect(() => {
    let active = true
    const load = async () => {
      setStatus('loading')
      try {
        const data = await getLatestVideos({ maxResults: 4 })
        if (!active) return
        setVideos(data.videos.slice(0, 4))
        setStatus('idle')
      } catch {
        if (!active) return
        setStatus('error')
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const featured = videos[0]
  const list = videos.slice(1)

  const nextSteps = [
    {
      title: 'New Here?',
      description:
        'We’d love to meet you! Plan your first visit and know what to expect.',
      linkText: 'Plan a Visit',
      to: '/connect',
      icon: faLocationDot,
    },
    {
      title: 'Join a Group',
      description:
        'Connect with others in small groups that meet throughout the week.',
      linkText: 'Find a Group',
      to: '/groups',
      icon: faPeopleGroup,
    },
    {
      title: 'Serve With Us',
      description:
        'Use your gifts to make a difference. There’s a place for everyone.',
      linkText: 'Get Involved',
      to: '/serve',
      icon: faHandHoldingHeart,
    },
    {
      title: 'Need Prayer?',
      description:
        'We believe in the power of prayer. Let us pray with you and for you.',
      linkText: 'Submit Request',
      to: '/connect',
      icon: faHandsPraying,
    },
  ]

  return (
    <section className="page">
      <div className="welcome-section">
        <div className="welcome-content">
          <span className="welcome-kicker">WELCOME TO TEAM CHURCH</span>
          <h2 className="welcome-title">
            <span>Real People.</span>
            <span className="welcome-accent">Real Faith.</span>
          </h2>
          <div className="welcome-body">
            <p>
              We’re a diverse community of Christ-followers in the heart of
              Denistone. Whether you’re exploring faith for the first time or
              have followed Jesus for years, there’s a place for you here.
            </p>
            <p>
              Our doors are open every Sunday at 11:00am. Come as you are—grab a
              coffee, find a seat, and experience authentic community.
            </p>
          </div>
          <button type="button" className="welcome-cta">
            Learn More About Us
            <span className="welcome-cta-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M5 12h12" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
        <div className="welcome-image">
          <img src={welcomeImage} alt="People gathered at church" />
        </div>
      </div>

      <section className="tone-section">
        <div className="tone-inner">
          <section
            className="latest-section"
            aria-labelledby="latest-messages-title"
          >
            <div className="latest-header">
              <div>
                <span className="latest-kicker">LATEST MESSAGES</span>
                <h2 id="latest-messages-title" className="latest-title">
                  Watch &amp; Listen
                </h2>
              </div>
              <Link to="/watch" className="latest-link">
                View All Messages <span aria-hidden="true">→</span>
              </Link>
            </div>

            {status === 'error' ? (
              <div className="latest-error">Unable to load latest messages.</div>
            ) : (
              <div className="latest-grid">
                <div className="latest-featured">
                  {status === 'loading' || !featured ? (
                    <div className="latest-skeleton latest-skeleton-featured" />
                  ) : (
                <Link
                  className="latest-featured-card"
                  to={`/watch?v=${featured.id}`}
                  aria-label={`Play ${featured.title}`}
                >
                  <div className="latest-featured-media">
                    <img src={featured.thumbnailUrl} alt={featured.title} />
                    <div className="latest-featured-overlay" />
                        <span className="latest-play" aria-hidden="true">
                          <svg viewBox="0 0 24 24" focusable="false">
                            <path d="M9 7l8 5-8 5z" />
                          </svg>
                        </span>
                      </div>
                  <div className="latest-featured-body">
                    <h3>{featured.title}</h3>
                    <p>Team Church Glasgow</p>
                  </div>
                </Link>
                  )}
                </div>
                <div className="latest-list">
                  {status === 'loading' ? (
                    <>
                      <div className="latest-skeleton latest-skeleton-item" />
                      <div className="latest-skeleton latest-skeleton-item" />
                      <div className="latest-skeleton latest-skeleton-item" />
                    </>
                  ) : (
                    list.map((video) => (
                  <Link
                    key={video.id}
                    className="latest-item"
                    to={`/watch?v=${video.id}`}
                    aria-label={`Play ${video.title}`}
                  >
                    <div className="latest-thumb">
                      <img src={video.thumbnailUrl} alt={video.title} />
                    </div>
                    <div className="latest-item-body">
                      <h4>{video.title}</h4>
                      <p>Team Church Glasgow</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
              </div>
            )}
          </section>
        </div>
      </section>

      <div className="next-separator" aria-hidden="true" />

      <section className="next-steps" aria-labelledby="next-steps-title">
        <div className="next-steps-header">
          <span className="next-steps-kicker">GET CONNECTED</span>
          <h2 id="next-steps-title" className="next-steps-title">
            Take Your Next Step
          </h2>
          <p className="next-steps-subtitle">
            Wherever you are in your journey, there’s a next step waiting for
            you.
          </p>
        </div>
        <div className="next-steps-grid">
          {nextSteps.map((step) => (
            <Link key={step.title} className="next-steps-card" to={step.to}>
              <div className="next-steps-icon" aria-hidden="true">
                <FontAwesomeIcon icon={step.icon} />
              </div>
              <div className="next-steps-body">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <span className="next-steps-link">
                {step.linkText} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  )
}

