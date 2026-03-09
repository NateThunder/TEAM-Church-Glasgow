import '../styles/give.css'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

type Frequency = 'one-time' | 'recurring'
type CheckoutStatus = 'success' | 'cancelled' | null

const DONATION_AMOUNTS = [25, 50, 100, 250, 500, 1000]
const checkoutEndpoint =
  (import.meta.env.VITE_STRIPE_CHECKOUT_ENDPOINT as string | undefined) ??
  '/.netlify/functions/create-stripe-checkout'
const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 2,
})

function formatAmount(amount: number) {
  return currencyFormatter.format(amount)
}

export default function GivePage() {
  const [searchParams] = useSearchParams()
  const [frequency, setFrequency] = useState<Frequency>('one-time')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const checkoutStatus = searchParams.get('checkout') as CheckoutStatus
  const parsedCustomAmount = Number.parseFloat(customAmount)
  const donationAmount =
    selectedAmount ?? (Number.isFinite(parsedCustomAmount) ? parsedCustomAmount : null)
  const hasValidAmount = donationAmount !== null && donationAmount >= 1
  const giftLabel =
    donationAmount === null
      ? 'Select an amount to continue'
      : `${formatAmount(donationAmount)} ${frequency === 'recurring' ? 'monthly' : 'one-time'}`

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setErrorMessage(null)
  }

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(event.target.value)

    if (event.target.value.trim()) {
      setSelectedAmount(null)
    }

    setErrorMessage(null)
  }

  const handleFrequencyChange = (value: Frequency) => {
    setFrequency(value)
    setErrorMessage(null)
  }

  const handleCheckout = async () => {
    if (!hasValidAmount || donationAmount === null) {
      setErrorMessage('Choose an amount of at least GBP 1 to continue.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await fetch(checkoutEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: donationAmount,
          frequency,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string
            url?: string
          }
        | null

      if (!response.ok || !payload?.url) {
        throw new Error(
          payload?.error ?? 'Unable to start Stripe Checkout. Please try again in a moment.',
        )
      }

      window.location.assign(payload.url)
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to start Stripe Checkout.',
      )
    }
  }

  return (
    <section className="give-page">
      <div className="give-hero">
        <p className="give-kicker">Give</p>
        <h1>Thank You For Your Generosity</h1>
        <p className="give-subtext">
          Every gift helps us share the love of Jesus throughout Glasgow and beyond. Your
          generosity makes ministry happen.
        </p>
      </div>

      <div className="give-card">
        <div className="give-card-header">
          <h2>Give to Team Church Glasgow</h2>
        </div>

        <div className="give-card-body">
          {checkoutStatus === 'success' ? (
            <div className="give-status give-status-success" role="status">
              Thank you. Your gift has been received successfully.
            </div>
          ) : null}

          {checkoutStatus === 'cancelled' ? (
            <div className="give-status give-status-neutral" role="status">
              Checkout was cancelled. You can update the amount and try again.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="give-status give-status-error" role="alert">
              {errorMessage}
            </div>
          ) : null}

          <div className="give-toggle" role="group" aria-label="Giving frequency">
            <button
              type="button"
              className={`give-toggle-btn${frequency === 'one-time' ? ' is-active' : ''}`}
              aria-pressed={frequency === 'one-time'}
              onClick={() => handleFrequencyChange('one-time')}
            >
              One-Time
            </button>
            <button
              type="button"
              className={`give-toggle-btn${frequency === 'recurring' ? ' is-active' : ''}`}
              aria-pressed={frequency === 'recurring'}
              onClick={() => handleFrequencyChange('recurring')}
            >
              Recurring
            </button>
          </div>

          <div className="give-amounts">
            {DONATION_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`give-amount-btn${
                  selectedAmount === amount ? ' is-selected' : ''
                }`}
                aria-pressed={selectedAmount === amount}
                onClick={() => handleAmountSelect(amount)}
              >
                {formatAmount(amount)}
              </button>
            ))}
          </div>

          <div className="give-custom">
            <span>or enter a custom amount</span>
            <label className="give-input">
              <span className="give-currency">GBP</span>
              <input
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="Amount"
                value={customAmount}
                onChange={handleCustomChange}
              />
            </label>
          </div>

          <div className="give-summary" aria-live="polite">
            <p>{giftLabel}</p>
            <span>
              {frequency === 'recurring'
                ? 'Recurring gifts are billed monthly through Stripe Checkout.'
                : 'You will finish this donation on Stripe secure checkout.'}
            </span>
          </div>

          <button
            type="button"
            className="give-primary"
            disabled={!hasValidAmount || isSubmitting}
            onClick={handleCheckout}
          >
            {isSubmitting ? 'Redirecting to Stripe...' : 'Continue to Secure Checkout'}
          </button>
        </div>
      </div>
    </section>
  )
}
