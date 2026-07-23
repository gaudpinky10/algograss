import { getCollection } from '@/lib/dbHelpers'

// Verify Stripe webhook signature without the SDK
// stripe-signature header format: t=<timestamp>,v1=<sig>,v1=<sig>,...
async function verifyStripeSignature(rawBody, signatureHeader, secret) {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => { const [k,...v]=p.split('='); return [k, v.join('=')] })
  )
  const t  = parts.t
  const v1 = parts.v1
  if (!t || !v1) throw new Error('Invalid stripe-signature header')

  const payload = `${t}.${rawBody}`
  const enc     = new TextEncoder()
  const key     = await crypto.subtle.importKey('raw', enc.encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign'])
  const sig     = await crypto.subtle.sign('HMAC', key, enc.encode(payload))
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,'0')).join('')

  if (expected !== v1) throw new Error('Stripe signature mismatch')

  // Reject events older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(t)
  if (age > 300) throw new Error('Stripe event too old — possible replay attack')
}

// Update user plan/status in MongoDB
async function updateUserRecord(email, updates) {
  if (!email) return
  const [usersCol, subsCol] = await Promise.all([
    getCollection('users').catch(() => null),
    getCollection('subscriptions').catch(() => null),
  ])
  const lc = email.toLowerCase()
  if (usersCol)  await usersCol.updateOne({ email: lc }, { $set: { ...updates, updatedAt: new Date() } }).catch(() => {})
  if (subsCol)   await subsCol.updateOne({ userEmail: lc }, { $set: { ...updates, updatedAt: new Date() } }).catch(() => {})
}

async function logBillingEvent(event, data) {
  const col = await getCollection('billing_events').catch(() => null)
  if (!col) return
  await col.insertOne({
    stripeEventId: event.id,
    type:          event.type,
    ...data,
    createdAt:     new Date(),
  }).catch(() => {}) // ignore duplicate key errors (idempotency)
}

export async function POST(request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET not set')
    return new Response('Webhook secret not configured', { status: 503 })
  }

  const rawBody = await request.text()
  const sig     = request.headers.get('stripe-signature') || ''

  try {
    await verifyStripeSignature(rawBody, sig, secret)
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message)
    return new Response(`Webhook signature error: ${err.message}`, { status: 400 })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const obj = event.data?.object

  try {
    switch (event.type) {

      // ── Subscription created or updated (plan change, trial end, reactivation) ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const email = obj.metadata?.email || obj.customer_email || ''
        const plan  = obj.items?.data?.[0]?.price?.metadata?.plan ||
                      obj.metadata?.plan || 'starter'
        const updates = {
          plan,
          subscriptionStatus: obj.status,
          stripeCustomerId:   obj.customer,
          stripeSubId:        obj.id,
          currentPeriodEnd:   obj.current_period_end
            ? new Date(obj.current_period_end * 1000)
            : null,
          cancelAtPeriodEnd:  obj.cancel_at_period_end || false,
          trial:              obj.status === 'trialing',
          trialEndsAt:        obj.trial_end
            ? new Date(obj.trial_end * 1000)
            : null,
        }
        // Fetch email from Stripe customer if not in metadata
        let resolvedEmail = email
        if (!resolvedEmail && obj.customer) {
          const key = process.env.STRIPE_SECRET_KEY
          if (key) {
            const r = await fetch(`https://api.stripe.com/v1/customers/${obj.customer}`, {
              headers: { Authorization: `Bearer ${key}` },
            })
            const c = await r.json()
            resolvedEmail = c.email || ''
          }
        }
        await updateUserRecord(resolvedEmail, updates)
        await logBillingEvent(event, { userEmail: resolvedEmail?.toLowerCase(), plan, status: obj.status, subId: obj.id })
        break
      }

      // ── Subscription cancelled ──
      case 'customer.subscription.deleted': {
        const email = obj.metadata?.email || ''
        let resolvedEmail = email
        if (!resolvedEmail && obj.customer) {
          const key = process.env.STRIPE_SECRET_KEY
          if (key) {
            const r = await fetch(`https://api.stripe.com/v1/customers/${obj.customer}`, {
              headers: { Authorization: `Bearer ${key}` },
            })
            const c = await r.json()
            resolvedEmail = c.email || ''
          }
        }
        await updateUserRecord(resolvedEmail, {
          plan:               'free',
          subscriptionStatus: 'cancelled',
          cancelledAt:        new Date(),
          stripeSubId:        obj.id,
        })
        await logBillingEvent(event, { userEmail: resolvedEmail?.toLowerCase(), status: 'cancelled', subId: obj.id })
        break
      }

      // ── Invoice payment succeeded (renewal) ──
      case 'invoice.payment_succeeded': {
        const customerId = obj.customer
        const amount     = obj.amount_paid
        const currency   = obj.currency
        const period     = obj.lines?.data?.[0]?.period
        await logBillingEvent(event, {
          userEmail:   obj.customer_email?.toLowerCase() || '',
          customerId,
          amount,
          currency,
          periodStart: period?.start ? new Date(period.start * 1000) : null,
          periodEnd:   period?.end   ? new Date(period.end   * 1000) : null,
        })
        // Update lastPaymentAt on user
        if (obj.customer_email) {
          await updateUserRecord(obj.customer_email, {
            subscriptionStatus: 'active',
            lastPaymentAt:      new Date(),
            lastPaymentAmount:  amount,
          })
        }
        break
      }

      // ── Invoice payment failed ──
      case 'invoice.payment_failed': {
        const customerId = obj.customer
        console.warn('Payment failed for customer:', customerId, obj.customer_email)
        if (obj.customer_email) {
          await updateUserRecord(obj.customer_email, {
            subscriptionStatus: 'past_due',
            lastFailedPaymentAt: new Date(),
          })
        }
        await logBillingEvent(event, {
          userEmail:   obj.customer_email?.toLowerCase() || '',
          customerId,
          amount:      obj.amount_due,
          currency:    obj.currency,
          failReason:  obj.last_payment_error?.message || 'unknown',
        })
        break
      }

      // ── Trial ending soon (3 days notice from Stripe) ──
      case 'customer.subscription.trial_will_end': {
        const email = obj.metadata?.email || ''
        await logBillingEvent(event, {
          userEmail: email?.toLowerCase() || '',
          subId:     obj.id,
          trialEnd:  obj.trial_end ? new Date(obj.trial_end * 1000) : null,
        })
        // TODO: send reminder email here
        break
      }

      default:
        // Ignore unhandled event types
        break
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err.message)
    // Return 200 so Stripe doesn't retry — we'll handle via Stripe dashboard
    return new Response('Handler error (logged)', { status: 200 })
  }

  return new Response(JSON.stringify({ received: true, type: event.type }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
