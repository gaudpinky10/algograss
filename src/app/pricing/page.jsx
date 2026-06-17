'use client'
import { useState } from 'react'

const PLANS = [
  { id:'starter', name:'Starter', mo:29,  yr:23,  desc:'Perfect for solo founders & small businesses',
    features:['1 website scan/month','Compliance risk report','Privacy policy generation','Cookie policy generation','Download reports','Email support'] },
  { id:'growth',  name:'Growth',  mo:79,  yr:63,  desc:'For actively growing businesses', popular:true,
    features:['5 scans/month','Full document suite (Privacy, Cookie, DPA)','Compliance dashboard','Scan history & tracking','AI compliance assistant','Priority support'] },
  { id:'agency',  name:'Agency',  mo:199, yr:159, desc:'For agencies managing multiple clients',
    features:['Unlimited scans','Multi-client dashboard','White-label reports','API access','DPA templates','Dedicated support'] },
  { id:'enterprise', name:'Enterprise', mo:0, yr:0, desc:'Custom compliance infrastructure', href:'/contact',
    features:['Everything in Agency','Custom integrations','99.9% SLA','Legal review add-on','SSO authentication','Account manager'] },
]

const FAQS = [
  { q:'Do I need to enter card details for the free trial?', a:'Yes — we collect your card details upfront to start the 1-month free trial. You will NOT be charged anything for 30 days. After your trial ends, your card is charged automatically at the plan rate. You can cancel any time during the trial and pay nothing.' },
  { q:'What happens after the free trial?', a:'After 30 days your subscription starts automatically. You\'ll receive an email reminder 7 days before the trial ends. Cancel any time from your dashboard — no charge if you cancel before trial ends.' },
  { q:'Can I cancel at any time?', a:'Yes. No contracts, no lock-in. Cancel any time from your dashboard. You keep access until the end of your billing period.' },
  { q:'Are the generated documents legally binding?', a:'AlgoGrass generates AI-powered documents based on current GDPR and UK DPA 2018. They are comprehensive, legally structured, and built to meet ICO requirements. Ready to publish — review with your legal team before using commercially.' },
  { q:'How accurate is the compliance scanner?', a:'Our scanner checks HTTPS, cookie consent, trackers, privacy policy, lawful basis, data rights, retention, DSAR contact, security headers, and more. It catches the vast majority of GDPR issues SMEs face.' },
  { q:'What payment methods do you accept?', a:'We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe — the same payment system used by Amazon and Deliveroo. Your card details are never stored on our servers.' },
]

