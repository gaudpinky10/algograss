// Loads pages in a real (headless) browser, for websites whose HTML is an
// empty JavaScript shell. Used only when a plain download has nothing to read.
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

// Returns { render(url) -> page result, close() }. Each result has the same
// shape as a plain download: { ok, status, text, headers, finalUrl } plus the
// URLs the page requested and the cookies it set without any interaction.
export async function createRenderer({ timeoutMs = 12000, maxConcurrent = 3, deadline = Infinity } = {}) {
  const browser = await launch()
  let active = 0
  const queue = []
  const acquire = () => new Promise(res => {
    if (active < maxConcurrent) { active++; res() } else queue.push(res)
  })
  const release = () => { const next = queue.shift(); if (next) next(); else active-- }

  async function render(url) {
    await acquire()
    const left = deadline - Date.now()
    if (left < 3000) { release(); return { ok: false, status: 0, text: '', headers: new Headers(), finalUrl: url, requests: [], cookies: [], timedOut: true } }
    const pageTimeout = Math.min(timeoutMs, left - 1500)
    const page = await browser.newPage()
    const requests = []
    try {
      await page.setUserAgent(UA)
      await page.setViewport({ width: 1280, height: 900 })
      await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-GB,en;q=0.9' })
      // Images, video, fonts and stylesheets don't change the text or links we
      // check, so skip downloading them. Their URLs are still recorded.
      await page.setRequestInterception(true)
      page.on('request', r => {
        if (requests.length < 300) requests.push(r.url())
        if (['image', 'media', 'font', 'stylesheet'].includes(r.resourceType())) r.abort().catch(() => {})
        else r.continue().catch(() => {})
      })
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: pageTimeout })
      // Wait for the app to put real content on the page, then a moment for footers
      await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 200, { timeout: Math.max(1000, Math.min(5000, deadline - Date.now() - 1500)) }).catch(() => {})
      await new Promise(r => setTimeout(r, 400))
      const text = await page.content()
      const cookies = (await page.cookies()).map(c => c.name)
      const headers = new Headers()
      for (const [k, v] of Object.entries(res?.headers() || {})) { try { headers.set(k, v) } catch {} }
      return { ok: true, status: res ? res.status() : 0, text: text.slice(0, 700 * 1024), headers, finalUrl: page.url(), requests, cookies }
    } catch {
      return { ok: false, status: 0, text: '', headers: new Headers(), finalUrl: url, requests, cookies: [] }
    } finally {
      await page.close().catch(() => {})
      release()
    }
  }

  return { render, close: () => browser.close().catch(() => {}) }
}
