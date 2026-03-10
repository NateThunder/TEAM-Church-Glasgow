import Stripe from 'stripe'

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
}

function getOrigin(request) {
  const originHeader = request.headers.get('origin')

  if (originHeader) {
    return originHeader
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!stripeSecretKey) {
    return json(
      {
        error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY in Netlify environment variables.',
      },
      { status: 500 },
    )
  }

  let payload

  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Invalid checkout payload.' }, { status: 400 })
  }

  const amount = Number(payload?.amount)
  const frequency = payload?.frequency

  if (!Number.isFinite(amount) || amount < 1) {
    return json({ error: 'Enter an amount of at least GBP 1.' }, { status: 400 })
  }

  if (frequency !== 'one-time' && frequency !== 'recurring') {
    return json({ error: 'Invalid giving frequency.' }, { status: 400 })
  }

  const stripe = new Stripe(stripeSecretKey)
  const origin = getOrigin(request)
  const unitAmount = Math.round(amount * 100)
  const isRecurring = frequency === 'recurring'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? 'subscription' : 'payment',
      billing_address_collection: 'auto',
      success_url: `${origin}/give?checkout=success`,
      cancel_url: `${origin}/give?checkout=cancelled`,
      customer_creation: isRecurring ? undefined : 'always',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'gbp',
            unit_amount: unitAmount,
            product_data: {
              name: 'TEAM Church Glasgow',
              description: isRecurring ? 'Monthly giving' : 'One-time giving',
            },
            ...(isRecurring ? { recurring: { interval: 'month' } } : {}),
          },
        },
      ],
      metadata: {
        amount_gbp: amount.toFixed(2),
        frequency,
      },
    })

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL.')
    }

    return json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout session failed', error)

    return json(
      {
        error: 'Unable to create the Stripe Checkout session right now. Please try again shortly.',
      },
      { status: 500 },
    )
  }
}
