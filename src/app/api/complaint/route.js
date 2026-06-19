import { cookies } from 'next/headers';
import { getCollection, trackActivity, parseUserCookie } from '@/lib/dbHelpers';

export async function GET(request) {
  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null
  if (!user?.email) return Response.json({ complaints: [] })
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const col = await getCollection('complaints')
  if (!col) return Response.json({ complaints: [] })
  const complaints = await col.find({ userEmail: user.email }).sort({ createdAt: -1 }).limit(limit).toArray()
  return Response.json({ complaints })
}

export async function POST(request) {
  const { complaint, businessName, channel } = await request.json()
  if (!complaint) return Response.json({ error: 'Complaint text required' }, { status: 400 })

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) return Response.json({ error: 'AI not configured.' }, { status: 503 })

  try {
    const prompt = `You are a GDPR complaint classification AI. Analyse this complaint and return ONLY valid JSON with no markdown, no code blocks, no extra text.

Business: ${businessName || 'Unknown'}
Channel: ${channel || 'Website Form'}
Complaint: ${complaint}

Return exactly this JSON:
{"isGdprComplaint":true,"category":"Subject Access Request","urgency":"High","responseDays":30,"regulationRef":"GDPR Art. 15","summary":"one sentence summary","recommendedAction":"specific action to take","templateResponse":"Dear [Name], Thank you for contacting us regarding your data. We have received your request and will respond within the statutory timeframe. If you have any questions, please contact our DPO.","riskLevel":"High","riskExplanation":"brief risk explanation"}

category must be one of: Subject Access Request, Erasure Request, Marketing Consent, Data Breach, Cookie Complaint, Data Portability, Rectification Request, Restriction Request, Objection to Processing, Employee/HR Data, Vendor Compliance, General Privacy, Not GDPR Related
urgency: High, Medium, or Low. riskLevel: High, Medium, or Low.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000, temperature: 0.1 },
        }),
      }
    )
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })

    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(rawText)

    ;(async () => {
      try {
        const col = await getCollection('complaints')
        if (col) await col.insertOne({
          userEmail: user?.email || 'anonymous',
          channel: channel || 'Website Form',
          complaintText: complaint,
          businessName: businessName || '',
          ...result,
          createdAt: new Date()
        })
        await trackActivity({ userEmail: user?.email, tool: 'complaint', action: 'complaint_classified', detail: result.category, meta: { urgency: result.urgency, riskLevel: result.riskLevel, channel } })
      } catch {}
    })()

    return Response.json({ result, analyzedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Analysis failed: ' + err.message }, { status: 500 })
  }
}
