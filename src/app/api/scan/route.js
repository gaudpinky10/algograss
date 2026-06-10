import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

export async function POST(request) {
  const { url } = await request.json()
  if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })
  let targetUrl = url.trim()
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) targetUrl = 'https://' + targetUrl

  try {
    // Fetch with 8s timeout — stream only first 400KB (enough for all regex checks)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AlgoGrass/1.0; compliance-scanner)',
        'Accept': 'text/html,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    clearTimeout(timer)

    // Read only first 400KB — large sites don't need more for compliance checks
    const reader = response.body.getReader()
    const chunks = []
    let totalBytes = 0
    const MAX_BYTES = 400 * 1024
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      totalBytes += value.length
      if (totalBytes >= MAX_BYTES) { reader.cancel(); break }
    }
    const html = new TextDecoder().decode(Buffer.concat(chunks.map(c => Buffer.from(c))))
    const finalUrl = response.url

    // ── Compliance checks (all regex — instant) ─────────────────────────
    const isHttps            = finalUrl.startsWith('https://')
    const hasPrivacyLink     = /privacy[\s-_]?policy|privacy\s+notice|data\s+protection/i.test(html)
    const hasCookieBanner    = /cookie[\s-_]?(banner|notice|consent|policy|bar|popup|modal)|consent[\s-_]?manager|cookieyes|cookiebot|onetrust|gdpr[\s-_]?consent|acceptcookies/i.test(html)
    const hasCookieReject    = /reject[\s-_]?(all|cookies)|decline[\s-_]?cookies|refuse[\s-_]?cookies|necessary[\s-_]?only/i.test(html)
    const hasContactForm     = /<form[^>]*>[\s\S]*?(name|email|message|contact|enquiry)[\s\S]*?<\/form>/i.test(html)
    const hasTerms           = /terms[\s-_]?(of[\s-_]?(service|use)|and[\s-_]?conditions)|t&c/i.test(html)
    const hasDataRights      = /data[\s-_]?subject|right[\s-_]?to[\s-_]?(access|erasure|deletion|rectification|portability|object)|subject[\s-_]?access[\s-_]?request/i.test(html)
    const hasLawfulBasis     = /lawful[\s-_]?basis|legal[\s-_]?basis|legitimate[\s-_]?interest|consent|legal[\s-_]?obligation/i.test(html)
    const hasRetentionPolicy = /retention[\s-_]?period|how[\s-_]?long[\s-_]?we[\s-_]?(keep|hold|store)|data[\s-_]?retention/i.test(html)
    const hasDsarContact     = /data[\s-_]?subject[\s-_]?access[\s-_]?request|sar@|dpo@|privacy@|dsar/i.test(html)
    const hasAccessibility   = /accessibility[\s-_]?statement|wcag|screen[\s-_]?reader/i.test(html)
    const hasSecurityMention = /ssl|tls|encrypt|secure[\s-_]?connection|https/i.test(html)
    const hasSubprocessors   = /third[\s-_]?party[\s-_]?(processor|provider|service)|subprocessor|data[\s-_]?processor/i.test(html)
    const hasDpo             = /data[\s-_]?protection[\s-_]?officer|dpo/i.test(html)

    const trackers = []
    if (/google[\s-]?analytics|googletagmanager|gtag\(|G-[A-Z0-9]/i.test(html))    trackers.push('Google Analytics')
    if (/facebook[\s-]?pixel|fbq\(|connect\.facebook\.net/i.test(html))            trackers.push('Facebook Pixel')
    if (/hotjar|hjid/i.test(html))                                                  trackers.push('Hotjar')
    if (/linkedin[\s-]?insight/i.test(html))                                        trackers.push('LinkedIn Insight')
    if (/hubspot|_hsq/i.test(html))                                                 trackers.push('HubSpot')
    if (/intercom/i.test(html))                                                     trackers.push('Intercom')
    if (/mixpanel/i.test(html))                                                     trackers.push('Mixpanel')
    if (/segment\.com|segment\.io/i.test(html))                                     trackers.push('Segment')
    if (/tiktok[\s-]?pixel|analytics\.tiktok/i.test(html))                         trackers.push('TikTok Pixel')
    if (/microsoft[\s-]?clarity|clarity\.ms/i.test(html))                          trackers.push('Microsoft Clarity')

    const issues = []
    if (!isHttps) issues.push({ sev:'High',   title:'Website not using HTTPS', desc:'Your website does not use HTTPS. Required under GDPR Article 32 for secure data transmission.', reg:'GDPR Art. 32' })
    if (!hasCookieBanner) issues.push({ sev:'High', title:'No cookie consent banner detected', desc:'No cookie consent mechanism found. Required under UK ePrivacy Regulations before setting any non-essential cookies.', reg:'ePrivacy Reg. 6' })
    else if (!hasCookieReject) issues.push({ sev:'High', title:'Cookie banner may lack a reject option', desc:'Cookie banner found but no clear "Reject all" option detected. ICO requires the reject option to be as prominent as Accept.', reg:'ICO Cookie Guidance 2023' })
    if (!hasPrivacyLink) issues.push({ sev:'High', title:'No privacy policy detected', desc:'No privacy policy found. A privacy notice is required under GDPR Articles 13 and 14 for all personal data collection.', reg:'GDPR Art. 13 & 14' })
    if (trackers.length > 0 && !hasPrivacyLink) issues.push({ sev:'High', title:`Tracking scripts not disclosed (${trackers.join(', ')})`, desc:`Your website loads ${trackers.join(', ')} but no privacy policy was found to disclose this.`, reg:'GDPR Art. 13(1)(e)' })
    else if (trackers.length > 0) issues.push({ sev:'Medium', title:`Verify ${trackers.join(', ')} is disclosed in your privacy policy`, desc:`Your website loads ${trackers.join(', ')}. Ensure each is named as a data processor in your privacy policy.`, reg:'GDPR Art. 13(1)(e)' })
    if (hasContactForm && !hasPrivacyLink) issues.push({ sev:'Medium', title:'Contact form may lack privacy notice', desc:'A contact form was detected but no privacy notice found. A notice is required at the point of data collection.', reg:'GDPR Art. 13' })
    if (hasPrivacyLink && !hasLawfulBasis) issues.push({ sev:'Medium', title:'Privacy policy may not state lawful basis', desc:'GDPR Art. 13(1)(c) requires explicitly stating the lawful basis for each type of processing.', reg:'GDPR Art. 13(1)(c)' })
    if (hasPrivacyLink && !hasDataRights) issues.push({ sev:'Medium', title:'Data subject rights not clearly stated', desc:'Your privacy policy may not clearly explain the eight data subject rights under GDPR Articles 15–22.', reg:'GDPR Art. 13(2)(b)' })
    if (hasPrivacyLink && !hasRetentionPolicy) issues.push({ sev:'Medium', title:'Data retention period not specified', desc:'Your privacy policy does not specify how long personal data is kept. Required by GDPR Art. 13(2)(a).', reg:'GDPR Art. 13(2)(a)' })
    if (hasPrivacyLink && !hasDsarContact) issues.push({ sev:'Medium', title:'No clear DSAR contact found', desc:'No dedicated privacy contact email (e.g. privacy@ or dpo@) found for handling Subject Access Requests.', reg:'GDPR Art. 12' })
    if (!hasTerms) issues.push({ sev:'Low', title:'No terms of service detected', desc:'No Terms of Service page found. Strongly recommended for all commercial websites.', reg:'Best practice' })
    if (trackers.length > 0 && !hasSubprocessors) issues.push({ sev:'Low', title:'Subprocessors may not be listed', desc:`Site uses ${trackers.join(', ')}. These should be listed as data processors/subprocessors in your privacy policy.`, reg:'GDPR Art. 28' })

    const checksArr = [isHttps, hasCookieBanner, hasCookieReject||!hasCookieBanner, hasPrivacyLink, hasTerms, hasLawfulBasis||!hasPrivacyLink, hasDataRights||!hasPrivacyLink, trackers.length===0||hasPrivacyLink, hasRetentionPolicy||!hasPrivacyLink, hasDsarContact||!hasPrivacyLink]
    const score = Math.round((checksArr.filter(Boolean).length / checksArr.length) * 100)

    const result = {
      url: finalUrl, score, isHttps, trackers, issues,
      checks: { https:isHttps, privacyPolicy:hasPrivacyLink, cookieBanner:hasCookieBanner, cookieReject:hasCookieReject, termsOfService:hasTerms, lawfulBasis:hasLawfulBasis, dataRights:hasDataRights, trackersDisclosed:trackers.length===0||hasPrivacyLink, retentionPolicy:hasRetentionPolicy, dsarContact:hasDsarContact, dpo:hasDpo, accessibilityStatement:hasAccessibility, subprocessorsList:hasSubprocessors, securityMention:hasSecurityMention },
      scannedAt: new Date().toISOString()
    }

    // Fire-and-forget DB save — never blocks the response
    ;(async () => {
      try {
        const userCookie = cookies().get('algograss_user')
        if (userCookie) {
          const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
          const col = await getCollection('scans')
          if (col && user?.email) await col.insertOne({ userEmail:user.email, userId:user.id||user.email, url:finalUrl, score, issues, trackers, scannedAt:new Date() })
        }
      } catch {}
    })()

    return Response.json(result)

  } catch (err) {
    const msg = err.message || ''
    if (err.name==='AbortError'||msg.includes('abort')) return Response.json({ error:'The website took too long to respond (8s timeout). Try again or check the URL.' }, { status:408 })
    if (msg.includes('ENOTFOUND')||msg.includes('fetch failed')) return Response.json({ error:'Could not reach that website. Please check the URL.' }, { status:400 })
    return Response.json({ error:'Scan failed: ' + msg }, { status:500 })
  }
}
