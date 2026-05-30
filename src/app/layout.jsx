import './globals.css'
import Nav from './nav'
import Footer from './footer'

export const metadata = {
  title: 'AlgoGrass — GDPR Compliance Tools for UK & EU SMEs',
  description: 'Scan your website for GDPR compliance risks and generate privacy documents automatically.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{background:'var(--ink)',padding:'8px 0',textAlign:'center'}}>
          <p style={{fontSize:11,color:'rgba(247,245,239,.5)'}}>
            AlgoGrass is a compliance guidance tool — not a law firm. Our outputs do not constitute legal advice. Always review with a qualified solicitor.
          </p>
        </div>
        <Nav />
        <div style={{paddingTop:64}}>{children}</div>
        <Footer />
      </body>
    </html>
  )
}
