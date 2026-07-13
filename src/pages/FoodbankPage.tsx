import '../styles/foodbank.css'
import { useMemo, useState, type FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClock,
  faEnvelope,
  faHandHoldingHeart,
  faLocationDot,
  faPhone,
} from '@fortawesome/free-solid-svg-icons'
import { submitNetlifyForm } from '../services/netlifyForms'
import { useFoodbankProfile } from '../services/foodbankProfile'

const enquiryOptions = [
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'donate_items', label: 'Donate items' },
  { value: 'financial_giving', label: 'Financial giving' },
  { value: 'partner', label: 'Partner with the Foodbank' },
]

const netlifyFormName = 'foodbank-enquiry'

const parseCommitteeMembers = (members: string) =>
  members
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, role = '', imageUrl = ''] = line.split('|')
      return {
        name: name.trim(),
        role: role.trim(),
        imageUrl: imageUrl.trim(),
      }
    })
    .filter((member) => member.name)

export default function FoodbankPage() {
  const { profile } = useFoodbankProfile()
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const phoneHref = useMemo(() => `tel:${profile.phone.replace(/[^\d+]/g, '')}`, [profile.phone])
  const emailHref = `mailto:${profile.email}`
  const committeeMembers = useMemo(
    () => parseCommitteeMembers(profile.committeeMembers),
    [profile.committeeMembers],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const enquiryType = String(data.get('enquiryType') ?? '').trim()
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const consent = data.get('consent') === 'on'

    setSubmitted(false)
    setSubmitError(null)

    if (!enquiryType || !name || !email) {
      setSubmitError('Please choose an enquiry type and provide your name and email.')
      return
    }

    if (!consent) {
      setSubmitError('Please confirm that the Foodbank team can contact you.')
      return
    }

    setIsSubmitting(true)

    try {
      await submitNetlifyForm(netlifyFormName, {
        enquiryType,
        name,
        email,
        phone,
        message,
        consent: 'true',
      })
      setSubmitted(true)
      form.reset()
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : 'Unable to submit right now. Please try again.'
      setSubmitError(messageText)
      if (import.meta.env.DEV) {
        console.error('Foodbank enquiry submit failed:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="foodbank-page">
      <header
        className="foodbank-hero"
        style={{ backgroundImage: `url("${profile.heroImageUrl}")` }}
      >
        <div className="foodbank-hero-overlay" />
        <div className="foodbank-hero-inner">
          <span className="foodbank-kicker">{profile.heroKicker}</span>
          <h1>{profile.heroTitle}</h1>
          <p>{profile.heroSummary}</p>
          <div className="foodbank-hero-actions">
            <a className="foodbank-button foodbank-button-primary" href="#foodbank-help">
              Get help
            </a>
            <a className="foodbank-button foodbank-button-secondary" href={profile.donateUrl}>
              <FontAwesomeIcon icon={faHandHoldingHeart} aria-hidden="true" />
              Support the Foodbank
            </a>
          </div>
        </div>
      </header>

      <div className="foodbank-quickbar" aria-label="Foodbank essentials">
        <div className="foodbank-quickbar-inner">
          <div>
            <span className="foodbank-quickbar-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faClock} />
            </span>
            <div className="foodbank-quickbar-copy">
              <span className="foodbank-quickbar-label">Open</span>
              <strong>{profile.hoursPrimaryLabel}: {profile.hoursPrimaryValue}</strong>
              <a className="foodbank-quickbar-action" href="#foodbank-help">
                View opening times
              </a>
            </div>
          </div>
          <div>
            <span className="foodbank-quickbar-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faLocationDot} />
            </span>
            <div className="foodbank-quickbar-copy">
              <span className="foodbank-quickbar-label">Location</span>
              <strong>{profile.address}</strong>
              <a className="foodbank-quickbar-action" href={profile.directionsUrl}>
                Get directions
              </a>
            </div>
          </div>
          <div>
            <span className="foodbank-quickbar-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faPhone} />
            </span>
            <div className="foodbank-quickbar-copy">
              <span className="foodbank-quickbar-label">Contact</span>
              <strong>{profile.phone}</strong>
              <a className="foodbank-quickbar-action" href={phoneHref}>
                Call now
              </a>
            </div>
          </div>
        </div>
      </div>

      <section className="foodbank-section foodbank-mission" aria-labelledby="foodbank-mission-title">
        <div className="foodbank-mission-copy">
          <span className="foodbank-kicker">MISSION AND HISTORY</span>
          <h2 id="foodbank-mission-title">{profile.missionTitle}</h2>
          <p>{profile.missionBody}</p>
          <a className="foodbank-text-link" href={profile.aboutUrl}>
            Read more on the Foodbank website
          </a>
        </div>
        <div className="foodbank-mission-image">
          <img src="/optimized/about-story-2.jpg" alt="Team Church community gathering" />
        </div>
      </section>

      {committeeMembers.length > 0 ? (
        <div className="tone-section foodbank-tone-section">
          <div className="tone-inner foodbank-tone-inner">
            <section
              className="foodbank-section foodbank-committee"
              aria-labelledby="foodbank-committee-title"
            >
              <div className="foodbank-committee-heading">
                <span className="foodbank-kicker">THE COMMITTEE</span>
                <h2 id="foodbank-committee-title">{profile.committeeTitle}</h2>
                <p>{profile.committeeSummary}</p>
              </div>
              <div className="foodbank-committee-grid">
                {committeeMembers.map((member) => (
                  <article
                    className="foodbank-committee-member"
                    key={`${member.name}-${member.role}`}
                  >
                    {member.imageUrl ? (
                      <img
                        className="foodbank-committee-photo"
                        src={member.imageUrl}
                        alt={member.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                    <h3>{member.name}</h3>
                    {member.role ? <p>{member.role}</p> : null}
                  </article>
                ))}
              </div>
              <a className="foodbank-text-link" href={profile.committeeUrl}>
                View committee on the Foodbank website
              </a>
            </section>
          </div>
        </div>
      ) : null}

      <section
        className="foodbank-section foodbank-support-composition"
        id="foodbank-help"
        aria-labelledby="foodbank-support-title"
      >
        <div className="foodbank-support-column">
          <div className="foodbank-support-copy">
            <span className="foodbank-kicker">VOLUNTEER &amp; SUPPORT</span>
            <h2 id="foodbank-support-title">{profile.supportTitle}</h2>
            <p>{profile.supportIntro}</p>
          </div>
          <div className="foodbank-support-list">
            <article>
              <span className="foodbank-support-index" aria-hidden="true">01</span>
              <div>
                <h3>Volunteer opportunities</h3>
                <p>{profile.supportRoleStatus}</p>
              </div>
            </article>
            <article>
              <span className="foodbank-support-index" aria-hidden="true">02</span>
              <div>
                <h3>Ways to support</h3>
                <p>{profile.supportJoinDetails}</p>
              </div>
            </article>
            <article>
              <span className="foodbank-support-index" aria-hidden="true">03</span>
              <div>
                <h3>Find us</h3>
                <p>{profile.supportLocationDetails}</p>
              </div>
            </article>
            <article>
              <span className="foodbank-support-index" aria-hidden="true">04</span>
              <div>
                <h3>Opening times</h3>
                <p>{profile.supportOpeningDetails}</p>
              </div>
            </article>
          </div>
        </div>

        <article className="foodbank-panel">
          <h2>Need food support?</h2>
          <p>{profile.helpSummary}</p>
          <dl className="foodbank-details">
            <div>
              <dt>
                <FontAwesomeIcon icon={faClock} /> {profile.hoursPrimaryLabel}
              </dt>
              <dd>{profile.hoursPrimaryValue}</dd>
            </div>
            <div>
              <dt>
                <FontAwesomeIcon icon={faClock} /> {profile.hoursSecondaryLabel}
              </dt>
              <dd>{profile.hoursSecondaryValue}</dd>
            </div>
            <div>
              <dt>
                <FontAwesomeIcon icon={faLocationDot} /> Address
              </dt>
              <dd>{profile.address}</dd>
            </div>
          </dl>
          <div className="foodbank-action-row">
            <a className="foodbank-button foodbank-button-primary" href={profile.contactUrl}>
              Contact the Foodbank
            </a>
            <a className="foodbank-button foodbank-button-muted" href={profile.directionsUrl}>
              Get directions
            </a>
          </div>
        </article>

        <article className="foodbank-panel">
          <h2>Give or get involved</h2>
          <p>{profile.donationSummary}</p>
          <p className="foodbank-muted-copy">{profile.itemDonationDetails}</p>
          <div className="foodbank-action-row">
            <a className="foodbank-button foodbank-button-primary" href={profile.donateUrl}>
              Donate money
            </a>
          </div>
        </article>
      </section>

      <section className="foodbank-section foodbank-contact-band" aria-label="Foodbank contact details">
        <a href={phoneHref} className="foodbank-contact-item">
          <span aria-hidden="true">
            <FontAwesomeIcon icon={faPhone} />
          </span>
          <div>
            <strong>Phone</strong>
            <p>{profile.phone}</p>
          </div>
        </a>
        <a href={emailHref} className="foodbank-contact-item">
          <span aria-hidden="true">
            <FontAwesomeIcon icon={faEnvelope} />
          </span>
          <div>
            <strong>Email</strong>
            <p>{profile.email}</p>
          </div>
        </a>
        <a href={profile.facebookUrl} className="foodbank-contact-item">
          <span aria-hidden="true">f</span>
          <div>
            <strong>Facebook</strong>
            <p>Everlasting Foodbank</p>
          </div>
        </a>
        <div className="foodbank-contact-item">
          <span aria-hidden="true">SC</span>
          <div>
            <strong>{profile.charityName}</strong>
            <p>Registered Charity: {profile.charityNumber}</p>
          </div>
        </div>
      </section>

      <div className="tone-section foodbank-tone-section">
        <div className="tone-inner foodbank-tone-inner">
          <section
            className="foodbank-section foodbank-enquiry"
            id="foodbank-enquiry"
            aria-labelledby="foodbank-enquiry-title"
          >
            <div className="foodbank-enquiry-copy">
              <span className="foodbank-kicker">GET IN TOUCH</span>
              <h2 id="foodbank-enquiry-title">Foodbank enquiry</h2>
              <p>Questions about volunteering, donations or partnership? Send the team an enquiry.</p>
            </div>
            <form
              className="foodbank-form"
              name={netlifyFormName}
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={(event) => void handleSubmit(event)}
            >
              <input type="hidden" name="form-name" value={netlifyFormName} />
              <input type="hidden" name="bot-field" />
              <label>
                Enquiry type
                <select name="enquiryType" required defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {enquiryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Name
                <input name="name" type="text" required placeholder="Your name" />
              </label>
              <label>
                Email
                <input name="email" type="email" required placeholder="you@email.com" />
              </label>
              <label>
                Phone number (optional)
                <input name="phone" type="tel" autoComplete="tel" placeholder="+44 7123 456789" />
              </label>
              <label className="foodbank-form-message">
                Message (optional)
                <textarea name="message" rows={4} placeholder="Share anything useful for the team." />
              </label>
              <div className="foodbank-consent">
                <input id="foodbank-consent" name="consent" type="checkbox" required />
                <label htmlFor="foodbank-consent">
                  I agree to be contacted about my Foodbank enquiry.
                </label>
              </div>
              {submitted ? <p className="foodbank-success">Thanks. Your enquiry has been sent.</p> : null}
              {submitError ? <p className="foodbank-error">{submitError}</p> : null}
              <button className="foodbank-submit" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit enquiry'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </section>
  )
}
