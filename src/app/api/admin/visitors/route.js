import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/dbHelpers'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

function isAdmin() {
  try {
    const c = cookies().get('algograss_user')
    if (!c) return false
    const u = JSON.parse(Buffer.from(c.value, 'base64').toString())
    return u.isAdmin === true
  } catch { return false }
}

export async function GET(request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const page    = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const device  = searchParams.get('device')  || ''
    const country = searchParams.get('country') || ''
    const path    = searchParams.get('page_')   || searchParams.get('page') || ''

    const PER = 50
    const col = await getCollection('visitors')
    if (!col) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

    // Build filter
    const match = {}
    if (device)  match.device  = { $regex: device,  $options: 'i' }
    if (country) match.country = { $regex: country, $options: 'i' }

    const now       = new Date()
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
    const weekStart  = new Date(now); weekStart.setDate(weekStart.getDate() - 7)

    const [
      totalVisits, uniqueVisitors, today, thisWeek,
      topPages, countries, devices, browsers, visits, totalFiltered,
    ] = await Promise.all([
      // total visits
      col.countDocuments({}),
      // unique visitors
      col.distinct('visitorId').then(a => a.length),
      // today
      col.countDocuments({ ts: { $gte: todayStart } }),
      // this week
      col.countDocuments({ ts: { $gte: weekStart } }),
      // top pages
      col.aggregate([
        { $group: { _id: '$page', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 8 },
      ]).toArray(),
      // countries
      col.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 10 },
      ]).toArray(),
      // devices
      col.aggregate([
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]).toArray(),
      // browsers
      col.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
        { $limit: 5 },
      ]).toArray(),
      // paginated visits (latest first)
      col.find(match).sort({ ts: -1 }).skip((page-1)*PER).limit(PER).toArray(),
      // total filtered count
      col.countDocuments(match),
    ])

    const topPage    = topPages[0]?._id || '—'
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PER))

    return NextResponse.json({
      totalVisits, uniqueVisitors, today, thisWeek, topPage,
      topPages, countries, devices, browsers,
      visits, totalFiltered, totalPages, page,
    })
  } catch (err) {
    console.error('GET /api/admin/visitors error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
