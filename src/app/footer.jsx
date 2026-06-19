'use client'
const COLS = [
  { title: 'Platform', links: [['/', 'Home'], ['/scan', 'Free Scanner'], ['/dashboard', 'Dashboard'], ['/pricing', 'Pricing'], ['/blog', 'Blog']] },
  { title: 'GRC Tools', links: [['/complaint', 'Complaint Classifier'], ['/dsar', 'DSAR Handler'], ['/ai-governance', 'AI Governance'], ['/grc', 'GRC Platform'], ['/data-audit', 'Data Audit'], ['/reminders', 'Review Reminders']] },
  { title: 'Company', links: [['/about', 'About Us'], ['/contact', 'Contact'], ['/signup', 'Sign Up Free'], ['/login', 'Log In']] },
]

export default function Footer() {
  return (
    <footer style={{ background: '#030810', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '64px 0 32px', position: 'relative', overflow: 'hidden' }}>

      {/* Glow orb background */}
      <div style={{ position: 'absolute', bottom: -80, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.06),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.05),transparent 70%)', pointerEvents: 'none' }} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className='footer-grid' style={{ marginBottom: 48 }}>

          {/* Brand column */}
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg width="22" height="26" viewBox="0 0 32 36" fill="none">
                <defs>
                  <linearGradient id="fLogGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00D4AA"/>
                    <stop offset="100%" stopColor="#7C9EFF"/>
                  </linearGradient>
                </defs>
                <path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="url(#fLogGrad)" opacity="0.9"/>
                <path d="M10 18 L14 22 L22 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ background: 'linear-gradient(135deg,#00D4AA,#7C9EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AlgoGrass</span>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(232,240,254,0.45)', lineHeight: 1.8, maxWidth: 270, marginBottom: 20 }}>
              The AI-powered GDPR and GRC compliance platform for UK and EU businesses. Expert compliance, automated.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>
              {[
                ['✓', 'GDPR & UK DPA 2018 compliant'],
                ['✓', 'ICO guidance aligned'],
                ['✓', 'Trusted by UK & EU SMEs'],
                ['✓', 'AI-powered · Always up to date'],
              ].map(([icon, text]) => (
                <span key={text} style={{ fontSize: 12, color: 'rgba(232,240,254,0.35)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: '#00D4AA', fontWeight: 700 }}>{icon}</span>{text}
                </span>
              ))}
            </div>

            <a href="mailto:hello@algograss.co.uk" style={{
              fontSize: 13, color: '#00D4AA', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              ✉ hello@algograss.co.uk
            </a>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(0,212,170,0.6)', marginBottom: 18 }}>{col.title}</div>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map(([href, label]) => (
                  <li key={label} style={{ marginBottom: 11 }}>
                    <a href={href} style={{ fontSize: 13, color: 'rgba(232,240,254,0.38)', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#00D4AA'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,240,254,0.38)'}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'rgba(232,240,254,0.2)' }}>© 2026 AlgoGrass Ltd · Registered in England & Wales · algograss.co.uk</span>
          <div style={{ display: 'flex', gap: 22 }}>
            {[['Privacy Policy','/privacy-policy'],['Terms of Service','/terms'],['Cookie Policy','/cookie-policy']].map(([item,href]) => (
              <a key={item} href={href} style={{ fontSize: 12, color: 'rgba(232,240,254,0.2)', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(232,240,254,0.55)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,240,254,0.2)'}>
                {item}
              </a>

            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
