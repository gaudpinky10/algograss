import { cookies } from 'next/headers';
import { getCollection, trackActivity, parseUserCookie } from '@/lib/dbHelpers';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function fetchPage(url, timeoutMs = 15000) {
  const FETCH_HEADERS = {
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-GB,en;q=0.9,en-US;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1',
  }
  const tryFetch = async (u) => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    try {
      const res = await fetch(u, { headers: FETCH_HEADERS, signal: ctrl.signal, redirect: 'follow', cache: 'no-store' })
      clearTimeout(timer)
      const text = await res.text().catch(() => '')
      if (!text && res.status >= 400) return null
      return { ok: true, text: text.slice(0, 700 * 1024), status: res.status, headers: res.headers, finalUrl: res.url }
    } catch (e) {
      clearTimeout(timer)
      return null
    }
  }
  let result = await tryFetch(url)
  if (!result && url.startsWith('https://')) result = await tryFetch(url.replace('https://', 'http://'))
  return result || { ok: false, text: '', status: 0, headers: new Headers(), finalUrl: url }
}

async function fetchSubPages(baseUrl) {
  // Comprehensive list covering SMEs, corporates, SaaS, e-commerce, and international sites
  const paths = [
    '/privacy-policy', '/privacy', '/privacy-notice', '/privacy-statement', '/privacy-center',
    '/data-protection', '/data-privacy', '/personal-data',
    '/cookie-policy', '/cookies', '/cookie-notice', '/cookie-statement',
    '/terms', '/terms-of-service', '/terms-and-conditions', '/terms-of-use',
    '/legal', '/legal/privacy', '/legal/privacy-policy', '/legal/cookie-policy',
    '/legal/terms', '/legal/terms-of-service',
    '/policies', '/policies/privacy', '/policies/cookies', '/policies/terms',
    '/en/privacy', '/en/privacy-policy', '/en/legal/privacy',
    '/about/privacy', '/info/privacy', '/help/privacy', '/help/legal',
    '/privacy/policy', '/site/privacy', '/your-privacy', '/your-data',
    '/privacy-rights', '/data-rights', '/gdpr', '/gdpr-policy',
    '/ccpa', '/california-privacy', '/accessibility',
  ]
  const origin = (() => { try { return new URL(baseUrl).origin } catch { return baseUrl } })()
  // Run in batches to avoid timeout — first 16 in parallel, then remaining
  const batch1 = paths.slice(0, 16).map(p => fetchPage(origin + p, 6000))
  const batch2 = paths.slice(16).map(p => fetchPage(origin + p, 5000))
  const [res1, res2] = await Promise.all([
    Promise.allSettled(batch1),
    Promise.allSettled(batch2),
  ])
  const all = [...res1, ...res2]
  return all.filter(r => r.status === 'fulfilled' && r.value?.ok && r.value?.status < 400).map(r => r.value.text).join('\n')
}

function detect(text, patterns) {
  return patterns.some(p => (typeof p === 'string' ? text.toLowerCase().includes(p.toLowerCase()) : p.test(text)))
}

