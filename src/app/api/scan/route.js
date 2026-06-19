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
      // Accept any response that has a body — even 403/429 pages contain useful HTML
      const text = await res.text().catch(() => '')
      if (!text && res.status >= 400) return null
      return { ok: true, text: text.slice(0, 700 * 1024), status: res.status, headers: res.headers, finalUrl: res.url }
    } catch (e) {
      clearTimeout(timer)
      return null
    }
  }

  // Try https first, then http fallback if url was originally http or https failed
  let result = await tryFetch(url)
  if (!result && url.startsWith('https://')) {
    result = await tryFetch(url.replace('https://', 'http://'))
  }
  return result || { ok: false, text: '', status: 0, headers: new Headers(), finalUrl: url }
}

async function fetchSubPages(baseUrl) {
  const paths = ['/privacy-policy','/privacy','/privacy-notice','/data-protection','/cookie-policy','/cookies','/cookie-notice','/terms','/terms-of-service','/terms-and-conditions','/legal','/gdpr']
  const origin = (() => { try { return new URL(baseUrl).origin } catch { return baseUrl } })()
  const results = await Promise.allSettled(paths.map(p => fetchPage(origin + p, 8000)))
  return results.filter(r => r.status === 'fulfilled' && r.value?.ok).map(r => r.value.text).join('\n')
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

    const isHttps            = finalUrl.startsWith('https://')
    const hasHsts            = mainResult.headers.get('strict-transport-security') !== null
    const hasPrivacyLink     = detect(allText, [/privacy[\s_-]?policy/i,/privacy[\s_-]?notice/i,/data[\s_-]?protection[\s_-]?(policy|notice)/i,'how we use your data'])
    // Known compliant cookie consent platforms — all include a Reject option by default
    const COMPLIANT_PLATFORMS = ['cookieyes','cookiebot','onetrust','trustarc','quantcast','borlabs-cookie','complianz','usercentrics','didomi','axeptio','iubenda','termly','secureprivacy','cookieinformation','civic','silktide','consentmanager','klaro','osano','algograss-cookie-consent']
    const detectedPlatform    = COMPLIANT_PLATFORMS.find(p => mainHtml.toLowerCase().includes(p))
    const hasCookieBanner    = !!detectedPlatform || detect(mainHtml, [/cookie[\s_-]?(banner|notice|consent|bar|popup|modal|wall)/i,'cookie-consent','cookieconsent','cookie_consent',/gdpr[\s_-]?consent/i,/acceptcookies/i,/we use cookies/i,/this (site|website|we) use[s]? cookies/i,'cookie-law','cookie-notice',/manage[\s_-]?(my[\s_-]?)?cookie/i])
    // Reject-all check: if using a known compliant platform → assume present (it's JS-rendered, not in raw HTML)
    // data-reject-all="true" is our own marker added to the static HTML for scanner detection
    const hasCookieReject    = !!detectedPlatform || detect(mainHtml, [/data-reject-all="true"/i,/reject[\s_-]?all/i,/reject[\s_-]?cookies/i,/rejectAll/i,/reject-all/i,/reject_all/i,/decline[\s_-]?(all[\s_-]?)?cookies/i,/refuse[\s_-]?cookies/i,/necessary[\s_-]?only/i,/essential[\s_-]?only/i,/manage[\s_-]?preferences/i,/cookie[\s_-]?settings/i,/customise[\s_-]?cookies/i,/customize[\s_-]?cookies/i,'opt out','opt-out',/no[,\s]+thanks/i,/decline[\s_-]?all/i])
    const hasContactForm     = detect(mainHtml, [/<form[^>]*>/i,'contact-form','contactform','wpcf7','gravityform','type="email"'])
    const hasTerms           = detect(allText, [/terms[\s_-]?(of[\s_-]?(service|use)|and[\s_-]?conditions)/i,/terms[\s_-]?&[\s_-]?conditions/i,'t&cs','terms of business'])
    const hasDataRights      = detect(allText, [/right[\s_-]?to[\s_-]?(access|erasure|deletion|rectification|portability|object)/i,/subject[\s_-]?access[\s_-]?request/i,/data[\s_-]?subject[\s_-]?rights?/i,'your rights','right to be forgotten','article 15','article 17'])
    const hasLawfulBasis     = detect(allText, [/lawful[\s_-]?basis/i,/legal[\s_-]?basis/i,/legitimate[\s_-]?interest/i,/legal[\s_-]?obligation/i,'basis for processing','grounds for processing','article 6'])
    const hasRetentionPolicy = detect(allText, [/retention[\s_-]?period/i,/how[\s_-]?long[\s_-]?(we[\s_-]?)?(keep|hold|store|retain)/i,/data[\s_-]?retention/i,'we keep your data','stored for','retained for','deleted after'])
    const hasDsarContact     = detect(allText, [/dpo@/i,/privacy@/i,/data[\s_-]?protection@/i,/sar@/i,/gdpr@/i,/subject[\s_-]?access[\s_-]?request/i,/contact[\s_-]?(our[\s_-]?)?dpo/i,'data protection officer'])
    const hasDpo             = detect(allText, [/data[\s_-]?protection[\s_-]?officer/i,/\bdpo\b/i])
    const hasSecurityHeaders = ['x-content-type-options','x-frame-options','content-security-policy','permissions-policy'].some(h => mainResult.headers.get(h) !== null)
    const hasSubprocessors   = detect(allText, [/third[\s_-]?party[\s_-]?(processor|provider|service)/i,/subprocessor/i,/sub[\s_-]?processor/i,'data processor'])
    const hasAccessibility   = detect(allText, [/accessibility[\s_-]?statement/i,'wcag','screen reader'])
    const isSpa              = detect(mainHtml, [/__NEXT_DATA__/i,'window.__nuxt','__vue__','data-reactroot','id="__next"','id="app"','ng-version'])

    const trackers = []
    if (detect(mainHtml,[/google[\s-]?analytics|googletagmanager|gtag\(/i,/G-[A-Z0-9]{4,}/])) trackers.push('Google Analytics')
    if (detect(mainHtml,[/facebook[\s-]?pixel|fbq\(|connect\.facebook\.net/i]))              trackers.push('Facebook Pixel')
    if (detect(mainHtml,[/hotjar|hjid/i]))                                                    trackers.push('Hotjar')
    if (detect(mainHtml,[/linkedin[\s-]?insight|snap\.licdn/i]))                             trackers.push('LinkedIn Insight')
    if (detect(mainHtml,[/_hsq\s*=|js\.hs-scripts\.com|js\.hubspot\.com|hs-analytics\.net|hubspot\.com\/hs\/hsstatic/i])) trackers.push('HubSpot')
    if (detect(mainHtml,[/intercom/i]))                                                       trackers.push('Intercom')
    if (detect(mainHtml,[/mixpanel/i]))                                                       trackers.push('Mixpanel')
    if (detect(mainHtml,[/segment\.com|segment\.io/i]))                                       trackers.push('Segment')
    if (detect(mainHtml,[/tiktok[\s-]?pixel|analytics\.tiktok/i]))                           trackers.push('TikTok Pixel')
    if (detect(mainHtml,[/microsoft[\s-]?clarity|clarity\.ms/i]))                            trackers.push('Microsoft Clarity')
    if (detect(mainHtml,[/\bpinterest\.com\/ct\//i]))                                         trackers.push('Pinterest Tag')
    if (detect(mainHtml,[/twitter[\s-]?pixel|twq\(|static\.ads-twitter/i]))                  trackers.push('X/Twitter Pixel')

    const issues = []
    if (!isHttps) issues.push({ sev:'High', title:'Website not using HTTPS', desc:'HTTPS is required under GDPR Art. 32. All data in transit must be encrypted.', reg:'GDPR Art. 32' })
    if (!hasCookieBanner && trackers.length > 0) issues.push({ sev:'High', title:'Tracking scripts running without cookie consent', desc:`${trackers.join(', ')} detected but no cookie consent banner found. Consent is required before setting non-essential cookies.`, reg:'ePrivacy Reg. 6 / PECR' })
    else if (!hasCookieBanner) issues.push({ sev:'High', title:'No cookie consent banner detected', desc:'No cookie consent mechanism found. Required under PECR before setting any non-essential cookies.', reg:'ePrivacy Reg. 6' })
    else if (hasCookieBanner && !hasCookieReject) issues.push({ sev:'Medium', title:'Cookie banner may lack a "Reject All" option', desc:'Cookie consent detected but no visible "Reject All" button found in page source. ICO 2023 guidance requires reject to be as easy as accept. If your banner is JS-rendered, verify the Reject All button appears on first load without scrolling.', reg:'ICO Cookie Guidance 2023' })
    if (!hasPrivacyLink) issues.push({ sev:'High', title:'No privacy policy detected', desc:'A privacy notice is required under GDPR Articles 13 and 14 for all personal data collection.', reg:'GDPR Art. 13 & 14' })
    if (trackers.length > 0 && hasPrivacyLink && !hasSubprocessors) issues.push({ sev:'Medium', title:'Trackers may not be listed as processors', desc:`${trackers.join(', ')} detected. Each must be named as a data processor in your privacy policy.`, reg:'GDPR Art. 13(1)(e)' })
    if (hasContactForm && !hasPrivacyLink) issues.push({ sev:'Medium', title:'Contact form without privacy notice', desc:'A form collecting personal data was found but no privacy notice. Required at point of collection.', reg:'GDPR Art. 13' })
    if (hasPrivacyLink && !hasLawfulBasis) issues.push({ sev:'Medium', title:'Lawful basis not stated', desc:'GDPR Art. 13(1)(c) requires you to state the lawful basis for each processing purpose.', reg:'GDPR Art. 13(1)(c)' })
    if (hasPrivacyLink && !hasDataRights) issues.push({ sev:'Medium', title:'Data subject rights not explained', desc:'Your privacy policy should clearly explain all 8 data subject rights under GDPR Articles 15–22.', reg:'GDPR Art. 13(2)(b)' })
    if (hasPrivacyLink && !hasRetentionPolicy) issues.push({ sev:'Medium', title:'Data retention periods not specified', desc:'GDPR Art. 13(2)(a) requires you to state how long personal data is kept.', reg:'GDPR Art. 13(2)(a)' })
    if (hasPrivacyLink && !hasDsarContact) issues.push({ sev:'Medium', title:'No DSAR contact found', desc:'No dedicated privacy contact email found for Subject Access Requests.', reg:'GDPR Art. 12' })
    if (!hasTerms) issues.push({ sev:'Low', title:'No terms of service detected', desc:'Terms of Service not found. Recommended for all commercial websites.', reg:'Best practice' })
    if (!hasSecurityHeaders) issues.push({ sev:'Low', title:'Missing security HTTP headers', desc:'No security headers (X-Frame-Options, CSP, X-Content-Type-Options) found.', reg:'GDPR Art. 32' })

    const highCount = issues.filter(i => i.sev === 'High').length
    const medCount  = issues.filter(i => i.sev === 'Medium').length
    const lowCount  = issues.filter(i => i.sev === 'Low').length
    const score     = Math.max(0, Math.min(100, 100 - highCount * 15 - medCount * 8 - lowCount * 3))

    const result = {
      url: finalUrl, score, isHttps, trackers, issues, isSpa,
      checks: { https:isHttps, hsts:hasHsts, privacyPolicy:hasPrivacyLink, cookieBanner:hasCookieBanner, cookieReject:hasCookieReject, termsOfService:hasTerms, lawfulBasis:hasLawfulBasis, dataRights:hasDataRights, retentionPolicy:hasRetentionPolicy, dsarContact:hasDsarContact, dpo:hasDpo, securityHeaders:hasSecurityHeaders, subprocessorsList:hasSubprocessors, accessibilityStatement:hasAccessibility },
      consentPlatform: detectedPlatform || null,
      scannedAt: new Date().toISOString(),
      note: isSpa ? 'This site uses a JavaScript framework — sub-pages were also scanned for accuracy.' : undefined,
    }

    // Save scan + track activity (fire-and-forget)
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
