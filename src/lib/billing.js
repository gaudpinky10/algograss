// Stripe price IDs for each plan, set in Vercel environment variables.
// Monthly: STRIPE_PRICE_STARTER, STRIPE_PRICE_GROWTH, STRIPE_PRICE_AGENCY
// Annual (optional): STRIPE_PRICE_STARTER_ANNUAL, STRIPE_PRICE_GROWTH_ANNUAL, STRIPE_PRICE_AGENCY_ANNUAL
const PLANS = ['starter', 'growth', 'agency']

export function priceFor(plan, billing = 'monthly') {
  if (!PLANS.includes(plan)) return null
  const key = `STRIPE_PRICE_${plan.toUpperCase()}${billing === 'annual' ? '_ANNUAL' : ''}`
  return process.env[key] || null
}
