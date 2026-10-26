import { cookies } from 'next/headers';
import { getCollection, trackActivity, parseUserCookie } from '@/lib/dbHelpers';
import { createHash } from 'crypto';

// JavaScript-only sites are loaded in a real browser, which takes longer
export const maxDuration = 60

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

// Drop the body of base64 data URIs (embedded images/fonts), keeping "data:"
function stripDataUris(html) {
  return (html || '').replace(/data:[a-z0-9.+\/-]+;base64,[A-Za-z0-9+\/=]+/gi, 'data:')
}

// Remove scripts/styles/tags so policy checks only see human-readable text
function visibleText(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&amp;|&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// The page as blocks of text (paragraphs, list items, headings...)
function textBlocks(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/?(p|div|li|ul|ol|h[1-6]|section|article|aside|header|footer|nav|main|tr|td|th|table|dt|dd|dl|blockquote|figure|figcaption|dialog|form)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#\d+;|&[a-z]+;/gi, ' ')
    .split('\n')
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}
const blockKey = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// The policy itself, without the site's menus, footer and cookie banner.
// Anything that also appears on the homepage is page furniture, not policy:
// a footer link to LinkedIn or a "cookies from Google" banner does not mean
// the policy names LinkedIn or Google.
function policyBody(html, homeHtmls = []) {
  const home = new Set(homeHtmls.flatMap(textBlocks).map(blockKey))
  const keep = h => textBlocks(h).filter(b => !home.has(blockKey(b))).join('\n')
  const full = visibleText(html)
  const body = keep((html || '').replace(/<(header|nav|footer)\b[\s\S]*?<\/\1>/gi, '\n'))
  // Unusual markup (e.g. the whole page inside <header>): only drop shared text
  return body.length >= full.length * 0.4 ? body : keep(html)
}

const PRIVACY_PATH = /privacy|data-protection|data-privacy|personal-data|gdpr|your-data|data-rights|ccpa|california/i
// Footer/nav links worth following: policy and legal pages are often at paths
// we would never guess (e.g. /website-verification/policy), so we use the
// site's own links as well as the fixed list of common paths.
const LEGAL_LINK    = /privacy|data[\s_-]?protection|personal[\s_-]?data|gdpr|cookie|terms|conditions|legal|polic(y|ies)|disclaimer/i
const TERMS_PATH    = /\/(terms|tos|terms-of-service|terms-and-conditions|terms-of-use|conditions|legal\/terms|legal\/terms-of-service|policies\/terms)\/?$/i
// For linked pages, "privacy" anywhere in the address is not enough (a blog post
// at /blog/privacy-tips is not a policy), so the last part of the path must be
// policy-like, or the page title must say it is a privacy policy/notice
const PRIVACY_SLUG  = /\/(privacy|privacy[-_]?(policy|notice|statement|center|centre)|data[-_]?(protection|privacy)([-_]?(policy|notice))?|personal[-_]?data|gdpr([-_]?policy)?|your[-_]?data|data[-_]?rights)\/?$/i
const TERMS_TITLE   = /terms[\s_-]*(of[\s_-]*(service|use|business|sale)|and[\s_-]*conditions|&(amp;)?[\s_-]*conditions)|conditions of (use|sale|service)|user agreement/i
const CONTENT_PATH  = /\/(blog|news|articles?|posts?|insights|resources|guides?|stories)\//i
const PRIVACY_TITLE = /privacy|data protection|personal (data|information)/i
const LEGAL_TITLE   = /terms|conditions|polic(y|ies)|legal|agreement|disclaimer/i
const NOT_FOUND     = /not found|\b404\b|page (doesn.?t|does not) exist|can.?t be found|cannot be found/i

// The page's <title> and first <h1>, as plain text
function pageHeading(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''
  const h1    = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || ''
  return visibleText(title + ' | ' + h1)
}

// Links whose text or address says they lead to a privacy policy / terms.
// Phrases like "your privacy" in ordinary text are not links and don't count.
const PRIVACY_LINK_TEXT = /privacy\s*(policy|notice|statement|centre|center|&\s*cookies|and cookies)|^\s*privacy\s*$|data\s*protection\s*(policy|notice|statement)|datenschutz/i
// The address must end in a policy-style page name (so /blog/privacy-tips
// doesn't count), or point to a known hosted-policy service
const PRIVACY_LINK_HREF = /\/(privacy|privacy[-_]?(policy|notice|statement|center|centre)|privacy[-_]?and[-_]?cookies?([-_]?policy)?|data[-_]?(protection|privacy)([-_]?(policy|notice))?|datenschutz(erklaerung)?|gdpr([-_]?policy)?)(\.(html?|php|aspx?))?\/?(\?.*)?$/i
const POLICY_HOSTS = /(^|\.)(termly\.io|iubenda\.com|privacypolicies\.com|termsfeed\.com|freeprivacypolicy\.com|getterms\.io|privacy\.microsoft\.com|policies\.google\.com)$/i
const TERMS_LINK_TEXT = /terms|conditions|t\s*&\s*cs?\b|user agreement|terms of business/i
const TERMS_LINK_HREF = /\/(terms|tos|terms[-_]?of[-_]?(service|use|business)|terms[-_]?(and|&)?[-_]?conditions|conditions|legal\/terms|policies\/terms)(\.(html?|php|aspx?))?\/?(\?.*)?$/i
function linksMatching(html, textRe, hrefRe) {
  const out = []
  const re = /<a\b[^>]*?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(html || '')) && out.length < 20) {
    const href = m[1].trim()
    if (!href || href.startsWith('#') || /^(javascript|mailto|tel):/i.test(href)) continue
    const text = visibleText(m[2])
    let path = href, host = ''
    try { const u = new URL(href, 'https://site.invalid'); path = u.pathname + u.search; host = u.hostname } catch {}
    if (CONTENT_PATH.test(path + '/')) continue // a blog post about privacy is not a policy
    if (textRe.test(text) || hrefRe.test(path) || (hrefRe === PRIVACY_LINK_HREF && POLICY_HOSTS.test(host))) out.push({ href, text: text.slice(0, 60) })
  }
  return out
}

function pathOf(url) {
  try { return new URL(url).pathname.replace(/\/+$/, '') || '/' } catch { return '' }
}

// What a footer link claims to be, from its address and text
function linkKind(s) {
  if (/privacy|data[\s_-]?protection|personal[\s_-]?data|gdpr/i.test(s)) return 'privacy'
  if (/terms|conditions/i.test(s)) return 'terms'
  return 'other'
}

// Same-site links whose address or link text looks like a policy/legal page
function findLegalLinks(mainHtml, pageUrl, limit = 8) {
  const out = []
  let origin
  try { origin = new URL(pageUrl).origin } catch { return out }
  const re = /<a\b[^>]*?href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let m
  while ((m = re.exec(mainHtml || '')) && out.length < limit) {
    const href = m[1]
    const text = visibleText(m[2])
    if (!LEGAL_LINK.test(href) && !LEGAL_LINK.test(text)) continue
    let u
    try { u = new URL(href, pageUrl) } catch { continue }
    if (u.origin !== origin) continue
    if (/\.(pdf|png|jpe?g|gif|svg|webp|zip|docx?)$/i.test(u.pathname)) continue
    if (CONTENT_PATH.test(u.pathname + '/')) continue // articles about privacy are not policies
    const p = u.pathname.replace(/\/+$/, '') || '/'
    if (p === '/' || out.some(l => l.path === p)) continue
    out.push({ path: p, kind: linkKind(href + ' ' + text) })
  }
  return out
}

