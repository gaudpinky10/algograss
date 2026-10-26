import { NextResponse } from 'next/server'
import { askClaude } from '@/lib/ai'
import { toolSystem } from '@/lib/ukDataFacts'
import { getCollection, trackActivity } from '@/lib/dbHelpers'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

const fmt = d => d.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' })

// Free to use without an account (someone dealing with a breach shouldn't have
// to sign up first), with a lower hourly limit when logged out
export async function POST(request) {
  const user = currentUser()
  const body = await request.json()
  const { breachDescription, dataTypes, individualsAffected, consequences, measuresTaken, controllerName, dpoContact, breachDate } = body
  if (!breachDescription || !String(breachDescription).trim()) return NextResponse.json({ error: 'Please describe what happened.' }, { status: 400 })
  if (!(await allowAiUse('breach', user, user ? 40 : 8))) return tooMany(user)

  // 72 hours from when they became aware, worked out here
  const aware = breachDate ? new Date(breachDate) : null
  const awareOk = aware && !isNaN(aware)
  const reportBy = awareOk ? new Date(aware.getTime() + 72 * 3600e3) : null
  const overdue = reportBy && reportBy < new Date()

  const prompt = `A UK organisation has had a possible personal data breach. Help them decide what to do and prepare their report.

Organisation (controller): ${controllerName || '[INSERT: organisation name]'}
Contact for the ICO: ${dpoContact || '[INSERT: name, email, phone]'}
Became aware of the breach: ${awareOk ? fmt(aware) : 'not stated'}
72-hour reporting deadline (already calculated, use exactly this): ${reportBy ? fmt(reportBy) + (overdue ? ' (this has passed: if the breach is reportable, report now and explain the reasons for the delay)' : '') : 'not known until the date of awareness is given'}
What happened: ${String(breachDescription).slice(0, 4000)}
Types of data involved: ${Array.isArray(dataTypes) ? dataTypes.join(', ') : dataTypes || 'not stated'}
Approximate number of people affected: ${individualsAffected || 'unknown'}
Likely consequences: ${consequences || 'not yet assessed'}
Measures taken or planned: ${measuresTaken || 'not stated'}

Write, with short headings:
1. Does this need reporting to the ICO? Answer "Likely yes", "Likely no" or "Unclear", with the reasons. (Report unless the breach is unlikely to result in a risk to people's rights and freedoms.)
2. Do the affected people need to be told? Only if it is likely to result in a high risk to them; say why.
3. Deadline: the date above. Reports go through the ICO's online form (ico.org.uk/for-organisations/report-a-breach/) or by phone, and can be completed in stages if not everything is known yet.
4. Information for the ICO report, filled in from the details above, with [INSERT: ...] where something is missing: what happened and when; how it was discovered; categories and approximate number of people and of records; the types of data; likely consequences; measures taken or planned, including to reduce harm; contact details.
5. Draft notice to affected people (only if they need to be told), in plain English: what happened, likely consequences, what you are doing, what they can do, and a contact.
6. Entry for the internal breach log (required even if not reported).
Don't claim the report is final or guaranteed to be accepted. Keep it under 1,300 words.`

  let report
  try {
    report = await askClaude({
      system: toolSystem('You are the AlgoGrass breach response assistant. You help UK small businesses assess a personal data breach and prepare the information for the ICO, calmly and accurately.'),
      prompt,
      maxTokens: 4000,
    })
  } catch (e) {
    return aiFailed(e.status === 503 ? 503 : 502)
  }

  if (user?.email) {
    ;(async () => {
      try {
        const col = await getCollection('breaches')
        if (col) await col.insertOne({ userEmail: user.email, controllerName, awareAt: awareOk ? aware : null, reportBy, dataTypes, individualsAffected, createdAt: new Date() })
        await trackActivity({ userEmail: user.email, tool: 'breach', action: 'breach_report_prepared', detail: `Breach report for ${controllerName || 'organisation'}` })
      } catch {}
    })()
  }

  return NextResponse.json({ letter: report, report, reportBy: reportBy ? fmt(reportBy) : null, overdue: !!overdue })
}
