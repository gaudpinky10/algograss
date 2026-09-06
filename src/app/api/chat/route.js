import { askClaude } from '@/lib/ai'

const SYSTEM_PROMPT = `You are AlgoGrass — an expert AI compliance platform specialising in GDPR (EU Regulation 2016/679), UK Data Protection Act 2018, UK GDPR, ePrivacy Regulations, and ICO enforcement guidance.

You provide authoritative, accurate, and actionable compliance guidance to UK and EU businesses. You speak with confidence and expertise. You give specific, practical answers — not vague generalities.

Always cite the exact GDPR article, ICO guidance reference, or UK DPA section. Give businesses clear, implementable steps they can act on immediately.

You are the compliance expert these businesses rely on. Be thorough, precise, and professional.`

export async function POST(request) {
  try {
    const { messages } = await request.json()

    const reply = await askClaude({
      system: SYSTEM_PROMPT,
      messages,
      maxTokens: 1500,
      temperature: 0.3,
    })

    return Response.json({ reply })
  } catch (err) {
    if (err.status === 503) {
      return Response.json({ reply: 'The AI assistant needs an ANTHROPIC_API_KEY configured in Vercel Environment Variables.' })
    }
    return Response.json({ reply: 'The assistant is temporarily unavailable. Please try again in a moment.' })
  }
}
