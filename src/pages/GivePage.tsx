import '../styles/give.css'
import { useMemo, useState } from 'react'

type Frequency = 'one-time' | 'recurring'

export default function GivePage() {
  const [frequency, setFrequency] = useState<Frequency>('one-time')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(50)
  const [customAmount, setCustomAmount] = useState('')

  const amounts = useMemo(() => [25, 50, 100, 250, 500, 1000], [])

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount('')
  }

  const handleCustomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(event.target.value)
    if (event.target.value) {
      setSelectedAmount(null)
    }
  }

  return (
    <section className="give-page">
      <div className="give-hero">
        <p className="give-kicker">Give</p>
        <h1>Thank You For Your Generosity</h1>
        <p className="give-subtext">
          Every gift helps us share the love of Jesus throughout Glasgow and beyond.
          Your generosity makes ministry happen.
        </p>
      </div>

      <div className="give-card">
        <div className="give-card-header">
          <span className="give-heart" aria-hidden="true">
            ♥
          </span>
          <h2>Give to Team Church Glasgow</h2>
        </div>

        <div className="give-card-body">
          <div className="give-toggle" role="group" aria-label="Giving frequency">
            <button
              type="button"
              className={`give-toggle-btn${frequency === 'one-time' ? ' is-active' : ''}`}
              aria-pressed={frequency === 'one-time'}
              onClick={() => setFrequency('one-time')}
            >
              One-Time
            </button>
            <button
              type="button"
              className={`give-toggle-btn${frequency === 'recurring' ? ' is-active' : ''}`}
              aria-pressed={frequency === 'recurring'}
              onClick={() => setFrequency('recurring')}
            >
              Recurring
            </button>
          </div>

          <div className="give-amounts">
            {amounts.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`give-amount-btn${
                  selectedAmount === amount ? ' is-selected' : ''
                }`}
                aria-pressed={selectedAmount === amount}
                onClick={() => handleAmountSelect(amount)}
              >
                £{amount}
              </button>
            ))}
          </div>

          <div className="give-custom">
            <span>or enter a custom amount</span>
            <label className="give-input">
              <span className="give-currency">£</span>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="Amount"
                value={customAmount}
                onChange={handleCustomChange}
              />
            </label>
          </div>

          <button type="button" className="give-primary">
            Give Now
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </section>
  )
}
