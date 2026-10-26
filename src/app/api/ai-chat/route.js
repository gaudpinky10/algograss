import { streamClaude } from '@/lib/ai'
import { UK_DATA_FACTS, HONESTY_RULES, todayUK } from '@/lib/ukDataFacts'
import { cookies } from 'next/headers'
import { getCollection, parseUserCookie, trackActivity } from '@/lib/dbHelpers'
import { allowAiUse } from '@/lib/toolGuard'

const BASE_SYSTEM_PROMPT = `You are AlgoGrass AI, the GDPR, UK data protection and GRC compliance assistant of AlgoGrass (algograss.com).

## Your Identity
- You are AlgoGrass AI, made by AlgoGrass Ltd and built on Anthropic's Claude models.
- If asked who made you or what you run on, say exactly that.

## Your Expertise
UK GDPR, the Data Protection Act 2018, PECR, the Data (Use and Access) Act 2025, ICO guidance, EU GDPR, the EU AI Act, ISO 27001/27701, Cyber Essentials, DSARs, breach notification, lawful basis, DPIAs, international transfers, children's data, cookies and consent, employee data and marketing rules.

${UK_DATA_FACTS}

## EU enforcement (for context; EU fines don't apply in the UK)
Largest EU GDPR fines: Meta €1.2bn (Irish DPC, May 2023, US transfers); Amazon €746m (Luxembourg CNPD, July 2021, advertising); TikTok €530m (DPC, May 2025, transfers to China); Instagram/Meta €405m (DPC, Sept 2022, children's data); Meta €390m (DPC, Jan 2023, legal basis for ads); TikTok €345m (DPC, Sept 2023, children's data); LinkedIn €310m (DPC, Oct 2024, behavioural ads); Uber €290m (Dutch AP, Aug 2024, transfers); Meta €265m (DPC, Nov 2022, data scraping); Meta €251m (DPC, Dec 2024, 2018 breach); WhatsApp €225m (DPC, Sept 2021, transparency). Don't quote other enforcement statistics as exact figures.

${HONESTY_RULES}

## How You Respond
- Give practical, actionable advice — not vague generalities
- Cite the specific article, section or ICO guidance when you are sure of it
- Format responses clearly: use bullet points, numbered lists, and headers when helpful
- For complex questions, structure as: Summary → Legal basis → Practical steps → Template/example if relevant
- Always flag when something needs a qualified solicitor or DPO review
- Be direct — UK SMEs need clear answers, not corporate waffle
- Tailor advice to UK context first, then EU where relevant

## Tone
Professional but approachable. You're the compliance expert the user wishes they had in-house. Confident, precise, helpful.

## What You Don't Do
- Give advice outside GDPR/data protection/privacy/GRC scope
- Provide advice that constitutes a solicitor-client relationship
- If asked about anything off-topic, politely redirect: "I'm specialised in GDPR and compliance — let me help you with that instead."

## AlgoGrass Platform
You are part of the AlgoGrass platform which includes:
- GDPR Scanner (scan any website for compliance issues)
- Complaint Classifier (AI-powered GDPR complaint handling)
- DSAR Handler (automate Subject Access Request responses)
- Vendor Risk Register (third-party risk management)
- DPIA Wizard (Data Protection Impact Assessments)
- GRC Platform (risks, policies, incidents)
- AI Governance Register (EU AI Act compliance)
- Review Reminders (compliance calendar)

When relevant, suggest the user tries these tools on algograss.com.`

// ─────────────────────────────────────────────────────────────────────────────
// RAG: Search knowledge base for relevant documents
// ─────────────────────────────────────────────────────────────────────────────
async function searchKnowledge(query, limit = 4) {
  try {
    const col = await getCollection('knowledge_base')
    if (!col) return []
    const results = await col
      .find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' }, projection: { content: 1, title: 1, category: 1, source: 1, publishedAt: 1, score: { $meta: 'textScore' } } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .toArray()
    return results
  } catch {
    return []
  }
}

function buildRagContext(docs) {
  if (!docs.length) return ''
  const entries = docs.map(d => {
    const date = d.publishedAt ? new Date(d.publishedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''
    return `### ${d.title}${date ? ` (${date})` : ''}\nSource: ${d.source || 'ICO/GDPR'}\n\n${d.content}`
  })
  return `\n\n## CURRENT KNOWLEDGE BASE — USE THIS FOR UP-TO-DATE INFORMATION\n\nThe following entries from your knowledge base are directly relevant to this query. Prioritise this information over general training knowledge:\n\n${entries.join('\n\n---\n\n')}\n\n---\nEnd of knowledge base context.`
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler — uses Claude (Anthropic)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI not configured. Add ANTHROPIC_API_KEY to Vercel environment variables.' }, { status: 503 })
  }

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  const body = await request.json()
  const sessionId = body.sessionId
  if (!body.messages?.length) return Response.json({ error: 'Messages required' }, { status: 400 })
  if (!(await allowAiUse('chat', user, user ? 60 : 10)))
    return Response.json({ error: user ? "You've sent a lot of questions in the last hour. Please try again a little later." : 'You have reached the hourly limit for the assistant without an account. Log in or sign up free to keep going.' }, { status: 429 })
  // Only the recent conversation is sent, and long messages are trimmed
  const messages = body.messages.slice(-20).map(m => ({ ...m, content: String(m?.content || '').slice(0, 8000) }))

  const lastUserMsg = messages[messages.length - 1]

  // ── RAG: fetch relevant knowledge base docs ───────────────────
  // Never let the knowledge-base lookup hold the answer up: cap it at 700ms
  const ragDocs    = await Promise.race([
    searchKnowledge(lastUserMsg.content),
    new Promise(r => setTimeout(() => r([]), 700)),
  ])
  const ragContext = buildRagContext(ragDocs)
  const systemPrompt = BASE_SYSTEM_PROMPT + `\n\nToday's date is ${todayUK()}.` + ragContext + '\n\n## Reply length\nBe concise and direct: aim for under 180 words unless the user asks for detail. Lead with the answer.'

  // ── Save user message to DB ───────────────────────────────────
  ;(async () => {
    try {
      const col = await getCollection('ai_chats')
      if (col && sessionId) {
        await col.updateOne(
          { sessionId },
          {
            $push: { messages: { role: 'user', content: lastUserMsg.content, timestamp: new Date() } },
            $set:  { userEmail: user?.email || 'anonymous', updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        )
      }
    } catch {}
  })()

  // ── Call Claude (true streaming) ──────────────────────────────
  try {
    const up = await streamClaude({
      system: systemPrompt,
      messages,
      maxTokens: 900,
      model: process.env.AI_CHAT_MODEL || 'claude-haiku-5-5',
    })
    if (!up.ok) {
      return Response.json({ error: up.error || 'AI error' }, { status: up.status >= 400 ? up.status : 500 })
    }

    const encoder = new TextEncoder()
    let fullResponse = ''
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of up.body) {
            fullResponse += text
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch {}
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()

        // ── Save AI response to DB ──────────────────────────────
        ;(async () => {
          try {
            const col = await getCollection('ai_chats')
            if (col && sessionId && fullResponse) {
              await col.updateOne(
                { sessionId },
                {
                  $push: { messages: { role: 'assistant', content: fullResponse, timestamp: new Date() } },
                  $set:  { updatedAt: new Date(), ragDocsUsed: ragDocs.length },
                }
              )
            }
            await trackActivity({
              userEmail: user?.email,
              tool:      'algograss-ai',
              action:    'ai_query',
              detail:    lastUserMsg.content.slice(0, 100),
            })
          } catch {}
        })()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
