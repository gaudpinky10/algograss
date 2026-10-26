// Daily email of reminders that are overdue or due within 7 days, for people
// who turned the digest on. Run from the daily cron.
import { getCollection } from './dbHelpers'
import { sendReminderDigestEmail } from './emails'

export async function sendReminderDigests() {
  const out = { digests: 0, errors: [] }
  if (!process.env.RESEND_API_KEY) return { ...out, skipped: 'email not configured' }
  const [users, reminders] = await Promise.all([getCollection('users'), getCollection('reminders')])
  if (!users || !reminders) return { ...out, skipped: 'db unavailable' }
  const soon = new Date(Date.now() + 7 * 864e5)
  const opted = await users.find({ reminderDigest: true }, { projection: { email: 1, name: 1 } }).limit(500).toArray()
  for (const u of opted) {
    try {
      const due = await reminders.find({ userEmail: u.email, completed: { $ne: true }, dueDate: { $lte: soon } }).sort({ dueDate: 1 }).limit(30).toArray()
      if (!due.length) continue
      await sendReminderDigestEmail(u.name || 'there', u.email, due)
      out.digests++
      await new Promise(r => setTimeout(r, 200))
    } catch (e) { out.errors.push(`${u.email}: ${e.message}`) }
  }
  return out
}
