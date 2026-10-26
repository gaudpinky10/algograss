import { askClaude } from '@/lib/ai'
import { UK_DATA_FACTS, HONESTY_RULES, todayUK } from '@/lib/ukDataFacts'
import { currentUser, allowAiUse } from '@/lib/toolGuard'

const SYSTEM_PROMPT = `You are AlgoGrass AI, the compliance assistant of AlgoGrass (algograss.com), built on Anthropic's Claude. You help UK small businesses with UK GDPR, the Data Protection Act 2018, PECR and ICO guidance (and EU GDPR where relevant).

Give specific, practical answers with clear next steps. Cite the article, section or ICO guidance when you are sure of it.

${UK_DATA_FACTS}

${HONESTY_RULES}`

export async function POST(request) {
  try {
    const { messages } = await request.json()
    const user = currentUser()
    if (!(await allowAiUse('chat', user, user ? 60 : 10)))
      return Response.json({ reply: user ? "You've sent a lot of questions in the last hour. Please try again a little later." : 'You have reached the hourly limit for the assistant without an account. Log in or sign up free to keep going.' })
    // Only the recent conversation is sent, and long messages are trimmed
    const recent = (Array.isArray(messages) ? messages : []).slice(-20).map(m => ({ ...m, content: String(m?.content || '').slice(0, 8000) }))

    const reply = await askClaude({
      system: SYSTEM_PROMPT + `\n\nToday's date is ${todayUK()}.`,
      messages: recent,
      maxTokens: 1500,
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
