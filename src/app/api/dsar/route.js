export async function POST(request) {
  const { requestText, businessName, dataTypes } = await request.json()
  if (!requestText) return Response.json({ error: 'Request text required' }, { status: 400 })

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
        system: 'You are a GDPR Subject Access Request (SAR) assistant for AlgoGrass. Help UK/EU businesses handle DSARs correctly under GDPR Art. 15. Always be practical and clear. End with a disclaimer that this is guidance only.',
        messages: [{
          role: 'user',
          content: `Business: ${businessName || 'Unknown'}\nData types held: ${dataTypes || 'Not specified'}\n\nSAR Request:\n${requestText}\n\nPlease provide:\n1. Confirmation this is a valid DSAR\n2. Response deadline (calendar date from today)\n3. What data must be provided\n4. Identity verification steps needed\n5. A draft acknowledgement email\n6. A draft response template with [PLACEHOLDER] tags\n7. Any exemptions that may apply\n8. Checklist of steps to complete`
        }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    return Response.json({ response: data.content[0].text, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Failed: ' + err.message }, { status: 500 })
  }
}
