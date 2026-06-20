import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

const GEMINI = (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`

export async function POST(request) {
  const { type, data } = await request.json()
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) return Response.json({ error: 'AI not configured.' }, { status: 500 })
  const prompts = {
    riskAssessment: `Assess this business risk for a UK SME:\nRisk: ${data?.riskTitle}\nCategory: ${data?.category}\nLikelihood: ${data?.likelihood}\nImpact: ${data?.impact}\nOwner: ${data?.owner}\n\nProvide: risk score (1-10), GDPR/regulatory implications, specific mitigation steps, residual risk, review timeline.`,
    policyReview: `Review this policy for a UK SME:\nPolicy: ${data?.policyName}\nLast reviewed: ${data?.lastReviewed}\nOwner: ${data?.owner}\n\nProvide: compliance gaps, recommended updates, priority actions, next review date.`,
    incidentAssessment: `Assess this data incident for a UK SME:\nIncident: ${data?.incidentTitle}\nDescription: ${data?.description}\nSeverity: ${data?.severity}\nData types affected: ${data?.dataTypes}\nPeople affected: ${data?.affectedCount}\n\nProvide: breach notification required (ICO 72hr rule), risk to individuals, immediate actions, notification template if needed.`,
  }
  try {
    const res = await fetch(GEMINI(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a GRC expert specialising in UK/EU GDPR, ISO 27001, and SME compliance. Give practical, actionable advice.' }] },
        contents: [{ role: 'user', parts: [{ text: prompts[type] || prompts.riskAssessment }] }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.3 },
      }),
    })
    const result = await res.json()
    if (result.error) return Response.json({ error: result.error.message }, { status: 500 })
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
