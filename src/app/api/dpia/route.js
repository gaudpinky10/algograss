import { askClaude } from '@/lib/ai'
import { toolSystem } from '@/lib/ukDataFacts'
import { getCollection, trackActivity } from '@/lib/dbHelpers'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

export async function POST(request) {
  const user = currentUser()
  const body = await request.json()
  const { project, purpose, dataTypes, legalBasis, recipients, retention, risks, mitigations, residualRisk, businessName } = body
  if (!project && !purpose) return Response.json({ error: 'Please describe the project and its purpose.' }, { status: 400 })
  if (!(await allowAiUse('dpia', user, user ? 40 : 5))) return tooMany(user)

  // Only kept for logged-in users, in their own account
  if (user?.email) void (async () => {
    try {
      const col = await getCollection('dpias')
      if (col) await col.insertOne({ userEmail: user.email, businessName: businessName || '', project, purpose, dataTypes, legalBasis, recipients, retention, risks, mitigations, residualRisk, status: 'submitted', createdAt: new Date() })
      await trackActivity({ userEmail: user.email, tool: 'dpia', action: 'dpia_submitted', detail: `DPIA for: ${project || businessName || 'Unnamed project'}`, meta: { legalBasis } })
    } catch {}
  })()

  const list = v => (Array.isArray(v) ? v.join(', ') : v) || 'not stated'
  const prompt = `Draft a Data Protection Impact Assessment (UK GDPR Art. 35) from these details. Where something isn't given, use [INSERT: ...] rather than inventing it.

Organisation: ${businessName || '[INSERT: organisation name]'}
Project or system: ${project || '[INSERT]'}
Purpose: ${purpose || '[INSERT]'}
Personal data: ${list(dataTypes)}
Lawful basis chosen: ${legalBasis || 'not stated'}
Recipients and processors: ${list(recipients)}
Retention: ${retention || 'not stated'}
Risks identified: ${list(risks)}
Measures selected: ${list(mitigations)}
Their own view of the remaining risk: ${residualRisk || 'not stated'}

Sections:
1. Is a DPIA required? Say which high-risk indicators apply (Art. 35(3), the ICO's list of processing likely to be high risk), or that it is good practice.
2. Description of the processing (nature, scope, context, purposes) and data flows.
3. Consultation (people affected, staff, processors; the DPO if they have one, otherwise their data protection lead).
4. Necessity and proportionality: lawful basis (and an Art. 9 condition if special category data is involved), data minimisation, accuracy, retention, transparency, rights, processors (Art. 28), international transfers.
5. Risks to individuals: a table of risk, likelihood (remote/possible/probable), severity (minimal/significant/severe) and overall risk.
6. Measures to reduce each risk, and the risk remaining after them.
7. Outcome: if a high risk remains, the ICO must be consulted before the processing starts (Art. 36). Say clearly whether that seems to apply.
8. Sign-off and review date.
End with a short note that this is an AI-generated draft to review, not legal advice.`

  let dpia
  try {
    dpia = await askClaude({
      system: toolSystem('You are the AlgoGrass DPIA assistant. You draft clear, honest Data Protection Impact Assessments for UK small businesses, following the ICO\'s approach.'),
      prompt,
      maxTokens: 3500,
    })
  } catch (e) {
    return aiFailed(e.status === 503 ? 503 : 502)
  }
  return Response.json({ result: dpia, dpia, generatedAt: new Date().toISOString() })
}
