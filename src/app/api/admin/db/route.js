import { cookies } from 'next/headers'
import { parseUserCookie, trackActivity } from '@/lib/dbHelpers'
import { initDb, getDbHealth } from '@/lib/db/initDb'

const ALLOWED_EMAIL = 'pinkigaud11@algograss.com'

function isAuthorized() {
  try {
    const c = cookies().get('algograss_user')
    if (!c) return false
    const user = parseUserCookie(c.value)
    return user?.email?.toLowerCase() === ALLOWED_EMAIL
  } catch { return false }
}

// GET /api/admin/db  — health check: collection sizes, index counts
export async function GET() {
  if (!isAuthorized()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const health = await getDbHealth()
    return Response.json(health)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/admin/db  — run initialization (create all indexes)
export async function POST() {
  if (!isAuthorized()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await initDb()
    await trackActivity({
      userEmail: ALLOWED_EMAIL,
      tool:   'admin',
      action: 'db_initialized',
      detail: `${result.collections} collections initialized`,
    })
    return Response.json(result)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
