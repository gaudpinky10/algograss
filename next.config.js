/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevents MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevents clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // XSS protection for older browsers
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Controls referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Restricts browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")' },
  // Forces HTTPS for 2 years
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Content Security Policy — controls what can load on your pages
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Next.js needs unsafe-inline and unsafe-eval for its runtime scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://hooks.stripe.com",
      // Inline styles needed by Next.js and glassmorphism CSS
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Google Fonts
      "font-src 'self' https://fonts.gstatic.com data:",
      // Images from anywhere over HTTPS + data URIs
      "img-src 'self' data: https:",
      // API calls: own server + Stripe
      "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com",
      // Stripe payment iframe
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      // Nobody can embed algograss.co.uk in an iframe
      "frame-ancestors 'none'",
      // All forms post to own domain only
      "form-action 'self'",
      // Block mixed content (HTTP on HTTPS page)
      "upgrade-insecure-requests",
    ].join('; '),
  },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
