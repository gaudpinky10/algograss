import { cookies } from 'next/headers'
import { getCollection, parseUserCookie } from '@/lib/dbHelpers'

const ALLOWED_EMAIL = 'gaudpinky10@gmail.com'

function isAuthorized(cookieStore) {
  try {
    const c = cookieStore.get('algograss_user')
    if (!c) return false
    const user = parseUserCookie(c.value)
    return user?.email?.toLowerCase() === ALLOWED_EMAIL
  } catch { return false }
}

export async function GET(request) {
  if (!isAuthorized(cookies())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const resource = searchParams.get('resource') || 'activities'
  const limit    = parseInt(searchParams.get('limit') || '100')
  const skip     = parseInt(searchParams.get('skip') || '0')
  try {
    const col = await getCollection(resource)
    if (!col) return Response.json({ data: [], total: 0, noDb: true })
    const [data, total] = await Promise.all([
      col.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments({}),
    ])
    const clean = data.map(d => { const { password, ...rest } = d; return rest })
    return Response.json({ data: clean, total })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
