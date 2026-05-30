'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PLANS=[
  {id:'starter',name:'Starter',price:'£29/mo',desc:'1 scan/month · Privacy & Cookie policy'},
  {id:'growth',name:'Growth',price:'£79/mo',desc:'5 scans/month · AI assistant · Full doc suite',popular:true},
  {id:'agency',name:'Agency',price:'£199/mo',desc:'Unlimited scans · Multi-client · API'},
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({name:'',email:'',password:'',website:'',plan:'growth'})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))

  async function submit(e) {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true); setError('')
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: form.email, source: `signup-${form.plan}`, name: form.name, website: form.website }),
      })
    } catch {}
    await new Promise(r => setTimeout(r, 800))
    router.push('/dashboard')
  }

  return (
    <section style={{minHeight:'88vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 24px',background:'var(--cream)'}}>
      <div style={{width:'100%',maxWidth:480}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <a href="/" style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:22,color:'var(--green)',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:7,marginBottom:20}}>
            <svg width="22" height="25" viewBox="0 0 32 36" fill="none"><path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52"/><path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            AlgoGrass
          </a>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:700,color:'var(--ink)',marginBottom:5}}>
            {step===1 ? 'Create your account' : 'Choose your plan'}
          </h1>
          <p style={{fontSize:13,color:'var(--ink2)'}}>{step===1 ? 'Free to start — no credit card required.' : 'Upgrade or cancel any time.'}</p>
        </div>

        <div style={{display:'flex',gap:6,marginBottom:24}}>
          {[1,2].map(n=>(
            <div key={n} style={{flex:1,height:3,borderRadius:2,background:n<=step?'var(--green)':'var(--green-m)',transition:'background .3s'}}/>
          ))}
        </div>

        <div className="card" style={{padding:'30px 26px'}}>
          <form onSubmit={submit}>
            {step===1 ? (
              <>
                <div className="field-wrap">
                  <label className="field-label">Full name *</label>
                  <input className="field-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} required/>
                </div>
                <div className="field-wrap">
                  <label className="field-label">Work email *</label>
                  <input className="field-input" type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} required/>
                </div>
                <div className="field-wrap">
                  <label className="field-label">Website to scan (optional)</label>
                  <input className="field-input" placeholder="yourwebsite.co.uk" value={form.website} onChange={set('website')}/>
                </div>
                <div style={{marginBottom:22}}>
                  <label className="field-label">Password *</label>
                  <input className="field-input" type="password" placeholder="Minimum 8 characters" value={form.password} onChange={set('password')} required minLength={8}/>
                </div>
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:20}}>
                {PLANS.map(p=>(
                  <label key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 15px',borderRadius:11,border:`2px solid ${form.plan===p.id?'var(--green)':'var(--border)'}`,background:form.plan===p.id?'var(--green-p)':'var(--white)',cursor:'pointer',transition:'all .2s'}}>
                    <input type="radio" name="plan" value={p.id} checked={form.plan===p.id} onChange={()=>setForm(f=>({...f,plan:p.id}))} style={{accentColor:'var(--green)'}}/>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                        <span style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{p.name}</span>
                        {p.popular&&<span style={{fontSize:9,fontWeight:700,background:'var(--lime)',color:'var(--ink)',padding:'2px 7px',borderRadius:100,textTransform:'uppercase'}}>Popular</span>}
                      </div>
                      <div style={{fontSize:12,color:'var(--ink2)'}}>{p.desc}</div>
                    </div>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--green)',whiteSpace:'nowrap'}}>{p.price}</span>
                  </label>
                ))}
                <a href="/pricing" style={{textAlign:'center',fontSize:12,color:'var(--green)',marginTop:4}}>Compare all plans →</a>
              </div>
            )}
            {error && <p style={{fontSize:13,color:'var(--red-text)',marginBottom:12}}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Setting up your account...' : step===1 ? 'Continue →' : 'Get started →'}
            </button>
          </form>
        </div>

        <p style={{textAlign:'center',fontSize:13,color:'var(--ink2)',marginTop:16}}>
          Already have an account? <a href="/login" style={{color:'var(--green)',fontWeight:500}}>Log in</a>
        </p>
        <p style={{textAlign:'center',fontSize:11,color:'var(--ink2)',marginTop:8}}>
          By signing up you agree to our <a href="/privacy" style={{color:'var(--green)'}}>Privacy Policy</a> and <a href="/terms" style={{color:'var(--green)'}}>Terms of Service</a>.
        </p>
      </div>
    </section>
  )
}
