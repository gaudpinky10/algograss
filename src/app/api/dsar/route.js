import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

export async function POST(request) {
  const { requestText, businessName, dataTypes, requesterName, requesterEmail, requestType } = await request.json()
  if (!requestText) return Response.json({ error: 'Request text required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') return Response.json({ error: 'AI not configured.' }, { status: 500 })
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', max_tokens: 2000,
        system: 'You are a GDPR Subject Access Request assistant for AlgoGrass. Help UK/EU businesses handle DSARs correctly under GDPR Art. 15. Be practical and clear.',
        messages: [{ role: 'user', content: `Business: ${businessName || 'Unknown'}\nData types held: ${dataTypes || 'Not specified'}\n\nSAR Request:\n${requestText}\n\nProvide: 1) Is this a valid DSAR 2) Response deadline 3) What data to provide 4) Identity verification steps 5) Draft acknowledgement email 6) Draft response template with [PLACEHOLDER] tags 7) Any exemptions 8) Step checklist` }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const responseText = data.content[0].text
    try {
      const userCookie = cookies().get('algograss_user')
      if (userCookie) {
        const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
        const col = await getCollection('dsars')
        if (col && user?.email) {
          const deadline = new Date(); deadline.setDate(deadline.getDate() + 30)
          await col.insertOne({ userEmail: user.email, requesterName: requesterName || 'Unknown', requesterEmail: requesterEmail || '', requestType: requestType || 'SAR', requestDetails: requestText, aiGuide: responseText, deadline, createdAt: new Date() })
        }
      }
    } catch (dbErr) { console.error('DB (non-fatal):', dbErr) }
    return Response.json({ response: responseText, generatedAt: new Date().toISOString() })
  } catch (err) { return Response.json({ error: 'Failed: ' + err.message }, { status: 500 }) }
}
