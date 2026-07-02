/**
 * WhatsApp Business API webhook — Meta Cloud API format.
 *
 * Setup:
 * 1. In Meta Developer Console → WhatsApp → Configuration
 * 2. Set Webhook URL to: https://www.algograss.com/api/webhooks/whatsapp
 * 3. Set Verify Token to the value of WHATSAPP_VERIFY_TOKEN in your env
 * 4. Subscribe to: messages
 *
 * Also add to your .env:
 *   WHATSAPP_VERIFY_TOKEN=your-random-secret-token
 *   WHATSAPP_TOKEN=your-whatsapp-access-token   (for sending reply messages)
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

async function notifyAdmin(from, message, classification, formspreeId) {
  if (!formspreeId) return
  await fetch(`https://formspree.io/f/${formspreeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject: `[AlgoGrass] WhatsApp complaint — ${classification.urgency} urgency`,
      message: `New complaint received via WhatsApp.\n\nFrom: ${from}\n\nClassification:\n- Category: ${classification.category}\n- Urgency: ${classification.urgency}\n- Respond within: ${classification.responseDays} days\n- Regulation: ${classification.regulationRef}\n\nSummary: ${classification.summary}\n\nRecommended action: ${classification.recommendedAction}\n\nOriginal message:\n${message}\n\nDraft response:\n${classification.templateResponse}`,
    }),
  })
}

async function sendWhatsAppReply(to, phoneNumberId, text, token) {
  if (!token || !phoneNumberId) return
  await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  })
}

// GET — Meta webhook verification handshake
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'algograss-webhook'

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// POST — inbound messages
export async function POST(request) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  const formspreeId = process.env.FORMSPREE_ID
  const whatsappToken = process.env.WHATSAPP_TOKEN

  let body
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // Parse Meta's nested message structure
  const entry = body?.entry?.[0]
  const change = entry?.changes?.[0]
  const value = change?.value
  const messages = value?.messages

  if (!messages?.length) return Response.json({ ok: true }) // Status updates — ignore

  const msg = messages[0]
  const from = msg.from // sender's phone number
  const text = msg.text?.body || msg.button?.text || msg.interactive?.button_reply?.title || ''
  const phoneNumberId = value?.metadata?.phone_number_id

  if (!text?.trim()) return Response.json({ ok: true })

  const complaintText = `[Received via: WHATSAPP]\nFrom: ${from}\n\n${text}`

  try {
    if (!apiKey) {
      await notifyAdmin(from, text, { category: 'Unclassified', urgency: 'Medium', responseDays: 30, regulationRef: 'N/A', summary: text.slice(0, 200), recommendedAction: 'Review manually', templateResponse: '' }, formspreeId)
      return Response.json({ ok: true })
    }

    const classification = await classifyComplaint(complaintText, apiKey)
    await notifyAdmin(from, text, classification, formspreeId)

    // Auto-reply on WhatsApp to acknowledge receipt
    if (classification.isGdprComplaint) {
      const ack = `Thank you for your message. We have received your ${classification.category} and will respond within ${classification.responseDays} days as required by GDPR. Reference: ${new Date().toISOString().slice(0, 10)}-WA`
      await sendWhatsAppReply(from, phoneNumberId, ack, whatsappToken)
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return Response.json({ ok: true }) // Always 200 to Meta to avoid retries
  }
}
