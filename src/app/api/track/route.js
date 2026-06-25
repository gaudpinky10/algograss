import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/dbHelpers'

export const runtime = 'nodejs'

// POST /api/track — receives page view data from VisitorTracker component
export async function POST(request) {
  try {
    const body = await request.json()

    // Pull real IP from Vercel/Cloudflare headers (not spoofable via client)
    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'

    // Cloudflare country header (free on Vercel Pro / Cloudflare proxy)
    const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || ''
    const city    = request.headers.get('x-vercel-ip-city') || ''
    const region  = request.headers.get('x-vercel-ip-country-region') || ''

    // Parse UA for basic device / browser detection
    const ua = body.ua || ''
    const device   = /Mobile|Android|iPhone|iPad/i.test(ua) ? 'mobile' : /Tablet/i.test(ua) ? 'tablet' : 'desktop'
    const browser  = /Edg\//i.test(ua) ? 'Edge'
                   : /Chrome/i.test(ua) ? 'Chrome'
                   : /Firefox/i.test(ua) ? 'Firefox'
                   : /Safari/i.test(ua) ? 'Safari'
                   : /MSIE|Trident/i.test(ua) ? 'IE'
                   : 'Other'
    const os       = /Windows NT/i.test(ua) ? 'Windows'
                   : /Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua) ? 'macOS'
                   : /iPhone/i.test(ua) ? 'iOS'
                   : /iPad/i.test(ua) ? 'iPadOS'
                   : /Android/i.test(ua) ? 'Android'
                   : /Linux/i.test(ua) ? 'Linux'
                   : 'Other'

    const isBot = /bot|crawl|spider|slurp|headless|phantom|puppeteer|selenium|prerender/i.test(ua)
    if (isBot) return NextResponse.json({ ok: true }) // silently ignore bots

    const doc = {
      // Page data
      page:       body.page || '/',
      title:      body.title || '',
      referrer:   body.referrer || '',

      // Identity
      visitorId:  body.visitorId || '',
      sessionId:  body.sessionId || '',

      // Location (server-side from headers)
      ip,
      country,
      city,
      region,

      // Device (server-side parsed)
      device,
      browser,
      os,

      // Client-side extras
      screen:     body.screen || '',
      lang:       body.lang   || '',
      tz:         body.tz     || '',
      ua,

      // Timestamp
      ts: new Date(),
    }

    const col = await getCollection('visitors')
    if (col) await col.insertOne(doc)

    return NextResponse.json({ ok: true })
  } catch (err) {
    // Never return 500 to client — tracking should always be silent
    console.error('track error:', err.message)
    return NextResponse.json({ ok: true })
  }
}
