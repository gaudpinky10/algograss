import { headers } from 'next/headers'
import { Plus_Jakarta_Sans, Lora, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import Nav from './nav'
import Footer from './footer'
import CookieBanner from '@/components/CookieBanner'
import VisitorTracker from '@/components/VisitorTracker'
import LaunchBanner from '@/components/LaunchBanner'

// ── Fonts (self-hosted at build time via next/font — zero runtime Google requests) ──
// Plus Jakarta Sans: headings, UI labels, buttons
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})
// Lora: body text, subtext — editorial serif for credibility
const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
  display: 'swap',
})
// Barlow Condensed: numbers, stats, amounts, countdown timers
const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://www.algograss.com'),
  title: {
    default: 'AlgoGrass — GDPR Compliance Tools for UK & EU Businesses',
    template: '%s | AlgoGrass',
  },
  description: 'Free GDPR website scanner + compliance tools for UK and EU SMEs. Generate privacy policies, handle DSARs, manage data audits, and stay ICO-compliant — no legal background needed.',
  keywords: ['GDPR compliance', 'UK GDPR', 'ICO compliance', 'privacy policy generator', 'DSAR handler', 'data protection', 'GDPR scanner', 'SME compliance', 'cookie consent', 'data audit'],
  authors: [{ name: 'AlgoGrass', url: 'https://www.algograss.com' }],
  creator: 'AlgoGrass',
  publisher: 'AlgoGrass',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: '/favicon.svg', apple: '/apple-icon.png' },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'AlgoGrass' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.algograss.com',
    siteName: 'AlgoGrass',
    title: 'AlgoGrass — GDPR Compliance Tools for UK & EU Businesses',
    description: 'Free GDPR website scanner + compliance tools for UK and EU SMEs. 60 days free, no card required.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoGrass — GDPR Compliance Tools for UK & EU Businesses',
    description: 'Free GDPR website scanner + privacy tools for UK SMEs. Scan your site, generate documents, stay ICO-compliant.',
    images: ['/opengraph-image'],
    creator: '@algograss',
  },
  alternates: { canonical: 'https://www.algograss.com' },
}

export const viewport = { themeColor: '#1A5E38' }

export default function RootLayout({ children }) {
  // Reading headers() makes the layout dynamic so Next.js picks up the nonce
  // from middleware and applies it to its own generated <script> tags
  const nonce = headers().get('x-nonce') || ''

  return (
    <html lang="en" className={`${plusJakarta.variable} ${lora.variable} ${barlowCondensed.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AlgoGrass" />
        {/* The nonce lets this inline script run under the Content Security Policy set in middleware.js */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}` }} />
      </head>
      <body>
        <Nav />
        <VisitorTracker />
        {/* Static cookie-consent marker — detectable by GDPR scanners without JS; actual interactive banner is client-rendered below */}
        <div id="algograss-cookie-consent" data-reject-all="true" aria-hidden="true" style={{display:'none'}}/>
        {/* The offer strip sits below the fixed nav bar (it used to be hidden behind it) */}
        <div style={{paddingTop:64}}><LaunchBanner />{children}</div>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
