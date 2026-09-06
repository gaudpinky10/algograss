'use client'
const COLS = [
  { title: 'Platform', links: [['/', 'Home'], ['/scan', 'Free Scanner'], ['/dashboard', 'Dashboard'], ['/pricing', 'Pricing'], ['/blog', 'Blog']] },
  { title: 'GRC Tools', links: [['/complaint', 'Complaint Classifier'], ['/dsar', 'DSAR Handler'], ['/ai-governance', 'AI Governance'], ['/grc', 'GRC Platform'], ['/data-audit', 'Data Audit'], ['/reminders', 'Review Reminders']] },
  { title: 'Company', links: [['/about', 'About Us'], ['/contact', 'Contact'], ['/signup', 'Sign Up Free'], ['/login', 'Log In']] },
]

export default function Footer() {
  return (
    <footer style={{ background: '#030308', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '64px 0 32px', position: 'relative', overflow: 'hidden' }}>

      {/* Glow orb background */}
      <div style={{ position: 'absolute', bottom: -80, left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.1),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, right: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,132,252,0.07),transparent 70%)', pointerEvents: 'none' }} />

      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className='footer-grid' style={{ marginBottom: 48 }}>

          {/* Brand column */}
          <div>
            <div style={{ marginBottom: 14 }}>
              <img src="/logo-white.png" alt="AlgoGrass" style={{ height: 32, width: 'auto', display: 'block' }} />
            </div>

            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.8, maxWidth: 270, marginBottom: 20 }}>
              The AI-powered GDPR and GRC compliance platform for UK and EU businesses. Expert compliance, automated.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 22 }}>
              {[
                ['✓', 'GDPR & UK DPA 2018 compliant'],
                ['✓', 'ICO guidance aligned'],
                ['✓', 'Trusted by UK & EU SMEs'],
                ['✓', 'AI-powered · Always up to date'],
              ].map(([icon, text]) => (
                <span key={text} style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: '#9B7BFA', fontWeight: 700 }}>{icon}</span>{text}
                </span>
              ))}
            </div>

            <a href="mailto:contact@algograss.com" style={{
              fontSize: 13, color: '#9B7BFA', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              ✉ contact@algograss.com
            </a>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#9B7BFA', marginBottom: 18 }}>{col.title}</div>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map(([href, label]) => (
                  <li key={label} style={{ marginBottom: 11 }}>
                    <a href={href} style={{ fontSize: 13, color: '#64748B', textDecoration: 'none', transition: 'color .2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#9B7BFA'}
                      onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>© 2026 AlgoGrass Ltd · Registered in England & Wales · algograss.com</span>
          <div style={{ display: 'flex', gap: 22 }}>
            {[['Privacy Policy','/privacy-policy'],['Terms of Service','/terms'],['Cookie Policy','/cookie-policy']].map(([item,href]) => (
              <a key={item} href={href} style={{ fontSize: 12, color: '#475569', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#9B7BFA'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
