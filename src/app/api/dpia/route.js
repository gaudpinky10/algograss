import { cookies } from 'next/headers';
import { getCollection, trackActivity, parseUserCookie } from '@/lib/dbHelpers';

export async function POST(request) {
  const body = await request.json()
  const { project, purpose, dataTypes, legalBasis, recipients, retention, risks, businessName } = body

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  // Save DPIA record to DB regardless of AI generation
  ;(async () => {
    try {
      const col = await getCollection('dpias')
      if (col) await col.insertOne({
        userEmail: user?.email || 'anonymous',
        businessName: businessName || '',
        project, purpose, dataTypes, legalBasis, recipients, retention, risks,
        status: 'submitted', createdAt: new Date()
      })
      await trackActivity({ userEmail: user?.email, tool: 'dpia', action: 'dpia_submitted', detail: `DPIA for: ${project || businessName || 'Unnamed project'}`, meta: { legalBasis, dataTypes: Array.isArray(dataTypes) ? dataTypes.length : 0 } })
    } catch {}
  })()

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI not configured. Your DPIA data has been saved. Please add GOOGLE_GEMINI_API_KEY in Vercel to generate the document.' }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are a GDPR DPIA specialist. Generate complete, structured DPIAs for UK/EU businesses under GDPR Article 35. Use clear headings and [PLACEHOLDER] tags where business-specific details are needed. End with a disclaimer.' }] },
          contents: [{ role: 'user', parts: [{ text: `Generate a complete DPIA for:\nBusiness: ${businessName || '[BUSINESS NAME]'}\nProject/System: ${project}\nPurpose: ${purpose}\nPersonal data types: ${dataTypes}\nLegal basis: ${legalBasis}\nData recipients/processors: ${recipients}\nRetention period: ${retention}\nKnown risks: ${risks}\n\nInclude: 1) Project description 2) Data flows 3) Necessity & proportionality 4) Risk identification (likelihood × impact) 5) Risk mitigation 6) DPO consultation 7) Approval sign-off 8) Review schedule` }] }],
          generationConfig: { maxOutputTokens: 3000, temperature: 0.3 },
        }),
      }
    )
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const dpia = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Generation failed.'
    return Response.json({ dpia, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
