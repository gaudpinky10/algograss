import { trackActivity } from '@/lib/dbHelpers'

const PLAN_NAMES = { starter:'Starter', growth:'Growth', agency:'Agency' }

export async function POST(request) {
  const { plan, email, trial } = await request.json()
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) {
    return Response.json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to Vercel environment variables.' }, { status: 503 })
  }

  const PRICES = {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth:  process.env.STRIPE_PRICE_GROWTH,
    agency:  process.env.STRIPE_PRICE_AGENCY,
  }

  const priceId = PRICES[plan]
  if (!priceId) return Response.json({ error: 'Invalid plan' }, { status: 400 })
  if (!email)   return Response.json({ error: 'Email required' }, { status: 400 })

  try {
    const base = process.env.NEXT_PUBLIC_URL || 'https://www.algograss.co.uk'

    const params = {
      'payment_method_types[]':     'card',
      'line_items[0][price]':       priceId,
      'line_items[0][quantity]':    '1',
      'mode':                       'subscription',
      'customer_email':             email,
      'success_url':                base + '/dashboard?upgraded=true&plan=' + plan + '&trial=' + (trial ? '1' : '0'),
      'cancel_url':                 base + '/pricing',
      'allow_promotion_codes':      'true',
      'billing_address_collection': 'required',
      'payment_method_collection':  'always',
    }

    if (trial) {
      params['subscription_data[trial_period_days]'] = '30'
      params['subscription_data[trial_settings][end_behavior][missing_payment_method]'] = 'cancel'
    }

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method:  'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams(params),
    })

    const session = await res.json()
    if (session.error) return Response.json({ error: session.error.message }, { status: 500 })

    await trackActivity({ userEmail: email, tool: 'billing', action: trial ? 'trial_started' : 'checkout_started', detail: PLAN_NAMES[plan] || plan, meta: { plan, trial: !!trial } })

    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({ error: 'Payment error: ' + err.message }, { status: 500 })
  }
}
