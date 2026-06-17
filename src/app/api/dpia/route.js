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

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured. Your DPIA data has been saved. Please add the API key in Vercel to generate the document.' }, { status: 503 })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        system: 'You are a GDPR DPIA specialist. Generate complete, structured DPIAs for UK/EU businesses under GDPR Article 35. Use clear headings and [PLACEHOLDER] tags where business-specific details are needed. End with a disclaimer.',
        messages: [{ role: 'user', content: `Generate a complete DPIA for:\nBusiness: ${businessName || '[BUSINESS NAME]'}\nProject/System: ${project}\nPurpose: ${purpose}\nPersonal data types: ${dataTypes}\nLegal basis: ${legalBasis}\nData recipients/processors: ${recipients}\nRetention period: ${retention}\nKnown risks: ${risks}\n\nInclude: 1) Project description 2) Data flows 3) Necessity & proportionality 4) Risk identification (likelihood × impact) 5) Risk mitigation 6) DPO consultation 7) Approval sign-off 8) Review schedule` }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    return Response.json({ dpia: data.content[0].text, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
