import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

async function getUserEmail() {
  try {
    const userCookie = cookies().get('algograss_user')
    if (!userCookie) return null
    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
    return user?.email || null
  } catch { return null }
}

export async function GET() {
  const email = await getUserEmail()
  if (!email) return Response.json({ reminders: [] })
  try {
    const col = await getCollection('reminders')
    if (!col) return Response.json({ reminders: [] })
    const reminders = await col.find({ userEmail: email }).sort({ dueDate: 1 }).toArray()
    return Response.json({ reminders })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}

export async function POST(request) {
  const email = await getUserEmail()
  if (!email) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  const { title, description, dueDate, priority, category } = await request.json()
  if (!title) return Response.json({ error: 'Title required' }, { status: 400 })
  try {
    const col = await getCollection('reminders')
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 })
    const result = await col.insertOne({ userEmail: email, title, description: description || '', dueDate: dueDate ? new Date(dueDate) : null, priority: priority || 'Medium', category: category || 'General', completed: false, createdAt: new Date() })
    return Response.json({ success: true, id: result.insertedId })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}

export async function PUT(request) {
  const email = await getUserEmail()
  if (!email) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  const { id, completed, title, dueDate, priority } = await request.json()
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 })
  try {
    const { ObjectId } = await import('mongodb')
    const col = await getCollection('reminders')
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 })
    const update = {}
    if (completed !== undefined) update.completed = completed
    if (title) update.title = title
    if (dueDate) update.dueDate = new Date(dueDate)
    if (priority) update.priority = priority
    await col.updateOne({ _id: new ObjectId(id), userEmail: email }, { $set: update })
    return Response.json({ success: true })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}

export async function DELETE(request) {
  const email = await getUserEmail()
  if (!email) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  const { id } = await request.json()
  if (!id) return Response.json({ error: 'ID required' }, { status: 400 })
  try {
    const { ObjectId } = await import('mongodb')
    const col = await getCollection('reminders')
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 })
    await col.deleteOne({ _id: new ObjectId(id), userEmail: email })
    return Response.json({ success: true })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}
