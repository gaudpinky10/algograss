/** @type {import('next').NextConfig} */

// CSP is handled dynamically by src/middleware.js (nonce-based, per request)
// These static headers are set for every response
const securityHeaders = [
  { key: 'X-Content-Type-Options',   value: 'nosniff' },
  { key: 'X-Frame-Options',          value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',         value: '1; mode=block' },
  { key: 'Referrer-Policy',          value: 'no-referrer' },
  { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
  { key: 'Strict-Transport-Security',value: 'max-age=63072000; includeSubDomains; preload' },
]

const nextConfig = {
  experimental: {
    // Headless Chromium for scanning JavaScript-only sites (see src/lib/renderPage.js).
    // Kept out of the bundle, and its compressed browser files shipped with the scan route.
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    outputFileTracingIncludes: {
      '/api/scan': ['./node_modules/@sparticuz/chromium/bin/**'],
    },
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

module.exports = nextConfig
