import '../styles/connect.css'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faLocationDot,
  faClock,
  faEnvelope,
  faPhone,
} from '@fortawesome/free-solid-svg-icons'
import { createGetInTouchSubmission } from '../services/getInTouch'

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
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Plan a Visit')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mapSrc = buildMapSrc()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const payload = Object.fromEntries(data.entries())

    if (import.meta.env.DEV) {
      console.log('Connect form submit', payload)
    }

    setSubmitted(null)
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      if (activeTab === 'Plan a Visit') {
        const name = String(data.get('name') ?? '').trim()
        const email = String(data.get('email') ?? '').trim()
        const phone = String(data.get('phone') ?? '').trim()
        const additionalInfo = String(data.get('additionalInfo') ?? '').trim()

        if (!name || !email) {
          setSubmitError('Please provide your name and email.')
          return
        }

        await createGetInTouchSubmission({
          formType: 'plan_visit',
          name,
          email,
          phoneNumber: phone,
          additionalInfo,
        })
      }

      if (activeTab === 'Prayer Request') {
        const name = String(data.get('name') ?? '').trim()
        const email = String(data.get('email') ?? '').trim()
        const phone = String(data.get('phone') ?? '').trim()
        const request = String(data.get('request') ?? '').trim()
        const confidential = data.get('confidential') === 'on'

        if (!request) {
          setSubmitError('Please enter your prayer request.')
          return
        }

        await createGetInTouchSubmission({
          formType: 'prayer_request',
          name,
          email,
          phoneNumber: phone,
          prayerRequest: request,
          confidential,
        })
      }

      if (activeTab === 'Contact Us') {
        const name = String(data.get('name') ?? '').trim()
        const email = String(data.get('email') ?? '').trim()
        const phone = String(data.get('phone') ?? '').trim()
        const subject = String(data.get('subject') ?? '').trim()
        const message = String(data.get('message') ?? '').trim()

        if (!name || !email || !message) {
          setSubmitError('Please provide your name, email, and message.')
          return
        }

        await createGetInTouchSubmission({
          formType: 'contact_us',
          name,
          email,
          phoneNumber: phone,
          subject,
          message,
        })
      }

      setSubmitted(`Thanks! We've received your ${activeTab.toLowerCase()}.`)
      form.reset()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to submit right now. Please try again.'
      setSubmitError(message)
      if (import.meta.env.DEV) {
        console.error('Connect form submit failed:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
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
            <a className="connect-info-item connect-info-link" href="mailto:hello@teamchurchglasgow.org">
              <span className="connect-icon" aria-hidden="true">
                <FontAwesomeIcon icon={faEnvelope} />
              </span>
              <div>
                <h3>Email</h3>
                <p>hello@teamchurchglasgow.org</p>
              </div>
            </a>
            <a className="connect-info-item connect-info-link" href="tel:+441234567890">
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
              Get Directions
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
                className={`connect-tab${activeTab === tab ? ' is-active' : ''}`}
                onClick={() => {
                  setActiveTab(tab)
                  setSubmitted(null)
                  setSubmitError(null)
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="connect-panel">
            {submitted ? <p className="connect-success">{submitted}</p> : null}
            {submitError ? <p className="connect-error">{submitError}</p> : null}

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
                <button className="connect-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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
                  Phone Number
                  <input name="phone" type="tel" />
                </label>
                <label>
                  Request *
                  <textarea name="request" rows={4} required />
                </label>
                <div className="connect-checkbox">
                  <input id="confidential" name="confidential" type="checkbox" />
                  <label htmlFor="confidential">Keep this confidential</label>
                </div>
                <button className="connect-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
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
                  Phone Number
                  <input name="phone" type="tel" />
                </label>
                <label>
                  Subject
                  <input name="subject" type="text" />
                </label>
                <label>
                  Message *
                  <textarea name="message" rows={4} required />
                </label>
                <button className="connect-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
