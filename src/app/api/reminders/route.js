import { getCollection } from '@/lib/dbHelpers'
import { currentUser } from '@/lib/toolGuard'
import { sendReminderDigestEmail } from '@/lib/emails'

const toId = async id => {
  const { ObjectId } = await import('mongodb')
  return ObjectId.isValid(String(id)) ? new ObjectId(String(id)) : null
}
const shape = r => ({ ...r, id: String(r._id), date: r.dueDate })

export async function GET() {
  const user = currentUser()
  if (!user?.email) return Response.json({ reminders: [], loggedIn: false })
  try {
    const [col, users] = await Promise.all([getCollection('reminders'), getCollection('users')])
    if (!col) return Response.json({ reminders: [], dbUnavailable: true })
    const reminders = await col.find({ userEmail: user.email }).sort({ dueDate: 1 }).toArray()
    const me = users ? await users.findOne({ email: user.email }, { projection: { reminderDigest: 1 } }) : null
    return Response.json({ reminders: reminders.map(shape), digest: !!me?.reminderDigest, email: user.email, emailOn: !!process.env.RESEND_API_KEY })
  } catch { return Response.json({ error: 'Could not load reminders.' }, { status: 500 }) }
}

export async function POST(request) {
  const user = currentUser()
  if (!user?.email) return Response.json({ error: 'Please log in to save reminders.' }, { status: 401 })
  const body = await request.json().catch(() => ({}))

  // Turn the daily email digest on or off (sent to the account's own email)
  if (body.action === 'digest') {
    const users = await getCollection('users')
    if (!users) return Response.json({ error: 'Please try again in a minute.' }, { status: 503 })
    await users.updateOne({ email: user.email }, { $set: { reminderDigest: !!body.enabled, reminderDigestUpdatedAt: new Date() } })
    return Response.json({ success: true, digest: !!body.enabled, emailOn: !!process.env.RESEND_API_KEY })
  }

  // Email the reminders now, to the account's own email only
  if (body.action === 'email') {
    if (!process.env.RESEND_API_KEY) return Response.json({ error: "Email isn't available yet. Your reminders are saved here." }, { status: 503 })
    const col = await getCollection('reminders')
    if (!col) return Response.json({ error: 'Please try again in a minute.' }, { status: 503 })
    const reminders = await col.find({ userEmail: user.email, completed: { $ne: true } }).sort({ dueDate: 1 }).limit(50).toArray()
    if (!reminders.length) return Response.json({ error: 'You have no open reminders to send.' }, { status: 400 })
    try {
      await sendReminderDigestEmail(user.name || 'there', user.email, reminders)
      return Response.json({ success: true, sentTo: user.email })
    } catch { return Response.json({ error: 'Could not send the email. Please try again.' }, { status: 502 }) }
  }

  const { title, type, dueDate, owner, notes, priority } = body
  if (!title || !String(title).trim()) return Response.json({ error: 'Please give the reminder a title.' }, { status: 400 })
  const due = dueDate ? new Date(dueDate) : null
  if (!due || isNaN(due)) return Response.json({ error: 'Please choose a due date.' }, { status: 400 })
  try {
    const col = await getCollection('reminders')
    if (!col) return Response.json({ error: 'Please try again in a minute.' }, { status: 503 })
    const doc = { userEmail: user.email, title: String(title).slice(0, 200), type: String(type || 'General').slice(0, 60), owner: String(owner || '').slice(0, 100), notes: String(notes || '').slice(0, 2000), priority: priority || 'Medium', dueDate: due, completed: false, createdAt: new Date() }
    const result = await col.insertOne(doc)
    return Response.json({ success: true, reminder: shape({ ...doc, _id: result.insertedId }) })
  } catch { return Response.json({ error: 'Could not save the reminder.' }, { status: 500 }) }
}

export async function PUT(request) {
  const user = currentUser()
  if (!user?.email) return Response.json({ error: 'Please log in.' }, { status: 401 })
  const { id, completed, title, dueDate, priority } = await request.json().catch(() => ({}))
  const _id = await toId(id)
  if (!_id) return Response.json({ error: 'Reminder not found.' }, { status: 404 })
  const col = await getCollection('reminders')
  if (!col) return Response.json({ error: 'Please try again in a minute.' }, { status: 503 })
  const update = {}
  if (completed !== undefined) update.completed = !!completed
  if (title) update.title = String(title).slice(0, 200)
  if (dueDate && !isNaN(new Date(dueDate))) update.dueDate = new Date(dueDate)
  if (priority) update.priority = priority
  await col.updateOne({ _id, userEmail: user.email }, { $set: update })
  return Response.json({ success: true })
}

export async function DELETE(request) {
  const user = currentUser()
  if (!user?.email) return Response.json({ error: 'Please log in.' }, { status: 401 })
  const { id } = await request.json().catch(() => ({}))
  const _id = await toId(id)
  if (!_id) return Response.json({ error: 'Reminder not found.' }, { status: 404 })
  const col = await getCollection('reminders')
  if (!col) return Response.json({ error: 'Please try again in a minute.' }, { status: 503 })
  await col.deleteOne({ _id, userEmail: user.email })
  return Response.json({ success: true })
}
