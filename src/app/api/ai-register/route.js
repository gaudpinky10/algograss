export async function POST(request) {
  const { toolName, purpose, dataTypes, legalBasis, hasSensitiveData, businessName } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') return Response.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: 'You are a UK GDPR AI governance specialist. Assess AI tool registrations for compliance. Return ONLY valid JSON with no markdown.',
        messages: [{ role: 'user', content: `Assess this AI tool for the UK AI Register:
Tool: ${toolName}
Business: ${businessName}
Purpose: ${purpose}
Data types: ${dataTypes}
Legal basis: ${legalBasis}
Contains sensitive data: ${hasSensitiveData}

Return JSON: {"riskScore": 1-10, "riskLevel": "High/Medium/Low", "legalBasisValid": true/false, "legalBasisNotes": "...", "sensitiveDataIssues": "...", "dpiaRequired": true/false, "dpiaReason": "...", "approvalRecommendation": "Approve/Reject/Conditional", "conditions": ["condition1","condition2"], "privacyPolicyUpdate": "what to add to privacy policy", "reviewDate": "YYYY-MM-DD (6 months from now)"}` }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const assessment = JSON.parse(data.content[0].text)
    return Response.json({ assessment, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
