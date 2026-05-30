export async function POST(request) {
  const { plan, email } = await request.json()
  const key = process.env.STRIPE_SECRET_KEY

  if (!key) {
    return Response.json({ error: 'Stripe not configured. Add STRIPE_SECRET_KEY to Vercel environment variables.' }, { status: 500 })
  }

  const PRICES = {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth: process.env.STRIPE_PRICE_GROWTH,
    agency: process.env.STRIPE_PRICE_AGENCY,
  }

  const priceId = PRICES[plan]
  if (!priceId) return Response.json({ error: 'Invalid plan selected' }, { status: 400 })

  try {
    const base = process.env.NEXT_PUBLIC_URL || 'https://www.algograss.co.uk'
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'mode': 'subscription',
        'customer_email': email || '',
        'success_url': `${base}/dashboard?upgraded=true&plan=${plan}`,
        'cancel_url': `${base}/pricing`,
        'allow_promotion_codes': 'true',
      })
    })
    const session = await res.json()
    if (session.error) return Response.json({ error: session.error.message }, { status: 500 })
    return Response.json({ url: session.url })
  } catch (err) {
    return Response.json({ error: 'Stripe error: ' + err.message }, { status: 500 })
  }
}
