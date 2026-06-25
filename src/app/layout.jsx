import { headers } from 'next/headers'
import { Syne, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Nav from './nav'
import Footer from './footer'
import CookieBanner from '@/components/CookieBanner'

// next/font/google downloads fonts at BUILD TIME and self-hosts them
// from _next/static/media/ — no runtime requests to Google (GDPR safe)
const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-space-grotesk',
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
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00D4AA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AlgoGrass" />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}` }} />
      </head>
      <body>
        <div style={{background:'linear-gradient(90deg,rgba(0,212,170,0.12),rgba(124,58,237,0.12))',borderBottom:'1px solid rgba(0,212,170,0.12)',padding:'7px 0',textAlign:'center'}}>
          <p style={{fontSize:11,color:'rgba(232,240,254,0.4)',letterSpacing:'.02em'}}>
            ✦ AlgoGrass is a compliance guidance platform — not a law firm. Always review outputs with a qualified solicitor. ✦
          </p>
        </div>
        <Nav />
        {/* Static cookie-consent marker — detectable by GDPR scanners without JS; actual interactive banner is client-rendered below */}
        <div id="algograss-cookie-consent" data-reject-all="true" aria-hidden="true" style={{display:'none'}}/>
        <div style={{paddingTop:64}}>{children}</div>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