export default function PricingPage() {
  const [annual,    setAnnual]    = useState(false)
  const [loading,   setLoading]   = useState(null)
  const [email,     setEmail]     = useState('')
  const [emailFor,  setEmailFor]  = useState(null) // { planId, trial }
  const [error,     setError]     = useState('')

  async function startCheckout(plan, trial) {
    if (plan.href) { window.location.href = plan.href; return }
    if (!email) { setEmailFor({ planId: plan.id, trial }); return }
    setError('')
    setLoading(plan.id + (trial ? '_trial' : '_pay'))
    try {
      const res  = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: plan.id, email, trial }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setError(data.error || 'Something went wrong. Please try again.')
    } catch { setError('Connection error. Please try again.') }
    setLoading(null)
  }

  function isLoading(planId, trial) { return loading === planId + (trial ? '_trial' : '_pay') }

  return (
    <>
      {/* ── HERO ── */}
      <section className="section" style={{ textAlign:'center', paddingBottom:56 }}>
        <div className="wrap" style={{ maxWidth:640, margin:'0 auto' }}>
          <span className="eyebrow" style={{ textAlign:'center' }}>Pricing</span>
          <h1 className="heading" style={{ fontSize:'clamp(30px,3.5vw,48px)', marginBottom:12 }}>Simple, honest pricing</h1>
          <p className="subtext" style={{ textAlign:'center', margin:'0 auto 8px' }}>No setup fees. No hidden charges. Cancel any time.</p>
          <p style={{ textAlign:'center', fontSize:14, color:'var(--green)', fontWeight:600, marginBottom:28 }}>🎁 All paid plans include a 1-month free trial — card required, nothing charged for 30 days</p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--white)', border:'1px solid var(--border)', borderRadius:100, padding:'5px 6px' }}>
            <button onClick={()=>setAnnual(false)} style={{ padding:'8px 18px', borderRadius:100, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background:!annual?'var(--green)':'transparent', color:!annual?'#fff':'var(--ink2)', transition:'all .2s' }}>Monthly</button>
            <button onClick={()=>setAnnual(true)}  style={{ padding:'8px 18px', borderRadius:100, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background:annual?'var(--green)':'transparent',  color:annual?'#fff':'var(--ink2)',  transition:'all .2s', display:'flex', alignItems:'center', gap:7 }}>
              Annual <span style={{ background:'var(--lime)', color:'var(--ink)', fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:100 }}>SAVE 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── EMAIL CAPTURE ── */}
      {emailFor && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'var(--white)', borderRadius:16, padding:32, maxWidth:420, width:'90%', boxShadow:'0 24px 80px rgba(0,0,0,.2)' }}>
            <h3 style={{ margin:'0 0 6px', fontSize:20, color:'var(--ink)' }}>Enter your email to continue</h3>
            <p style={{ fontSize:13, color:'var(--ink2)', margin:'0 0 20px' }}>
              {emailFor.trial
                ? "You're starting a 1-month free trial. We'll collect card details on the next screen — nothing is charged for 30 days."
                : "You're one step away from activating your plan. Enter your email to continue to secure checkout."}
            </p>
            <input
              type="email" placeholder="you@example.com" value={email}
              onChange={e=>setEmail(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&email&&startCheckout(PLANS.find(p=>p.id===emailFor.planId), emailFor.trial)}
              style={{ width:'100%', border:'1px solid var(--border)', borderRadius:9, padding:'11px 14px', fontSize:14, marginBottom:12, boxSizing:'border-box', outline:'none' }}
              autoFocus
            />
            {error && <p style={{ color:'#EF4444', fontSize:13, marginBottom:10 }}>{error}</p>}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>{setEmailFor(null);setError('')}} style={{ flex:1, padding:'11px', borderRadius:9, border:'1px solid var(--border)', background:'transparent', color:'var(--ink2)', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={()=>email&&startCheckout(PLANS.find(p=>p.id===emailFor.planId), emailFor.trial)} disabled={!email||!!loading}
                style={{ flex:2, padding:'11px', borderRadius:9, border:'none', background:'var(--green)', color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer' }}>
                {loading ? 'Loading…' : '→ Continue to payment'}
              </button>
            </div>
            <p style={{ fontSize:11, color:'var(--ink2)', textAlign:'center', marginTop:12 }}>🔒 Secured by Stripe. We never store your card details.</p>
          </div>
        </div>
      )}

      {/* ── PLAN CARDS ── */}
      <section style={{ paddingBottom:88 }}>
        <div className="wrap">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14 }}>
            {PLANS.map(p => (
              <div key={p.id} style={{ background:p.popular?'var(--green)':'var(--white)', border:p.popular?'none':'1px solid var(--border)', borderRadius:18, padding:24, position:'relative', display:'flex', flexDirection:'column' }}>
                {p.popular && <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', background:'var(--lime)', color:'var(--ink)', fontSize:9, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', padding:'4px 12px', borderRadius:100, whiteSpace:'nowrap' }}>Most popular</div>}

                <div style={{ fontSize:12, fontWeight:600, color:p.popular?'rgba(255,255,255,.65)':'var(--ink2)', marginBottom:6 }}>{p.name}</div>

                {p.mo ? (
                  <div style={{ marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:3 }}>
                      <span style={{ fontFamily:'Syne,sans-serif', fontSize:38, fontWeight:800, color:p.popular?'#fff':'var(--ink)', lineHeight:1 }}>£{annual?p.yr:p.mo}</span>
                      <span style={{ fontSize:12, color:p.popular?'rgba(255,255,255,.55)':'var(--ink2)', marginBottom:5 }}>/mo</span>
                    </div>
                    <div style={{ fontSize:11, color:p.popular?'rgba(255,255,255,.55)':'var(--green)', fontWeight:600 }}>🎁 First month FREE</div>
                  </div>
                ) : (
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:p.popular?'#fff':'var(--ink)', marginBottom:5 }}>Custom</div>
                )}

                <p style={{ fontSize:11, color:p.popular?'rgba(255,255,255,.6)':'var(--ink2)', margin:'8px 0 16px', lineHeight:1.5 }}>{p.desc}</p>

                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:9, marginBottom:22, flex:1 }}>
                  {p.features.map(f=>(
                    <li key={f} style={{ display:'flex', gap:7, fontSize:12, color:p.popular?'rgba(255,255,255,.86)':'var(--ink2)', lineHeight:1.4 }}>
                      <span style={{ color:p.popular?'var(--lime)':'var(--green)', fontWeight:700, flexShrink:0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>

                {/* FREE TRIAL button */}
                {p.mo ? (
                  <>
                    <button onClick={()=>startCheckout(p, true)} disabled={!!loading}
                      style={{ display:'block', width:'100%', padding:'11px', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:8,
                        background:p.popular?'var(--lime)':'var(--green)', color:p.popular?'var(--ink)':'#fff', border:'none' }}>
                      {isLoading(p.id, true) ? 'Loading…' : '🎁 Start free trial →'}
                    </button>
                    <button onClick={()=>startCheckout(p, false)} disabled={!!loading}
                      style={{ display:'block', width:'100%', padding:'9px', borderRadius:9, fontSize:12, fontWeight:500, cursor:'pointer',
                        background:'transparent', color:p.popular?'rgba(255,255,255,.7)':'var(--ink2)', border:`1px solid ${p.popular?'rgba(255,255,255,.25)':'var(--border)'}` }}>
                      {isLoading(p.id, false) ? 'Loading…' : 'Pay now — no trial'}
                    </button>
                    <p style={{ fontSize:10, color:p.popular?'rgba(255,255,255,.45)':'var(--ink2)', textAlign:'center', marginTop:8, lineHeight:1.4 }}>
                      Card required for trial · Not charged for 30 days
                    </p>
                  </>
                ) : (
                  <button onClick={()=>startCheckout(p, false)}
                    style={{ display:'block', width:'100%', padding:'12px', borderRadius:9, fontSize:13, fontWeight:500, cursor:'pointer', background:'var(--green-p)', color:'var(--green)', border:'1px solid var(--green-m)' }}>
                    Contact us →
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div style={{ display:'flex', gap:24, justifyContent:'center', flexWrap:'wrap', marginTop:36 }}>
            {['🔒 Secured by Stripe', '💳 All major cards accepted', '❌ Cancel any time', '🇬🇧 UK GDPR compliant', '📧 Receipts sent instantly'].map(t=>(
              <span key={t} style={{ fontSize:12, color:'var(--ink2)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW TRIAL WORKS ── */}
      <section style={{ background:'var(--white)', padding:'64px 0', borderTop:'1px solid var(--border)' }}>
        <div className="wrap" style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <span className="eyebrow" style={{ textAlign:'center' }}>Free trial</span>
          <h2 className="heading" style={{ fontSize:'clamp(22px,3vw,36px)', marginBottom:40 }}>How the 1-month free trial works</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:24, textAlign:'left' }}>
            {[
              { step:'1', icon:'📋', title:'Choose your plan', desc:'Pick the plan that fits your business. All paid plans include a 1-month free trial.' },
              { step:'2', icon:'💳', title:'Enter card details', desc:'Stripe securely stores your card. Nothing is charged now — your card is only saved for after the trial.' },
              { step:'3', icon:'🎁', title:'Use AlgoGrass free for 30 days', desc:'Full access to all features. Cancel any time before day 30 and pay absolutely nothing.' },
              { step:'4', icon:'🔄', title:'Auto-renews after trial', desc:'On day 31, your subscription starts at the plan price. You\'ll get a reminder email 7 days before.' },
            ].map(s=>(
              <div key={s.step} style={{ background:'var(--bg)', borderRadius:12, padding:20 }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{s.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--green)', marginBottom:4 }}>STEP {s.step}</div>
                <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>{s.title}</div>
                <div style={{ fontSize:12, color:'var(--ink2)', lineHeight:1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-white">
        <div className="wrap" style={{ maxWidth:700, margin:'0 auto' }}>
          <span className="eyebrow" style={{ textAlign:'center' }}>FAQ</span>
          <h2 className="heading" style={{ fontSize:'clamp(24px,3vw,38px)', textAlign:'center', marginBottom:44 }}>Common questions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
            {FAQS.map(f=><FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      <section style={{ padding:'72px 0', textAlign:'center' }}>
        <div className="wrap" style={{ maxWidth:500 }}>
          <h2 className="heading" style={{ fontSize:'clamp(22px,2.5vw,32px)', marginBottom:12 }}>Still have questions?</h2>
          <p className="subtext" style={{ marginBottom:26, textAlign:'center' }}>We respond within one business day.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
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
    <div style={{ border:'1px solid var(--border)', borderRadius:11, overflow:'hidden', marginBottom:2 }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:open?'var(--green-p)':'var(--white)', border:'none', cursor:'pointer', textAlign:'left', fontSize:14, fontWeight:500, color:'var(--ink)', gap:12 }}>
        {q}<span style={{ fontSize:20, color:'var(--green)', transform:open?'rotate(45deg)':'none', transition:'transform .2s', flexShrink:0 }}>+</span>
      </button>
      {open && <div style={{ padding:'0 20px 16px', fontSize:13, color:'var(--ink2)', lineHeight:1.7 }}>{a}</div>}
    </div>
  )
}
