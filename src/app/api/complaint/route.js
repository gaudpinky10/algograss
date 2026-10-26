import { askClaude } from '@/lib/ai'
import { toolSystem, extractJson, addCalendarMonths, addDays, ukDay, formatUK } from '@/lib/ukDataFacts'
import { getCollection, trackActivity } from '@/lib/dbHelpers'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

const CATEGORIES = ['Subject Access Request', 'Erasure Request', 'Rectification Request', 'Restriction Request', 'Objection to Processing', 'Data Portability', 'Marketing Consent', 'Data Breach', 'Cookie Complaint', 'Employee/HR Data', 'Vendor Compliance', 'General Privacy', 'Not GDPR Related']
const RIGHTS = { 'Subject Access Request': 'UK GDPR Art. 15', 'Erasure Request': 'UK GDPR Art. 17', 'Rectification Request': 'UK GDPR Art. 16', 'Restriction Request': 'UK GDPR Art. 18', 'Objection to Processing': 'UK GDPR Art. 21', 'Data Portability': 'UK GDPR Art. 20' }
const LEVELS = ['High', 'Medium', 'Low']

// What the law requires and by when, for each kind of message, worked out
// here so every deadline is a real date
function deadlinesFor(category, received) {
  if (RIGHTS[category]) {
    const by = addCalendarMonths(received, 1)
    return { responseDays: 'one calendar month', deadline: formatUK(by), deadlineRule: `This is a rights request: respond by ${formatUK(by)} (one calendar month from receipt; extendable by two further months if complex, telling them within the first month).`, regulationRef: RIGHTS[category] }
  }
  if (category === 'Marketing Consent') {
    return { responseDays: 'straight away', deadline: 'Now', deadlineRule: 'An objection to direct marketing must be acted on straight away: stop the marketing and add them to your suppression list. If they are also complaining, acknowledge within 30 days too.', regulationRef: 'UK GDPR Art. 21(3) / PECR' }
  }
  if (category === 'Not GDPR Related') return { responseDays: null, deadline: null, deadlineRule: 'No data protection deadline applies.', regulationRef: '' }
  const ack = addDays(received, 30)
  return { responseDays: 30, deadline: formatUK(ack), deadlineRule: `This is a data protection complaint: acknowledge it by ${formatUK(ack)} (within 30 days of receipt), look into it without undue delay, keep them updated, and tell them the outcome.`, regulationRef: 'DPA 2018 s.164A (DUAA 2025)' }
}

export async function GET(request) {
  const user = currentUser()
  if (!user?.email) return Response.json({ complaints: [] })
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50') || 50, 100)
  const col = await getCollection('complaints')
  if (!col) return Response.json({ complaints: [] })
  const complaints = await col.find({ userEmail: user.email }).sort({ createdAt: -1 }).limit(limit).toArray()
  return Response.json({ complaints })
}

export async function POST(request) {
  const user = currentUser()
  const { complaint, businessName, channel, dateReceived } = await request.json()
  if (!complaint || !String(complaint).trim()) return Response.json({ error: 'Please paste the message.' }, { status: 400 })
  if (!(await allowAiUse('complaint', user, user ? 40 : 5))) return tooMany(user)
  const received = ukDay(dateReceived) || ukDay(new Date().toISOString())

  const prompt = `Classify this message received by a UK organisation and suggest how to handle it.

Organisation: ${businessName || 'not stated'}
Received via: ${channel || 'website form'} on ${formatUK(received)}
Message:
"""
${String(complaint).slice(0, 5000)}
"""

Reply with JSON only, in exactly this shape (the values here are descriptions, not answers):
{"isGdprComplaint": true or false, "category": one of ${JSON.stringify(CATEGORIES)}, "urgency": "High" | "Medium" | "Low", "summary": "one sentence", "recommendedAction": "the specific next steps", "templateResponse": "a short, polite acknowledgement to send, with [INSERT: ...] placeholders, that doesn't promise anything you can't know", "riskLevel": "High" | "Medium" | "Low", "riskExplanation": "one or two sentences"}
Pick the category for what the person is actually asking for (e.g. "send me my data" is a Subject Access Request even if they call it a complaint). Don't state any deadline: it is added separately.`

  // Ask again once if the reply wasn't usable JSON
  let ai = null
  for (let attempt = 0; attempt < 2 && !ai; attempt++) {
    try {
      const raw = await askClaude({
        system: toolSystem('You are the AlgoGrass complaint classifier. You sort data protection requests and complaints for UK organisations accurately and calmly.'),
        prompt,
        maxTokens: 2000,
      })
      ai = extractJson(raw)
    } catch (e) {
      if (attempt) return aiFailed(e.status === 503 ? 503 : 502)
    }
  }
  if (!ai) return aiFailed()
  const category = CATEGORIES.includes(ai.category) ? ai.category : 'General Privacy'
  const result = {
    isGdprComplaint: category !== 'Not GDPR Related' && ai.isGdprComplaint !== false,
    category,
    urgency: LEVELS.includes(ai.urgency) ? ai.urgency : 'Medium',
    riskLevel: LEVELS.includes(ai.riskLevel) ? ai.riskLevel : 'Medium',
    summary: String(ai.summary || ''),
    recommendedAction: String(ai.recommendedAction || ''),
    templateResponse: String(ai.templateResponse || ''),
    riskExplanation: String(ai.riskExplanation || ''),
    received: formatUK(received),
    ...deadlinesFor(category, received),
  }

  // Only kept for logged-in users, in their own account
  if (user?.email) void (async () => {
    try {
      const col = await getCollection('complaints')
      if (col) await col.insertOne({ userEmail: user.email, channel: channel || 'Website Form', complaintText: complaint, businessName: businessName || '', receivedAt: received, ...result, createdAt: new Date() })
      await trackActivity({ userEmail: user.email, tool: 'complaint', action: 'complaint_classified', detail: result.category, meta: { urgency: result.urgency, riskLevel: result.riskLevel, channel } })
    } catch {}
  })()

  return Response.json({ result, analyzedAt: new Date().toISOString() })
}
