import { trackActivity, parseUserCookie } from '@/lib/dbHelpers'
import { cookies } from 'next/headers'

export async function POST(request) {
  const { plan, email, trial } = await request.json()
  const key = process.env.STRIPE_SECRET_KEY

  if (!key)   return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

  const PRICES = {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth:  process.env.STRIPE_PRICE_GROWTH,
    agency:  process.env.STRIPE_PRICE_AGENCY,
  }
  if (!PRICES[plan]) return Response.json({ error: 'Invalid plan' }, { status: 400 })

  const base = process.env.NEXT_PUBLIC_URL || 'https://www.algograss.com'

  try {
    // Step 1 of 2 — £1 card verification payment
    // Card is saved (setup_future_usage: off_session) so we can charge the subscription after.
    // The £1 is refunded automatically by /api/checkout/activate on success.
    const params = new URLSearchParams({
      'mode':                                               'payment',
      'payment_method_types[]':                            'card',
      'line_items[0][price_data][currency]':               'gbp',
      'line_items[0][price_data][product_data][name]':     'Card Verification (Refundable)',
      'line_items[0][price_data][product_data][description]': 'A £1.00 charge to verify your card is valid. This is refunded automatically — usually within minutes.',
      'line_items[0][price_data][unit_amount]':            '100',
      'line_items[0][quantity]':                           '1',
      'customer_email':                                    email,
      'payment_intent_data[setup_future_usage]':           'off_session',
      'billing_address_collection':                        'required',
      'success_url':  `${base}/api/checkout/activate?session_id={CHECKOUT_SESSION_ID}&plan=${plan}&trial=${trial?'1':'0'}`,
      'cancel_url':   `${base}/pricing`,
    })

    const res     = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })
    const session = await res.json()
    if (session.error) return Response.json({ error: session.error.message }, { status: 500 })

    const userCookie = cookies().get('algograss_user')
    const user = userCookie ? (() => { try { return JSON.parse(Buffer.from(userCookie.value,'base64').toString()) } catch { return null } })() : null
    await trackActivity({ userEmail: email || user?.email, tool:'billing', action:'verification_started', detail: plan, meta:{ plan, trial:!!trial } })

    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
