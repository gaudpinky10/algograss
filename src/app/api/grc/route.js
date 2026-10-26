import { askClaude } from '@/lib/ai'
import { toolSystem } from '@/lib/ukDataFacts'
import { getCollection } from '@/lib/dbHelpers'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

export async function POST(request) {
  const user = currentUser()
  const { type, data } = await request.json()
  const prompts = {
    riskAssessment: `Assess this risk for a UK small business:\nRisk: ${data?.riskTitle}\nCategory: ${data?.category}\nLikelihood: ${data?.likelihood}\nImpact: ${data?.impact}\nOwner: ${data?.owner}\n\nGive: a risk score (1-10) with reasons, the legal or regulatory points (UK GDPR, PECR or other UK law, only where relevant), specific mitigation steps, the remaining risk after them, and when to review.`,
    policyReview: `Review this policy for a UK small business:\nPolicy: ${data?.policyName}\nLast reviewed: ${data?.lastReviewed}\nOwner: ${data?.owner}\n\nYou can't see the policy itself, so give: what a policy of this kind must cover under UK law, common gaps to check for, priority actions, and a sensible next review date.`,
    incidentAssessment: `Assess this incident for a UK small business:\nIncident: ${data?.incidentTitle}\nDescription: ${data?.description}\nSeverity: ${data?.severity}\nData types affected: ${data?.dataTypes}\nPeople affected: ${data?.affectedCount}\n\nGive: whether it is a personal data breach; whether it is likely reportable to the ICO within 72 hours of becoming aware, and whether affected people must be told (only if high risk), with reasons; immediate actions; and a note to record it in the breach log either way.`,
  }
  if (!prompts[type]) return Response.json({ error: 'Unknown request type.' }, { status: 400 })
  if (!(await allowAiUse('grc', user, user ? 40 : 5))) return tooMany(user)
  let aiText
  try {
    aiText = await askClaude({
      system: toolSystem('You are the AlgoGrass GRC assistant, an expert in UK GDPR, ISO 27001 and practical compliance for small businesses. Give practical, actionable advice.'),
      prompt: prompts[type],
      maxTokens: 1500,
    })
  } catch (e) {
    return aiFailed(e.status === 503 ? 503 : 502)
  }
  try {
    const col = await getCollection('grc_' + type)
    if (col && user?.email) await col.insertOne({ userEmail: user.email, type, data, aiText, createdAt: new Date() })
  } catch {}
  return Response.json({ result: aiText, generatedAt: new Date().toISOString() })
}
