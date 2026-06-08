export async function POST(request) {
  const { project, purpose, dataTypes, legalBasis, recipients, retention, risks, businessName } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') return Response.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        system: 'You are a GDPR Data Protection Impact Assessment (DPIA) specialist. Generate complete, structured DPIAs for UK/EU businesses under GDPR Article 35. Use clear headings and [PLACEHOLDER] tags where business-specific details are needed. End with a disclaimer.',
        messages: [{ role: 'user', content: `Generate a complete DPIA for:
Business: ${businessName || '[BUSINESS NAME]'}
Project/System: ${project}
Purpose: ${purpose}
Personal data types: ${dataTypes}
Legal basis: ${legalBasis}
Data recipients/processors: ${recipients}
Retention period: ${retention}
Known risks: ${risks}

Include all DPIA sections: 1) Project description 2) Data flows 3) Necessity & proportionality assessment 4) Risk identification (likelihood × impact matrix) 5) Risk mitigation measures 6) DPO consultation 7) Approval sign-off section 8) Review schedule` }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    return Response.json({ dpia: data.content[0].text, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
