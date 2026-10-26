import { askClaude } from '@/lib/ai'
import { toolSystem, addCalendarMonths, ukDay, formatUK, todayUK } from '@/lib/ukDataFacts'
import { getCollection, trackActivity } from '@/lib/dbHelpers'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

const TYPES = {
  SAR: 'Subject access request (right of access, Art. 15)',
  Erasure: 'Erasure request (Art. 17)',
  Rectification: 'Rectification request (Art. 16)',
  Restriction: 'Restriction request (Art. 18)',
  Objection: 'Objection to processing (Art. 21)',
  Portability: 'Data portability request (Art. 20)',
}

export async function POST(request) {
  const user = currentUser()
  const { requestText, businessName, dataTypes, requesterName, requesterEmail, requestType, dateReceived } = await request.json()
  if (!requestText || !String(requestText).trim()) return Response.json({ error: 'Please paste the request.' }, { status: 400 })
  if (!(await allowAiUse('dsar', user, user ? 40 : 5))) return tooMany(user)

  // The deadline is worked out here, not by the AI: one calendar month from
  // the day the request arrived, moved to the next working day if needed
  const received = ukDay(dateReceived) || ukDay(new Date().toISOString())
  const deadline = addCalendarMonths(received, 1)
  const extendedDeadline = addCalendarMonths(received, 3)
  const type = TYPES[requestType] ? requestType : 'SAR'

  const prompt = `A UK organisation has received the request below. Help them respond correctly under UK GDPR and the Data Protection Act 2018.

Organisation: ${businessName || '[INSERT: organisation name]'}
Personal data they say they hold: ${dataTypes || 'not stated'}
Request type selected: ${TYPES[type]}
Requester: ${requesterName || 'not stated'}${requesterEmail ? ` (${requesterEmail})` : ''}
Date received: ${formatUK(received)}
Response deadline (already calculated, use exactly this): ${formatUK(deadline)}. If the deadline is extended because the request is complex or there are several, the latest date is ${formatUK(extendedDeadline)}, and the person must be told within the first month.

Request text:
"""
${String(requestText).slice(0, 6000)}
"""

Write, with short headings:
1. Is this a valid request? (A request doesn't need special wording or a form; say if it is really a different right or not a data protection request at all.)
2. Deadline: state the dates above. Say the clock pauses only while genuinely needed ID or clarification is awaited.
3. Identity: what proportionate checks are reasonable here (don't ask for more than needed).
4. What to provide: for a subject access request, a copy of the data plus the Art. 15 information (purposes, categories, recipients, retention, rights, source, automated decisions, transfers). For other rights, what action is needed.
5. Searching: where to look, keeping the search reasonable and proportionate.
6. Exemptions that might apply (DPA 2018 Schedules 2 to 4), only if relevant, and that other people's data may need redacting.
7. Draft acknowledgement email.
8. Draft response template with [INSERT: ...] placeholders.
9. Step-by-step checklist.
Keep it practical and under 1,400 words.`

  let responseText
  try {
    responseText = await askClaude({
      system: toolSystem('You are the AlgoGrass DSAR assistant. You help UK small businesses handle subject access and other data protection rights requests correctly. Be practical and clear.'),
      prompt,
      maxTokens: 4500,
    })
  } catch (e) {
    return aiFailed(e.status === 503 ? 503 : 502)
  }

  // Only kept for logged-in users, in their own account
  if (user?.email) void (async () => {
    try {
      const col = await getCollection('dsars')
      if (col) await col.insertOne({ userEmail: user.email, requesterName: requesterName || 'Unknown', requesterEmail: requesterEmail || '', requestType: type, requestDetails: requestText, aiGuide: responseText, receivedAt: received, deadline, extendedDeadline, createdAt: new Date() })
      await trackActivity({ userEmail: user.email, tool: 'dsar', action: 'dsar_processed', detail: `${type} from ${requesterName || 'Unknown'}`, meta: { requestType: type } })
    } catch {}
  })()

  return Response.json({
    response: responseText,
    received: formatUK(received),
    deadline: formatUK(deadline),
    extendedDeadline: formatUK(extendedDeadline),
    generatedAt: new Date().toISOString(),
    today: todayUK(),
  })
}
