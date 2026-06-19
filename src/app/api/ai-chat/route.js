import { cookies } from 'next/headers'
import { getCollection, parseUserCookie, trackActivity } from '@/lib/dbHelpers'

const SYSTEM_PROMPT = `You are AlgoGrass AI — an expert GDPR, UK Data Protection, and GRC compliance assistant built exclusively for AlgoGrass (algograss.co.uk).

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
- **ICO Guidance** — all published ICO codes, guidance notes, and enforcement decisions
- **EU AI Act** (Regulation 2024/1689) — risk classification, obligations, prohibited practices
- **ISO 27001 / ISO 27701** — information security and privacy management
- **NIS2 Directive** — network and information security
- **UK Cyber Essentials** scheme
- **DSAR handling** (Data Subject Access Requests, Art. 15–22)
- **Data breach notification** (72-hour ICO rule, Art. 33–34)
- **Lawful basis** for processing (Art. 6, Art. 9 special categories)
- **Privacy by design and default** (Art. 25)
- **Data Protection Impact Assessments** (Art. 35)
- **International transfers** (Art. 44–49, SCCs, UK IDTA, adequacy decisions)
- **Children's data** (COPPA, ICO Age Appropriate Design Code)
- **Cookies and consent** (PECR, ICO 2023 cookie guidance)
- **Employment data** (special category, monitoring, CCTV)
- **Marketing and consent** (soft opt-in, legitimate interests, email/SMS rules)

## Key Legal References You Know Deeply
- GDPR Articles 1–99 and all Recitals
- UK DPA 2018 schedules and exemptions
- ICO enforcement actions and fines (British Airways, Marriott, WhatsApp etc)
- ICO Accountability Framework
- Article 29 Working Party / EDPB guidelines
- All ICO codes: Direct Marketing, Children's, Data Sharing, CCTV, Employment Practices

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
- Provide legal advice that constitutes solicitor-client relationship
- Discuss topics unrelated to compliance, data protection, or business governance
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

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'AI not configured' }, { status: 503 })
  }

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  const { messages, sessionId } = await request.json()
  if (!messages?.length) return Response.json({ error: 'Messages required' }, { status: 400 })

  // Save user message to DB
  const lastUserMsg = messages[messages.length - 1]
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

  // Stream from Anthropic
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta':    'messages-2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system:     SYSTEM_PROMPT,
        stream:     true,
        messages:   messages.map(m => ({ role: m.role, content: m.content })),
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return Response.json({ error: err.error?.message || 'AI error' }, { status: 500 })
    }

    // Pass the stream through, collecting full response for DB
    const encoder = new TextEncoder()
    let fullResponse = ''

    const stream = new ReadableStream({
      async start(controller) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    fullResponse += parsed.delta.text
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`))
                  }
                  if (parsed.type === 'message_stop') {
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
                  }
                } catch {}
              }
            }
          }
        } finally {
          controller.close()
          reader.cancel()

          // Save AI response to DB
          ;(async () => {
            try {
              const col = await getCollection('ai_chats')
              if (col && sessionId && fullResponse) {
                await col.updateOne(
                  { sessionId },
                  {
                    $push: { messages: { role: 'assistant', content: fullResponse, timestamp: new Date() } },
                    $set:  { updatedAt: new Date() },
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
        }
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
