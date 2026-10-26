import { askClaude } from '@/lib/ai'
import { toolSystem } from '@/lib/ukDataFacts'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

const DOC_ROLE = 'You are the AlgoGrass document assistant. You draft clear, accurate UK data protection documents for small businesses, in plain English. You never invent facts about the business: anything you weren\'t told goes in an [INSERT: ...] placeholder.'

export async function POST(request) {
  const user = currentUser()
  const { docType, scanData } = await request.json()
  if (!docType || !scanData?.url) return Response.json({ error: 'Scan your website first, then generate the document.' }, { status: 400 })
  if (!(await allowAiUse('generate', user, user ? 30 : 3))) return tooMany(user)

  const trackers = Array.isArray(scanData.trackers) ? scanData.trackers.map(String).slice(0, 20) : []
  const issues = Array.isArray(scanData.issues) ? scanData.issues.map(i => String(i?.title || '')).filter(Boolean).slice(0, 20) : []
  const checks = scanData.checks || {}
  const cookies = Array.isArray(scanData.trackingCookiesBeforeConsent) ? scanData.trackingCookiesBeforeConsent.map(String).slice(0, 20) : []
  let domain = ''
  try { domain = new URL(String(scanData.url)).hostname.replace(/^www\./, '') } catch { domain = String(scanData.url).replace(/^https?:\/\//, '').split('/')[0] }
  const found = `What our scan of ${domain} found: tracking tools: ${trackers.join(', ') || 'none detected'}; tracking cookies set before consent: ${cookies.join(', ') || 'none'}; cookie banner found: ${checks.cookieBannerFound ?? checks.cookieBanner ? 'yes' : 'no'}; reject option: ${checks.cookieRejectFound ?? checks.cookieReject ? 'yes' : 'no'}; issues: ${issues.join('; ') || 'none'}. Only these tools were detected on the homepage; other pages or offline processing may involve more.`

  const prompts = {
    privacy: `Draft a privacy notice for the website ${domain}, under UK GDPR and the Data Protection Act 2018 (add EU GDPR wording only as an optional section, for businesses that serve people in the EU).

${found}

Cover: who we are and how to contact us; the personal data we collect and where from; purposes, each with its lawful basis (Art. 6, and an Art. 9 condition for any special category data); cookies and similar technologies, naming each tracking tool found above and what it does; who we share data with (processors and other recipients, by name where known); international transfers and the safeguard used; how long we keep each type of data; people's rights; how to complain to us (and that we acknowledge complaints within 30 days) and to the ICO (ico.org.uk); automated decision-making, if any; changes to this notice.
Use [INSERT: ...] for every business-specific detail you weren't given. Don't state retention periods, processors or purposes as facts unless they come from the scan above.`,

    cookie: `Draft a cookie policy for ${domain} under PECR and the ICO's guidance on storage and access technologies.

${found}

Cover: what cookies and similar technologies are; the categories we use (strictly necessary; functionality/preferences; analytics; advertising); a table (Name | Provider | Purpose | Duration | Category) with a row for each tool found above and [INSERT] rows for others; which need consent and which are exempt (strictly necessary, and since February 2026 some analytics and preference cookies, only with clear information and a simple way to object); how people give, refuse and withdraw consent (refusing as easy as accepting); third-party cookies; browser settings; changes.
Don't claim the site already complies: if the scan found tracking before consent or no reject option, add a short note to the business (marked [NOTE TO YOU: ...]) saying what to fix first.`,

    dpa: `Draft a data processing agreement under UK GDPR Article 28, for ${domain} as controller and a supplier as processor.

Suppliers that may be processors, from our scan: ${trackers.join(', ') || 'none detected'}. Note to the business: advertising and social pixels (e.g. Meta, LinkedIn, TikTok) usually act as separate or joint controllers and have their own terms, so a DPA like this is mainly for suppliers that process data only on your instructions (hosting, email, CRM, payroll and so on).

Include all Art. 28(3) terms: subject matter, duration, nature and purpose; types of data and data subjects; processing only on documented instructions; confidentiality; security (Art. 32); sub-processors (prior authorisation and flow-down); help with people's rights requests; help with security, breach notification (without undue delay) and DPIAs; deletion or return at the end; information and audits. Also: international transfers (UK adequacy regulations, the UK-US data bridge, the IDTA or the UK Addendum to the EU SCCs); liability; term and termination; governing law of England and Wales [INSERT: or Scotland / Northern Ireland].
Use [INSERT: ...] throughout for details you weren't given.`,
  }

  const prompt = prompts[docType]
  if (!prompt) return Response.json({ error: 'Choose a privacy notice, cookie policy or data processing agreement.' }, { status: 400 })

  try {
    const document = await askClaude({ system: toolSystem(DOC_ROLE), prompt, maxTokens: 4500 })
    const note = 'AI-generated draft. Fill in every [INSERT] and check it matches how your business really uses data before you publish or sign it. Not legal advice.'
    return Response.json({ document, note, docType, domain, generatedAt: new Date().toISOString() })
  } catch (e) {
    return aiFailed(e.status === 503 ? 503 : 502)
  }
}
