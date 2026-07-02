'use client'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import ParticleCanvas from '@/components/ParticleCanvas'
import TiltCard from '@/components/TiltCard'
import CountUp from '@/components/CountUp'

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '100px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <ParticleCanvas count={50} speed={0.25} connectDist={110} />
        <div className="orb orb-teal" style={{ width: 500, height: 500, top: '-10%', right: '5%', opacity: 0.7 }} />
        <div className="orb orb-purple" style={{ width: 400, height: 400, bottom: '-8%', left: '5%', opacity: 0.6 }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <AnimateOnScroll>
            <span className="eyebrow">About AlgoGrass</span>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: 22, color: 'var(--ink)', maxWidth: 720 }}>
              Making GDPR compliance{' '}
              <span className="animate-gradient-text">understandable</span>{' '}
              for every small business
            </h1>
            <p className="subtext" style={{ maxWidth: 580, marginBottom: 32 }}>
              AlgoGrass was founded in the UK with one goal: make it easier for small businesses to understand their data protection obligations and build the documentation they need — without needing a solicitor on speed dial.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="/scan" className="btn btn-primary animate-pulse-glow">Try the free scanner →</a>
              <a href="/contact" className="btn btn-secondary">Get in touch</a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '0 0 80px', position: 'relative', zIndex: 1 }}>
        <div className="wrap">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { val: '2025', label: 'Founded in the UK', isNum: false },
              { val: 'GDPR', label: 'UK DPA 2018 & ePrivacy', isNum: false },
              { val: 60, suffix: 's', label: 'To your first free scan', isNum: true },
              { val: 'Free', label: 'Cost of your first scan', isNum: false },
            ].map(({ val, suffix, label, isNum }, i) => (
              <AnimateOnScroll key={label} delay={i + 1} direction="scale">
                <TiltCard intensity={8}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 20px', backdropFilter: 'blur(16px)', textAlign: 'center', height: '100%' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 6 }} className="animate-gradient-text">
                      {isNum ? <CountUp end={val} suffix={suffix || ''} /> : val}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(232,240,254,0.5)', lineHeight: 1.5 }}>{label}</div>
                  </div>
                </TiltCard>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '80px 0', background: 'rgba(13,21,37,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1 }}>
        <div className="wrap grid-2col">
          <AnimateOnScroll direction="left">
            <span className="eyebrow">Our mission</span>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,2.5vw,38px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 16, letterSpacing: '-0.5px' }}>Compliance shouldn't cost thousands</h2>
            <p style={{ fontSize: 15, color: 'rgba(232,240,254,0.55)', lineHeight: 1.8, marginBottom: 16 }}>We give every small business owner a clear, honest picture of their GDPR compliance position — and practical tools to address what they find.</p>
            <p style={{ fontSize: 13, color: 'rgba(232,240,254,0.38)', lineHeight: 1.75, marginBottom: 28 }}>We work collaboratively with data protection professionals. We're not here to replace solicitors — we're here to help businesses come to those conversations better informed.</p>
            <a href="/pricing" className="btn btn-primary">See our plans →</a>
          </AnimateOnScroll>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🎯', title: 'Honest', desc: 'Clear about what AlgoGrass is and is not. A guidance tool, not a law firm.' },
              { icon: '💡', title: 'Plain English', desc: 'No jargon. Real regulation translated into language any business owner understands.' },
              { icon: '🔒', title: 'Accurate', desc: 'Every regulation reference is real and verified against current GDPR and UK DPA 2018.' },
              { icon: '⚡', title: 'Practical', desc: 'Real checks, real issues, real guidance — not abstract compliance theory.' },
            ].map(({ icon, title, desc }, i) => (
              <AnimateOnScroll key={title} delay={i + 1} direction="right">
                <div style={{ display: 'flex', gap: 14, padding: '16px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, transition: 'border-color 0.3s, transform 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'; e.currentTarget.style.transform = 'translateX(6px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(232,240,254,0.45)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '96px 0', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div className="orb orb-teal" style={{ width: 700, height: 400, top: '20%', left: '50%', transform: 'translateX(-50%)', opacity: 0.4 }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <AnimateOnScroll direction="scale">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span className="eyebrow">The team</span>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,3vw,42px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px', marginBottom: 12 }}>The people behind AlgoGrass</h2>
              <p style={{ fontSize: 15, color: 'rgba(232,240,254,0.5)', maxWidth: 480, margin: '0 auto' }}>A passionate team making GDPR compliance accessible for every UK and EU small business.</p>
            </div>
          </AnimateOnScroll>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 28, maxWidth: 820, margin: '0 auto' }}>
            {/* Founder — Pinki Gaud */}
            <AnimateOnScroll direction="left">
              <TiltCard intensity={7}>
                <div style={{ background: 'linear-gradient(135deg,rgba(0,212,170,0.07),rgba(124,58,237,0.05))', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 20, padding: '40px 32px', textAlign: 'center', backdropFilter: 'blur(16px)', height: '100%' }}>
                  <div style={{ width: 110, height: 140, borderRadius: 12, overflow: 'hidden', margin: '0 auto 22px', border: '2px solid rgba(0,212,170,0.4)', boxShadow: '0 0 24px rgba(0,212,170,0.2)', background: 'linear-gradient(135deg,rgba(0,212,170,0.3),rgba(0,168,130,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse-glow">
                    <img src="/team/pinki.jpg" alt="Pinki Gaud" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={e => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.innerHTML='<span style="font-size:36px;font-weight:800;color:#00D4AA;font-family:Syne,sans-serif">PG</span>' }} />
                  </div>
                  <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: 'linear-gradient(135deg,#00D4AA,#00A882)', color: '#06111E', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Founder</div>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Pinki Gaud</h3>
                  <p style={{ fontSize: 13, color: 'rgba(232,240,254,0.5)', lineHeight: 1.7, marginBottom: 22, maxWidth: 300, margin: '0 auto 22px' }}>MSc Business Analytics, Queen Mary University London · AI Researcher recognised at a Top-3 university in China · Built AlgoGrass solo — 14 GDPR compliance tools from website scanner to AI document generator, serving UK and EU SMEs.</p>
                  <a href="https://www.linkedin.com/in/pinkigaud/" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: 9, background: '#0A66C2', boxShadow: '0 4px 16px rgba(10,102,194,0.3)', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,102,194,0.5)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,102,194,0.3)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Connect on LinkedIn
                  </a>
                </div>
              </TiltCard>
            </AnimateOnScroll>

            {/* Co-Founder — Kumar Kuppusamy */}
            <AnimateOnScroll direction="right">
              <TiltCard intensity={7}>
                <div style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.07),rgba(0,212,170,0.04))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 20, padding: '40px 32px', textAlign: 'center', backdropFilter: 'blur(16px)', height: '100%' }}>
                  <div style={{ width: 110, height: 140, borderRadius: 12, overflow: 'hidden', margin: '0 auto 22px', border: '2px solid rgba(124,58,237,0.4)', boxShadow: '0 0 24px rgba(124,58,237,0.2)', background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(155,94,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse-purple">
                    <img src="/team/kumar.jpg" alt="Kumar Kuppusamy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} onError={e => { e.currentTarget.style.display='none'; e.currentTarget.parentElement.innerHTML='<span style="font-size:36px;font-weight:800;color:#9B5EFF;font-family:Syne,sans-serif">KK</span>' }} />
                  </div>
                  <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: 'linear-gradient(135deg,#7C3AED,#9B5EFF)', color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Co-Founder</div>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Kumar Kuppusamy</h3>
                  <p style={{ fontSize: 13, color: 'rgba(232,240,254,0.5)', lineHeight: 1.7, marginBottom: 22, maxWidth: 300, margin: '0 auto 22px' }}>Co-founding AlgoGrass with deep expertise in technology and business strategy. Focused on scaling compliant, AI-driven tools for businesses of all sizes.</p>
                  <a href="https://www.linkedin.com/in/kumar-kuppusamy/" target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: 9, background: '#0A66C2', boxShadow: '0 4px 16px rgba(10,102,194,0.3)', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(10,102,194,0.5)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(10,102,194,0.3)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    Connect on LinkedIn
                  </a>
                </div>
              </TiltCard>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'rgba(13,21,37,0.8)', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div className="orb orb-teal" style={{ width: 600, height: 300, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.4 }} />
        <div className="wrap" style={{ maxWidth: 520, position: 'relative', zIndex: 1 }}>
          <AnimateOnScroll direction="scale">
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Try the free scanner today</h2>
            <p style={{ fontSize: 15, color: 'rgba(232,240,254,0.5)', marginBottom: 28, lineHeight: 1.7 }}>No account, no card. See your compliance position in seconds.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <a href="/scan" className="btn btn-primary">Scan my website →</a>
              <a href="/pricing" className="btn btn-secondary">View pricing</a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  )
}
