export async function POST(request) {
  const { docType, scanData } = await request.json()
  if (!docType || !scanData) return Response.json({ error: 'Missing docType or scanData' }, { status: 400 })

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ error: 'AI not configured. Please add GOOGLE_GEMINI_API_KEY in Vercel settings.' }, { status: 500 })
  }

  const { url, trackers, checks, isHttps, issues } = scanData
  const domain = url.replace(/^https?:\/\//, '').split('/')[0]

  const prompts = {
    privacy: `Draft a comprehensive, professional Privacy Policy for "${domain}".

Scan context: HTTPS=${isHttps}, Trackers=${trackers.join(', ') || 'none'}, Issues=${issues.map(i=>i.title).join('; ') || 'none'}.

Include all required sections under GDPR Art. 13 & 14 and UK DPA 2018:
1. Identity and contact details of the controller
2. Purposes and legal basis for processing (Art. 6)
3. Categories of personal data collected
4. Cookies and tracking technologies${trackers.length > 0 ? ` — disclose: ${trackers.join(', ')}` : ''}
5. Data sharing and third-party processors
6. International transfers and safeguards
7. Retention periods
8. Data subject rights (Art. 15–22) — access, erasure, rectification, portability, restriction, objection
9. Right to withdraw consent
10. Right to complain to the ICO (ico.org.uk)
11. Automated decision-making
12. Policy updates

Use professional, clear language. Include [INSERT: ...] tags for business-specific details. State this covers both EU GDPR and UK GDPR/DPA 2018.`,

    cookie: `Draft a comprehensive Cookie Policy for "${domain}".

Trackers detected: ${trackers.join(', ') || 'none'}. Cookie banner: ${checks.cookieBanner}. Reject option: ${checks.cookieReject}.

Include:
1. What cookies are and how we use them
2. Cookie categories: strictly necessary, functional, analytics, marketing
3. Complete cookie inventory table (Name | Provider | Purpose | Duration | Category)${trackers.length > 0 ? ` — include: ${trackers.join(', ')}` : ''}
4. How to manage and withdraw consent
5. Third-party cookies and their purposes
6. Browser opt-out instructions (Chrome, Firefox, Safari, Edge)
7. Updates to this policy

Comply with UK ePrivacy Regulations and ICO Cookie Guidance 2023. Use [INSERT: ...] tags where needed.`,

    dpa: `Draft a Data Processing Agreement for "${domain}" under GDPR Article 28.

Third-party processors detected: ${trackers.join(', ') || 'none detected'}.

Include all required Art. 28(3) provisions:
1. Definitions
2. Subject matter, nature, purpose and duration of processing
3. Categories of data and data subjects
4. Controller obligations and instructions
5. Processor obligations: (a) processing only on instructions (b) confidentiality obligations (c) security measures per Art. 32 (d) subprocessor restrictions and approval (e) data subject rights assistance (f) deletion or return of data (g) audit cooperation (h) DPIA assistance
6. Subprocessors — listing and approval mechanism
7. International transfer safeguards (SCCs/adequacy decisions)
8. Liability and indemnity
9. Term and termination
10. Governing law — UK/EU option

Use [INSERT: ...] tags throughout for business-specific details.`
  }

  const prompt = prompts[docType]
  if (!prompt) return Response.json({ error: 'Invalid docType. Use: privacy, cookie, or dpa' }, { status: 400 })

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are AlgoGrass — an expert GDPR compliance platform. Draft complete, professional, legally structured compliance documents for UK and EU businesses. Write with authority and precision. Use clear headings, structured sections, and professional language. Include [INSERT: specific detail needed] tags where the business must add their specific information. Documents must be comprehensive, accurate, and ready to use.' }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4000, temperature: 0.3 },
        }),
      }
    )
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const document = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Document generation failed.'
    return Response.json({ document, docType, domain, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Generation failed: ' + err.message }, { status: 500 })
  }
}
