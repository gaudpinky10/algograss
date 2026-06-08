export async function POST(request) {
  const { area, answers, businessName } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') return Response.json({ error: 'ANTHROPIC_API_KEY not configured.' }, { status: 500 })

  const system = `You are AlgoGrass — an expert GDPR compliance platform for UK businesses. Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "score": number (0-100),
  "rating": "Compliant" | "Needs Work" | "At Risk",
  "summary": "2-3 sentence plain-English overview of the compliance picture",
  "issues": [
    {
      "sev": "High" | "Medium" | "Low",
      "title": "short issue title",
      "desc": "specific explanation with practical impact",
      "reg": "e.g. GDPR Art. 5(1)(e) or PECR Reg. 22"
    }
  ],
  "actions": [
    {
      "priority": "Immediate" | "Within 30 days" | "Within 90 days",
      "action": "specific action to take",
      "detail": "how to do it in practice"
    }
  ],
  "privacyPolicyAdditions": ["specific clause or section to add"],
  "positives": ["things the business is already doing well"]
}`

  const answerBlock = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join('\n')

  const userPrompts = {
    crm: `Assess GDPR compliance for ${businessName || 'this business'}'s CRM & Customer Data practices:
${answerBlock}
Focus on: data retention (Art. 5(1)(e)), lawful basis (Art. 6), DPA with processor (Art. 28), data subject rights (Arts. 15-22), international transfers (Art. 46), inactive data deletion. Be specific about risks.`,

    hr: `Assess GDPR compliance for ${businessName || 'this business'}'s HR & Employee Records:
${answerBlock}
Focus on: retention periods (UK employment law + GDPR), special category data (Art. 9), recruitment data handling, employee SAR rights (Art. 15), HR processor agreements (Art. 28), GDPR training compliance. Call out special category data risks explicitly.`,

    email: `Assess GDPR/PECR compliance for ${businessName || 'this business'}'s Email Marketing:
${answerBlock}
Focus on: consent mechanism validity (PECR Reg. 22 + GDPR Art. 6/7), unsubscribe compliance (PECR Reg. 23), suppression list management, ESP data processor agreement (Art. 28), list provenance and lawful basis, re-engagement rules, soft opt-in rules. Flag bought/rented list risks as High severity.`,

    vendor: `Assess GDPR compliance for ${businessName || 'this business'}'s Vendor & Supplier management:
${answerBlock}
Focus on: DPA status with each vendor (Art. 28), international transfer safeguards — SCCs or adequacy (Art. 46), subprocessor chain (Art. 28(2)), data protection contract clauses, breach notification obligations (Art. 33), vendor review cadence. Flag missing DPAs as High.`,
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2500,
        system,
        messages: [{ role: 'user', content: userPrompts[area] || userPrompts.crm }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const result = JSON.parse(data.content[0].text)
    return Response.json({ result, area, businessName, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Assessment failed: ' + err.message }, { status: 500 })
  }
}
