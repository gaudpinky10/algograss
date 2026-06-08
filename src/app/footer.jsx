const COLS = [
  { title: 'Platform', links: [['/', 'Home'], ['/scan', 'Free Scanner'], ['/dashboard', 'Dashboard'], ['/pricing', 'Pricing'], ['/blog', 'Blog']] },
  { title: 'GRC Tools', links: [['/complaint', 'Complaint Classifier'], ['/dsar', 'DSAR Handler'], ['/ai-governance', 'AI Governance'], ['/grc', 'GRC Platform']] },
  { title: 'Company', links: [['/about', 'About'], ['/contact', 'Contact'], ['/signup', 'Sign Up Free'], ['/login', 'Log In']] },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', padding: '56px 0 32px' }}>
      <div className="wrap">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 44 }}>
          <div>
            <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: '#B8D96A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="20" height="22" viewBox="0 0 32 36" fill="none">
                <path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52" />
                <path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              AlgoGrass
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, maxWidth: 270, marginBottom: 16 }}>
              The AI-powered GDPR and GRC compliance platform for UK and EU businesses. Expert compliance, automated.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {['✓ GDPR & UK DPA 2018 compliant', '✓ ICO guidance aligned', '✓ Trusted by UK & EU SMEs', '✓ AI-powered · Always up to date'].map(item => (
                <span key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{item}</span>
              ))}
            </div>
            <a href="mailto:hello@algograss.co.uk" style={{ fontSize: 13, color: '#B8D96A', textDecoration: 'none' }}>hello@algograss.co.uk</a>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'rgba(184,217,106,.6)', marginBottom: 16 }}>{col.title}</div>
              <ul style={{ listStyle: 'none' }}>
                {col.links.map(([href, label]) => (
                  <li key={label} style={{ marginBottom: 10 }}>
                    <a href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#B8D96A'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>© 2026 AlgoGrass Ltd · Registered in England & Wales · algograss.co.uk</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,.25)', textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
