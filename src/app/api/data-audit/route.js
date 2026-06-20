import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

export async function POST(request) {
  const { area, answers, businessName } = await request.json()
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) return Response.json({ error: 'AI not configured.' }, { status: 500 })
  const systemText = `You are AlgoGrass — an expert GDPR compliance platform. Return ONLY valid JSON with no markdown: {"score":0-100,"rating":"Compliant|Needs Work|At Risk","summary":"2-3 sentence overview","issues":[{"sev":"High|Medium|Low","title":"short title","desc":"specific explanation","reg":"GDPR article","action":"specific fix"}],"actions":["action1","action2"],"positives":["good1"],"nextReview":"YYYY-MM-DD"}`
  const areaPrompts = {
    crm: `Audit CRM data for GDPR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: lawful basis, consent records, data minimisation, retention, subject rights, third-party sharing, security.`,
    hr: `Audit HR records for GDPR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: employee data lawful basis, sensitive data handling, retention policies, access controls, pre-employment checks, monitoring.`,
    email: `Audit email marketing for GDPR/PECR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: consent evidence, unsubscribe mechanism, list hygiene, suppression lists, consent records, third-party lists.`,
    vendor: `Audit vendor/supplier data sharing for GDPR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: DPAs in place, subprocessor disclosure, international transfers, vendor risk assessment, contractual safeguards.`,
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents: [{ role: 'user', parts: [{ text: areaPrompts[area] || areaPrompts.crm }] }],
          generationConfig: { maxOutputTokens: 2500, temperature: 0.1 },
        }),
      }
    )
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(rawText)
    try {
      const userCookie = cookies().get('algograss_user')
      if (userCookie) {
        const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
        const col = await getCollection('audits')
        if (col && user?.email) await col.insertOne({ userEmail: user.email, auditType: area, answers, result, score: result.score, createdAt: new Date() })
      }
    } catch (dbErr) { console.error('DB (non-fatal):', dbErr) }
    return Response.json({ result, area, businessName, generatedAt: new Date().toISOString() })
  } catch (err) { return Response.json({ error: 'Assessment failed: ' + err.message }, { status: 500 }) }
}
