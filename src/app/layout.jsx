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
  title: 'AlgoGrass — GDPR Compliance Tools for UK & EU SMEs',
  description: 'Scan your website for GDPR compliance risks and generate privacy documents automatically.',
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.json',
  themeColor: '#00D4AA',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'AlgoGrass' },
}

export default function RootLayout({ children }) {
  // Reading headers() makes the layout dynamic so Next.js picks up the nonce
  // from middleware and applies it to its own generated <script> tags
  const nonce = headers().get('x-nonce') || ''

  return (
    <html lang="en" className={`${plusJakarta.variable} ${lora.variable} ${barlowCondensed.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00D4AA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AlgoGrass" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}` }} />
      </head>
      <body>
        <div style={{background:'linear-gradient(90deg,rgba(0,212,170,0.15),rgba(124,158,255,0.1))',borderBottom:'1px solid rgba(0,212,170,0.2)',padding:'9px 0',textAlign:'center'}}>
          <p style={{fontSize:12,color:'#E8F0FE',letterSpacing:'.01em',margin:0,fontWeight:500}}>
            🚀 <span style={{color:'#00D4AA',fontWeight:700}}>Launch offer:</span> Sign up free and get <strong>60 days full Pro access</strong> — no credit card needed.{' '}
            <a href="/signup" style={{color:'#7C9EFF',fontWeight:700,textDecoration:'none'}}>Claim it →</a>
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
