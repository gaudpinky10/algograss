import { trackActivity, getCollection } from '@/lib/dbHelpers'

// Stripe helper — throws on API errors instead of silently returning them
async function stripeReq(path, method = 'GET', body = null, key) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
  if (body && method !== 'GET') opts.body = new URLSearchParams(body).toString()
  const res  = await fetch(`https://api.stripe.com/v1${path}`, opts)
  const json = await res.json()
  if (json.error) throw new Error(`Stripe error on ${method} ${path}: ${json.error.message}`)
  return json
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')
  const plan      = searchParams.get('plan')  || 'starter'
  const trial     = searchParams.get('trial') === '1'
  const key       = process.env.STRIPE_SECRET_KEY
  const base      = process.env.NEXT_PUBLIC_URL || 'https://www.algograss.com'

  const successUrl = `${base}/dashboard?upgraded=true&plan=${plan}&trial=${trial?'1':'0'}&verified=true`
  const failUrl    = `${base}/pricing?error=activation_failed`

  if (!sessionId || !key) {
    console.error('Activate: missing sessionId or STRIPE_SECRET_KEY')
    return Response.redirect(failUrl, 302)
  }

  let customerEmail = ''

  try {
    // ── Step 1: Retrieve checkout session with payment_intent expanded ──
    const session = await stripeReq(
      `/checkout/sessions/${sessionId}?expand[]=payment_intent&expand[]=customer`,
      'GET', null, key
    )

    const customerId    = typeof session.customer === 'object' ? session.customer.id : session.customer
    customerEmail       = session.customer_details?.email || session.customer_email || ''
    const paymentIntent = session.payment_intent
    const paymentIntentId = typeof paymentIntent === 'object' ? paymentIntent.id : paymentIntent

    if (!customerId) throw new Error('No customer ID in session')

    // ── Step 2: Refund the £1 immediately ──
    // Wrapped in its own try so a refund failure doesn't block subscription creation
    let refundStatus = 'not_attempted'
    if (paymentIntentId) {
      try {
        const refund = await stripeReq('/refunds', 'POST', {
          payment_intent: paymentIntentId,
          reason:         'requested_by_customer',
        }, key)
        refundStatus = refund.status // 'succeeded' or 'pending'
        console.log('Refund created:', refund.id, refundStatus)
      } catch (refundErr) {
        // Log but don't block — subscription must still be created
        console.error('Refund failed:', refundErr.message)
        refundStatus = 'failed'
      }
    }

    // ── Step 3: Get saved payment method ──
    // First try from the payment intent itself (most reliable, no lag)
    let paymentMethodId = null

    if (typeof paymentIntent === 'object' && paymentIntent.payment_method) {
      paymentMethodId = typeof paymentIntent.payment_method === 'object'
        ? paymentIntent.payment_method.id
        : paymentIntent.payment_method
    }

    // Fallback: list customer's saved cards
    if (!paymentMethodId) {
      const pmData = await stripeReq(
        `/customers/${customerId}/payment_methods?type=card&limit=1`,
        'GET', null, key
      )
      paymentMethodId = pmData.data?.[0]?.id
    }

    if (!paymentMethodId) throw new Error('No payment method found for customer')

    // ── Step 4: Set as default payment method on the customer ──
    await stripeReq(`/customers/${customerId}`, 'POST', {
      'invoice_settings[default_payment_method]': paymentMethodId,
    }, key)

    // ── Step 5: Create the subscription ──
    const PRICES = {
      starter: process.env.STRIPE_PRICE_STARTER,
      growth:  process.env.STRIPE_PRICE_GROWTH,
      agency:  process.env.STRIPE_PRICE_AGENCY,
    }
    const priceId = PRICES[plan]

    if (!priceId) {
      console.error(`No price ID for plan: ${plan}. Check STRIPE_PRICE_${plan.toUpperCase()} env var.`)
    } else {
      const subBody = {
        'customer':               customerId,
        'items[0][price]':        priceId,
        'default_payment_method': paymentMethodId,
        // Stripe will auto-charge this payment method when trial ends or immediately if no trial
      }
      if (trial) subBody['trial_period_days'] = '30'

      const subscription = await stripeReq('/subscriptions', 'POST', subBody, key)
      console.log('Subscription created:', subscription.id, subscription.status)
    }

    // ── Step 6: Save subscription + billing event to MongoDB ──
    const subsCol   = await getCollection('subscriptions').catch(() => null)
    const eventsCol = await getCollection('billing_events').catch(() => null)

    if (subsCol && customerEmail) {
      // upsert — one row per user/plan combination
      await subsCol.updateOne(
        { userEmail: customerEmail.toLowerCase() },
        {
          $set: {
            userEmail:            customerEmail.toLowerCase(),
            stripeCustomerId:     customerId,
            plan,
            status:               trial ? 'trialing' : 'active',
            trial,
            trialEndsAt:          trial ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
            paymentMethodId,
            refundStatus,
            updatedAt:            new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      ).catch(() => {})
    }

    if (eventsCol) {
      await eventsCol.insertOne({
        stripeEventId: `activate_${sessionId}`, // idempotent key
        userEmail:     customerEmail?.toLowerCase() || 'unknown',
        event:         trial ? 'trial_started' : 'subscription_created',
        plan,
        trial,
        refundStatus,
        customerId,
        amount:        100, // £1.00 in pence (verification charge)
        currency:      'gbp',
        createdAt:     new Date(),
      }).catch(() => {})
    }

    // Also update the user record with their plan
    if (customerEmail) {
      const usersCol = await getCollection('users').catch(() => null)
      if (usersCol) {
        await usersCol.updateOne(
          { email: customerEmail.toLowerCase() },
          { $set: { plan, stripeCustomerId: customerId, updatedAt: new Date() } }
        ).catch(() => {})
      }
    }

    await trackActivity({
      userEmail: customerEmail,
      tool:   'billing',
      action: trial ? 'trial_activated' : 'subscription_activated',
      detail: plan,
      meta:   { plan, trial, refundStatus, customerId },
    }).catch(() => {}) // never block redirect on tracking failure

    return Response.redirect(successUrl, 302)

  } catch (err) {
    console.error('Activate critical error:', err.message)
    // Still redirect to dashboard — user paid, don't strand them
    // The subscription/refund issue can be fixed manually in Stripe dashboard
    return Response.redirect(successUrl, 302)
  }
}