// A page whose HTML is only an empty JavaScript app shell (e.g. a React app
// showing "You need to enable JavaScript to run this app"): the content only
// appears after scripts run in a browser, so this scan cannot read it
function isJsShell(html) {
  const h = html || ''
  if (!/<script[\s>]/i.test(h)) return false
  const text = visibleText(h.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ').replace(/<title[\s\S]*?<\/title>/gi, ' '))
  const mount = /<div[^>]+id=["'](root|app|__next|__nuxt|svelte)["'][^>]*>\s*<\/div>/i.test(h)
  const needsJs = /enable javascript to run this app|requires? javascript|please enable javascript/i.test(h)
  return text.length < 200 && (mount || needsJs)
}

// Bot-protection screens and refusals are not the real page
const BLOCK_PAGE = /<title>\s*(just a moment|attention required|access denied|request rejected|pardon our interruption)|window\._cf_chl_opt|sorry, you have been blocked|_Incapsula_Resource/i
function isBlocked(res) {
  return !!res?.ok && ([401, 403, 429, 503].includes(res.status) || BLOCK_PAGE.test((res.text || '').slice(0, 30000)))
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// One retry for a page that was briefly unavailable or rate-limited
async function fetchWithRetry(url, timeoutMs) {
  let r = await fetchPage(url, timeoutMs)
  if (!r.ok || r.status === 429 || r.status === 503) {
    await sleep(800)
    r = await fetchPage(url, timeoutMs)
  }
  return r
}

const TERMS_FALLBACK = ['/terms', '/terms-of-service', '/terms-and-conditions', '/terms-of-use', '/legal', '/legal/terms', '/legal/terms-of-service', '/policies/terms']

async function fetchSubPages(baseUrl, mainHtml = '', pageUrl = baseUrl, opts = {}) {
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
  const pageOrigin = (() => { try { return new URL(pageUrl).origin } catch { return origin } })()
  const fixed = new Set(paths)
  const legalLinks = findLegalLinks(mainHtml, pageUrl)
  const linkKinds = new Map(legalLinks.map(l => [l.path, l.kind]))
  // "linked" pages are judged a little more strictly (see privacyByPath)
  const linkedOnly = new Set(legalLinks.map(l => l.path).filter(p => !fixed.has(p)))

  // Many sites (SPAs, catch-all routers) answer 200 for every path and just
  // return the homepage. Drop those "soft 404" pages so they are not mistaken
  // for a real privacy policy.
  const mainSig = visibleText(mainHtml).slice(0, 600)
  const rawSig = opts.rawMainHtml ? visibleText(opts.rawMainHtml).slice(0, 600) : ''
  const pages = []
  // Privacy/terms links on the homepage that lead to "page not found"
  const broken = { privacy: [], terms: [] }
  let blocked = 0
  const take = (list, results) => results.forEach((r, i) => {
    const path = list[i]
    const v = r.status === 'fulfilled' ? r.value : null
    if (isBlocked(v)) { blocked++; return } // bot protection, not the real page
    const kind = linkKinds.get(path)
    if (kind === 'privacy' || kind === 'terms') {
      if (v?.ok && (v.status === 404 || v.status === 410 || (v.status < 400 && NOT_FOUND.test(pageHeading(v.text || '')))))
        broken[kind].push(path)
    }
    if (!v?.ok || v.status >= 400) return
    const html = v.text
    if (!html || html.length < 300) return
    const vis = visibleText(html)
    if (vis.length < 200) return
    if (mainSig.length > 200 && vis.slice(0, 600) === mainSig) return // same as homepage
    if (rawSig.length > 200 && vis.slice(0, 600) === rawSig) return
    const heading = pageHeading(html)
    if (NOT_FOUND.test(heading)) return // a "page not found" page served with status 200
    pages.push({ path, finalPath: pathOf(v.finalUrl), html, vis, heading, linked: linkedOnly.has(path) })
  })

  // A page counts as a privacy policy if its web address or its title says so,
  // and its content reads like one
  const isPrivacyHeading = h => PRIVACY_TITLE.test(h) && /polic|notice|statement|charter/i.test(h)
  const privacyByPath = pg => pg.linked
    ? PRIVACY_SLUG.test(pg.path) || PRIVACY_SLUG.test(pg.finalPath)
    : PRIVACY_PATH.test(pg.path) // fixed list: unchanged behaviour
  // Terms are often published under another name (e.g. "No Guarantee Policy" at
  // /terms), so a real page at a terms-style address counts, as does a linked
  // page titled as terms or conditions
  const classify = () => ({
    policyPages: pages.filter(pg =>
      (privacyByPath(pg) || isPrivacyHeading(pg.heading)) &&
      /privacy|personal (data|information)|data protection/i.test(pg.vis) && pg.vis.length > 800),
    termsPages: pages.filter(pg =>
      (TERMS_PATH.test(pg.path) || TERMS_PATH.test(pg.finalPath) || (pg.linked && TERMS_TITLE.test(pg.heading))) &&
      LEGAL_TITLE.test(pg.heading + ' ' + pg.vis.slice(0, 300))),
  })

  // 1. The site's own policy links first. That is usually only a few requests,
  //    so bot protection is rarely triggered and results stay the same between scans.
  const legalPaths = legalLinks.map(l => l.path)
  // In the browser only privacy and terms pages are loaded (each load is slow)
  const phase1 = opts.render
    ? (legalLinks.some(l => l.kind !== 'other') ? legalLinks.filter(l => l.kind !== 'other') : legalLinks).slice(0, 3).map(l => l.path)
    : legalPaths
  const getPage = opts.render ? (u => opts.render(u)) : (u => fetchWithRetry(u, 8000))
  const phase1Results = await Promise.allSettled(phase1.map(p => getPage(pageOrigin + p)))
  take(phase1, phase1Results)
  let { policyPages, termsPages } = classify()

  // Privacy/terms pages whose text only appears with JavaScript (e.g. an
  // embedded policy tool): open them in the browser once more
  let reRendered = []
  if (opts.renderThin && !opts.render) {
    const got = new Set(pages.map(pg => pg.path))
    const brokenPaths = new Set([...broken.privacy, ...broken.terms])
    reRendered = phase1.filter((p, i) => {
      const kind = linkKinds.get(p)
      const v = phase1Results[i].status === 'fulfilled' ? phase1Results[i].value : null
      return (kind === 'privacy' || kind === 'terms') && !got.has(p) && !brokenPaths.has(p) && !isBlocked(v) && v?.ok && v.status < 400
    }).slice(0, 2)
    if (reRendered.length) {
      take(reRendered, await Promise.allSettled(reRendered.map(p => opts.renderThin(pageOrigin + p))))
      ;({ policyPages, termsPages } = classify())
    }
  }

  // 2. Only if those links gave no privacy policy (or no terms), guess common
  //    addresses. Skipped if the site is already refusing our requests.
  const tried = new Set(phase1)
  const fallback = policyPages.length === 0 ? paths : termsPages.length === 0 ? TERMS_FALLBACK : []
  // Guessing addresses is skipped for browser-loaded sites: a JavaScript app
  // answers every address with the same shell, and each browser load is slow
  const phase2 = (blocked > 0 || opts.render) ? [] : fallback.filter(p => !tried.has(p))
  if (phase2.length) {
    const b1 = phase2.slice(0, 16).map(p => fetchPage(origin + p, 6000))
    const b2 = phase2.slice(16).map(p => fetchPage(origin + p, 5000))
    const [r1, r2] = await Promise.all([Promise.allSettled(b1), Promise.allSettled(b2)])
    take(phase2, [...r1, ...r2])
    ;({ policyPages, termsPages } = classify())
  }

  return {
    text: pages.map(pg => pg.html).join('\n'),
    policyText: policyPages.map(pg => pg.vis).join('\n'),
    policyBody: policyPages.map(pg => policyBody(pg.html, [mainHtml, opts.rawMainHtml].filter(Boolean))).join('\n'),
    policyPaths: policyPages.map(pg => pg.path),
    termsPaths: termsPages.map(pg => pg.path),
    brokenPrivacyLinks: broken.privacy,
    brokenTermsLinks: broken.terms,
    blockedCount: blocked,
    requestCount: phase1.length + phase2.length,
    reRendered,
  }
}

function detect(text, patterns) {
  return patterns.some(p => (typeof p === 'string' ? text.toLowerCase().includes(p.toLowerCase()) : p.test(text)))
}

export async function POST(request) {
  const startedAt = Date.now()
  const { url } = await request.json()
  if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })
  let targetUrl = url.trim()
  // Strip protocol if present, then rebuild cleanly
  let clean = targetUrl.replace(/^https?:\/\//i,'').replace(/^www\./i,'').split('/')[0]
  // If bare name with no dots (e.g. "algograss"), try to resolve it
  if (!clean.includes('.')) {
    const tlds = ['.com','.co.uk','.co','.org','.net','.io']
    let resolved = null
    const UA2 = 'Mozilla/5.0 (compatible; AlgoGrass-Scanner/1.0)'
    for (const tld of tlds) {
      try {
        const ctrl = new AbortController(); setTimeout(()=>ctrl.abort(),4000)
        const r = await fetch(`https://www.${clean}${tld}`,{method:'HEAD',signal:ctrl.signal,headers:{'User-Agent':UA2},redirect:'follow',cache:'no-store'})
        if (r.status < 500 && r.status !== 404) { resolved = r.url || `https://www.${clean}${tld}`; break }
      } catch {}
      try {
        const ctrl = new AbortController(); setTimeout(()=>ctrl.abort(),4000)
        const r = await fetch(`https://${clean}${tld}`,{method:'HEAD',signal:ctrl.signal,headers:{'User-Agent':UA2},redirect:'follow',cache:'no-store'})
        if (r.status < 500 && r.status !== 404) { resolved = r.url || `https://${clean}${tld}`; break }
      } catch {}
    }
    targetUrl = resolved || `https://www.${clean}.com`
  } else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl
  }

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  try {
    let mainResult = await fetchPage(targetUrl)
    // Rate-limited or shown a bot-protection screen: wait and try once more
    if (mainResult.ok && (mainResult.status === 429 || mainResult.status === 503 || isBlocked(mainResult))) {
      await sleep(1500)
      mainResult = await fetchPage(targetUrl)
    }
    // Never score a refusal or error page as if it were the website
    if (mainResult.ok && (isBlocked(mainResult) || mainResult.status >= 400)) {
      await trackActivity({ userEmail: user?.email, tool: 'scan', action: 'scan_blocked', detail: `${targetUrl} (HTTP ${mainResult.status})` })
      const error = mainResult.status === 404
        ? 'That page could not be found. Please check the URL and try again.'
        : 'This website blocked our automated scan (many sites use bot protection). Please try again in a few minutes. If it keeps happening, the site blocks automated checks, so we cannot give an accurate result.'
      return Response.json({ error, blocked: true }, { status: 422 })
    }
    // Open the homepage in a real browser, the way a visitor sees it: this
    // shows which trackers actually load, which cookies are set before anyone
    // clicks, and what the cookie banner offers. A plain download is the
    // fallback if the browser can't load the page. For an empty JavaScript
    // shell the browser is the only way to read the site at all.
    const rawMainHtml = mainResult.text
    const jsShell = mainResult.ok && isJsShell(mainResult.text)
    let renderer = null
    let renderedInBrowser = false
    let browserRequests = []
    let browserCookies = []
    let browserCookieDetails = []
    let banner = null
    if (mainResult.ok && !process.env.SCAN_DISABLE_BROWSER) {
      try {
        const { createRenderer } = await import('@/lib/renderPage')
        renderer = await createRenderer({ deadline: startedAt + 40000 })
        const r = await renderer.render(mainResult.finalUrl || targetUrl, { probe: true })
        if (r.ok && r.status < 400 && !isBlocked(r) && !isJsShell(r.text)) {
          // Use the page as the browser shows it, unless it somehow shows much
          // less than the plain download (keep the original headers either way)
          if (jsShell || visibleText(r.text).length >= visibleText(mainResult.text).length * 0.8)
            mainResult = { ...mainResult, text: r.text, finalUrl: r.finalUrl || mainResult.finalUrl }
          browserRequests = r.requests || []
          browserCookies = r.cookies || []
          browserCookieDetails = r.cookieDetails || []
          banner = r.banner || null
          renderedInBrowser = true
        }
      } catch (e) {
        console.error('scan: browser load failed', e?.message || e)
      }
    }
    if (jsShell && !renderedInBrowser) {
      if (renderer) await renderer.close()
      await trackActivity({ userEmail: user?.email, tool: 'scan', action: 'scan_js_only', detail: targetUrl })
      return Response.json({
        error: "This website builds its pages with JavaScript in the browser, and we couldn't load it in our browser this time. Please try again in a minute. Rather than guess, we haven't given it a score.",
        jsOnly: true,
      }, { status: 422 })
    }
    let sub
    try {
      const subOpts = { rawMainHtml }
      if (renderedInBrowser && jsShell) subOpts.render = u => renderer.render(u)
      else if (renderedInBrowser) subOpts.renderThin = u => renderer.render(u)
      sub = mainResult.ok
        ? await fetchSubPages(targetUrl, mainResult.text, mainResult.finalUrl, subOpts)
        : { text: '', policyText: '', policyBody: '', policyPaths: [], termsPaths: [], brokenPrivacyLinks: [], brokenTermsLinks: [], blockedCount: 0, requestCount: 0, reRendered: [] }
    } finally {
      if (renderer) await renderer.close()
    }
    const subText = sub.text
    if (!mainResult.ok) {
      await trackActivity({ userEmail: user?.email, tool: 'scan', action: 'scan_failed', detail: targetUrl })
      return Response.json({ error: 'Could not reach that website. Please check the URL and try again.' }, { status: 400 })
    }

    const mainHtml = mainResult.text
    const finalUrl = mainResult.finalUrl

    // Extract inline JS and script src references so tracker detection works
    // on JS-rendered (Next.js / React / Vue / Nuxt) sites that inject scripts
    // at runtime rather than embedding them in the initial HTML body.
    // Embedded images and fonts (base64 data URIs) are long runs of random
    // letters that can contain short tracker IDs by pure chance (e.g. "CHJid"
    // matching Hotjar's "hjid"), so they are removed before detection.
    const scanHtml      = stripDataUris(mainHtml)
    const inlineScripts = (scanHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || []).join('\n')
    const scriptSrcs    = (scanHtml.match(/src=["']([^"']+\.js[^"']*)/gi) || []).join('\n')
    const jsContent     = inlineScripts + '\n' + scriptSrcs
    // Combined text used for all tracker / banner detection
    const allScanText  = scanHtml + '\n' + jsContent + (browserRequests.length ? '\n' + browserRequests.join('\n') : '')

    const allText  = mainHtml + '\n' + subText
    // Separate privacy-specific content (more strict matching within sub-pages)
    // Only text from pages that really look like a privacy policy counts.
    const privacyText = sub.policyText
    const hasReadPrivacyPage = privacyText.length > 1000 // we actually read a real policy
    // Policy-content checks (lawful basis, rights, retention...) must be run
    // against the policy itself when we have it, not the marketing homepage.
    const policyScope = hasReadPrivacyPage ? privacyText : allText

    // ─── HTTPS ───────────────────────────────────────────────────────────────
    const isHttps         = finalUrl.startsWith('https://')
    const hasHsts         = mainResult.headers.get('strict-transport-security') !== null

    // ─── PRIVACY POLICY ──────────────────────────────────────────────────────
    // The site links to a privacy policy, but the page shows "page not found"
    // and no working policy was found anywhere else
    const privacyLinkBroken = sub.brokenPrivacyLinks.length > 0 && sub.policyPaths.length === 0
    // A privacy policy counts if we read one, or the homepage links to one
    // (on this site or a policy service). Words like "your privacy" in
    // ordinary text don't count.
    const privacyLinks = linksMatching(mainHtml, PRIVACY_LINK_TEXT, PRIVACY_LINK_HREF)
    const hasPrivacyLink  = (sub.policyPaths.length > 0 || privacyLinks.length > 0) && !privacyLinkBroken

    // ─── COOKIE CONSENT ──────────────────────────────────────────────────────
    const COMPLIANT_PLATFORMS = [
      'cookieyes','cookiebot','onetrust','trustarc','quantcast','borlabs-cookie',
      'complianz','usercentrics','didomi','axeptio','iubenda','termly',
      'secureprivacy','cookieinformation','civic','silktide','consentmanager',
      'klaro','osano','cookie-script','cookiehub','privy','algograss-cookie-consent',
      'osano','admiral','crownpeak','evidon','sourcepoint','bigcommerce-cookie',
    ]
    const detectedPlatform = COMPLIANT_PLATFORMS.find(p => allScanText.toLowerCase().includes(p))
    const rejectControlPatterns = [
      /data-reject-all="true"/i,
      /reject[\s_-]?all/i, /reject[\s_-]?cookies/i, 'rejectAll', 'reject-all', 'reject_all',
      /decline[\s_-]?(all[\s_-]?)?cookies/i, /refuse[\s_-]?cookies/i,
      /necessary[\s_-]?only/i, /essential[\s_-]?only/i,
      /manage[\s_-]?preferences/i, /cookie[\s_-]?settings/i,
      /customise[\s_-]?cookies/i, /customize[\s_-]?cookies/i,
      /decline[\s_-]?all/i,
      /only (necessary|essential|required) cookies/i,
    ]
    // A real button labelled just "Reject", "Decline", "Deny" or "Refuse",
    // looked for in the page markup only (not inside scripts)
    const markupOnly = scanHtml.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ')
    const hasRejectButton = /<button\b[^>]*>\s*(reject|decline|deny|refuse)(\s+all)?\s*<\/button>/i.test(markupOnly) ||
      /<[a-z]+\b[^>]*role=["']button["'][^>]*>\s*(reject|decline|deny|refuse)(\s+all)?\s*<\/[a-z]+>/i.test(markupOnly)
    const hasCookieRejectSignal = hasRejectButton || detect(allScanText, rejectControlPatterns)
    // A page can only offer a "reject all" / "manage preferences" control if a
    // cookie banner exists to attach it to — so finding one of those controls
    // is itself proof of a banner, even if the banner's own wrapper text
    // (e.g. a bespoke, non-third-party implementation like Google's own
    // consent screen) doesn't match the phrase list below.
    const regexCookieBanner = !!detectedPlatform || hasCookieRejectSignal || detect(allScanText, [
      /cookie[\s_-]?(banner|notice|consent|bar|popup|modal|wall|dialog|overlay)/i,
      'cookie-consent', 'cookieconsent', 'cookie_consent', 'cookie_banner',
      /gdpr[\s_-]?consent/i, /acceptcookies/i,
      /we use cookies/i, /this (site|website|we) use[s]? cookies/i,
      'cookie-law', 'cookie-notice', /manage[\s_-]?(my[\s_-]?)?cookie/i,
      'cookie preferences', 'cookie settings', 'cookie choices',
      /by (using|continuing|browsing|clicking).{0,60}(cookies|consent)/i,
      // Bespoke/in-house consent screens (e.g. Google's own implementation)
      // often skip generic "cookie banner" phrasing entirely in favour of
      // wording like this:
      /before you continue/i,
      /we use cookies and data/i,
      /use cookies and data to/i,
      /cookies and similar technologies/i,
      /consent to (our|the) use of cookies/i,
    ])
    const hasCookieBanner = !!(banner && banner.found) || regexCookieBanner
    const regexCookieReject = !!detectedPlatform || hasCookieRejectSignal
    // The banner a visitor actually sees, and its buttons (from the browser)
    const seenBanner = banner && banner.found ? banner : null
    const hasCookieReject  = seenBanner ? !!seenBanner.hasReject : regexCookieReject

    // ─── TERMS ───────────────────────────────────────────────────────────────
    const termsLinkBroken = sub.brokenTermsLinks.length > 0 && sub.termsPaths.length === 0
    // Terms count if we found a terms page, or the homepage links to one.
    // A privacy policy that mentions "terms of use" doesn't count.
    const termsLinks = linksMatching(mainHtml, TERMS_LINK_TEXT, TERMS_LINK_HREF)
    const hasTerms        = (sub.termsPaths.length > 0 || termsLinks.length > 0) && !termsLinkBroken

    // ─── LAWFUL BASIS ────────────────────────────────────────────────────────
    // Only flag if we actually read the privacy policy AND couldn't find it
    const ruleLawfulBasis = detect(policyScope, [
      /lawful[\s_-]?basis/i, /legal[\s_-]?basis/i, /legal[\s_-]?ground/i,
      /legitimate[\s_-]?interest/i, /legal[\s_-]?obligation/i,
      /basis (for|of) processing/i, /grounds (for|of) processing/i,
      /\barticle\s*6\b/i, /\bart\.\s*6\b/i,
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
    const ruleDataRights  = detect(policyScope, [
      /right[\s_-]?to[\s_-]?(access|erasure|deletion|rectification|portability|object|restrict)/i,
      /subject[\s_-]?access[\s_-]?request/i, /data[\s_-]?subject[\s_-]?rights?/i,
      'right to be forgotten', 'article 15', 'article 17', 'article 21',
      /\bart(icle|\.)\s*(1[5-9]|2[0-2])\b/i,
      // Broad synonyms
      'your rights', 'your privacy rights', 'your data rights',
      'individual rights',
      /access (your|to your) (personal )?(data|information)/i,
      /request (a copy|deletion|removal|correction|rectification) of (your )?(personal )?(data|information)/i,
      /delete (your|account|personal) (data|information|account)/i,
      /opt.out (of|from)/i, 'withdraw consent',
      /manage (your )?(data|privacy|preferences|personal information)/i,
      /control (your )?(data|personal information|privacy)/i,
      /data (portability|request|access request)/i,
      /exercise (your|these) rights/i, /submit a (privacy |data )?request/i,
      // CCPA/US rights that also satisfy GDPR transparency
      /right to know/i, /right to delete/i, /right to opt.out/i,
      /california (privacy|consumer)/i, /ccpa/i,
      /you (may|can) (request|ask us|contact us) (to )?(access|delete|correct|update|remove)/i,
      // Rights listed by name, e.g. "rights including access, rectification, erasure"
      /\brights?\s+(including|such as|to|of)\s+(access|rectification|correction|erasure|deletion|portability|restriction|object)/i,
      /\b(access|rectification|correction|erasure|deletion|portability|restriction|objection)\b[^.]{0,60}\b(rectification|correction|erasure|deletion|portability|restriction|objection|object)\b/i,
    ])

    // ─── DATA RETENTION ──────────────────────────────────────────────────────
    // Actual periods ("for 6 years", "Retention: 2 years", "deleted after 30 days")
    const RETENTION_SPECIFIC = [
      /(kept|retained|stored|held|deleted|erased) (for|after|within) (up to )?[0-9]+ (day|month|year)/i,
      /for (up to )?[0-9]+ (day|month|year)s? (after|from|following)/i,
      /\b(keep|kept|retain|retained|store|stored|hold|held|delete|deleted|erase|erased)\b[^.]{0,80}?\b(for|up to|within|after)\s+(a (minimum|maximum) of |at least |up to )?([0-9]+|one|two|three|four|five|six|seven|ten|twelve)\s+(day|week|month|year)s?\b/i,
      /\bretention\b[^.]{0,40}?\b([0-9]+|one|two|three|four|five|six|seven|ten|twelve)\s+(day|week|month|year)s?\b/i,
    ]
    // Retention mentioned only in general terms ("as long as necessary")
    const RETENTION_GENERAL = [
      /retention[\s_-]?period/i,
      /how[\s_-]?long[\s_-]?(we[\s_-]?)?(keep|hold|store|retain)/i,
      /data[\s_-]?retention/i,
      /we keep your data/i, /stored for/i, /retained for/i, /deleted after/i,
      /as long as (is )?(reasonably )?(necessary|needed|required)/i,
      /no longer than (is )?(necessary|needed|required)/i,
      /for (the duration|as long as|the period)/i,
      /we (will )?(store|retain|keep|hold) (and use )?(your |personal )?(data|information) (for|until|as)/i,
      /storage (limitation|period|duration)/i,
      /keep (your |personal )?(data|information) (for|until)/i,
      /minimum (necessary|retention) period/i,
      /we will (delete|remove|erase|destroy) (your |personal )?(data|information)/i,
      /automatically (deleted|removed|erased|purged)/i,
    ]
    const ruleRetentionSpecific = detect(policyScope, RETENTION_SPECIFIC)
    const ruleRetention = ruleRetentionSpecific || detect(policyScope, RETENTION_GENERAL)
    // The sentence that mentions retention, to quote when it is only general
    const retentionSentence = (() => {
      for (const re of RETENTION_GENERAL) {
        const m = re.exec(policyScope)
        if (!m) continue
        const from = Math.max(policyScope.lastIndexOf('. ', m.index) + 2, policyScope.lastIndexOf('\n', m.index) + 1, m.index - 200)
        let to = policyScope.indexOf('. ', m.index + m[0].length); if (to < 0 || to - m.index > 240) to = Math.min(policyScope.length, m.index + 240)
        return policyScope.slice(from, to + 1).replace(/\s+/g, ' ').trim()
      }
      return ''
    })()

    // ─── DSAR CONTACT ────────────────────────────────────────────────────────
    // An email given in the privacy policy for privacy, data protection or
    // rights queries counts, whatever the address is called (e.g. "For all
    // queries regarding data protection, contact Gary at: gary@...")
    const EMAIL = '[\\w.+-]+@[\\w-]+\\.[\\w.-]+'
    const DSAR_TOPIC = '(data protection|privacy|personal (data|information)|your (data )?rights|these rights|exercise|subject access|data request)'
    const policyEmailContact = hasReadPrivacyPage && (
      new RegExp(DSAR_TOPIC + '[^.]{0,200}?' + EMAIL, 'i').test(privacyText) ||
      new RegExp(EMAIL + '[^.]{0,80}?' + DSAR_TOPIC, 'i').test(privacyText))
    const ruleDsarContact = policyEmailContact || detect(policyScope, [
      /dpo@/i, /privacy@/i, /data[\s_-]?protection@/i, /sar@/i, /gdpr@/i,
      /subject[\s_-]?access[\s_-]?request/i,
      /contact[\s_-]?(our[\s_-]?)?dpo/i, 'data protection officer',
      // Broad synonyms
      /contact[\s_-]?us (at|about|regarding) (privacy|data|your (personal|data))/i,
      /privacy (request|form|portal|centre|center)/i,
      /data (request|access) (form|portal|page)/i,
      /submit (a |your )?(privacy|data) request/i,
      /to (exercise|make) (a |your )?request/i,
      /privacy (team|department|office)/i,
      'data request', /request your (data|information)/i,
    ])

    // ─── DPO ─────────────────────────────────────────────────────────────────
    const hasDpo          = detect(policyScope, [
      /data[\s_-]?protection[\s_-]?officer/i, /\bdpo\b/i,
      'data protection representative', 'EU representative', 'UK representative',
    ])

    // ─── POLICY CONTENT, READ BY CLAUDE WITH QUOTED EVIDENCE ──────────────────
    // Each answer must quote the policy, and every quote is checked against
    // the text. A confirmed answer is used; anything uncertain falls back to
    // the rules above and is never reported as a definite failure.
    // The same policy text always gets the same answers: a review is saved
    // and reused until the policy changes, so repeat scans agree.
    let ai = null
    if (hasReadPrivacyPage && Date.now() - startedAt < 46000) {
      try {
        const { reviewPolicy, REVIEW_VERSION } = await import('@/lib/policyReview')
        const reviewKey = createHash('sha256').update(REVIEW_VERSION + '\n' + privacyText).digest('hex')
        let reviews = null
        try {
          reviews = await Promise.race([getCollection('policy_reviews'), new Promise(r => setTimeout(() => r(null), 1500))])
          const saved = reviews ? await Promise.race([reviews.findOne({ _id: reviewKey }), new Promise(r => setTimeout(() => r(null), 1500))]) : null
          if (saved && saved.checks && Date.now() - new Date(saved.createdAt).getTime() < 30 * 864e5)
            ai = { ok: true, checks: saved.checks, model: saved.model, truncated: saved.truncated, saved: true }
        } catch {}
        if (!ai) {
          ai = await reviewPolicy(privacyText, { timeoutMs: 20000, deadline: startedAt + 56000 })
          if (ai.ok && reviews) reviews.updateOne({ _id: reviewKey }, { $set: { checks: ai.checks, model: ai.model, truncated: ai.truncated, createdAt: new Date() } }, { upsert: true }).catch(() => {})
        }
      } catch (e) { ai = { ok: false, reason: 'error' } }
    }
    const aiAnswer = k => (ai && ai.ok && ai.checks[k]) ? ai.checks[k] : { answer: 'unclear', quote: '' }
    const aiUsed = !!(ai && ai.ok)
    const evidence = {}
    // 'pass' | 'fail' (confirmed) | 'unsure'
    const decide = (key, ruleResult, passWords) => {
      const a = aiAnswer(key)
      if (passWords.includes(a.answer)) { evidence[key] = a.quote; return 'pass' }
      if (a.answer === 'no') return 'fail'
      if (aiUsed) return ruleResult ? 'pass' : 'unsure' // AI unsure: rules can still find it, never fail on their own
      return ruleResult ? 'pass' : (hasReadPrivacyPage ? 'fail' : 'unsure') // no AI: previous behaviour
    }
    const lawfulState  = decide('lawful_basis', ruleLawfulBasis, ['yes'])
    const rightsState  = decide('data_rights', ruleDataRights, ['yes'])
    const contactState = decide('request_contact', ruleDsarContact, ['yes'])
    const retentionAnswer = aiAnswer('retention')
    // When the policy was not read by Claude (or Claude was unsure), the rules
    // give the same kind of answer: general wording only counts as "vague"
    const ruleVagueOnly = hasReadPrivacyPage && ruleRetention && !ruleRetentionSpecific && !!retentionSentence
    const retentionVague = retentionAnswer.answer === 'vague' || (!['specific', 'no'].includes(retentionAnswer.answer) && ruleVagueOnly)
    if (retentionVague) evidence.retention = retentionAnswer.answer === 'vague' ? retentionAnswer.quote : retentionSentence
    const retentionState = retentionVague ? 'vague' : decide('retention', ruleRetention, ['specific'])
    const hasLawfulBasis = lawfulState === 'pass'
    const hasDataRights = rightsState === 'pass'
    const hasRetentionPolicy = retentionState === 'pass'
    const hasDsarContact = contactState === 'pass'
    const policyWhere = sub.policyPaths.length ? ` (${sub.policyPaths[0]})` : ''

    // ─── SECURITY HEADERS ────────────────────────────────────────────────────
    const hdr = n => mainResult.headers.get(n)
    const cspHeader = hdr('content-security-policy') || ''
    const missingHeaders = []
    if (!hdr('strict-transport-security')) missingHeaders.push('Strict-Transport-Security')
    if (!hdr('x-content-type-options')) missingHeaders.push('X-Content-Type-Options')
    if (!hdr('x-frame-options') && !/frame-ancestors/i.test(cspHeader)) missingHeaders.push('X-Frame-Options (or CSP frame-ancestors)')
    const hasSecurityHeaders = missingHeaders.length === 0

    // ─── SUBPROCESSORS / DATA SHARING ────────────────────────────────────────
    // A privacy policy that mentions "third parties", "advertising partners", "service providers"
    // OR mentions the tracker brands by name counts as disclosing processors
    const hasSubprocessors = detect(policyScope, [
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
    // Look for real form fields, not CSS: a stylesheet rule like ".contact-form"
    // on a page with no form at all is not a data-collection form
    const formHtml        = scanHtml.replace(/<style[\s\S]*?<\/style>/gi, ' ')
    const hasContactForm  = detect(formHtml, [
      /<form[\s>]/i, /<textarea[\s>]/i, /<input[^>]*type=["']?email/i,
      'wpcf7', 'gravityform', /formspree\.io/i, /typeform\.com/i,
    ])

    // ─── ACCESSIBILITY ───────────────────────────────────────────────────────
    const hasAccessibility = detect(allText, [
      /accessibility[\s_-]?statement/i, 'wcag', 'screen reader',
    ])

    // ─── SPA DETECTION ───────────────────────────────────────────────────────
    const looksLikeSpa = detect(allScanText, [
      /__NEXT_DATA__/i, 'window.__nuxt', '__vue__', 'data-reactroot',
      'id="__next"', 'id="app"', 'id="root"', 'ng-version', 'data-n-head',
      /enable javascript to run this app/i,
      /next\/dist\/client/i, /webpack-runtime/i, /chunks\/main/i,
      /_app-[a-f0-9]+\.js/i, /static\/chunks/i,
    ])
    // If the browser showed us the page, nothing is hidden behind JavaScript
    const isSpa = looksLikeSpa && !renderedInBrowser

    // ─── TRACKERS ────────────────────────────────────────────────────────────
    const trackers = []
    if (detect(allScanText, [/google[\s-]?analytics|googletagmanager|gtag\(|google-analytics/i, /['"](G|UA)-[A-Z0-9]{4,}/])) trackers.push('Google Analytics')
    if (detect(allScanText, [/facebook[\s-]?pixel|fbq\(|connect\.facebook\.net|meta[\s-]?pixel/i]))                          trackers.push('Meta Pixel')
    if (detect(allScanText, [/static\.hotjar\.com|script\.hotjar\.com|_hjSettings|\bhjid\s*:\s*\d/i]))                     trackers.push('Hotjar')
    if (detect(allScanText, [/linkedin[\s-]?insight|snap\.licdn|linkedin\.com\/px/i]))                                        trackers.push('LinkedIn Insight')
    if (detect(allScanText, [/_hsq\s*=|js\.hs-scripts\.com|js\.hubspot\.com|hs-analytics\.net|hubspot\.com\/hs\/hsstatic/i])) trackers.push('HubSpot')
    if (detect(allScanText, [/intercomcdn|widget\.intercom|api-iam\.intercom\.io/i]))                                       trackers.push('Intercom')
    if (detect(allScanText, [/cdn\.mxpnl\.com|api-js\.mixpanel\.com|mixpanel\.init/i]))                                       trackers.push('Mixpanel')
    if (detect(allScanText, [/segment\.com\/analytics|segment\.io\/analytics/i]))                                             trackers.push('Segment')
    if (detect(allScanText, [/analytics\.tiktok\.com|tiktok[\s-]?pixel|ttq\./i]))                                            trackers.push('TikTok Pixel')
    if (detect(allScanText, [/microsoft[\s-]?clarity|clarity\.ms\/tag/i]))                                                   trackers.push('Microsoft Clarity')
    if (detect(allScanText, [/\bpinterest\.com\/ct\//i]))                                                                     trackers.push('Pinterest Tag')
    if (detect(allScanText, [/static\.ads-twitter|ads\.twitter\.com|twq\(|t\.co\/i\//i]))                                    trackers.push('X/Twitter Pixel')
    if (detect(allScanText, [/amplitude\.com\/libs|amplitude\.getInstance/i]))                                                trackers.push('Amplitude')
    if (detect(allScanText, [/posthog\.com\/static|posthog\.init/i]))                                                         trackers.push('PostHog')
    if (detect(allScanText, [/client\.crisp\.chat/i]))                                                                         trackers.push('Crisp Chat')
    if (detect(allScanText, [/sc\.lfeeder\.com|tr\.lfeeder\.com|lftracker\.leadfeeder\.com|lftracker_v1_/i]))                trackers.push('Leadfeeder')
    if (detect(allScanText, [/secure\.leadforensics\.com|\.leadforensics\.com\/js\//i]))                                      trackers.push('Lead Forensics')
    if (detect(allScanText, [/cdn\.heapanalytics\.com|heap\.load\(/i]))                                                       trackers.push('Heap')
    if (detect(allScanText, [/redditstatic\.com\/ads\/pixel|rdt\(\s*['"]init['"]/i]))                                         trackers.push('Reddit Pixel')
    if (detect(allScanText, [/sc-static\.net\/scevent|snaptr\(\s*['"]init['"]/i]))                                            trackers.push('Snap Pixel')

    // ─── COOKIES SET ON FIRST VISIT (real header check, not text matching) ─────
    let setCookieNames = []
    try {
      const raw = typeof mainResult.headers.getSetCookie === 'function' ? mainResult.headers.getSetCookie() : []
      setCookieNames = raw.map(c => c.split('=')[0].trim()).filter(Boolean)
    } catch {}
    for (const n of browserCookies) if (!setCookieNames.includes(n)) setCookieNames.push(n)
    // Known analytics/advertising cookies on the site itself, plus well-known
    // advertising cookies from other domains. Other cookies are listed but
    // never assumed to be tracking.
    const FIRST_PARTY_TRACKING = /^(_ga|_gid|_gat|_fbp|_fbc|_hj|_clck|_clsk|_uet|_pin_|__hs|hubspotutk|ajs_|mp_|_tt_|_ttp|ph_|amp_|_gcl|_lfa$|li_fat_id$|_rdt_uuid$|_scid|_hp2_)/i
    const THIRD_PARTY_TRACKING = [[/doubleclick\.net$/i, /^(IDE|test_cookie|DSID)$/], [/facebook\.com$/i, /^fr$/], [/linkedin\.com$/i, /^(bcookie|lidc|UserMatchHistory|AnalyticsSyncHistory)$/], [/(bing\.com|clarity\.ms)$/i, /^MUID$/], [/tiktok\.com$/i, /^_ttp$/]]
    const siteHost = (() => { try { return new URL(finalUrl).hostname.replace(/^www\./, '') } catch { return '' } })()
    const isFirstParty = d => { const h = (d || '').replace(/^\./, ''); return !h || h === siteHost || h.endsWith('.' + siteHost) || siteHost.endsWith('.' + h) }
    const nonEssentialCookies = []
    for (const n of setCookieNames) if (FIRST_PARTY_TRACKING.test(n) && !browserCookieDetails.some(c => c.name === n && !isFirstParty(c.domain))) nonEssentialCookies.push(n)
    for (const c of browserCookieDetails) {
      const d = (c.domain || '').replace(/^\./, '')
      if (isFirstParty(c.domain)) continue
      if (THIRD_PARTY_TRACKING.some(([dom, name]) => dom.test(d) && name.test(c.name)) && !nonEssentialCookies.includes(c.name)) nonEssentialCookies.push(c.name)
    }

    // ─── BUILD ISSUES ────────────────────────────────────────────────────────
    // Only raise policy-content issues when we actually read privacy policy pages
    // (prevents false positives on JS-heavy or bot-protected sites)
    const issues = []

    // PECR only requires consent for non-essential cookies and tracking. If the
    // scan found no trackers and no non-essential cookies, a missing banner is
    // not a gap, so it is not flagged.
    const cookieConsentNeeded = trackers.length > 0 || nonEssentialCookies.length > 0

    if (!isHttps)
      issues.push({ sev:'High', title:'Website not using HTTPS', desc:'HTTPS is required under GDPR Art. 32 to encrypt data in transit. All modern websites should use HTTPS.', reg:'GDPR Art. 32' })

    // isSpa sites render some/all content client-side after a plain HTTP GET,
    // so a genuinely missing element and an element this scan simply can't
    // see are indistinguishable from "not found in the fetched HTML" alone.
    // Downgrade to Low + a verification note rather than reporting a false High.
    if (!hasCookieBanner && trackers.length > 0) {
      if (isSpa) {
        issues.push({ sev:'Low', title:'Verify cookie consent \u2014 could not confirm on this JS-rendered site', desc:`${trackers.join(', ')} detected, but this site renders content with JavaScript, so a consent banner injected after page load would not appear in this scan. Verify manually that consent is obtained before these trackers fire.`, reg:'ePrivacy / PECR Reg. 6' })
      } else {
        issues.push({ sev:'High', title:'Tracking scripts without cookie consent', desc:`${trackers.join(', ')} detected but no cookie consent banner found in page source. Consent must be obtained before dropping non-essential cookies.`, reg:'ePrivacy / PECR Reg. 6' })
      }
    } else if (!hasCookieBanner && cookieConsentNeeded) {
      if (isSpa) {
        issues.push({ sev:'Low', title:'Could not confirm cookie consent mechanism (JS-rendered site)', desc:'This site renders content with JavaScript, so a cookie banner added after page load would not appear in this scan. Verify manually.', reg:'ePrivacy Reg. 6' })
      } else {
        issues.push({ sev:'Medium', title:'No cookie consent mechanism detected', desc:'No cookie consent banner found. Required under PECR before setting non-essential cookies.', reg:'ePrivacy Reg. 6' })
      }
    } else if (hasCookieBanner && !hasCookieReject && cookieConsentNeeded) {
      if (seenBanner) {
        const offered = seenBanner.buttons.length ? seenBanner.buttons.map(b => `"${b}"`).join(', ') : 'no buttons'
        issues.push({ sev:'Medium', title:'Cookie banner has no Reject option', desc:`Your cookie banner offers ${offered}, but no button to refuse non-essential cookies. ICO guidance says refusing should be as easy as accepting. (${trackers.join(', ')} detected on the site.)`, reg:'ICO Cookie Guidance 2023', evidence: `Banner buttons: ${seenBanner.buttons.join(' | ')}` })
      } else {
        issues.push({ sev:'Medium', title:'Cookie banner may lack a "Reject All" option', desc:'A cookie banner was detected but no "Reject All" button found in page source. ICO 2023 guidance requires this to be as easy as accepting. If your banner is JS-rendered, verify manually.', reg:'ICO Cookie Guidance 2023' })
      }
    }

    // Seen in a real browser: tracking cookies set before the visitor chose anything
    // Which tool each tracking cookie belongs to, so the report says what to fix
    const COOKIE_OWNERS = [[/^(_ga|_gid|_gat)/i, 'Google Analytics'], [/^_gcl|^IDE$|^test_cookie$|^DSID$/i, 'Google Ads'], [/^_fbp|^_fbc|^fr$/i, 'Meta'],
      [/^_hj/i, 'Hotjar'], [/^_clck|^_clsk/i, 'Microsoft Clarity'], [/^_uet|^MUID$/i, 'Microsoft Advertising'], [/^__hs|^hubspotutk/i, 'HubSpot'],
      [/^li_fat_id$|^bcookie$|^lidc$|^UserMatchHistory$|^AnalyticsSyncHistory$/i, 'LinkedIn'], [/^_lfa$/i, 'Leadfeeder'], [/^_tt_|^_ttp/i, 'TikTok'],
      [/^_pin_/i, 'Pinterest'], [/^ajs_/i, 'Segment'], [/^mp_/i, 'Mixpanel'], [/^ph_/i, 'PostHog'], [/^amp_/i, 'Amplitude'], [/^_rdt_uuid$/i, 'Reddit'], [/^_scid/i, 'Snap'], [/^_hp2_/i, 'Heap']]
    const withOwner = n => { const o = COOKIE_OWNERS.find(([re]) => re.test(n)); return o ? `${n} (${o[1]})` : n }
    if (nonEssentialCookies.length > 0 && hasCookieBanner && renderedInBrowser)
      issues.push({ sev:'High', title:'Tracking cookies set before visitors choose', desc:`When we opened your homepage without clicking anything, these tracking cookies were already set: ${nonEssentialCookies.slice(0, 6).map(withOwner).join(', ')}. PECR requires consent before they are set, so your banner should hold them back until a visitor accepts.`, reg:'ePrivacy / PECR Reg. 6', evidence: `Cookies set before any click: ${nonEssentialCookies.map(withOwner).join(', ')}` })

    if (nonEssentialCookies.length > 0 && !hasCookieBanner)
      issues.push({ sev:'High', title:'Tracking cookies set on first visit without a consent banner', desc:`The server set non-essential cookies (${nonEssentialCookies.slice(0,5).join(', ')}) on the very first request, and no cookie consent mechanism was found. PECR requires consent before these are set.`, reg:'ePrivacy / PECR Reg. 6' })

    if (privacyLinkBroken) {
      issues.push({ sev:'High', title:'Privacy policy link is broken', desc:`Your site links to a privacy policy (${sub.brokenPrivacyLinks[0]}), but that page shows "page not found". Visitors cannot read it, so the site effectively has no privacy notice. Required under GDPR Art. 13 & 14.`, reg:'GDPR Art. 13 & 14' })
    } else if (!hasPrivacyLink) {
      if (isSpa) {
        issues.push({ sev:'Low', title:'Could not confirm privacy policy (JS-rendered site)', desc:'No privacy policy link found in the fetched HTML or common URL paths, but this site renders content with JavaScript \u2014 a link added by client-side code would not appear in this scan. Verify manually before treating this as a genuine gap.', reg:'GDPR Art. 13 & 14' })
      } else {
        issues.push({ sev:'High', title:'No privacy policy detected', desc:'No privacy policy found in page source, the site\'s own policy links, or common URL paths. A privacy notice is required under GDPR Art. 13 & 14.', reg:'GDPR Art. 13 & 14' })
      }
    }

    // Each tracker found on the site should be named in the privacy policy
    const TRACKER_NAMES = {
      'Google Analytics': /google/i, 'Meta Pixel': /facebook|\bmeta\b/i, 'Hotjar': /hotjar/i,
      'LinkedIn Insight': /linkedin/i, 'HubSpot': /hubspot/i, 'Intercom': /intercom/i, 'Mixpanel': /mixpanel/i,
      'Segment': /segment/i, 'TikTok Pixel': /tiktok/i, 'Microsoft Clarity': /clarity|microsoft/i,
      'Pinterest Tag': /pinterest/i, 'X/Twitter Pixel': /twitter|\bx corp/i, 'Amplitude': /amplitude/i,
      'PostHog': /posthog/i, 'Crisp Chat': /crisp/i, 'Leadfeeder': /leadfeeder|dealfront/i, 'Lead Forensics': /lead\s?forensics/i,
      'Heap': /\bheap\b/i, 'Reddit Pixel': /reddit/i, 'Snap Pixel': /snap(chat)?\b/i,
    }
    // Names are looked for in the policy itself, not in the site's footer,
    // menus or cookie banner that appear around it
    const policyOwnText = sub.policyBody || privacyText
    const undisclosedTrackers = hasReadPrivacyPage ? trackers.filter(t => !(TRACKER_NAMES[t] || /$^/).test(policyOwnText)) : []
    // Art. 13(1)(e) allows "recipients or categories of recipients", so a
    // policy that covers the type of tool (e.g. "third-party analytics tools")
    // is a smaller gap than one that says nothing at all
    const categoryDisclosed = /(third[\s-]?part(y|ies)|external)[\s-]+(analytics|tracking|advertising|marketing|cookies?)|analytics\s+(tools?|providers?|services?|partners?|cookies?|software|platforms?)|advertising\s+(partners?|networks?|providers?|cookies?)|marketing\s+(partners?|cookies?|tools?|platforms?)|(tracking|performance|statistics?|statistical|analytical)\s+cookies/i.test(policyOwnText)
    const bannerText = seenBanner ? seenBanner.text : ''
    const namedInBanner = t => !!bannerText && (TRACKER_NAMES[t] || /$^/).test(bannerText)
    if (trackers.length > 0 && hasPrivacyLink) {
      if (hasReadPrivacyPage && undisclosedTrackers.length) {
        const list = undisclosedTrackers.join(', '), many = undisclosedTrackers.length > 1
        const coveredSomehow = categoryDisclosed || undisclosedTrackers.every(namedInBanner)
        const how = categoryDisclosed ? ' Your policy mentions this type of tool in general terms, but not by name.'
          : undisclosedTrackers.every(namedInBanner) ? ' Your cookie banner mentions it, but your privacy policy does not.' : ''
        issues.push(coveredSomehow
          ? { sev:'Low', title:'Name your tracking tools in your privacy policy', desc:`${list} ${many ? 'are' : 'is'} used on your site, but ${many ? "they aren't" : "it isn't"} named in your privacy policy${policyWhere}.${how} Naming each tool, what it collects and why makes the policy clear (GDPR Art. 13(1)(e), ICO cookie guidance).`, reg:'GDPR Art. 13(1)(e)', evidence: `Found on your site: ${trackers.join(', ')}. Not named in your policy: ${list}.` }
          : { sev:'Medium', title:'Tracking tools not mentioned in your privacy policy', desc:`${list} ${many ? 'are' : 'is'} used on your site, but your privacy policy${policyWhere} doesn't mention ${many ? 'them' : 'it'}, or analytics and advertising tools at all. GDPR Art. 13(1)(e) requires you to say who receives personal data.`, reg:'GDPR Art. 13(1)(e)', evidence: `Found on your site: ${trackers.join(', ')}. Not named in your policy: ${list}.` })
      } else if (!hasReadPrivacyPage && !hasSubprocessors) {
        issues.push({ sev:'Low', title:'Verify trackers are disclosed in privacy policy', desc:`${trackers.join(', ')} detected. Could not fully read the privacy policy. Verify these are named in it.`, reg:'GDPR Art. 13(1)(e)' })
      }
    }

    if (hasContactForm && !hasPrivacyLink)
      issues.push({ sev:'Medium', title:'Contact form without visible privacy notice', desc:'A data-collection form was detected but no privacy notice found. Required at point of data collection under GDPR Art. 13.', reg:'GDPR Art. 13' })

    // 'fail' = confirmed missing from the policy we read; 'unsure' = we couldn't confirm
    if (hasPrivacyLink && lawfulState === 'fail')
      issues.push({ sev:'Medium', title:'Lawful basis for processing not stated', desc:`We read your privacy policy${policyWhere} and it doesn't say which lawful basis (e.g. consent, contract, legitimate interests) you rely on. GDPR Art. 13(1)(c) requires this for each purpose.`, reg:'GDPR Art. 13(1)(c)' })
    else if (hasPrivacyLink && lawfulState === 'unsure')
      issues.push({ sev:'Low', title:'Verify lawful basis is stated in privacy policy', desc: hasReadPrivacyPage ? 'We read your privacy policy but could not confirm it states the lawful basis for processing. Please check it does.' : 'Could not fully read the privacy policy. Ensure your legal basis for processing is clearly stated.', reg:'GDPR Art. 13(1)(c)' })

    if (hasPrivacyLink && rightsState === 'fail')
      issues.push({ sev:'Medium', title:'Data subject rights not clearly explained', desc:`We read your privacy policy${policyWhere} and it doesn't explain people's rights (access, correction, erasure, objection and so on). GDPR Art. 13(2)(b) requires this.`, reg:'GDPR Art. 13(2)(b)' })
    else if (hasPrivacyLink && rightsState === 'unsure')
      issues.push({ sev:'Low', title:'Verify data subject rights are explained', desc: hasReadPrivacyPage ? 'We read your privacy policy but could not confirm it explains people\'s data rights. Please check it does.' : 'Could not fully read the privacy policy. Ensure all data subject rights under GDPR Art. 15–22 are clearly explained.', reg:'GDPR Art. 13(2)(b)' })

    if (hasPrivacyLink && retentionState === 'vague')
      issues.push({ sev:'Low', title:'Retention periods could be more specific', desc:`Your privacy policy${policyWhere} only describes retention in general terms ("${(evidence.retention || '').slice(0, 160)}"). Stating actual periods, or the criteria for each type of data, meets GDPR Art. 13(2)(a) more clearly.`, reg:'GDPR Art. 13(2)(a)', evidence: evidence.retention })
    else if (hasPrivacyLink && retentionState === 'fail')
      issues.push({ sev:'Medium', title:'Data retention periods not specified', desc:`We read your privacy policy${policyWhere} and it doesn't say how long personal data is kept. GDPR Art. 13(2)(a) requires this.`, reg:'GDPR Art. 13(2)(a)' })
    else if (hasPrivacyLink && retentionState === 'unsure')
      issues.push({ sev:'Low', title:'Verify data retention periods are stated', desc: hasReadPrivacyPage ? 'We read your privacy policy but could not confirm it says how long data is kept. Please check it does.' : 'Could not fully read the privacy policy. Ensure data retention periods are clearly stated for each category of personal data.', reg:'GDPR Art. 13(2)(a)' })

    if (hasPrivacyLink && hasReadPrivacyPage && contactState === 'fail')
      issues.push({ sev:'Low', title:'No clear DSAR contact method found', desc:`We read your privacy policy${policyWhere} and couldn't find an email, form or address for privacy questions or data requests. Make it easy for people to contact you about their data.`, reg:'GDPR Art. 12' })

    if (termsLinkBroken)
      issues.push({ sev:'Low', title:'Terms link is broken', desc:`Your site links to terms (${sub.brokenTermsLinks[0]}), but that page shows "page not found". Fix the link or publish the page.`, reg:'Best practice' })
    else if (!hasTerms)
      issues.push({ sev:'Low', title:'No terms of service detected', desc:'No terms page found in the site\'s own links or common URL paths. Recommended for all commercial websites.', reg:'Best practice' })

    if (!hasSecurityHeaders)
      issues.push({ sev:'Low', title:'Missing HTTP security headers', desc:`Your site doesn't send: ${missingHeaders.join(', ')}. These protect visitors from common attacks and show appropriate security measures under GDPR Art. 32.${cspHeader ? '' : ' A Content-Security-Policy is also recommended.'}`, reg:'GDPR Art. 32', evidence: `Missing: ${missingHeaders.join(', ')}` })

    // ─── SCORING ─────────────────────────────────────────────────────────────
    const highCount = issues.filter(i => i.sev === 'High').length
    const medCount  = issues.filter(i => i.sev === 'Medium').length
    const lowCount  = issues.filter(i => i.sev === 'Low').length
    const score     = Math.max(0, Math.min(100, 100 - highCount * 15 - medCount * 7 - lowCount * 2))

    // ─── NOTE ────────────────────────────────────────────────────────────────
    let note = 'This is an automated scan of publicly visible HTML. JS-rendered content, authenticated areas, and dynamically loaded privacy policies may not be fully captured.'
    if (isSpa) note = 'This site uses a JavaScript framework. Content rendered after page load (including some cookie banners and privacy policy text) may not be captured in this scan.'
    const scannedFrom = process.env.VERCEL_REGION || null
    if (renderedInBrowser) note = `AlgoGrass opened your homepage in a real browser${scannedFrom === 'lhr1' ? ' in London, as a UK visitor would see it,' : ', as a visitor would,'} and recorded the trackers and cookies it loads before anyone clicks.`
    if (renderedInBrowser && jsShell) note += ' This site builds its pages with JavaScript, so its policy pages were also read in the browser.'
    if (aiUsed) note += ' Your privacy policy was read in full, and each finding about it is based on a quote from the policy.'
    if (hasReadPrivacyPage && !aiUsed) note += ' Policy content checks were run against the privacy policy page itself.'
    if (!hasReadPrivacyPage && hasPrivacyLink) note += ' Privacy policy pages could not be fully read — some checks may be marked Low severity as a result.'
    if (sub.blockedCount > 0) note += ' Some pages on this site refused automated access, so a few checks may be incomplete.'

    const result = {
      url: finalUrl, score, isHttps, trackers, issues, isSpa, renderedInBrowser,
      evidence, aiPolicyReview: aiUsed ? { model: ai.model, saved: !!ai.saved } : (ai ? { skipped: ai.reason } : null),
      cookieBannerSeen: seenBanner ? { text: seenBanner.text, buttons: seenBanner.buttons } : null,
      trackingCookiesBeforeConsent: nonEssentialCookies,
      securityHeadersMissing: missingHeaders,
      checks: {
        https: isHttps, hsts: hasHsts, privacyPolicy: hasPrivacyLink,
        privacyLinkBroken, termsLinkBroken,
        // No trackers or non-essential cookies means no consent is needed, so these pass
        cookieBanner: hasCookieBanner || !cookieConsentNeeded,
        cookieReject: hasCookieReject || !cookieConsentNeeded,
        cookieConsentNeeded,
        cookieBannerFound: hasCookieBanner, cookieRejectFound: hasCookieReject,
        termsOfService: hasTerms, lawfulBasis: hasLawfulBasis,
        dataRights: hasDataRights, retentionPolicy: hasRetentionPolicy,
        dsarContact: hasDsarContact, dpo: hasDpo,
        securityHeaders: hasSecurityHeaders, subprocessorsList: hasSubprocessors,
        // No trackers found means there is nothing to disclose, so this passes
        trackersDisclosed: trackers.length === 0 ? true : (hasReadPrivacyPage ? undisclosedTrackers.length === 0 : hasSubprocessors),
        policyPageRead: hasReadPrivacyPage,
        accessibilityStatement: hasAccessibility,
      },
      consentPlatform: detectedPlatform || null,
      cookiesSetOnFirstVisit: setCookieNames,
      policyPagesRead: sub.policyPaths,
      termsPagesFound: sub.termsPaths,
      brokenPolicyLinks: [...sub.brokenPrivacyLinks, ...sub.brokenTermsLinks],
      scannedAt: new Date().toISOString(),
      scannedFrom,
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
