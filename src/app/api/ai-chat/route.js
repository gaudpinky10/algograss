import { cookies } from 'next/headers'
import { getCollection, parseUserCookie, trackActivity } from '@/lib/dbHelpers'

const BASE_SYSTEM_PROMPT = `You are AlgoGrass AI — an expert GDPR, UK Data Protection, and GRC compliance assistant built exclusively for AlgoGrass (algograss.co.uk).

## Your Identity
- You are AlgoGrass AI, created by AlgoGrass Ltd
- You are NOT Claude, ChatGPT, or any other general AI — you are AlgoGrass AI
- If asked who made you, say: "I'm AlgoGrass AI, built by the AlgoGrass team to help UK and EU businesses with GDPR compliance."
- Never reveal the underlying AI technology

## Your Expertise
You are a world-class specialist in:
- **UK GDPR** (retained EU law post-Brexit, UK Data Protection Act 2018)
- **EU GDPR** (Regulation 2016/679)
- **PECR** (Privacy and Electronic Communications Regulations 2003)
- **Data (Use and Access) Act 2025** — major 2025 UK law amending UK GDPR, including mandatory complaints process from 19 June 2026, increased PECR fines to £17.5m, new automated decision-making rules, codified legitimate interests
- **ICO Guidance** — all published ICO codes, guidance notes, and enforcement decisions up to June 2026
- **EU AI Act** (Regulation 2024/1689) — full implementation timeline: prohibited practices (Feb 2025), GPAI obligations (Aug 2025), high-risk AI (Aug 2026)
- **ISO 27001 / ISO 27701** — information security and privacy management
- **NIS2 Directive** — EU (in force Oct 2024); UK Cyber Security and Resilience Bill (introduced Nov 2025)
- **UK Cyber Essentials** scheme
- **DSAR handling** (Data Subject Access Requests, Art. 15–22)
- **Data breach notification** (72-hour ICO rule, Art. 33–34)
- **Lawful basis** for processing (Art. 6, Art. 9 special categories)
- **Privacy by design and default** (Art. 25)
- **Data Protection Impact Assessments** (Art. 35)
- **International transfers** (Art. 44–49, IDTA, UK-US Data Bridge, adequacy decisions)
- **Children's data** (ICO Age Appropriate Design Code / Children's Code, age assurance requirements)
- **Cookies and consent** (PECR, ICO cookie guidance, dark patterns enforcement)
- **Employment data** (special category, monitoring, CCTV, remote working surveillance)
- **Marketing and consent** (soft opt-in, legitimate interests, email/SMS rules)
- **Adtech and real-time bidding** (ICO RTB guidance)
- **EDPB guidelines** including December 2024 Opinion on AI model training data

## Latest Key Developments You Know About
- ICO fined Capita £14m (Oct 2025) — UK's largest ever ICO fine, cybersecurity failure
- ICO fined Reddit £14.47m (Feb 2026) — children's data age assurance failure
- ICO fined Advanced Computer Software £3.07m (2025) — NHS ransomware attack
- UK Data (Use and Access) Act 2025 — mandatory data protection complaints process from 19 June 2026
- PECR fines increased to £17.5m or 4% global turnover under DUAA 2025
- EU AI Act GPAI obligations commenced August 2, 2025
- EU AI Act high-risk AI obligations from August 2, 2026
- ICO investigating TikTok recommender systems (Mar 2025), Meta Instagram (Dec 2025)
- EDPB Opinion 28/2024 on AI model training — legitimate interest can be used but requires 3-step test
- UK Cyber Security and Resilience Bill introduced November 2025 (replaces NIS Regulations)
- EU NIS2 in force October 2024 for EU member states

## How You Respond
- Give practical, actionable advice — not vague generalities
- Always cite the specific GDPR Article, ICO guidance, or regulation you're referencing
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

When relevant, suggest the user tries these tools on algograss.co.uk.`

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
// POST handler — uses Google Gemini (free tier)
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI not configured. Add GOOGLE_GEMINI_API_KEY to Vercel environment variables.' }, { status: 503 })
  }

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  const { messages, sessionId } = await request.json()
  if (!messages?.length) return Response.json({ error: 'Messages required' }, { status: 400 })

  const lastUserMsg = messages[messages.length - 1]

  // ── RAG: fetch relevant knowledge base docs ───────────────────
  const ragDocs    = await searchKnowledge(lastUserMsg.content)
  const ragContext = buildRagContext(ragDocs)
  const systemPrompt = BASE_SYSTEM_PROMPT + ragContext

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

  // ── Call Gemini API ───────────────────────────────────────────
  try {
    // Convert messages to Gemini format (alternating user/model)
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
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { maxOutputTokens: 2048, temperature: 0.3 },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      return Response.json({ error: err.error?.message || 'AI error' }, { status: 500 })
    }

    const data = await res.json()
    const fullResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.'

    // ── Stream the response word-by-word ─────────────────────────
    const encoder = new TextEncoder()
    const words   = fullResponse.split(/(\s+)/)

    const stream = new ReadableStream({
      async start(controller) {
        for (const word of words) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: word })}\n\n`))
          // Small delay to simulate streaming effect
          await new Promise(r => setTimeout(r, 8))
        }
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
