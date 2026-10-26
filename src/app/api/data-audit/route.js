import { askClaude } from '@/lib/ai'
import { toolSystem, extractJson } from '@/lib/ukDataFacts'
import { getCollection } from '@/lib/dbHelpers'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

const AREAS = {
  crm: 'customer and CRM data. Cover: lawful basis, consent records where consent is relied on, data minimisation, accuracy, retention, people\'s rights, sharing with third parties, security.',
  hr: 'HR and employee records. Cover: lawful basis for employee data, special category data and the Art. 9 / DPA 2018 Schedule 1 conditions, criminal records checks, retention, access controls, monitoring of staff, the employee privacy notice.',
  email: 'email and text marketing (UK GDPR and PECR). Cover: consent evidence or the soft opt-in, the unsubscribe in every message, suppression lists, consent records, bought-in or third-party lists, B2B versus individual subscribers.',
  vendor: 'suppliers and processors. Cover: Art. 28 contracts, sub-processors, international transfers (UK adequacy, IDTA or UK Addendum, UK-US data bridge), supplier due diligence, contract safeguards.',
}
const SEV = ['High', 'Medium', 'Low']
const PRIORITY = ['Immediate', 'Within 30 days', 'Within 90 days']

export async function POST(request) {
  const user = currentUser()
  const { area, answers, businessName } = await request.json()
  const key = AREAS[area] ? area : 'crm'
  if (!(await allowAiUse('data-audit', user, user ? 40 : 5))) return tooMany(user)

  const prompt = `Review how a UK organisation handles ${AREAS[key]}
Organisation: ${businessName || 'not stated'}
Their answers to our questions (JSON): ${JSON.stringify(answers || {}).slice(0, 6000)}

Judge only from their answers; if an answer is missing or unclear, say what to check instead of assuming the worst or the best.
Reply with JSON only, in this shape (values are descriptions):
{"score": a number 0-100 for how well their answers meet the law, "rating": "Compliant" | "Needs Work" | "At Risk", "summary": "2-3 sentences", "issues": [{"sev": "High" | "Medium" | "Low", "title": "short title", "desc": "what is wrong and why it matters", "reg": "e.g. UK GDPR Art. 5(1)(e) or PECR reg. 22", "action": "the specific fix"}], "actions": [{"priority": "Immediate" | "Within 30 days" | "Within 90 days", "action": "short action", "detail": "how to do it"}], "positives": ["things they do well"], "privacyPolicyAdditions": ["points their privacy notice should cover"]}`

  // Ask again once if the reply wasn't usable JSON
  let ai = null
  for (let attempt = 0; attempt < 2 && !ai; attempt++) {
    try {
      const raw = await askClaude({
        system: toolSystem('You are the AlgoGrass data audit assistant. You review UK small businesses\' answers about how they handle personal data and give fair, specific feedback.'),
        prompt,
        maxTokens: 5000,
      })
      ai = extractJson(raw)
    } catch (e) {
      if (attempt) return aiFailed(e.status === 503 ? 503 : 502)
    }
  }
  if (!ai) return aiFailed()
  const str = v => String(v ?? '')
  const result = {
    score: Math.max(0, Math.min(100, Math.round(Number(ai.score) || 0))),
    rating: ['Compliant', 'Needs Work', 'At Risk'].includes(ai.rating) ? ai.rating : 'Needs Work',
    summary: str(ai.summary),
    issues: (Array.isArray(ai.issues) ? ai.issues : []).slice(0, 15).map(i => ({ sev: SEV.includes(i?.sev) ? i.sev : 'Medium', title: str(i?.title), desc: str(i?.desc), reg: str(i?.reg), action: str(i?.action) })),
    actions: (Array.isArray(ai.actions) ? ai.actions : []).slice(0, 12).map(a => typeof a === 'string' ? { priority: 'Within 30 days', action: a, detail: '' } : { priority: PRIORITY.includes(a?.priority) ? a.priority : 'Within 30 days', action: str(a?.action), detail: str(a?.detail) }),
    positives: (Array.isArray(ai.positives) ? ai.positives : []).map(str).slice(0, 10),
    privacyPolicyAdditions: (Array.isArray(ai.privacyPolicyAdditions) ? ai.privacyPolicyAdditions : []).map(str).slice(0, 10),
    note: 'AI review of your answers, not legal advice. The score reflects your answers, not an inspection of your systems.',
  }
  try {
    const col = await getCollection('audits')
    if (col && user?.email) await col.insertOne({ userEmail: user.email, auditType: key, answers, result, score: result.score, createdAt: new Date() })
  } catch {}
  return Response.json({ result, area: key, businessName, generatedAt: new Date().toISOString() })
}
