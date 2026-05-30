export async function POST(request) {
  const { docType, scanData } = await request.json()
  if (!docType || !scanData) return Response.json({ error: 'Missing docType or scanData' }, { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ error: 'ANTHROPIC_API_KEY not configured. Add it to Vercel Environment Variables.' }, { status: 500 })
  }

  const { url, trackers, checks, isHttps, issues } = scanData
  const domain = url.replace(/^https?:\/\//, '').split('/')[0]

  const prompts = {
    privacy: `Write a complete Privacy Policy for "${domain}". Context: HTTPS=${isHttps}, Trackers=${trackers.join(', ') || 'none'}, Issues=${issues.map(i=>i.title).join('; ') || 'none'}. Include sections: 1.Who we are 2.Data collected 3.Legal basis (GDPR Art.6) 4.How we use data 5.Cookies/trackers (name each: ${trackers.join(', ') || 'none'}) 6.Data sharing 7.International transfers 8.Retention 9.Your rights (Art.15-22) 10.Contact/DPO 11.ICO complaints 12.Policy updates. Use plain English, include [PLACEHOLDER] tags, state covers EU GDPR and UK GDPR/DPA 2018.`,
    cookie: `Write a complete Cookie Policy for "${domain}". Trackers found: ${trackers.join(', ') || 'none'}. Cookie banner: ${checks.cookieBanner}. Include: 1.What cookies are 2.Cookie types (necessary/functional/analytics/marketing) 3.Cookie table with Name|Provider|Purpose|Duration|Type columns (include ${trackers.join(', ') || 'generic examples'}) 4.Managing consent 5.Third-party cookies 6.Browser settings 7.Contact. Comply with UK ePrivacy Regulations and ICO Cookie Guidance 2023. Include [PLACEHOLDER] tags.`,
    dpa: `Write a Data Processing Agreement template for "${domain}" under GDPR Article 28. Third-party processors: ${trackers.join(', ') || 'none detected'}. Include: 1.Definitions 2.Subject matter/purpose/duration 3.Data types and subjects 4.Controller obligations 5.Processor obligations (Art.28(3)(a)-(h): instructions, confidentiality, security, subprocessors, data subject rights, deletion, audits) 6.Subprocessors approval 7.International transfer safeguards 8.Liability 9.Term/termination 10.Governing law (UK/EU option). Include [PLACEHOLDER] tags.`
  }

  const prompt = prompts[docType]
  if (!prompt) return Response.json({ error: 'Invalid docType' }, { status: 400 })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: 'You are a compliance document drafting assistant for AlgoGrass. Write clear, complete, well-structured compliance documents for UK and EU small businesses. Always include [PLACEHOLDER] tags where business-specific details are needed. Format with clear headings. End every document with a disclaimer that it is AI-generated and must be reviewed by a qualified solicitor before use.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    return Response.json({ document: data.content[0].text, docType, domain, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Generation failed: ' + err.message }, { status: 500 })
  }
}
