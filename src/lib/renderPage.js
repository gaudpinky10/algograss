// Loads pages in a real (headless) browser, the way a visitor sees them.
// Used for every homepage scan (to see which trackers actually load, which
// cookies are set before anyone clicks, and what the cookie banner offers),
// and for privacy/terms pages that need JavaScript to show their text.
//
// On Vercel this uses @sparticuz/chromium. For local development, set
// CHROME_EXECUTABLE_PATH to any installed Chrome/Chromium.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'

async function launch() {
  const puppeteer = (await import('puppeteer-core')).default
  if (process.env.CHROME_EXECUTABLE_PATH) {
    return puppeteer.launch({
      executablePath: process.env.CHROME_EXECUTABLE_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-proxy-server'],
    })
  }
  const chromium = (await import('@sparticuz/chromium')).default
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: true,
    args: chromium.args,
  })
}

// Runs inside the page: finds a visible cookie/consent banner and the labels
// of its buttons. A banner must mention cookies/consent and offer at least one
// accept- or reject-style button, so ordinary footer links don't count.
function probeConsentBanner() {
  const ACCEPT = /^(accept|agree|allow|ok|okay|got it|i understand|understood|continue|yes|i agree|i accept)/i
  const REJECT = /(reject|decline|deny|refuse|disagree|necessary only|essential only|only necessary|only essential|no,? thanks|strictly necessary only)/i
  const visible = el => {
    const r = el.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) return false
    const s = getComputedStyle(el)
    return s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity || '1') > 0.05
  }
  const label = b => (b.innerText || b.value || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()
  const btnSel = 'button, [role="button"], a, input[type="button"], input[type="submit"]'
  const nodes = document.querySelectorAll('div, section, aside, dialog, form, footer, [role="dialog"], [role="alertdialog"], [role="region"]')
  let best = null
  for (const el of nodes) {
    const text = (el.innerText || '').trim()
    if (text.length < 15 || text.length > 4000) continue
    if (!/cookie|consent|tracking|analytics|privacy/i.test(text)) continue
    if (!visible(el)) continue
    const buttons = [...el.querySelectorAll(btnSel)].filter(visible).map(label).filter(Boolean)
    if (!buttons.some(b => ACCEPT.test(b) || REJECT.test(b))) continue
    if (!best || text.length < best.text.length) best = { text, buttons }
  }
  if (!best) return { found: false }
  return {
    found: true,
    text: best.text.replace(/\s+/g, ' ').slice(0, 300),
    buttons: best.buttons.slice(0, 12),
    hasAccept: best.buttons.some(b => ACCEPT.test(b)),
    hasReject: best.buttons.some(b => REJECT.test(b)),
  }
}

// Returns { render(url, opts) -> page result, close() }. Each result has the
// same shape as a plain download: { ok, status, text, headers, finalUrl }, plus
// the URLs the page requested, every cookie set without any interaction
// (first- and third-party), and, with { probe: true }, the cookie banner.
export async function createRenderer({ timeoutMs = 12000, maxConcurrent = 3, deadline = Infinity } = {}) {
  const browser = await launch()
  let active = 0
  const queue = []
  const acquire = () => new Promise(res => {
    if (active < maxConcurrent) { active++; res() } else queue.push(res)
  })
  const release = () => { const next = queue.shift(); if (next) next(); else active-- }
  const empty = (url, extra = {}) => ({ ok: false, status: 0, text: '', headers: new Headers(), finalUrl: url, requests: [], cookies: [], cookieDetails: [], banner: null, ...extra })

  async function render(url, { probe = false } = {}) {
    await acquire()
    const left = deadline - Date.now()
    if (left < 3000) { release(); return empty(url, { timedOut: true }) }
    const pageTimeout = Math.min(timeoutMs, left - 1500)
    const page = await browser.newPage()
    const requests = []
    try {
      await page.setUserAgent(UA)
      await page.setViewport({ width: 1280, height: 900 })
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en;q=0.9' })
      // Some consent tools decide by time zone which banner to show: be a UK visitor
      await page.emulateTimezone('Europe/London').catch(() => {})
      // Images, video and fonts don't change the text, links or cookies we
      // check, so skip downloading them (their URLs are still recorded).
      // Stylesheets are kept when checking the banner, as CSS decides what
      // a visitor can actually see.
      const skip = probe ? ['image', 'media', 'font'] : ['image', 'media', 'font', 'stylesheet']
      await page.setRequestInterception(true)
      page.on('request', r => {
        if (requests.length < 400) requests.push(r.url())
        if (skip.includes(r.resourceType())) r.abort().catch(() => {})
        else r.continue().catch(() => {})
      })
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: pageTimeout })
      const waitLeft = () => Math.max(800, Math.min(5000, deadline - Date.now() - 1500))
      // Wait for real content, then (homepage) a little longer for consent tools to appear
      await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 200, { timeout: waitLeft() }).catch(() => {})
      let banner = null
      if (probe) {
        await page.waitForFunction('(' + probeConsentBanner.toString() + ')().found', { timeout: Math.min(2500, waitLeft()) }).catch(() => {})
        await new Promise(r => setTimeout(r, 1200)) // let tags that fire on load set their cookies
        banner = await page.evaluate(probeConsentBanner).catch(() => null)
      } else {
        await new Promise(r => setTimeout(r, 400))
      }
      const text = await page.content()
      // Every cookie in the browser, including HttpOnly and third-party ones
      let cookieDetails = []
      try {
        const cdp = await page.createCDPSession()
        const { cookies } = await cdp.send('Network.getAllCookies')
        cookieDetails = (cookies || []).map(c => ({ name: c.name, domain: c.domain }))
      } catch {
        cookieDetails = (await page.cookies().catch(() => [])).map(c => ({ name: c.name, domain: c.domain }))
      }
      const headers = new Headers()
      for (const [k, v] of Object.entries(res?.headers() || {})) { try { headers.set(k, v) } catch {} }
      return {
        ok: true, status: res ? res.status() : 0, text: text.slice(0, 700 * 1024), headers, finalUrl: page.url(),
        requests, cookies: cookieDetails.map(c => c.name), cookieDetails, banner,
      }
    } catch {
      return empty(url, { requests })
    } finally {
      await page.close().catch(() => {})
      release()
    }
  }

  return { render, close: () => browser.close().catch(() => {}) }
}
