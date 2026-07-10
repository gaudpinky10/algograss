import { headers } from 'next/headers'
import { Plus_Jakarta_Sans, Lora, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import Nav from './nav'
import Footer from './footer'
import CookieBanner from '@/components/CookieBanner'
import VisitorTracker from '@/components/VisitorTracker'

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
  metadataBase: new URL('https://algograss.com'),
  title: {
    default: 'AlgoGrass — GDPR Compliance Tools for UK & EU Businesses',
    template: '%s | AlgoGrass',
  },
  description: 'Free GDPR website scanner + compliance tools for UK and EU SMEs. Generate privacy policies, handle DSARs, manage data audits, and stay ICO-compliant — no legal background needed.',
  keywords: ['GDPR compliance', 'UK GDPR', 'ICO compliance', 'privacy policy generator', 'DSAR handler', 'data protection', 'GDPR scanner', 'SME compliance', 'cookie consent', 'data audit'],
  authors: [{ name: 'AlgoGrass', url: 'https://algograss.com' }],
  creator: 'AlgoGrass',
  publisher: 'AlgoGrass',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: '/favicon.svg', apple: '/favicon.svg' },
  manifest: '/manifest.json',
  themeColor: '#9B7BFA',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'AlgoGrass' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://algograss.com',
    siteName: 'AlgoGrass',
    title: 'AlgoGrass — GDPR Compliance Tools for UK & EU Businesses',
    description: 'Free GDPR website scanner + compliance tools for UK and EU SMEs. 60 days free, no card required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AlgoGrass — GDPR Compliance Made Simple' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AlgoGrass — GDPR Compliance Tools for UK & EU Businesses',
    description: 'Free GDPR website scanner + privacy tools for UK SMEs. Scan your site, generate documents, stay ICO-compliant.',
    images: ['/og-image.png'],
    creator: '@algograss',
  },
  alternates: { canonical: 'https://algograss.com' },
}

export default function RootLayout({ children }) {
  // Reading headers() makes the layout dynamic so Next.js picks up the nonce
  // from middleware and applies it to its own generated <script> tags
  const nonce = headers().get('x-nonce') || ''

  return (
    <html lang="en" className={`${plusJakarta.variable} ${lora.variable} ${barlowCondensed.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9B7BFA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AlgoGrass" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}` }} />
      </head>
      <body>
        <div style={{background:'linear-gradient(90deg,rgba(139,92,246,0.15),rgba(124,158,255,0.1))',borderBottom:'1px solid rgba(139,92,246,0.2)',padding:'9px 0',textAlign:'center'}}>
          <p style={{fontSize:12,color:'#FFFFFF',letterSpacing:'.01em',margin:0,fontWeight:500}}>
            🚀 <span style={{color:'#9B7BFA',fontWeight:700}}>Launch offer:</span> Sign up free and get <strong>60 days full Pro access</strong> — no credit card needed.{' '}
            <a href="/signup" style={{color:'#C084FC',fontWeight:700,textDecoration:'none'}}>Claim it →</a>
          </p>
        </div>
        <Nav />
        <VisitorTracker />
        {/* Static cookie-consent marker — detectable by GDPR scanners without JS; actual interactive banner is client-rendered below */}
        <div id="algograss-cookie-consent" data-reject-all="true" aria-hidden="true" style={{display:'none'}}/>
        <div style={{paddingTop:64}}>{children}</div>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
