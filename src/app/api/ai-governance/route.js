export async function POST(request) {
  const { toolName, purpose, dataTypes, hasPersonalData, sharesWithThirdParty, businessName } = await request.json()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ error: 'AI not configured.' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: 'You are an AI Governance specialist for AlgoGrass. Assess AI tool usage for GDPR and UK data protection compliance. Be practical and specific. End with disclaimer.',
        messages: [{
          role: 'user',
          content: `Assess this AI tool usage for GDPR compliance:
Business: ${businessName || 'Unknown'}
AI Tool: ${toolName}
Purpose: ${purpose}
Data types entered into tool: ${dataTypes}
Contains personal data: ${hasPersonalData ? 'Yes' : 'No'}
Data shared with third party: ${sharesWithThirdParty ? 'Yes' : 'No'}

Provide:
1. Overall risk rating (High/Medium/Low) with explanation
2. GDPR issues identified (specific articles)
3. Legal basis assessment (is there a valid basis?)
4. Data processor agreement needed? (Yes/No + why)
5. DPIA required? (Yes/No + why)
6. Recommended actions (numbered list)
7. What to add to privacy policy
8. Monitoring and review recommendations`
        }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    return Response.json({ assessment: data.content[0].text, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Failed: ' + err.message }, { status: 500 })
  }
}
