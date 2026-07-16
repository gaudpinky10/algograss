import { cookies } from 'next/headers'
import { getDb, getCollection, parseUserCookie } from '@/lib/dbHelpers'

const ALLOWED_EMAIL = 'pinkigaud11@algograss.com'

function isAuthorized(cookieStore) {
  try {
    const c = cookieStore.get('algograss_user')
    if (!c) return false
    const user = parseUserCookie(c.value)
    return user?.email?.toLowerCase() === ALLOWED_EMAIL
  } catch { return false }
}

export async function GET() {
  if (!isAuthorized(cookies())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const db = await getDb()
    const dbConnected = !!db

    let collections = []
    if (db) {
      const cols = await db.listCollections().toArray()
      collections = await Promise.all(cols.map(async c => ({
        name: c.name,
        count: await db.collection(c.name).countDocuments({}),
      })))
    }

    const acts = await getCollection('activities')
    const errors = acts ? await acts.find({ action: { $in: ['scan_failed','login_failed','error'] } }).sort({ createdAt:-1 }).limit(50).toArray() : []
    const recent = acts ? await acts.find({}).sort({createdAt:-1}).limit(100).toArray() : []

    const envStatus = {
      MONGODB_URI:       !!process.env.MONGODB_URI,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      RESEND_API_KEY:    !!process.env.RESEND_API_KEY,
      ADMIN_EMAIL:       !!process.env.ADMIN_EMAIL,
      NODE_ENV:          process.env.NODE_ENV || 'unknown',
    }

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24*60*60*1000)
    const recentActs = acts ? await acts.find({ createdAt:{ $gte: yesterday } }).toArray() : []
    const byHour = {}
    recentActs.forEach(a => { const h=new Date(a.createdAt).getHours(); byHour[h]=(byHour[h]||0)+1 })

    return Response.json({ dbConnected, collections, errors, recent, envStatus, byHour, serverTime: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