export async function POST(request) {
  const { url } = await request.json()
  if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })
  let targetUrl = url.trim()
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) targetUrl = 'https://' + targetUrl

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  try {
    const [mainResult, subText] = await Promise.all([fetchPage(targetUrl), fetchSubPages(targetUrl)])
    if (!mainResult.ok) {
      await trackActivity({ userEmail: user?.email, tool: 'scan', action: 'scan_failed', detail: targetUrl })
      return Response.json({ error: 'Could not reach that website. Please check the URL and try again.' }, { status: 400 })
    }

    const mainHtml = mainResult.text
    const finalUrl = mainResult.finalUrl
    const allText  = mainHtml + '\n' + subText
    // Separate privacy-specific content (more strict matching within sub-pages)
    const privacyText = subText.length > 500 ? subText : ''
    const hasReadPrivacyPage = privacyText.length > 1000 // we actually got meaningful privacy page content

    // ─── HTTPS ───────────────────────────────────────────────────────────────
    const isHttps         = finalUrl.startsWith('https://')
    const hasHsts         = mainResult.headers.get('strict-transport-security') !== null

    // ─── PRIVACY POLICY ──────────────────────────────────────────────────────
    const hasPrivacyLink  = detect(allText, [
      /privacy[\s_-]?(policy|notice|statement|center)/i,
      /data[\s_-]?protection[\s_-]?(policy|notice|statement)/i,
      /how we (use|handle|process|collect) (your )?(personal )?(data|information)/i,
      'your privacy', 'privacy rights', 'your personal information',
      'data we collect', 'information we collect',
    ])

    // ─── COOKIE CONSENT ──────────────────────────────────────────────────────
    const COMPLIANT_PLATFORMS = [
      'cookieyes','cookiebot','onetrust','trustarc','quantcast','borlabs-cookie',
      'complianz','usercentrics','didomi','axeptio','iubenda','termly',
      'secureprivacy','cookieinformation','civic','silktide','consentmanager',
      'klaro','osano','cookie-script','cookiehub','privy','algograss-cookie-consent',
      'osano','admiral','crownpeak','evidon','sourcepoint','bigcommerce-cookie',
    ]
    const detectedPlatform = COMPLIANT_PLATFORMS.find(p => mainHtml.toLowerCase().includes(p))
    const hasCookieBanner  = !!detectedPlatform || detect(mainHtml, [
      /cookie[\s_-]?(banner|notice|consent|bar|popup|modal|wall|dialog|overlay)/i,
      'cookie-consent', 'cookieconsent', 'cookie_consent', 'cookie_banner',
      /gdpr[\s_-]?consent/i, /acceptcookies/i,
      /we use cookies/i, /this (site|website|we) use[s]? cookies/i,
      'cookie-law', 'cookie-notice', /manage[\s_-]?(my[\s_-]?)?cookie/i,
      'cookie preferences', 'cookie settings', 'cookie choices',
      /by (using|continuing|browsing|clicking).{0,60}(cookies|consent)/i,
    ])
    const hasCookieReject  = !!detectedPlatform || detect(mainHtml, [
      /data-reject-all="true"/i,
      /reject[\s_-]?all/i, /reject[\s_-]?cookies/i, 'rejectAll', 'reject-all', 'reject_all',
      /decline[\s_-]?(all[\s_-]?)?cookies/i, /refuse[\s_-]?cookies/i,
      /necessary[\s_-]?only/i, /essential[\s_-]?only/i,
      /manage[\s_-]?preferences/i, /cookie[\s_-]?settings/i,
      /customise[\s_-]?cookies/i, /customize[\s_-]?cookies/i,
      'opt out', 'opt-out', /decline[\s_-]?all/i, 'no thanks',
      /only (necessary|essential|required) cookies/i,
    ])

    // ─── TERMS ───────────────────────────────────────────────────────────────
    const hasTerms        = detect(allText, [
      /terms[\s_-]?(of[\s_-]?(service|use)|and[\s_-]?conditions)/i,
      /terms[\s_-]?&[\s_-]?conditions/i, 't&cs', 'terms of business',
      'user agreement', 'usage policy', 'acceptable use',
    ])

    // ─── LAWFUL BASIS ────────────────────────────────────────────────────────
    // Only flag if we actually read the privacy policy AND couldn't find it
    const hasLawfulBasis  = detect(allText, [
      /lawful[\s_-]?basis/i, /legal[\s_-]?basis/i, /legal[\s_-]?ground/i,
      /legitimate[\s_-]?interest/i, /legal[\s_-]?obligation/i,
      /basis (for|of) processing/i, /grounds (for|of) processing/i,
      'article 6', /art\.?\s*6/i,
      // Broad synonyms used by big companies
      /we (collect|process|use) (your |this )?(personal )?(data|information) (because|to|for|in order)/i,
      /we need (to process|your data|this information)/i,
      /we (rely on|base our processing on)/i,
      /consent(ing)? to (our|the) (processing|use|collection)/i,
      /performance of (a |the )?contract/i,
      /to (provide|fulfil|deliver|complete) (your |the )?(order|service|contract|request)/i,
      /we have a legitimate/i, /our legitimate interests/i,
      /legal (requirement|obligation|duty)/i,
      /required (by|under) law/i, /comply with (law|regulation|legal)/i,
      // US-style (common on global sites)
      /legal basis/i, /reasons we (share|use|collect|process)/i,
      /why we (collect|use|process|share)/i,
      /purposes (of|for) (processing|collection|use)/i,
    ])

    // ─── DATA SUBJECT RIGHTS ─────────────────────────────────────────────────
    const hasDataRights   = detect(allText, [
      /right[\s_-]?to[\s_-]?(access|erasure|deletion|rectification|portability|object|restrict)/i,
      /subject[\s_-]?access[\s_-]?request/i, /data[\s_-]?subject[\s_-]?rights?/i,
      'right to be forgotten', 'article 15', 'article 17', 'article 21',
      /art\.?\s*1[5-9]|art\.?\s*2[0-2]/i,
      // Broad synonyms
      'your rights', 'your privacy rights', 'your data rights', 'your choices',
      'individual rights', 'privacy rights',
      /access (your|to your) (personal )?(data|information)/i,
      /request (a copy|deletion|removal|correction|rectification) of (your )?(personal )?(data|information)/i,
      /delete (your|account|personal) (data|information|account)/i,
      /opt.out (of|from)/i, 'unsubscribe', 'withdraw consent',
      /manage (your )?(data|privacy|preferences|personal information)/i,
      /control (your )?(data|personal information|privacy)/i,
      /data (portability|request|access request)/i,
      /exercise (your|these) rights/i, /submit a (privacy |data )?request/i,
      // CCPA/US rights that also satisfy GDPR transparency
      /right to know/i, /right to delete/i, /right to opt.out/i,
      /california (privacy|consumer)/i, /ccpa/i,
      /you (may|can) (request|ask us|contact us) (to )?(access|delete|correct|update|remove)/i,
    ])

    // ─── DATA RETENTION ──────────────────────────────────────────────────────
    const hasRetentionPolicy = detect(allText, [
      /retention[\s_-]?period/i,
      /how[\s_-]?long[\s_-]?(we[\s_-]?)?(keep|hold|store|retain)/i,
      /data[\s_-]?retention/i,
      'we keep your data', 'stored for', 'retained for', 'deleted after',
      // Broad synonyms
      /as long as (necessary|needed|required)/i,
      /no longer than (necessary|needed|required)/i,
      /for (the duration|as long as|the period)/i,
      /we (store|retain|keep|hold) (your |personal )?(data|information) (for|until|as)/i,
      /storage (limitation|period|duration)/i,
      /keep (your |personal )?(data|information) (for|until)/i,
      /minimum (necessary|retention) period/i,
      /we will (delete|remove|erase|destroy) (your |personal )?(data|information)/i,
      /automatically (deleted|removed|erased|purged)/i,
      /for [0-9]+ (day|month|year)/i,
      /within [0-9]+ (day|month|year)/i,
      /up to [0-9]+ (day|month|year)/i,
    ])

    // ─── DSAR CONTACT ────────────────────────────────────────────────────────
    const hasDsarContact  = detect(allText, [
      /dpo@/i, /privacy@/i, /data[\s_-]?protection@/i, /sar@/i, /gdpr@/i,
      /subject[\s_-]?access[\s_-]?request/i,
      /contact[\s_-]?(our[\s_-]?)?dpo/i, 'data protection officer',
      // Broad synonyms
      /contact[\s_-]?us (at|about|regarding) (privacy|data|your (personal|data))/i,
      /privacy (request|form|portal|centre|center)/i,
      /data (request|access) (form|portal|page)/i,
      /submit (a |your )?(privacy|data) request/i,
      /to (exercise|make) (a |your )?request/i,
      /email[\s_-]?us (at|to|about)/i,
      /reach (us|our team) (at|via)/i,
      /privacy (team|department|office)/i,
      'data request', /request your (data|information)/i,
    ])

    // ─── DPO ─────────────────────────────────────────────────────────────────
    const hasDpo          = detect(allText, [
      /data[\s_-]?protection[\s_-]?officer/i, /\bdpo\b/i,
      'data protection representative', 'EU representative', 'UK representative',
    ])

    // ─── SECURITY HEADERS ────────────────────────────────────────────────────
    const hasSecurityHeaders = [
      'x-content-type-options','x-frame-options',
      'content-security-policy','permissions-policy',
      'strict-transport-security','x-xss-protection',
    ].some(h => mainResult.headers.get(h) !== null)

    // ─── SUBPROCESSORS / DATA SHARING ────────────────────────────────────────
    // A privacy policy that mentions "third parties", "advertising partners", "service providers"
    // OR mentions the tracker brands by name counts as disclosing processors
    const hasSubprocessors = detect(allText, [
      /third[\s_-]?party[\s_-]?(processor|provider|service|partner)/i,
      /subprocessor/i, /sub[\s_-]?processor/i, 'data processor',
      // Broad synonyms for third-party sharing/disclosure
      'advertising partners', 'analytics providers', 'service providers',
      /our (partners|vendors|suppliers|contractors)/i,
      /companies we work with/i, /we share (your|this|personal) (data|information) with/i,
      /who we share (your|this|personal|data)?/i,
      /sharing (your|personal) (data|information)/i,
      /disclosure of (your|personal) (data|information)/i,
      /transfer (your|personal) (data|information)/i,
      /third parties (we share|who (may|can) access)/i,
      // Specific tracker brand names that appear in privacy policies
      'google llc', 'google ireland', 'google analytics', 'google tag',
      'meta platforms', 'facebook ireland', 'meta pixel',
      'linkedin corporation', 'linkedin ireland',
      'tiktok', 'bytedance',
      'microsoft corporation', 'microsoft advertising',
      'twitter inc', 'x corp', 'hotjar',
    ])

    // ─── CONTACT FORM ────────────────────────────────────────────────────────
    const hasContactForm  = detect(mainHtml, [
      /<form[^>]*>/i, 'contact-form', 'contactform', 'wpcf7',
      'gravityform', 'type="email"', 'formspree', 'typeform',
    ])

    // ─── ACCESSIBILITY ───────────────────────────────────────────────────────
    const hasAccessibility = detect(allText, [
      /accessibility[\s_-]?statement/i, 'wcag', 'screen reader',
      /aria-/i, 'alt text', 'accessible',
    ])

    // ─── SPA DETECTION ───────────────────────────────────────────────────────
    const isSpa = detect(mainHtml, [
      /__NEXT_DATA__/i, 'window.__nuxt', '__vue__', 'data-reactroot',
      'id="__next"', 'id="app"', 'ng-version', 'data-n-head',
    ])

    // ─── TRACKERS ────────────────────────────────────────────────────────────
    const trackers = []
    if (detect(mainHtml, [/google[\s-]?analytics|googletagmanager|gtag\(|google-analytics/i, /['"](G|UA)-[A-Z0-9]{4,}/])) trackers.push('Google Analytics')
    if (detect(mainHtml, [/facebook[\s-]?pixel|fbq\(|connect\.facebook\.net|meta[\s-]?pixel/i]))                          trackers.push('Meta Pixel')
    if (detect(mainHtml, [/hotjar|hjid/i]))                                                                                 trackers.push('Hotjar')
    if (detect(mainHtml, [/linkedin[\s-]?insight|snap\.licdn|linkedin\.com\/px/i]))                                        trackers.push('LinkedIn Insight')
    if (detect(mainHtml, [/_hsq\s*=|js\.hs-scripts\.com|js\.hubspot\.com|hs-analytics\.net|hubspot\.com\/hs\/hsstatic/i])) trackers.push('HubSpot')
    if (detect(mainHtml, [/\bintercom\b/i, /intercomcdn|widget\.intercom/i]))                                              trackers.push('Intercom')
    if (detect(mainHtml, [/mixpanel\.com|mixpanel\.init/i]))                                                               trackers.push('Mixpanel')
    if (detect(mainHtml, [/segment\.com\/analytics|segment\.io\/analytics/i]))                                             trackers.push('Segment')
    if (detect(mainHtml, [/analytics\.tiktok\.com|tiktok[\s-]?pixel|ttq\./i]))                                            trackers.push('TikTok Pixel')
    if (detect(mainHtml, [/microsoft[\s-]?clarity|clarity\.ms\/tag/i]))                                                   trackers.push('Microsoft Clarity')
    if (detect(mainHtml, [/\bpinterest\.com\/ct\//i]))                                                                     trackers.push('Pinterest Tag')
    if (detect(mainHtml, [/static\.ads-twitter|ads\.twitter\.com|twq\(|t\.co\/i\//i]))                                    trackers.push('X/Twitter Pixel')

    // ─── BUILD ISSUES ────────────────────────────────────────────────────────
    // Only raise policy-content issues when we actually read privacy policy pages
    // (prevents false positives on JS-heavy or bot-protected sites)
    const issues = []

    if (!isHttps)
      issues.push({ sev:'High', title:'Website not using HTTPS', desc:'HTTPS is required under GDPR Art. 32 to encrypt data in transit. All modern websites should use HTTPS.', reg:'GDPR Art. 32' })

    if (!hasCookieBanner && trackers.length > 0)
      issues.push({ sev:'High', title:'Tracking scripts without cookie consent', desc:`${trackers.join(', ')} detected but no cookie consent banner found in page source. Consent must be obtained before dropping non-essential cookies.`, reg:'ePrivacy / PECR Reg. 6' })
    else if (!hasCookieBanner)
      issues.push({ sev:'Medium', title:'No cookie consent mechanism detected', desc:'No cookie consent banner found. Required under PECR before setting non-essential cookies. Note: JS-rendered banners may not appear in a static HTML scan.', reg:'ePrivacy Reg. 6' })
    else if (hasCookieBanner && !hasCookieReject)
      issues.push({ sev:'Medium', title:'Cookie banner may lack a "Reject All" option', desc:'A cookie banner was detected but no "Reject All" button found in page source. ICO 2023 guidance requires this to be as easy as accepting. If your banner is JS-rendered, verify manually.', reg:'ICO Cookie Guidance 2023' })

    if (!hasPrivacyLink)
      issues.push({ sev:'High', title:'No privacy policy detected', desc:'No privacy policy link found in page source or common URL paths. A privacy notice is required under GDPR Art. 13 & 14.', reg:'GDPR Art. 13 & 14' })

    // Only flag processor/content issues if we found privacy policy content to read
    if (trackers.length > 0 && hasPrivacyLink && !hasSubprocessors) {
      if (hasReadPrivacyPage) {
        issues.push({ sev:'Medium', title:'Trackers may not be disclosed as data processors', desc:`${trackers.join(', ')} detected. Privacy policy content was scanned and did not explicitly list these as data processors. Each should be named under GDPR Art. 13(1)(e).`, reg:'GDPR Art. 13(1)(e)' })
      } else {
        issues.push({ sev:'Low', title:'Verify trackers are disclosed in privacy policy', desc:`${trackers.join(', ')} detected. Could not fully read the privacy policy (may be JS-rendered). Verify these are listed as data processors.`, reg:'GDPR Art. 13(1)(e)' })
      }
    }

    if (hasContactForm && !hasPrivacyLink)
      issues.push({ sev:'Medium', title:'Contact form without visible privacy notice', desc:'A data-collection form was detected but no privacy notice found. Required at point of data collection under GDPR Art. 13.', reg:'GDPR Art. 13' })

    if (hasPrivacyLink && !hasLawfulBasis) {
      if (hasReadPrivacyPage) {
        issues.push({ sev:'Medium', title:'Lawful basis for processing not stated', desc:'Privacy policy was scanned but no lawful basis statement found. GDPR Art. 13(1)(c) requires you to state the legal basis for each processing purpose.', reg:'GDPR Art. 13(1)(c)' })
      } else {
        issues.push({ sev:'Low', title:'Verify lawful basis is stated in privacy policy', desc:'Could not fully read the privacy policy (may be JS-rendered or behind authentication). Ensure your legal basis for processing is clearly stated.', reg:'GDPR Art. 13(1)(c)' })
      }
    }

    if (hasPrivacyLink && !hasDataRights) {
      if (hasReadPrivacyPage) {
        issues.push({ sev:'Medium', title:'Data subject rights not clearly explained', desc:'Privacy policy was scanned but rights under GDPR Art. 15–22 (access, erasure, portability, etc.) were not found. These must be explained in your privacy notice.', reg:'GDPR Art. 13(2)(b)' })
      } else {
        issues.push({ sev:'Low', title:'Verify data subject rights are explained', desc:'Could not fully read the privacy policy. Ensure all eight data subject rights under GDPR Art. 15–22 are clearly explained.', reg:'GDPR Art. 13(2)(b)' })
      }
    }

    if (hasPrivacyLink && !hasRetentionPolicy) {
      if (hasReadPrivacyPage) {
        issues.push({ sev:'Medium', title:'Data retention periods not specified', desc:'Privacy policy was scanned but no retention period information found. GDPR Art. 13(2)(a) requires you to state how long personal data is kept.', reg:'GDPR Art. 13(2)(a)' })
      } else {
        issues.push({ sev:'Low', title:'Verify data retention periods are stated', desc:'Could not fully read the privacy policy. Ensure data retention periods are clearly stated for each category of personal data.', reg:'GDPR Art. 13(2)(a)' })
      }
    }

    if (hasPrivacyLink && !hasDsarContact && hasReadPrivacyPage)
      issues.push({ sev:'Low', title:'No clear DSAR contact method found', desc:'No dedicated privacy contact email or data request form found. Make it easy for individuals to submit Subject Access Requests.', reg:'GDPR Art. 12' })

    if (!hasTerms)
      issues.push({ sev:'Low', title:'No terms of service detected', desc:'Terms of Service not found in common URL paths. Recommended for all commercial websites.', reg:'Best practice' })

    if (!hasSecurityHeaders)
      issues.push({ sev:'Low', title:'Missing HTTP security headers', desc:'No security headers (X-Frame-Options, CSP, X-Content-Type-Options) detected. These help protect users and demonstrate security measures under GDPR Art. 32.', reg:'GDPR Art. 32' })

    // ─── SCORING ─────────────────────────────────────────────────────────────
    const highCount = issues.filter(i => i.sev === 'High').length
    const medCount  = issues.filter(i => i.sev === 'Medium').length
    const lowCount  = issues.filter(i => i.sev === 'Low').length
    const score     = Math.max(0, Math.min(100, 100 - highCount * 15 - medCount * 7 - lowCount * 2))

    // ─── NOTE ────────────────────────────────────────────────────────────────
    let note = 'This is an automated scan of publicly visible HTML. JS-rendered content, authenticated areas, and dynamically loaded privacy policies may not be fully captured.'
    if (isSpa) note = 'This site uses a JavaScript framework. Content rendered after page load (including some cookie banners and privacy policy text) may not be captured in this scan.'
    if (!hasReadPrivacyPage && hasPrivacyLink) note += ' Privacy policy pages could not be fully read — some checks may be marked Low severity as a result.'

    const result = {
      url: finalUrl, score, isHttps, trackers, issues, isSpa,
      checks: {
        https: isHttps, hsts: hasHsts, privacyPolicy: hasPrivacyLink,
        cookieBanner: hasCookieBanner, cookieReject: hasCookieReject,
        termsOfService: hasTerms, lawfulBasis: hasLawfulBasis,
        dataRights: hasDataRights, retentionPolicy: hasRetentionPolicy,
        dsarContact: hasDsarContact, dpo: hasDpo,
        securityHeaders: hasSecurityHeaders, subprocessorsList: hasSubprocessors,
        accessibilityStatement: hasAccessibility,
      },
      consentPlatform: detectedPlatform || null,
      scannedAt: new Date().toISOString(),
      note,
    }

    ;(async () => {
      try {
        const col = await getCollection('scans')
        if (col) await col.insertOne({ userEmail: user?.email || 'anonymous', url: finalUrl, score, issues, trackers, checks: result.checks, scannedAt: new Date() })
        await trackActivity({ userEmail: user?.email, tool: 'scan', action: 'website_scanned', detail: finalUrl, meta: { score, issueCount: issues.length, highCount, medCount } })
      } catch {}
    })()

    return Response.json(result)
  } catch (err) {
    const msg = err.message || ''
    if (err.name === 'AbortError' || msg.includes('abort')) return Response.json({ error: 'The website took too long to respond. Try again.' }, { status: 408 })
    if (msg.includes('ENOTFOUND') || msg.includes('fetch failed') || msg.includes('ECONNREFUSED')) return Response.json({ error: 'Could not reach that website. Please check the URL.' }, { status: 400 })
    return Response.json({ error: 'Scan failed: ' + msg }, { status: 500 })
  }
}
