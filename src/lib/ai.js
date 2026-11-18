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

// Added to an answer that still ran out of room after any continuations
export const CUT_SHORT_NOTE = '[This answer was cut short. Please try again, or ask for less at once.]'

// Where to stop a cut-off answer before asking for the rest: the last line break,
// or failing that the last full sentence, so the join never splits a word
function cleanCut(text) {
  const nl = text.lastIndexOf('\n')
  if (nl > text.length * 0.6) {
    const before = text.slice(0, nl)
    // Keep a paragraph break as a paragraph break
    return { kept: before.trimEnd(), joiner: /\n\s*$/.test(before) ? '\n\n' : '\n' }
  }
  const m = text.match(/^[\s\S]*[.!?:](?=\s)/)
  if (m && m[0].length > text.length * 0.6) return { kept: m[0], joiner: ' ' }
  // Otherwise at least drop the half-finished last word
  const sp = text.trimEnd().lastIndexOf(' ')
  if (sp > text.length * 0.6) return { kept: text.slice(0, sp), joiner: ' ' }
  return { kept: text.trimEnd(), joiner: ' ' }
}

export async function askClaude({
  system,
  messages,
  prompt,
  maxTokens = 2048,
  temperature, // accepted for backwards compatibility; not sent — deprecated on current models
  model = DEFAULT_MODEL,
  continuations = 0, // if the answer hits maxTokens, ask for the rest this many times
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

  // One retry when the API is busy or briefly unreachable, so a passing
  // hiccup doesn't become an error for the user
  const send = (msgs = finalMessages) => fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: msgs,
    }),
  })
  const busy = st => st === 429 || st === 529 || st >= 500
  // One call, with a single retry if the API is busy. Returns { text, stopReason }.
  async function callOnce(msgs) {
    let res
    for (let attempt = 0; attempt < 2; attempt++) {
      try { res = await send(msgs) } catch (e) { if (attempt) throw e; await new Promise(r => setTimeout(r, 1500)); continue }
      if (!busy(res.status) || attempt) break
      const wait = Math.min(5000, Math.max(1000, (parseFloat(res.headers.get('retry-after')) || 2) * 1000))
      await new Promise(r => setTimeout(r, wait))
    }

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
    return { text, stopReason: data.stop_reason }
  }

  let { text, stopReason } = await callOnce(finalMessages)

  // Ran out of room: ask for the rest, picking up from a clean break
  for (let i = 0; i < continuations && stopReason === 'max_tokens' && text; i++) {
    const { kept, joiner } = cleanCut(text)
    let next
    try {
      next = await callOnce([
        ...finalMessages,
        { role: 'assistant', content: kept },
        { role: 'user', content: 'Continue exactly where your last message stopped. Do not repeat anything, and do not add an introduction.' },
      ])
    } catch { break } // keep what we have; the note below says it is incomplete
    if (!next.text) break
    text = kept + joiner + next.text
    stopReason = next.stopReason
  }

  // Never pass off a cut-short answer as complete
  if (stopReason === 'max_tokens' && text) return text + '\n\n' + CUT_SHORT_NOTE
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


// ─────────────────────────────────────────────────────────────────────────────
// Real streaming for chat. Opens the Anthropic request with stream:true and
// returns { ok, status, error } or { ok:true, body } where body is an async
// generator of text deltas. The first words reach the user as soon as the
// model produces them instead of after the whole answer is finished.
// ─────────────────────────────────────────────────────────────────────────────
export async function streamClaude({ system, messages, maxTokens = 900, model }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { ok: false, status: 503, error: 'AI not configured.' }
  const finalMessages = normaliseMessages(messages)
  if (!finalMessages.length) return { ok: false, status: 400, error: 'No message to send.' }

  const call = (m) => fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: m, max_tokens: maxTokens, system, messages: finalMessages, stream: true }),
  })

  let res = await call(model || DEFAULT_MODEL)
  // If the fast model name is not available on this account, fall back once
  if (res.status === 404 && model && model !== DEFAULT_MODEL) res = await call(DEFAULT_MODEL)
  if (!res.ok || !res.body) {
    let detail = ''
    try { detail = (await res.json())?.error?.message || '' } catch {}
    return { ok: false, status: res.status || 500, error: detail || `AI request failed (${res.status})` }
  }

  // Set from the stream's message_delta event; 'max_tokens' means the answer was cut off
  let stopReason = null
  async function* deltas() {
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        try {
          const ev = JSON.parse(line.slice(5).trim())
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) yield ev.delta.text
          else if (ev.type === 'message_delta' && ev.delta?.stop_reason) stopReason = ev.delta.stop_reason
        } catch {}
      }
    }
  }
  return { ok: true, body: deltas(), stopReason: () => stopReason }
}
