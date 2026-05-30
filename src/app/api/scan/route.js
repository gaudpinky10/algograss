export async function POST(request) {
  const { url } = await request.json()
  if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })
  let targetUrl = url.trim()
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) targetUrl = 'https://' + targetUrl
  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AlgoGrass/1.0; compliance-scanner)', 'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8' },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    })
    const html = await response.text()
    const finalUrl = response.url
    const isHttps = finalUrl.startsWith('https://')

    // --- existing checks ---
    const hasPrivacyLink = /privacy[\s-_]?policy|privacy\s+notice|data\s+protection/i.test(html)
    const hasCookieBanner = /cookie[\s-_]?(banner|notice|consent|policy|bar|popup|modal)|consent[\s-_]?manager|cookieyes|cookiebot|onetrust|gdpr[\s-_]?consent|acceptcookies/i.test(html)
    const hasCookieReject = /reject[\s-_]?(all|cookies)|decline[\s-_]?cookies|refuse[\s-_]?cookies|necessary[\s-_]?only/i.test(html)
    const hasContactForm = /<form[^>]*>[\s\S]*?(name|email|message|contact|enquiry)[\s\S]*?<\/form>/i.test(html)
    const hasTerms = /terms[\s-_]?(of[\s-_]?(service|use)|and[\s-_]?conditions)|t&c/i.test(html)
    const hasDataRights = /data[\s-_]?subject|right[\s-_]?to[\s-_]?(access|erasure|deletion|rectification|portability|object)|subject[\s-_]?access[\s-_]?request/i.test(html)
    const hasLawfulBasis = /lawful[\s-_]?basis|legal[\s-_]?basis|legitimate[\s-_]?interest|consent|legal[\s-_]?obligation/i.test(html)

    // --- new checks ---
    const hasRetentionPolicy = /retention[\s-_]?period|how[\s-_]?long[\s-_]?we[\s-_]?(keep|hold|store)|data[\s-_]?retention/i.test(html)
    const hasDsarContact = /data[\s-_]?subject[\s-_]?access[\s-_]?request|sar@|dpo@|privacy@|dsar/i.test(html)
    const hasAccessibilityStatement = /accessibility[\s-_]?statement|wcag|screen[\s-_]?reader/i.test(html)
    const hasSecurityMention = /ssl|tls|encrypt|secure[\s-_]?connection|https/i.test(html)
    const hasSubprocessors = /third[\s-_]?party[\s-_]?(processor|provider|service)|subprocessor|data[\s-_]?processor/i.test(html)
    const hasDpo = /data[\s-_]?protection[\s-_]?officer|dpo/i.test(html)

    // --- trackers ---
    const trackers = []
    if (/google[\s-]?analytics|googletagmanager|gtag\(|G-[A-Z0-9]/i.test(html)) trackers.push('Google Analytics')
    if (/facebook[\s-]?pixel|fbq\(|connect\.facebook\.net/i.test(html)) trackers.push('Facebook Pixel')
    if (/hotjar|hjid/i.test(html)) trackers.push('Hotjar')
    if (/linkedin[\s-]?insight/i.test(html)) trackers.push('LinkedIn Insight')
    if (/hubspot|_hsq/i.test(html)) trackers.push('HubSpot')
    if (/intercom/i.test(html)) trackers.push('Intercom')
    if (/mixpanel/i.test(html)) trackers.push('Mixpanel')
    if (/segment\.com|segment\.io/i.test(html)) trackers.push('Segment')
    if (/tiktok[\s-]?pixel|analytics\.tiktok/i.test(html)) trackers.push('TikTok Pixel')
    if (/microsoft[\s-]?clarity|clarity\.ms/i.test(html)) trackers.push('Microsoft Clarity')

    // --- issues ---
    const issues = []
    if (!isHttps) issues.push({ sev: 'High', title: 'Website not using HTTPS', desc: 'Your website does not use HTTPS encryption. This is required under GDPR Article 32 for appropriate security of personal data.', reg: 'GDPR Art. 32' })
    if (!hasCookieBanner) issues.push({ sev: 'High', title: 'No cookie consent banner detected', desc: 'We could not detect a cookie consent mechanism. Under UK ePrivacy Regulations you must get consent before setting non-essential cookies.', reg: 'ePrivacy Reg. 6' })
    else if (!hasCookieReject) issues.push({ sev: 'High', title: 'Cookie banner may lack a reject option', desc: 'We detected a cookie banner but could not confirm it has a clear "Reject all" option. The ICO requires accept and reject to be equally easy.', reg: 'ICO Cookie Guidance 2023' })
    if (!hasPrivacyLink) issues.push({ sev: 'High', title: 'No privacy policy detected', desc: 'We could not find a link to a privacy policy. A privacy policy is legally required under GDPR Articles 13 and 14.', reg: 'GDPR Art. 13 & 14' })
    if (trackers.length > 0 && !hasPrivacyLink) issues.push({ sev: 'High', title: `Tracking scripts not disclosed (${trackers.join(', ')})`, desc: `Your website loads ${trackers.join(', ')} but no privacy policy was found disclosing this to users.`, reg: 'GDPR Art. 13(1)(e)' })
    else if (trackers.length > 0) issues.push({ sev: 'Medium', title: `Verify ${trackers.join(', ')} is disclosed in your privacy policy`, desc: `Your website loads ${trackers.join(', ')}. Ensure these are named in your privacy policy as third-party processors.`, reg: 'GDPR Art. 13(1)(e)' })
    if (hasContactForm && !hasPrivacyLink) issues.push({ sev: 'Medium', title: 'Contact form may lack privacy notice', desc: 'We detected a contact form but could not confirm it includes a privacy notice at the point of data collection.', reg: 'GDPR Art. 13' })
    if (hasPrivacyLink && !hasLawfulBasis) issues.push({ sev: 'Medium', title: 'Privacy policy may not state lawful basis', desc: 'GDPR Article 13(1)(c) requires you to state the lawful basis for each processing activity in your privacy policy.', reg: 'GDPR Art. 13(1)(c)' })
    if (hasPrivacyLink && !hasDataRights) issues.push({ sev: 'Medium', title: 'Data subject rights not clearly stated', desc: 'Your privacy policy may not clearly explain users rights under GDPR Articles 15-22.', reg: 'GDPR Art. 13(2)(b)' })
    if (hasPrivacyLink && !hasRetentionPolicy) issues.push({ sev: 'Medium', title: 'Data retention period not specified', desc: 'Your privacy policy does not appear to specify how long you keep personal data. GDPR Art. 13(2)(a) requires you to state retention periods or the criteria used to determine them.', reg: 'GDPR Art. 13(2)(a)' })
    if (hasPrivacyLink && !hasDsarContact) issues.push({ sev: 'Medium', title: 'No clear DSAR / privacy contact found', desc: 'We could not find a dedicated privacy contact email (e.g. dpo@ or privacy@). Individuals need a clear way to submit Subject Access Requests.', reg: 'GDPR Art. 12' })
    if (!hasTerms) issues.push({ sev: 'Low', title: 'No terms of service detected', desc: 'We could not find a Terms of Service page. While not a direct GDPR requirement, it is strongly recommended.', reg: 'Best practice' })
    if (trackers.length > 0 && !hasSubprocessors) issues.push({ sev: 'Low', title: 'Subprocessors may not be listed', desc: `Your site uses ${trackers.join(', ')}. Your privacy policy should list these as subprocessors/third-party data processors.`, reg: 'GDPR Art. 28' })

    // --- score ---
    const checks = [
      isHttps, hasCookieBanner, hasCookieReject || !hasCookieBanner, hasPrivacyLink,
      hasTerms, hasLawfulBasis || !hasPrivacyLink, hasDataRights || !hasPrivacyLink,
      trackers.length === 0 || hasPrivacyLink, hasRetentionPolicy || !hasPrivacyLink,
      hasDsarContact || !hasPrivacyLink
    ]
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100)

    return Response.json({
      url: finalUrl, score, isHttps, trackers, issues,
      checks: {
        https: isHttps,
        privacyPolicy: hasPrivacyLink,
        cookieBanner: hasCookieBanner,
        cookieReject: hasCookieReject,
        termsOfService: hasTerms,
        lawfulBasis: hasLawfulBasis,
        dataRights: hasDataRights,
        trackersDisclosed: trackers.length === 0 || hasPrivacyLink,
        retentionPolicy: hasRetentionPolicy,
        dsarContact: hasDsarContact,
        dpo: hasDpo,
        accessibilityStatement: hasAccessibilityStatement,
        subprocessorsList: hasSubprocessors,
        securityMention: hasSecurityMention,
      },
      scannedAt: new Date().toISOString()
    })
  } catch (err) {
    const msg = err.message || ''
    if (msg.includes('timeout') || msg.includes('abort')) return Response.json({ error: 'The website took too long to respond. Please check the URL and try again.' }, { status: 408 })
    if (msg.includes('ENOTFOUND') || msg.includes('fetch failed')) return Response.json({ error: 'Could not reach that website. Please check the URL is correct and the site is live.' }, { status: 400 })
    return Response.json({ error: 'Scan failed: ' + msg }, { status: 500 })
  }
}
