import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

export async function GET() {
  try {
    const userCookie = cookies().get('algograss_user')
    if (!userCookie) return Response.json({ scans: [] })
    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
    if (!user?.email) return Response.json({ scans: [] })
    const col = await getCollection('scans')
    if (!col) return Response.json({ scans: [] })
    const scans = await col.find({ userEmail: user.email }).sort({ scannedAt: -1 }).limit(50).toArray()
    return Response.json({ scans })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}

export async function DELETE(request) {
  try {
    const userCookie = cookies().get('algograss_user')
    if (!userCookie) return Response.json({ error: 'Not authenticated' }, { status: 401 })
    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
    if (!user?.email) return Response.json({ error: 'Not authenticated' }, { status: 401 })
    const { id } = await request.json()
    if (!id) return Response.json({ error: 'ID required' }, { status: 400 })
    const { ObjectId } = await import('mongodb')
    const col = await getCollection('scans')
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 })
    await col.deleteOne({ _id: new ObjectId(id), userEmail: user.email })
    return Response.json({ success: true })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}
