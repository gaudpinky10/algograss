const SYSTEM_PROMPT = `You are AlgoGrass — an expert AI compliance platform specialising in GDPR (EU Regulation 2016/679), UK Data Protection Act 2018, UK GDPR, ePrivacy Regulations, and ICO enforcement guidance.

You provide authoritative, accurate, and actionable compliance guidance to UK and EU businesses. You speak with confidence and expertise. You give specific, practical answers — not vague generalities.

Always cite the exact GDPR article, ICO guidance reference, or UK DPA section. Give businesses clear, implementable steps they can act on immediately.

You are the compliance expert these businesses rely on. Be thorough, precise, and professional.`

export async function POST(request) {
  const { messages } = await request.json()
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ reply: 'The AI assistant needs a GOOGLE_GEMINI_API_KEY configured in Vercel Environment Variables.' })
  }
  try {
    // Convert messages to Gemini format
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 1500, temperature: 0.3 },
        }),
      }
    )
    const data = await res.json()
    if (data.error) return Response.json({ reply: `Error: ${data.error.message}` })
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'
    return Response.json({ reply })
  } catch (err) {
    return Response.json({ reply: 'Connection error. Please try again.' })
  }
}
