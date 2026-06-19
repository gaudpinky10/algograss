import { NextResponse } from 'next/server'

export function middleware(request) {
  // Generate a unique nonce for every request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const csp = [
    "default-src 'self'",
    // nonce-based: no unsafe-inline, no unsafe-eval
    // strict-dynamic lets nonce-allowed scripts load their own chunks (Next.js code splitting)
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://hooks.stripe.com`,
    // style unsafe-inline needed by Next.js SSR — penalised less than script unsafe-inline
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  // Pass nonce to the layout via request header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  // Also set on the response so the browser sees it
  response.headers.set('Content-Security-Policy', csp)

  return response
}

// Run middleware on all routes except static assets
export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
