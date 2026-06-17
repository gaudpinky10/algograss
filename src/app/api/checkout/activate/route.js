import { trackActivity } from '@/lib/dbHelpers'

async function stripe(path, method = 'GET', body = null, key) {
  const opts = {
    method,
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  }
  if (body) opts.body = new URLSearchParams(body)
  const res = await fetch(`https://api.stripe.com/v1${path}`, opts)
  return res.json()
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const plan      = searchParams.get('plan')   || 'starter'
  const trial     = searchParams.get('trial')  === '1'
  const key       = process.env.STRIPE_SECRET_KEY
  const base      = process.env.NEXT_PUBLIC_URL || 'https://www.algograss.co.uk'

  const failUrl    = `${base}/pricing?error=activation_failed`
  const successUrl = `${base}/dashboard?upgraded=true&plan=${plan}&trial=${trial?'1':'0'}&verified=true`

  if (!sessionId || !key) return Response.redirect(failUrl)

  try {
    // 1 — Retrieve checkout session (expand payment_intent and customer)
    const session = await stripe(
      `/checkout/sessions/${sessionId}?expand[]=payment_intent&expand[]=customer`,
      'GET', null, key
    )
    if (session.error) return Response.redirect(failUrl)

    const customerId      = typeof session.customer === 'object' ? session.customer.id : session.customer
    const paymentIntent   = session.payment_intent
    const paymentIntentId = typeof paymentIntent === 'object' ? paymentIntent.id : paymentIntent
    const customerEmail   = session.customer_email || session.customer_details?.email || ''

    // 2 — Refund the £1 verification charge immediately
    if (paymentIntentId) {
      await stripe('/refunds', 'POST', {
        payment_intent: paymentIntentId,
        reason:         'requested_by_customer',
        'metadata[reason]': 'Automatic card verification refund — AlgoGrass',
      }, key)
    }

    // 3 — Get the saved payment method from the customer
    const pmData = await stripe(`/customers/${customerId}/payment_methods?type=card&limit=1`, 'GET', null, key)
    const paymentMethodId = pmData.data?.[0]?.id

    // 4 — Set it as the default payment method for the customer
    if (paymentMethodId) {
      await stripe(`/customers/${customerId}`, 'POST', {
        'invoice_settings[default_payment_method]': paymentMethodId,
      }, key)
    }

    // 5 — Create the subscription
    const PRICES = {
      starter: process.env.STRIPE_PRICE_STARTER,
      growth:  process.env.STRIPE_PRICE_GROWTH,
      agency:  process.env.STRIPE_PRICE_AGENCY,
    }
    const priceId = PRICES[plan]

    if (priceId && paymentMethodId) {
      const subBody = {
        'customer':                customerId,
        'items[0][price]':         priceId,
        'default_payment_method':  paymentMethodId,
        'expand[]':                'latest_invoice.payment_intent',
      }
      if (trial) subBody['trial_period_days'] = '30'

      await stripe('/subscriptions', 'POST', subBody, key)
    }

    // 6 — Track activity
    await trackActivity({
      userEmail: customerEmail,
      tool:   'billing',
      action: trial ? 'trial_activated' : 'subscription_activated',
      detail: plan,
      meta:   { plan, trial, verified: true, customerId },
    })

    return Response.redirect(successUrl)

  } catch (err) {
    console.error('Activate error:', err.message)
    // Even if something fails, send them to dashboard — don't leave user stranded
    return Response.redirect(successUrl)
  }
}
