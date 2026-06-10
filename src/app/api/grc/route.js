import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

export async function POST(request) {
  const { type, data } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') return Response.json({ error: 'AI not configured.' }, { status: 500 })
  const prompts = {
    riskAssessment: `Assess this business risk for a UK SME:\nRisk: ${data?.riskTitle}\nCategory: ${data?.category}\nLikelihood: ${data?.likelihood}\nImpact: ${data?.impact}\nOwner: ${data?.owner}\n\nProvide: risk score (1-10), GDPR/regulatory implications, specific mitigation steps, residual risk, review timeline.`,
    policyReview: `Review this policy for a UK SME:\nPolicy: ${data?.policyName}\nLast reviewed: ${data?.lastReviewed}\nOwner: ${data?.owner}\n\nProvide: compliance gaps, recommended updates, priority actions, next review date.`,
    incidentAssessment: `Assess this data incident for a UK SME:\nIncident: ${data?.incidentTitle}\nDescription: ${data?.description}\nSeverity: ${data?.severity}\nData types affected: ${data?.dataTypes}\nPeople affected: ${data?.affectedCount}\n\nProvide: breach notification required (ICO 72hr rule), risk to individuals, immediate actions, notification template if needed.`,
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1500, system: 'You are a GRC expert specialising in UK/EU GDPR, ISO 27001, and SME compliance. Give practical, actionable advice.', messages: [{ role: 'user', content: prompts[type] || prompts.riskAssessment }] }),
    })
    const result = await res.json()
    if (result.error) return Response.json({ error: result.error.message }, { status: 500 })
    const aiText = result.content[0].text
    try {
      const userCookie = cookies().get('algograss_user')
      if (userCookie) {
        const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
        const col = await getCollection('grc_' + type)
        if (col && user?.email) await col.insertOne({ userEmail: user.email, type, data, aiText, createdAt: new Date() })
      }
    } catch (dbErr) { console.error('DB (non-fatal):', dbErr) }
    return Response.json({ result: aiText, generatedAt: new Date().toISOString() })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}
