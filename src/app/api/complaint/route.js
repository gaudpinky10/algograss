export async function POST(request) {
  const { complaint, businessName } = await request.json()
  if (!complaint) return Response.json({ error: 'Complaint text required' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ error: 'AI not configured. Add ANTHROPIC_API_KEY to Vercel.' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: `You are a GDPR complaint classification AI for AlgoGrass. Analyse complaints and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "isGdprComplaint": true/false,
  "category": "one of: Subject Access Request | Erasure Request | Marketing Consent | Data Breach | Cookie Complaint | Data Portability | Rectification Request | Restriction Request | Objection to Processing | Employee/HR Data | Vendor Compliance | General Privacy | Not GDPR Related",
  "urgency": "High | Medium | Low",
  "responseDays": number,
  "regulationRef": "e.g. GDPR Art. 17",
  "summary": "one sentence summary of the complaint",
  "recommendedAction": "specific action the business should take",
  "templateResponse": "a professional 3-4 sentence acknowledgement email the business can send to the complainant",
  "riskLevel": "High | Medium | Low",
  "riskExplanation": "brief explanation of the risk if not handled correctly"
}`,
        messages: [{ role: 'user', content: `Business: ${businessName || 'Unknown'}\n\nComplaint text:\n${complaint}` }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const text = data.content[0].text
    const result = JSON.parse(text)
    return Response.json({ result, analyzedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Analysis failed: ' + err.message }, { status: 500 })
  }
}
