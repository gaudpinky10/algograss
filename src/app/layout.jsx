import './globals.css'
import Nav from './nav'
import Footer from './footer'
import CookieBanner from '@/components/CookieBanner'

export const metadata = {
  title: 'AlgoGrass — GDPR Compliance Tools for UK & EU SMEs',
  description: 'Scan your website for GDPR compliance risks and generate privacy documents automatically.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{background:'linear-gradient(90deg,rgba(0,212,170,0.12),rgba(124,58,237,0.12))',borderBottom:'1px solid rgba(0,212,170,0.12)',padding:'7px 0',textAlign:'center'}}>
          <p style={{fontSize:11,color:'rgba(232,240,254,0.4)',letterSpacing:'.02em'}}>
            ✦ AlgoGrass is a compliance guidance platform — not a law firm. Always review outputs with a qualified solicitor. ✦
          </p>
        </div>
        <Nav />
        <div style={{paddingTop:64}}>{children}</div>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
