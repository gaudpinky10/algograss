import { cookies } from 'next/headers'
import { getCollection, parseUserCookie } from '@/lib/dbHelpers'

export async function GET(request) {
  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null
  if (!user?.email) return Response.json({ activities: [] })

  const { searchParams } = new URL(request.url)
  const limit  = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const tool   = searchParams.get('tool') || null

  try {
    const col = await getCollection('activities')
    if (!col) return Response.json({ activities: [] })

    const filter = { userEmail: user.email }
    if (tool) filter.tool = tool

    const activities = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return Response.json({ activities, total: activities.length })
  } catch (err) {
    return Response.json({ activities: [], error: err.message })
  }
}
