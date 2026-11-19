import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCollection, getSessionUser } from '@/lib/dbHelpers'

// GET /api/referral — referral stats for the logged-in user only.
// (It used to take any ?email= and return the emails that person had referred.)
export async function GET() {
  const user = getSessionUser(cookies())
  if (!user?.email) return NextResponse.json({ error: 'Please log in to see your referrals.' }, { status: 401 })
  try {
    const users = await getCollection('users')
    if (!users) return NextResponse.json({ referralCount: 0, freeMonths: 0, rank: null, referrals: [] })
    const email = user.email
    const referrals = await users.find(
      { referredBy: email },
      { projection: { email: 1, createdAt: 1, _id: 0 } }
    ).sort({ createdAt: -1 }).toArray()

    // Rank among everyone who has referred at least one person
    const leaderboard = await users.aggregate([
      { $match: { referredBy: { $exists: true } } },
      { $group: { _id: '$referredBy', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray()
    const myIdx = leaderboard.findIndex(x => x._id === email)

    return NextResponse.json({
      referralCount: referrals.length,
      freeMonths: referrals.length, // 1 month per referral
      rank: myIdx >= 0 ? myIdx + 1 : leaderboard.length + 1,
      referrals,
    })
  } catch (err) {
    console.error('GET /api/referral error:', err)
    return NextResponse.json({ error: 'Failed to load referral data' }, { status: 500 })
  }
}

// Referrals are credited by sign-up itself (see src/lib/referral.js). This
// endpoint used to credit any email on request, which let anyone extend a
// trial as often as they liked, so it no longer does anything.
export async function POST() {
  return NextResponse.json({ ok: false, error: 'Referrals are applied automatically at sign-up.' }, { status: 410 })
}
