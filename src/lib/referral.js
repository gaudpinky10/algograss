// Referral credit: when someone signs up through a referral link, the person who
// shared it gets 30 more days. Called only from sign-up, on the server, so it
// can't be triggered again for an old account or used to extend a trial at will.
import { getCollection } from './dbHelpers'

const REFERRAL_DAYS = 30

// The referral code is the referrer's email in base64 without the "=" padding
export function decodeRefCode(refCode) {
  try {
    const code = String(refCode || '').trim().replace(/-/g, '+').replace(/_/g, '/')
    if (!code || code.length > 400) return null
    const email = Buffer.from(code, 'base64').toString('utf8').trim().toLowerCase()
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
  } catch { return null }
}

export function refCodeFor(email) {
  return Buffer.from(String(email).toLowerCase()).toString('base64').replace(/=+$/, '')
}

// Returns true if the referral was credited
export async function creditReferral(newUserEmail, refCode) {
  const newEmail = String(newUserEmail || '').toLowerCase()
  const referrerEmail = decodeRefCode(refCode)
  if (!newEmail || !referrerEmail || referrerEmail === newEmail) return false
  const users = await getCollection('users')
  if (!users) return false
  const referrer = await users.findOne({ email: referrerEmail })
  if (!referrer) return false

  // Only a brand-new account that hasn't been referred before can be marked
  const marked = await users.updateOne(
    { email: newEmail, referredBy: { $exists: false }, createdAt: { $gt: new Date(Date.now() - 3600e3) } },
    { $set: { referredBy: referrerEmail, referredAt: new Date() } }
  )
  if (marked.modifiedCount !== 1) return false

  const now = new Date()
  const currentEnd = referrer.trialEndsAt ? new Date(referrer.trialEndsAt) : now
  const newEnd = new Date(Math.max(currentEnd.getTime(), now.getTime()))
  newEnd.setDate(newEnd.getDate() + REFERRAL_DAYS)
  await users.updateOne(
    { email: referrerEmail },
    {
      // A free account gets Pro again until the new end date (the daily trial job
      // switches it back afterwards); paying accounts keep their plan
      $set: { trialEndsAt: newEnd, plan: referrer.plan === 'free' ? 'pro' : referrer.plan, trialWarningSent: false },
      $inc: { referralBonusMonths: 1 },
    }
  )
  return true
}
