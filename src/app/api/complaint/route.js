import { cookies } from 'next/headers';
import { getCollection, trackActivity, parseUserCookie } from '@/lib/dbHelpers';

export async function POST(request) {
  const { complaint, businessName, channel } = await request.json()
  if (!complaint) return Response.json({ error: 'Complaint text required' }, { status: 400 })

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') return Response.json({ error: 'AI not configured. Please add ANTHROPIC_API_KEY in Vercel settings.' }, { status: 503 })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 1500,
        system: `You are a GDPR complaint classification AI. Return ONLY valid JSON: {"isGdprComplaint":bool,"category":"Subject Access Request|Erasure Request|Marketing Consent|Data Breach|Cookie Complaint|Data Portability|Rectification Request|Restriction Request|Objection to Processing|Employee/HR Data|Vendor Compliance|General Privacy|Not GDPR Related","urgency":"High|Medium|Low","responseDays":number,"regulationRef":"e.g. GDPR Art. 17","summary":"one sentence","recommendedAction":"specific action","templateResponse":"3-4 sentence acknowledgement email","riskLevel":"High|Medium|Low","riskExplanation":"brief explanation"}`,
        messages: [{ role: 'user', content: `Business: ${businessName || 'Unknown'}\nChannel: ${channel || 'Website Form'}\n\nComplaint:\n${complaint}` }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const result = JSON.parse(data.content[0].text)

    ;(async () => {
      try {
        const col = await getCollection('complaints')
        if (col) await col.insertOne({ userEmail: user?.email || 'anonymous', channel: channel || 'Website Form', complaintText: complaint, ...result, createdAt: new Date() })
        await trackActivity({ userEmail: user?.email, tool: 'complaint', action: 'complaint_classified', detail: result.category, meta: { urgency: result.urgency, riskLevel: result.riskLevel, channel } })
      } catch {}
    })()

    return Response.json({ result, analyzedAt: new Date().toISOString() })
  } catch (err) { return Response.json({ error: 'Analysis failed: ' + err.message }, { status: 500 }) }
}
