import '../styles/connect.css'
import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLocationDot,
  faClock,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons'

const CHURCH_LAT = 55.8589
const CHURCH_LNG = -4.2186
const MAP_DELTA = 0.01

const buildMapSrc = () => {
  const left = CHURCH_LNG - MAP_DELTA
  const right = CHURCH_LNG + MAP_DELTA
  const top = CHURCH_LAT + MAP_DELTA
  const bottom = CHURCH_LAT - MAP_DELTA
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&marker=${CHURCH_LAT}%2C${CHURCH_LNG}`
}

const tabs = ['Plan a Visit', 'Prayer Request', 'Contact Us'] as const

export default function ConnectPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]>('Plan a Visit')
  const [submitted, setSubmitted] = useState<string | null>(null)

  const mapSrc = useMemo(buildMapSrc, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = Object.fromEntries(data.entries())
    // Placeholder for future integration.
    // eslint-disable-next-line no-console
    console.log('Connect form submit', payload)
    setSubmitted(`Thanks! We’ve received your ${activeTab.toLowerCase()}.`)
    form.reset()
  }

  return (
    <section className="page connect-page">
      <header className="connect-header">
        <h1>Get In Touch</h1>
      </header>

      <div className="connect-grid">
        <aside className="connect-left">
          <div className="connect-info">
            <a
              className="connect-info-item connect-info-link"
              href="https://www.google.com/maps/dir/?api=1&destination=12+Whitehill+Street,+Glasgow+G31+2LH"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Google Maps for 12 Whitehill Street, Glasgow G31 2LH"
            >
              <span className="connect-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faLocationDot} />
              </span>
              <div>
                <h3>Location</h3>
                <p>12 Whitehill Street, Glasgow G31 2LH</p>
              </div>
            </a>
            <div className="connect-info-item">
              <span className="connect-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faClock} />
              </span>
              <div>
                <h3>Service Times</h3>
                <p>Sundays at 11:00am</p>
              </div>
            </div>
            <a
              className="connect-info-item connect-info-link"
              href="mailto:hello@teamchurchglasgow.org"
            >
              <span className="connect-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <div>
                <h3>Email</h3>
                <p>hello@teamchurchglasgow.org</p>
              </div>
            </a>
            <a
              className="connect-info-item connect-info-link"
              href="tel:+441234567890"
            >
              <span className="connect-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faPhone} />
              </span>
              <div>
                <h3>Phone</h3>
                <p>+44 123 456 7890</p>
              </div>
            </a>
          </div>

          <div className="connect-map-card">
            <iframe
              title="Team Church Glasgow location"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              className="connect-directions"
              href="https://www.google.com/maps/dir/?api=1&destination=12+Whitehill+Street,+Glasgow+G31+2LH"
              target="_blank"
              rel="noreferrer"
            >
              Get Directions →
            </a>
          </div>
        </aside>

        <div className="connect-right">
          <div className="connect-tabs" role="tablist" aria-label="Contact forms">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`connect-tab${
                  activeTab === tab ? ' is-active' : ''
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="connect-panel">
            {submitted ? <p className="connect-success">{submitted}</p> : null}

            {activeTab === 'Plan a Visit' ? (
              <form className="connect-form" onSubmit={handleSubmit}>
                <label>
                  Your Name *
                  <input name="name" type="text" required />
                </label>
                <label>
                  Email *
                  <input name="email" type="email" required />
                </label>
                <label>
                  Phone Number
                  <input name="phone" type="tel" />
                </label>
                <label>
                  Additional Info
                  <textarea
                    name="additionalInfo"
                    rows={4}
                    placeholder="Share anything that would help us prepare for your visit."
                  />
                </label>
                <button className="connect-submit" type="submit">
                  Submit
                </button>
              </form>
            ) : null}

            {activeTab === 'Prayer Request' ? (
              <form className="connect-form" onSubmit={handleSubmit}>
                <label>
                  Name
                  <input name="name" type="text" />
                </label>
                <label>
                  Email
                  <input name="email" type="email" />
                </label>
                <label>
                  Request *
                  <textarea name="request" rows={4} required />
                </label>
                <div className="connect-checkbox">
                  <input
                    id="confidential"
                    name="confidential"
                    type="checkbox"
                  />
                  <label htmlFor="confidential">Keep this confidential</label>
                </div>
                <button className="connect-submit" type="submit">
                  Submit
                </button>
              </form>
            ) : null}

            {activeTab === 'Contact Us' ? (
              <form className="connect-form" onSubmit={handleSubmit}>
                <label>
                  Name *
                  <input name="name" type="text" required />
                </label>
                <label>
                  Email *
                  <input name="email" type="email" required />
                </label>
                <label>
                  Subject
                  <input name="subject" type="text" />
                </label>
                <label>
                  Message *
                  <textarea name="message" rows={4} required />
                </label>
                <button className="connect-submit" type="submit">
                  Submit
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
