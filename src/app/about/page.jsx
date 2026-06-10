'use client'
export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '100px 0 80px', position: 'relative', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -100, right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.08),transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.07),transparent 65%)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow">About AlgoGrass</span>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: 22, color: 'var(--ink)', maxWidth: 720 }}>
            Making GDPR compliance{' '}
            <span style={{ background: 'linear-gradient(135deg,#00D4AA,#7C9EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>understandable</span>{' '}
            for every small business
          </h1>
          <p className="subtext" style={{ maxWidth: 580, marginBottom: 32 }}>
            AlgoGrass was founded in the UK with one goal: make it easier for small businesses to understand their data protection obligations and build the documentation they need — without needing a solicitor on speed dial.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/scan" className="btn btn-primary">Try the free scanner →</a>
            <a href="/contact" className="btn btn-secondary">Get in touch</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              ['2025', 'Founded in the UK'],
              ['GDPR', 'UK DPA 2018 & ePrivacy'],
              ['60s', 'To your first free scan'],
              ['Free', 'Cost of your first scan'],
            ].map(([n, l]) => (
              <div key={n} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 20px', backdropFilter: 'blur(16px)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,#00D4AA,#7C9EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 6 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,240,254,0.5)', lineHeight: 1.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '80px 0', background: 'rgba(13,21,37,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <span className="eyebrow">Our mission</span>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,2.5vw,38px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 16, letterSpacing: '-0.5px' }}>Compliance shouldn't cost thousands</h2>
            <p style={{ fontSize: 15, color: 'rgba(232,240,254,0.55)', lineHeight: 1.8, marginBottom: 16 }}>We give every small business owner a clear, honest picture of their GDPR compliance position — and practical tools to address what they find.</p>
            <p style={{ fontSize: 13, color: 'rgba(232,240,254,0.38)', lineHeight: 1.75, marginBottom: 28 }}>We work collaboratively with data protection professionals. We're not here to replace solicitors — we're here to help businesses come to those conversations better informed.</p>
            <a href="/pricing" className="btn btn-primary">See our plans →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🎯', title: 'Honest', desc: 'Clear about what AlgoGrass is and is not. A guidance tool, not a law firm.' },
              { icon: '💡', title: 'Plain English', desc: 'No jargon. Real regulation translated into language any business owner understands.' },
              { icon: '🔒', title: 'Accurate', desc: 'Every regulation reference is real and verified against current GDPR and UK DPA 2018.' },
              { icon: '⚡', title: 'Practical', desc: 'Real checks, real issues, real guidance — not abstract compliance theory.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', gap: 14, padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(232,240,254,0.45)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '96px 0', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,212,170,0.05),transparent 70%)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="eyebrow">The team</span>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,3vw,42px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', marginBottom: 12 }}>The people behind AlgoGrass</h2>
            <p style={{ fontSize: 15, color: 'rgba(232,240,254,0.5)', maxWidth: 480, margin: '0 auto' }}>A passionate team making GDPR compliance accessible for every UK and EU small business.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 28, maxWidth: 820, margin: '0 auto' }}>

            {/* Founder — Pinki Gaud */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(0,212,170,0.07),rgba(124,58,237,0.05))',
              border: '1px solid rgba(0,212,170,0.2)',
              borderRadius: 20, padding: '40px 32px', textAlign: 'center',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 40px rgba(0,212,170,0.07)',
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 48px rgba(0,212,170,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 40px rgba(0,212,170,0.07)' }}>

              {/* Passport photo */}
              <div style={{ width: 110, height: 140, borderRadius: 12, overflow: 'hidden', margin: '0 auto 22px', border: '2px solid rgba(0,212,170,0.4)', boxShadow: '0 0 24px rgba(0,212,170,0.2)', background: 'rgba(0,212,170,0.05)' }}>
                <img src="/team/pinki.jpg" alt="Pinki Gaud"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              </div>

              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: 'linear-gradient(135deg,#00D4AA,#00A882)', color: '#06111E', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Founder</div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Pinki Gaud</h3>
              <p style={{ fontSize: 13, color: 'rgba(232,240,254,0.5)', lineHeight: 1.7, marginBottom: 22, maxWidth: 300, margin: '0 auto 22px' }}>Building AlgoGrass with a background in LegalTech and AI. Passionate about making GDPR compliance practical and affordable for SMEs across the UK and EU.</p>

              <a href="https://www.linkedin.com/in/pinkigaud/" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: 9, background: '#0A66C2', boxShadow: '0 4px 16px rgba(10,102,194,0.3)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,102,194,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,102,194,0.3)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Connect on LinkedIn
              </a>
            </div>

            {/* Co-Founder — Kumar Kuppusamy */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(124,58,237,0.07),rgba(0,212,170,0.04))',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 20, padding: '40px 32px', textAlign: 'center',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 40px rgba(124,58,237,0.07)',
              transition: 'transform .2s, box-shadow .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 48px rgba(124,58,237,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 0 40px rgba(124,58,237,0.07)' }}>

              {/* Passport photo */}
              <div style={{ width: 110, height: 140, borderRadius: 12, overflow: 'hidden', margin: '0 auto 22px', border: '2px solid rgba(124,58,237,0.4)', boxShadow: '0 0 24px rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.05)' }}>
                <img src="/team/kumar.jpg" alt="Kumar Kuppusamy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
              </div>

              <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: 'linear-gradient(135deg,#7C3AED,#9B5EFF)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Co-Founder</div>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Kumar Kuppusamy</h3>
              <p style={{ fontSize: 13, color: 'rgba(232,240,254,0.5)', lineHeight: 1.7, marginBottom: 22, maxWidth: 300, margin: '0 auto 22px' }}>Co-founding AlgoGrass with deep expertise in technology and business strategy. Focused on scaling compliant, AI-driven tools for businesses of all sizes.</p>

              <a href="https://www.linkedin.com/in/kumar-kuppusamy/" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: 9, background: '#0A66C2', boxShadow: '0 4px 16px rgba(10,102,194,0.3)', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,102,194,0.45)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,102,194,0.3)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Connect on LinkedIn
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'rgba(13,21,37,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,212,170,0.07),transparent 70%)', pointerEvents: 'none' }} />
        <div className="wrap" style={{ maxWidth: 520, position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Try the free scanner today</h2>
          <p style={{ fontSize: 15, color: 'rgba(232,240,254,0.5)', marginBottom: 28, lineHeight: 1.7 }}>No account, no card. See your compliance position in seconds.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/scan" className="btn btn-primary btn-lg">Scan my website free →</a>
            <a href="/pricing" className="btn btn-white btn-lg">View pricing</a>
          </div>
        </div>
      </section>
    </>
  )
}
