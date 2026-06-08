export async function POST(request) {
  const { messages } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ reply: 'The AI assistant needs an API key configured in Vercel Environment Variables (ANTHROPIC_API_KEY).' })
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: `You are AlgoGrass — an expert AI compliance platform specialising in GDPR (EU Regulation 2016/679), UK Data Protection Act 2018, UK GDPR, ePrivacy Regulations, and ICO enforcement guidance.

You provide authoritative, accurate, and actionable compliance guidance to UK and EU businesses. You speak with confidence and expertise. You give specific, practical answers — not vague generalities.

Always cite the exact GDPR article, ICO guidance reference, or UK DPA section. Give businesses clear, implementable steps they can act on immediately.

You are the compliance expert these businesses rely on. Be thorough, precise, and professional.`,
        messages,
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ reply: `Error: ${data.error.message}` })
    return Response.json({ reply: data.content[0].text })
  } catch (err) {
    return Response.json({ reply: 'Connection error. Please try again.' })
  }
}
