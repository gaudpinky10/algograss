import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/dbHelpers'

// GET /api/referral?email=xxx — get referral stats for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    const users = await getCollection('users')
    const referrals = await users.find(
      { referredBy: email },
      { projection: { email: 1, createdAt: 1, _id: 0 } }
    ).sort({ createdAt: -1 }).toArray()

    // Count how many referrals each user has (for leaderboard rank)
    const pipeline = [
      { $match: { referredBy: { $exists: true } } },
      { $group: { _id: '$referredBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]
    const leaderboard = await users.aggregate(pipeline).toArray()
    const myIdx = leaderboard.findIndex(x => x._id === email)
    const rank = myIdx >= 0 ? myIdx + 1 : leaderboard.length + 1

    return NextResponse.json({
      referralCount: referrals.length,
      freeMonths: referrals.length, // 1 month per referral
      rank,
      referrals,
    })
  } catch (err) {
    console.error('GET /api/referral error:', err)
    return NextResponse.json({ error: 'Failed to load referral data' }, { status: 500 })
  }
}

// POST /api/referral/apply — called during signup to credit a referral
// Body: { newUserEmail, refCode }
export async function POST(request) {
  try {
    const { newUserEmail, refCode } = await request.json()
    if (!newUserEmail || !refCode) return NextResponse.json({ ok: false })

    // Decode the referral code back to the referrer's email
    let referrerEmail
    try {
      referrerEmail = atob(refCode + '=='.slice(0, (4 - refCode.length % 4) % 4))
    } catch {
      return NextResponse.json({ ok: false })
    }

    if (!referrerEmail || referrerEmail === newUserEmail) {
      return NextResponse.json({ ok: false })
    }

    const users = await getCollection('users')

    // Mark the new user as referred
    await users.updateOne(
      { email: newUserEmail },
      { $set: { referredBy: referrerEmail } }
    )

    // Extend the referrer's trial by 30 days (or add 30 days to trialEndsAt)
    const referrer = await users.findOne({ email: referrerEmail })
    if (referrer) {
      const now = new Date()
      const currentEnd = referrer.trialEndsAt ? new Date(referrer.trialEndsAt) : now
      const baseDate = currentEnd > now ? currentEnd : now
      const newEnd = new Date(baseDate)
      newEnd.setDate(newEnd.getDate() + 30)

      await users.updateOne(
        { email: referrerEmail },
        {
          $set: {
            trialEndsAt: newEnd,
            plan: referrer.plan === 'free' ? 'starter' : referrer.plan,
          },
          $inc: { referralBonusMonths: 1 }
        }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /api/referral error:', err)
    return NextResponse.json({ ok: false })
  }
}
