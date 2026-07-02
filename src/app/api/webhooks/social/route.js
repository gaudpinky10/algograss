/**
 * Social media complaint webhook.
 *
 * Accepts complaints forwarded from:
 *  - Twitter/X (via Zapier, Make, or manual forwarding)
 *  - Facebook / Instagram (Meta webhook for page mentions and DMs)
 *  - LinkedIn (via Zapier/Make)
 *  - Any other source that can POST JSON
 *
 * Expected payload (flexible — any of these work):
 * {
 *   platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'other',
 *   from: 'username or ID',
 *   text: 'the message content',
 *   permalink: 'optional link to original post',
 *   // OR Meta Webhooks format for Facebook/Instagram pages:
 *   entry: [...Meta webhook structure...]
 * }
 *
 * For Facebook/Instagram pages:
 *   Set webhook URL to: https://www.algograss.com/api/webhooks/social
 *   Verify token: value of SOCIAL_VERIFY_TOKEN env var
 *   Subscribe to: messages, feed, mentions
 *
 * For Twitter/X via Zapier:
 *   Trigger: New mention or DM → Action: Webhook POST to this URL
 */

async function classifyComplaint(text, apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are a GDPR complaint classification AI. Return ONLY valid JSON with no markdown: {"isGdprComplaint":true,"category":"Subject Access Request|Erasure Request|Marketing Consent|Data Breach|Cookie Complaint|Data Portability|Rectification Request|Restriction Request|Objection to Processing|Employee/HR Data|Vendor Compliance|General Privacy|Not GDPR Related","urgency":"High|Medium|Low","responseDays":30,"regulationRef":"string","summary":"string","recommendedAction":"string","templateResponse":"string"}' }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.1 },
      }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(rawText)
}

async function notifyAdmin(platform, from, text, permalink, classification, formspreeId) {
  if (!formspreeId) return
  await fetch(`https://formspree.io/f/${formspreeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject: `[AlgoGrass] ${platform} complaint — ${classification.urgency} urgency`,
      message: `New complaint received via ${platform}.\n\nFrom: ${from}${permalink ? `\nPost: ${permalink}` : ''}\n\nClassification:\n- Category: ${classification.category}\n- Urgency: ${classification.urgency}\n- Respond within: ${classification.responseDays} days\n- Regulation: ${classification.regulationRef}\n\nSummary: ${classification.summary}\n\nRecommended action: ${classification.recommendedAction}\n\nOriginal message:\n${text}\n\nDraft response:\n${classification.templateResponse}`,
    }),
  })
}

// GET — Meta webhook verification (Facebook/Instagram pages)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  const verifyToken = process.env.SOCIAL_VERIFY_TOKEN || 'algograss-social'

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// POST — inbound social messages
export async function POST(request) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  const formspreeId = process.env.FORMSPREE_ID

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  let platform = 'Social Media', from = '', text = '', permalink = ''

  // Meta Facebook/Instagram webhook format
  if (body?.object === 'page' || body?.object === 'instagram') {
    const entry = body?.entry?.[0]
    const messaging = entry?.messaging?.[0]
    const change = entry?.changes?.[0]

    if (messaging?.message?.text) {
      // Facebook/Instagram DM
      platform = body.object === 'instagram' ? 'Instagram' : 'Facebook'
      from = messaging.sender?.id || ''
      text = messaging.message.text
    } else if (change?.value?.message) {
      // Facebook page mention / comment
      platform = 'Facebook'
      from = change.value.from?.name || change.value.from?.id || ''
      text = change.value.message
      permalink = change.value.permalink_url || ''
    }

    if (!text) return Response.json({ ok: true }) // Non-message event
  } else {
    // Generic / Zapier / Make format
    platform = body.platform || body.source || 'Social Media'
    from = body.from || body.user || body.username || body.sender || ''
    text = body.text || body.message || body.content || body.body || ''
    permalink = body.permalink || body.url || body.link || ''
  }

  if (!text?.trim()) return Response.json({ ok: true })

  const complaintText = `[Received via: ${platform.toUpperCase()}]\nFrom: ${from}${permalink ? `\nPost: ${permalink}` : ''}\n\n${text}`

  try {
    if (!apiKey) {
      await notifyAdmin(platform, from, text, permalink, { category: 'Unclassified', urgency: 'Medium', responseDays: 30, regulationRef: 'N/A', summary: text.slice(0, 200), recommendedAction: 'Review manually', templateResponse: '' }, formspreeId)
      return Response.json({ ok: true })
    }

    const classification = await classifyComplaint(complaintText, apiKey)
    await notifyAdmin(platform, from, text, permalink, classification, formspreeId)
    return Response.json({ ok: true, category: classification.category, urgency: classification.urgency })
  } catch (err) {
    console.error('Social webhook error:', err)
    return Response.json({ ok: true }) // Always 200 to avoid webhook retries
  }
}
