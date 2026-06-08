'use client'
import { useState } from 'react'

const PLANS = [
  { id: 'starter', name: 'Starter', mo: 29, yr: 23, desc: 'Perfect for solo founders', features: ['1 website scan/month', 'Compliance risk report', 'Privacy policy generation', 'Cookie policy generation', 'Download reports', 'Email support'] },
  { id: 'growth', name: 'Growth', mo: 79, yr: 63, desc: 'For actively growing businesses', popular: true, features: ['5 scans/month', 'Full document suite (Privacy, Cookie, DPA)', 'Compliance dashboard', 'Scan history & tracking', 'AI compliance assistant', 'Priority support'] },
  { id: 'agency', name: 'Agency', mo: 199, yr: 159, desc: 'For agencies with multiple clients', features: ['Unlimited scans', 'Multi-client dashboard', 'White-label reports', 'API access', 'DPA templates', 'Dedicated support'] },
  { id: 'enterprise', name: 'Enterprise', mo: 500, yr: 400, desc: 'Custom compliance infrastructure', href: '/contact', features: ['Everything in Agency', 'Custom integrations', '99.9% SLA', 'Legal review add-on', 'SSO authentication', 'Account manager'] },
]

const FAQS = [
  { q: 'Are the generated documents legally binding?', a: 'AlgoGrass generates AI-powered documents based on current GDPR and UK DPA 2018. They are comprehensive, legally structured, and built to meet GDPR and UK DPA 2018 requirements. Ready to publish.' },
  { q: 'How accurate is the compliance scanner?', a: 'Our scanner checks for the most common GDPR issues including cookies, consent mechanisms, privacy policy presence, data forms, trackers, retention policies, and DSAR contacts. It catches the vast majority of issues SMEs face.' },
  { q: 'Can I cancel at any time?', a: 'Yes. No contracts, no lock-in. Cancel any time from your dashboard. You keep access until the end of your billing period.' },
  { q: 'What regulations do you cover?', a: 'GDPR (EU), UK Data Protection Act 2018, ePrivacy Regulations (Cookie Law), and ICO guidance. US CCPA guidance coming soon.' },
  { q: 'Is there a free trial?', a: 'Your first website scan is completely free — no credit card required. Growth plan customers get a 7-day free trial before billing starts.' },
  { q: 'How does payment work?', a: 'We use Stripe for secure payment processing. We accept all major credit and debit cards. Subscriptions renew monthly or annually depending on your choice.' },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [loading, setLoading] = useState(null)
  const [email, setEmail] = useState('')
  const [showEmail, setShowEmail] = useState(null)

  async function handleCheckout(plan) {
    if (plan.href) { window.location.href = plan.href; return }
    if (!email) { setShowEmail(plan.id); return }
    setLoading(plan.id)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, email }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      if (data.error) { window.location.href = '/signup'; return }
    } catch { window.location.href = '/signup' }
    setLoading(null)
  }

  return (
    <>
      <section className="section" style={{ textAlign: 'center', paddingBottom: 56 }}>
        <div className="wrap" style={{ maxWidth: 640, margin: '0 auto' }}>
          <span className="eyebrow" style={{ textAlign: 'center' }}>Pricing</span>
          <h1 className="heading" style={{ fontSize: 'clamp(30px,3.5vw,48px)', marginBottom: 12 }}>Simple, honest pricing</h1>
          <p className="subtext" style={{ textAlign: 'center', margin: '0 auto 28px' }}>No setup fees. No hidden charges. Cancel any time.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 100, padding: '5px 6px' }}>
            <button onClick={() => setAnnual(false)} style={{ padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: !annual ? 'var(--green)' : 'transparent', color: !annual ? '#fff' : 'var(--ink2)', transition: 'all .2s' }}>Monthly</button>
            <button onClick={() => setAnnual(true)} style={{ padding: '8px 18px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: annual ? 'var(--green)' : 'transparent', color: annual ? '#fff' : 'var(--ink2)', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 7 }}>
              Annual <span style={{ background: 'var(--lime)', color: 'var(--ink)', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100 }}>SAVE 20%</span>
            </button>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 88 }}>
        <div className="wrap">
          {showEmail && (
            <div style={{ background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, maxWidth: 560, margin: '0 auto 24px' }}>
              <input type="email" placeholder="Enter your email to continue" value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, border: '1px solid var(--green-m)', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none' }} />
              <button onClick={() => handleCheckout(PLANS.find(p => p.id === showEmail))} className="btn btn-primary btn-sm">Continue →</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ background: p.popular ? 'var(--green)' : 'var(--white)', border: p.popular ? 'none' : '1px solid var(--border)', borderRadius: 18, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {p.popular && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: 'var(--lime)', color: 'var(--ink)', fontSize: 9, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>Most popular</div>}
                <div style={{ fontSize: 12, fontWeight: 600, color: p.popular ? 'rgba(255,255,255,.65)' : 'var(--ink2)', marginBottom: 6 }}>{p.name}</div>
                {p.mo ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, marginBottom: 5 }}>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 38, fontWeight: 800, color: p.popular ? '#fff' : 'var(--ink)', lineHeight: 1 }}>£{annual ? p.yr : p.mo}</span>
                    <span style={{ fontSize: 12, color: p.popular ? 'rgba(255,255,255,.55)' : 'var(--ink2)', marginBottom: 5 }}>/mo</span>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: p.popular ? '#fff' : 'var(--ink)', marginBottom: 5 }}>Custom</div>
                )}
                <p style={{ fontSize: 11, color: p.popular ? 'rgba(255,255,255,.6)' : 'var(--ink2)', marginBottom: 20, lineHeight: 1.5 }}>{p.desc}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22, flex: 1 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 7, fontSize: 12, color: p.popular ? 'rgba(255,255,255,.86)' : 'var(--ink2)', lineHeight: 1.4 }}>
                      <span style={{ color: p.popular ? 'var(--lime)' : 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleCheckout(p)} disabled={loading === p.id}
                  style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: p.popular ? 'var(--lime)' : 'var(--green-p)', color: p.popular ? 'var(--ink)' : 'var(--green)', border: p.popular ? 'none' : '1px solid var(--green-m)', width: '100%' }}>
                  {loading === p.id ? 'Loading...' : p.href ? 'Contact us' : 'Get started →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-white">
        <div className="wrap" style={{ maxWidth: 700, margin: '0 auto' }}>
          <span className="eyebrow" style={{ textAlign: 'center' }}>FAQ</span>
          <h2 className="heading" style={{ fontSize: 'clamp(24px,3vw,38px)', textAlign: 'center', marginBottom: 44 }}>Common questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      <section style={{ padding: '72px 0', textAlign: 'center' }}>
        <div className="wrap" style={{ maxWidth: 500 }}>
          <h2 className="heading" style={{ fontSize: 'clamp(22px,2.5vw,32px)', marginBottom: 12 }}>Still have questions?</h2>
          <p className="subtext" style={{ marginBottom: 26, textAlign: 'center' }}>We respond within one business day.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <a href="/contact" className="btn btn-secondary">Contact us</a>
            <a href="/scan" className="btn btn-primary">Try free scanner →</a>
          </div>
        </div>
      </section>
    </>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 11, overflow: 'hidden', marginBottom: 2 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: open ? 'var(--green-p)' : 'var(--white)', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 500, color: 'var(--ink)', gap: 12 }}>
        {q}<span style={{ fontSize: 20, color: 'var(--green)', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>+</span>
      </button>
      {open && <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--ink2)', lineHeight: 1.7 }}>{a}</div>}
    </div>
  )
}
