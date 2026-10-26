// Reads a privacy policy with Claude and answers the scanner's content checks,
// each backed by an exact quote. Every quote is checked against the policy
// text, so an answer the policy doesn't actually support is never used.
//
// Returns { ok: true, checks } or { ok: false, reason }. Callers fall back to
// the rule-based checks whenever ok is false or a check is "unclear".

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const MAX_POLICY_CHARS = 60000

const SYSTEM = `You review the privacy notice of a UK website against UK GDPR Article 13.
Answer only from the policy text you are given. Never assume anything that is not written there.
For every "yes" (and every "vague" retention answer) copy one short sentence or phrase from the policy, word for word, as the quote. Do not paraphrase, shorten words or fix typos inside a quote.
If you are not sure, answer "unclear". Answer "no" only when the policy clearly does not cover the point.
Reply with JSON only, no other text.`

const QUESTIONS = `Questions:
- lawful_basis: Does it state the lawful basis (legal basis) for processing personal data, e.g. consent, contract, legitimate interests, legal obligation? "yes" | "no" | "unclear"
- data_rights: Does it explain people's data protection rights (e.g. access, rectification, erasure, objection, portability)? "yes" | "no" | "unclear"
- retention: Does it say how long personal data is kept? "specific" = actual periods, or clear criteria per type of data; "vague" = only general wording such as "as long as necessary"; "no" = not mentioned; or "unclear"
- request_contact: Does it give a way to contact the organisation about privacy or to exercise data rights (an email address, form, postal address or phone number)? "yes" | "no" | "unclear"

Reply exactly in this shape:
{"lawful_basis":{"answer":"","quote":""},"data_rights":{"answer":"","quote":""},"retention":{"answer":"","quote":""},"request_contact":{"answer":"","quote":""}}`

// Lower-case, straighten quotes and dashes, collapse spaces
export function normalise(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”‟″]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// A quote counts only if it really appears in the policy text
export function quoteIsInText(quote, text) {
  const q = normalise(quote).replace(/^["'.\s]+|["'.\s]+$/g, '')
  if (q.length < 12) return false
  const t = normalise(text)
  if (t.includes(q)) return true
  // Allow the model to drop a few words at the end of a long sentence
  return q.length >= 60 && t.includes(q.slice(0, 60))
}

const VALID = {
  lawful_basis: ['yes', 'no', 'unclear'],
  data_rights: ['yes', 'no', 'unclear'],
  retention: ['specific', 'vague', 'no', 'unclear'],
  request_contact: ['yes', 'no', 'unclear'],
}

// Turns the model's reply into checks: { answer, quote, verified }
export function parseReview(raw, policyText, truncated) {
  const m = (raw || '').match(/\{[\s\S]*\}/)
  if (!m) return null
  let j
  try { j = JSON.parse(m[0]) } catch { return null }
  const checks = {}
  for (const [key, allowed] of Object.entries(VALID)) {
    const item = j?.[key] || {}
    let answer = String(item.answer || '').toLowerCase().trim()
    if (!allowed.includes(answer)) answer = 'unclear'
    const quote = String(item.quote || '').slice(0, 400)
    const needsQuote = answer === 'yes' || answer === 'specific' || answer === 'vague'
    const verified = needsQuote ? quoteIsInText(quote, policyText) : false
    // An answer that needs a quote but whose quote isn't in the policy is not trusted
    if (needsQuote && !verified) answer = 'unclear'
    // If we could only send part of the policy, "not there" can't be trusted
    if (answer === 'no' && truncated) answer = 'unclear'
    checks[key] = { answer, quote: verified ? quote : '', verified }
  }
  return checks
}

export async function reviewPolicy(policyText, { timeoutMs = 20000 } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || process.env.SCAN_DISABLE_AI) return { ok: false, reason: 'not configured' }
  if (!policyText || policyText.length < 500) return { ok: false, reason: 'no policy text' }
  const truncated = policyText.length > MAX_POLICY_CHARS
  const text = policyText.slice(0, MAX_POLICY_CHARS)
  const models = [process.env.POLICY_REVIEW_MODEL || 'claude-sonnet-5-5', 'claude-haiku-5-5']
  for (const model of [...new Set(models)]) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model,
          max_tokens: 900,
          system: SYSTEM,
          messages: [{ role: 'user', content: `Privacy policy text:\n<policy>\n${text}\n</policy>\n\n${QUESTIONS}` }],
        }),
      })
      clearTimeout(timer)
      if (res.status === 404) continue // model name not available on this account: try the next
      if (!res.ok) return { ok: false, reason: `AI ${res.status}` }
      const data = await res.json()
      const raw = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
      const checks = parseReview(raw, text, truncated)
      if (!checks) return { ok: false, reason: 'unreadable reply' }
      return { ok: true, checks, model, truncated }
    } catch (e) {
      clearTimeout(timer)
      return { ok: false, reason: e?.name === 'AbortError' ? 'timed out' : 'request failed' }
    }
  }
  return { ok: false, reason: 'no model available' }
}
