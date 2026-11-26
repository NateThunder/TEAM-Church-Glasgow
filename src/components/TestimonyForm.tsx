import { useState, type FormEvent } from 'react'
import { submitNetlifyForm } from '../services/netlifyForms'
import '../styles/connect.css'
import '../styles/testimony.css'

const questions = [
  { name: 'timing', title: 'When did this happen?', choices: ['Recently', 'Within the last few months', 'Some time ago'] },
  { name: 'sharing', title: 'Would you be comfortable sharing this on stage in 3 minutes?', choices: ['Yes', 'Yes, with some guidance', "I'd prefer to share it privately"] },
]

export default function TestimonyForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'sending') return
    const data = new FormData(event.currentTarget)
    const values = Object.fromEntries(Array.from(data, ([key, value]) => [key, String(value).trim()]))
    setStatus('sending')
    try {
      await submitNetlifyForm('testimony', { ...values, contactPermission: values.contactPermission || 'No' })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="testimony-page" aria-labelledby="testimony-title">
      <h2 id="testimony-title">Share Your Testimony</h2>
      {status === 'sent' ? (
        <p role="status">Thank you for sharing your testimony with the team.</p>
      ) : (
        <>
          <p>We’d love to hear what God has been doing in your life. Submit your testimony for consideration for sharing during a Sunday service.</p>
          <form className="connect-form" onSubmit={submit}>
            <input name="bot-field" hidden tabIndex={-1} autoComplete="off" />
            <label>Full name<input name="name" autoComplete="name" placeholder="Your name" required /></label>
            <label>Email or phone number<input name="contact" placeholder="Your contact details" required /></label>
            <label>What has God done in your life?
              <textarea name="story" placeholder="Briefly share what happened and what God has done…" required />
            </label>
            {questions.map(question => (
              <fieldset key={question.name}>
                <legend>{question.title}</legend>
                {question.choices.map(choice => (
                  <label className="testimony-choice" key={choice}>
                    <input type="radio" name={question.name} value={choice} required />{choice}
                  </label>
                ))}
              </fieldset>
            ))}
            <label className="testimony-choice">
              <input type="checkbox" name="contactPermission" value="Yes" />
              I’m happy for the testimony team to contact me about my submission.
            </label>
            {status === 'error' && <p role="alert">Your testimony could not be sent. Please try again.</p>}
            <button className="connect-submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Submit testimony'}
            </button>
          </form>
        </>
      )}
    </section>
  )
}
