export async function POST(request) {
  const { messages } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ reply: 'The AI assistant needs an API key.\n\nTo activate:\n1. Go to console.anthropic.com\n2. Create a free account and generate an API key\n3. In Vercel: Settings → Environment Variables → add ANTHROPIC_API_KEY\n4. Redeploy\n\nCost is approximately £0.001 per conversation.' })
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        system: `You are an expert AI compliance assistant for AlgoGrass, a compliance guidance tool for UK and EU small businesses. You specialise in GDPR (EU Regulation 2016/679), UK Data Protection Act 2018, UK GDPR, ePrivacy Regulations (Cookie Law), and ICO enforcement guidance. Help business owners understand their compliance obligations in plain, practical English. Always cite the specific GDPR article or regulation. End EVERY response with: "Note: This is AI-generated guidance for information purposes only and does not constitute legal advice. Please consult a qualified solicitor for advice specific to your situation."`,
        messages,
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ reply: `API error: ${data.error.message}` })
    return Response.json({ reply: data.content[0].text })
  } catch (err) {
    return Response.json({ reply: 'Connection error. Please try again.' })
  }
}
