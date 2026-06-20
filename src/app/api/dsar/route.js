import { cookies } from 'next/headers';
import { getCollection, trackActivity, parseUserCookie } from '@/lib/dbHelpers';

const GEMINI = (key) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`

export async function POST(request) {
  const { requestText, businessName, dataTypes, requesterName, requesterEmail, requestType } = await request.json()
  if (!requestText) return Response.json({ error: 'Request text required' }, { status: 400 })

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) return Response.json({ error: 'AI not configured.' }, { status: 503 })

  try {
    const res = await fetch(GEMINI(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a GDPR Subject Access Request assistant. Help UK/EU businesses handle DSARs correctly under GDPR Art. 15. Be practical and clear.' }] },
        contents: [{ role: 'user', parts: [{ text: `Business: ${businessName || 'Unknown'}\nData types held: ${dataTypes || 'Not specified'}\n\nSAR Request:\n${requestText}\n\nProvide: 1) Is this a valid DSAR 2) Response deadline 3) What data to provide 4) Identity verification steps 5) Draft acknowledgement email 6) Draft response template with [PLACEHOLDER] tags 7) Any exemptions 8) Step checklist` }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.'

    ;(async () => {
      try {
        const col = await getCollection('dsars')
        if (col) {
          const deadline = new Date(); deadline.setDate(deadline.getDate() + 30)
          await col.insertOne({ userEmail: user?.email || 'anonymous', requesterName: requesterName || 'Unknown', requesterEmail: requesterEmail || '', requestType: requestType || 'SAR', requestDetails: requestText, aiGuide: responseText, deadline, createdAt: new Date() })
        }
        await trackActivity({ userEmail: user?.email, tool: 'dsar', action: 'dsar_processed', detail: `${requestType || 'SAR'} from ${requesterName || 'Unknown'}`, meta: { requestType, requesterEmail } })
      } catch {}
    })()

    return Response.json({ response: responseText, generatedAt: new Date().toISOString() })
  } catch (err) { return Response.json({ error: 'Failed: ' + err.message }, { status: 500 }) }
}
