import { askClaude } from '@/lib/ai'
import { UK_DATA_FACTS, HONESTY_RULES, todayUK } from '@/lib/ukDataFacts'

const SYSTEM_PROMPT = `You are AlgoGrass AI, the compliance assistant of AlgoGrass (algograss.com), built on Anthropic's Claude. You help UK small businesses with UK GDPR, the Data Protection Act 2018, PECR and ICO guidance (and EU GDPR where relevant).

Give specific, practical answers with clear next steps. Cite the article, section or ICO guidance when you are sure of it.

${UK_DATA_FACTS}

${HONESTY_RULES}`

export async function POST(request) {
  try {
    const { messages } = await request.json()

    const reply = await askClaude({
      system: SYSTEM_PROMPT + `\n\nToday's date is ${todayUK()}.`,
      messages,
      maxTokens: 1500,
      temperature: 0.3,
    })

    return Response.json({ reply })
  } catch (err) {
    if (err.status === 503) {
      return Response.json({ reply: 'The AI assistant needs an ANTHROPIC_API_KEY configured in Vercel Environment Variables.' })
    }
    console.error('chat:', err.status, err.message)
    return Response.json({ reply: 'Sorry, the assistant could not answer just now. Please try again in a moment.' })
  }
}
