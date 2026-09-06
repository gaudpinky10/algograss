// src/lib/ai.js
// Single Claude (Anthropic) client for every AlgoGrass AI route.
//
// Two exports:
//   askClaude()       — clean interface, used by /api/chat and /api/generate
//   generateContent() — accepts the old request shape and returns the old
//                       response shape, so existing routes keep their parsing

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-5'

// Anthropic requires messages to alternate and to start with a user turn.
export function normaliseMessages(messages = []) {
  const cleaned = messages
    .filter(m => m && typeof m.content === 'string' && m.content.trim())
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
  while (cleaned.length && cleaned[0].role !== 'user') cleaned.shift()
  return cleaned
}

export async function askClaude({
  system,
  messages,
  prompt,
  maxTokens = 2048,
  temperature = 0.3,
  model = DEFAULT_MODEL,
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    const e = new Error('AI not configured. Add ANTHROPIC_API_KEY in Vercel environment variables.')
    e.status = 503
    throw e
  }

  const finalMessages = messages ? normaliseMessages(messages) : [{ role: 'user', content: prompt }]
  if (!finalMessages.length) {
    const e = new Error('No message to send.')
    e.status = 400
    throw e
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: finalMessages,
    }),
  })

  if (!res.ok) {
    let detail = ''
    try {
      const j = await res.json()
      detail = j?.error?.message || ''
    } catch {}
    const e = new Error(detail || `AI request failed (${res.status})`)
    e.status = res.status
    throw e
  }

  const data = await res.json()
  const text = (data.content || [])
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim()

  return text || 'No response received.'
}

// ─────────────────────────────────────────────────────────────────────────────
// Compatibility layer.
//
// Takes { systemInstruction, contents, generationConfig } and returns
// { candidates: [{ content: { parts: [{ text }] } }] } — or { error: { message } }.
// This lets each route keep the request body and the response parsing it
// already had, while the call underneath goes to Claude.
// ─────────────────────────────────────────────────────────────────────────────
export async function generateContent({ systemInstruction, contents = [], generationConfig = {} } = {}) {
  try {
    const system = (systemInstruction?.parts || [])
      .map(p => p.text)
      .filter(Boolean)
      .join('\n')

    const messages = contents.map(c => ({
      role: c.role === 'model' ? 'assistant' : 'user',
      content: (c.parts || []).map(p => p.text).filter(Boolean).join('\n'),
    }))

    const text = await askClaude({
      system: system || undefined,
      messages,
      maxTokens: generationConfig.maxOutputTokens || 2048,
      temperature: generationConfig.temperature ?? 0.3,
    })

    return { candidates: [{ content: { parts: [{ text }] } }] }
  } catch (err) {
    return { error: { message: err.message || 'AI request failed' } }
  }
}
