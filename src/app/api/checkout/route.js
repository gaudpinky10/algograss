import { trackActivity, parseUserCookie } from '@/lib/dbHelpers'
import { cookies } from 'next/headers'
import { priceFor } from '@/lib/billing'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const { plan, trial } = body
  const key = process.env.STRIPE_SECRET_KEY
  // A logged-in user is billed under their account email
  const sessionUser = (() => { try { const c = cookies().get('algograss_user'); return c ? parseUserCookie(c.value) : null } catch { return null } })()
  const email = sessionUser?.email || (typeof body.email === 'string' ? body.email.trim() : '')

  if (!key)   return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

  const billing = body.billing === 'annual' ? 'annual' : 'monthly'
  const price = priceFor(plan, billing)
  if (!priceFor(plan, 'monthly')) return Response.json({ error: 'Invalid plan' }, { status: 400 })
  // The pricing page shows annual prices: never charge the monthly price for them
  if (!price) return Response.json({ error: 'Annual billing is not available yet. Please choose monthly billing.' }, { status: 400 })

  const base = process.env.NEXT_PUBLIC_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.algograss.com'

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
      // Always create a Stripe customer, so the saved card can pay the subscription
      'customer_creation':                                 'always',
      // The plan is read back from here on activation (not from the address bar, which can be edited)
      'metadata[plan]':                                    plan,
      'metadata[trial]':                                   trial ? '1' : '0',
      'metadata[billing]':                                 billing,
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

    await trackActivity({ userEmail: email, tool:'billing', action:'verification_started', detail: plan, meta:{ plan, trial:!!trial } })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('checkout:', err.message)
    return Response.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 })
  }
}
