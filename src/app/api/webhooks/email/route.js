/**
 * Inbound email webhook — compatible with Mailgun, SendGrid, and Postmark.
 *
 * Mailgun:  POST with multipart/form-data — fields: from, subject, body-plain
 * SendGrid: POST with JSON array of envelope objects — each has: from, subject, text
 * Postmark: POST with JSON — fields: From, Subject, TextBody
 *
 * Set your provider's inbound webhook URL to:
 *   https://www.algograss.com/api/webhooks/email
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

async function notifyAdmin(from, subject, body, classification, formspreeId) {
  if (!formspreeId) return
  await fetch(`https://formspree.io/f/${formspreeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      _subject: `[AlgoGrass] Inbound email complaint — ${classification.urgency} urgency`,
      message: `New complaint received via inbound email.\n\nFrom: ${from}\nSubject: ${subject}\n\nClassification:\n- Category: ${classification.category}\n- Urgency: ${classification.urgency}\n- Respond within: ${classification.responseDays} days\n- Regulation: ${classification.regulationRef}\n\nSummary: ${classification.summary}\n\nRecommended action: ${classification.recommendedAction}\n\nOriginal message:\n${body}\n\nDraft response:\n${classification.templateResponse}`,
    }),
  })
}

export async function POST(request) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  const formspreeId = process.env.FORMSPREE_ID

  const contentType = request.headers.get('content-type') || ''
  let from = '', subject = '', body = ''

  try {
    if (contentType.includes('application/json')) {
      const json = await request.json()

      // Handle SendGrid format (array of messages)
      if (Array.isArray(json)) {
        const msg = json[0] || {}
        from = msg.from || msg.envelope?.from || ''
        subject = msg.subject || ''
        body = msg.text || msg.body || ''
      } else {
        // Postmark format
        from = json.From || json.from || json.sender || ''
        subject = json.Subject || json.subject || ''
        body = json.TextBody || json.text || json.body || json['body-plain'] || ''
      }
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      // Mailgun format
      const formData = await request.formData()
      from = formData.get('from') || formData.get('sender') || ''
      subject = formData.get('subject') || ''
      body = formData.get('body-plain') || formData.get('stripped-text') || formData.get('text') || ''
    } else {
      return Response.json({ error: 'Unsupported content type' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Failed to parse request' }, { status: 400 })
  }

  if (!body?.trim()) return Response.json({ error: 'No message body found' }, { status: 400 })

  const complaintText = `[Received via: EMAIL]\nFrom: ${from}\nSubject: ${subject}\n\n${body}`

  if (!apiKey) {
    // No AI — still log and notify admin without classification
    await notifyAdmin(from, subject, body, { category: 'Unclassified', urgency: 'Medium', responseDays: 30, regulationRef: 'N/A', summary: body.slice(0, 200), recommendedAction: 'Review manually', templateResponse: '' }, formspreeId)
    return Response.json({ success: true, classified: false })
  }

  try {
    const classification = await classifyComplaint(complaintText, apiKey)
    await notifyAdmin(from, subject, body, classification, formspreeId)
    return Response.json({ success: true, classified: true, category: classification.category, urgency: classification.urgency })
  } catch (err) {
    return Response.json({ error: 'Classification failed: ' + err.message }, { status: 500 })
  }
}

// Some providers (e.g. Mailgun) do a GET verification ping
export async function GET() {
  return Response.json({ status: 'AlgoGrass email webhook active' })
}
