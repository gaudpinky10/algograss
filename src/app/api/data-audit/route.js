import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

export async function POST(request) {
  const { area, answers, businessName } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') return Response.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 })
  const system = `You are AlgoGrass — an expert GDPR compliance platform. Return ONLY valid JSON: {"score":0-100,"rating":"Compliant|Needs Work|At Risk","summary":"2-3 sentence overview","issues":[{"sev":"High|Medium|Low","title":"short title","desc":"specific explanation","reg":"GDPR article","action":"specific fix"}],"actions":["action1","action2"],"positives":["good1"],"nextReview":"YYYY-MM-DD"}`
  const areaPrompts = {
    crm: `Audit CRM data for GDPR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: lawful basis, consent records, data minimisation, retention, subject rights, third-party sharing, security.`,
    hr: `Audit HR records for GDPR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: employee data lawful basis, sensitive data handling, retention policies, access controls, pre-employment checks, monitoring.`,
    email: `Audit email marketing for GDPR/PECR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: consent evidence, unsubscribe mechanism, list hygiene, suppression lists, consent records, third-party lists.`,
    vendor: `Audit vendor/supplier data sharing for GDPR compliance. Business: ${businessName}. Answers: ${JSON.stringify(answers)}. Cover: DPAs in place, subprocessor disclosure, international transfers, vendor risk assessment, contractual safeguards.`,
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 2500, system, messages: [{ role: 'user', content: areaPrompts[area] || areaPrompts.crm }] }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const result = JSON.parse(data.content[0].text)
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
