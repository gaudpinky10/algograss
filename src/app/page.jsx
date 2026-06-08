'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  return (<><Hero/><Logos/><Problem/><HowItWorks/><Features/><EarlyAccess/><CtaBanner/></>)
}

function Hero() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  return (
    <section style={{minHeight:'91vh',display:'flex',alignItems:'center',padding:'56px 0',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 55% at 78% 40%, rgba(184,217,106,.13) 0%, transparent 70%)'}}/>
      <div style={{position:'absolute',inset:0,opacity:.028,backgroundImage:'linear-gradient(var(--ink) 1px,transparent 1px),linear-gradient(90deg,var(--ink) 1px,transparent 1px)',backgroundSize:'44px 44px'}}/>
      <div className="wrap" style={{position:'relative',zIndex:1,width:'100%',display:'grid',gridTemplateColumns:'1fr 360px',gap:64,alignItems:'center'}}>
        <div>
          <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'var(--green-p)',border:'1px solid var(--green-m)',padding:'5px 13px',borderRadius:100,marginBottom:28,fontSize:11,fontWeight:600,color:'var(--green)',letterSpacing:'.06em',textTransform:'uppercase'}}>
            <span style={{width:6,height:6,background:'var(--lime-d)',borderRadius:'50%'}}/>
            AI compliance tools for UK & EU SMEs — Live now
          </div>
          <h1 className="display" style={{fontSize:'clamp(42px, 5.5vw, 74px)',marginBottom:22}}>
            GDPR compliance<br/>made simple for<br/><span style={{color:'var(--green)'}}>small businesses</span>
          </h1>
          <p className="subtext" style={{maxWidth:500,marginBottom:34}}>
            AlgoGrass scans your website, identifies GDPR risks, and generates privacy documents automatically — in minutes, not months.
          </p>
          <form onSubmit={e=>{e.preventDefault();router.push('/scan')}} style={{display:'flex',background:'var(--white)',border:'1.5px solid var(--green-m)',borderRadius:12,padding:'5px 5px 5px 16px',maxWidth:470,marginBottom:14,gap:8}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="yourwebsite.co.uk" style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,color:'var(--ink)'}}/>
            <button type="submit" className="btn btn-primary btn-sm">Scan free →</button>
          </form>
          <p style={{fontSize:12,color:'var(--ink2)'}}>No credit card · No account needed · GDPR + UK DPA 2018 + ePrivacy</p>
          <div style={{display:'flex',gap:36,marginTop:44}}>
            {[['€20M','Max GDPR fine','GDPR Art. 83'],['72 hrs','Breach notification limit','GDPR Art. 33'],['£29/mo','AlgoGrass starting price','']].map(([n,l,src])=>(
              <div key={n}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:700,color:'var(--green)',lineHeight:1}}>{n}</div>
                <div style={{fontSize:11,color:'var(--ink2)',marginTop:3}}>{l}</div>
                {src&&<div style={{fontSize:10,color:'var(--green)',marginTop:1,opacity:.75}}>Source: {src}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{padding:22,boxShadow:'0 24px 60px rgba(10,15,13,.1)'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--cream)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 13px',marginBottom:18,fontSize:12,color:'var(--ink2)'}}>
            <span style={{width:7,height:7,background:'var(--lime-d)',borderRadius:'50%'}}/>
            example-site.co.uk — scan complete
          </div>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
            <div style={{width:64,height:64,borderRadius:'50%',background:'conic-gradient(var(--green) 252deg, var(--green-p) 252deg)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',flexShrink:0}}>
              <div style={{position:'absolute',width:48,height:48,background:'var(--white)',borderRadius:'50%'}}/>
              <span style={{position:'relative',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:17,color:'var(--green)',zIndex:1}}>70</span>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:500}}>Compliance score</div>
              <div style={{fontSize:11,color:'var(--ink2)',marginTop:2}}>3 issues found · action needed</div>
            </div>
          </div>
          {[['High','chip-high','No cookie consent banner'],['Medium','chip-medium','Privacy policy missing lawful basis'],['Low','chip-low','Contact form lacks privacy notice']].map(([sev,cls,text])=>(
            <div key={sev} style={{display:'flex',alignItems:'flex-start',gap:9,padding:'9px 0',borderBottom:'1px solid var(--green-p)'}}>
              <span className={`chip ${cls}`} style={{marginTop:1}}>{sev}</span>
              <span style={{fontSize:12,color:'var(--ink2)',lineHeight:1.4,paddingTop:1}}>{text}</span>
            </div>
          ))}
          <a href="/scan" className="btn btn-primary btn-full" style={{marginTop:14,borderRadius:8}}>Scan your website →</a>
          <p style={{fontSize:10,color:'var(--ink2)',textAlign:'center',marginTop:8}}>Example result · scan your own site for free</p>
        </div>
      </div>
    </section>
  )
}

function Logos() {
  return (
    <div style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'var(--white)',padding:'18px 0'}}>
      <div className="wrap" style={{display:'flex',alignItems:'center',gap:36,flexWrap:'wrap'}}>
        <span style={{fontSize:11,fontWeight:600,color:'var(--ink2)',letterSpacing:'.08em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Works with websites built on</span>
        {['Shopify','WordPress','Wix','Squarespace','Webflow','HubSpot'].map(l=>(
          <span key={l} style={{fontSize:13,fontWeight:600,color:'var(--ink2)',opacity:.4}}>{l}</span>
        ))}
      </div>
    </div>
  )
}

function Problem() {
  return (
    <section className="section">
      <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center'}}>
        <div>
          <span className="eyebrow">The challenge</span>
          <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:16}}>Privacy compliance is a real obligation — and most SMEs are not fully prepared</h2>
          <p className="subtext" style={{marginBottom:14}}>GDPR and the UK Data Protection Act 2018 impose genuine legal obligations on any business collecting personal data — including something as routine as a contact form.</p>
          <p style={{fontSize:13,color:'var(--ink2)',marginBottom:28,lineHeight:1.6,fontStyle:'italic'}}>AlgoGrass gives you everything you need to become fully GDPR compliant — from identifying risks to generating all required documentation.</p>
          <a href="/scan" className="btn btn-primary">Check your website →</a>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[{n:'€20M',l:'Maximum GDPR fine — or 4% of global annual turnover',src:'GDPR Art. 83'},{n:'72 hrs',l:'Time limit to notify the ICO after a personal data breach',src:'GDPR Art. 33'},{n:'Art. 13',l:'GDPR article requiring a privacy notice for all data collection',src:'GDPR Art. 13'},{n:'8 rights',l:'Data subject rights every business collecting data must uphold',src:'GDPR Art. 15–22'}].map(({n,l,src})=>(
            <div key={n} className="card card-hover" style={{padding:'20px 18px'}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,color:'var(--green)',marginBottom:5}}>{n}</div>
              <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.5,marginBottom:4}}>{l}</div>
              <div style={{fontSize:10,color:'var(--green)',opacity:.8}}>Source: {src}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="section-white">
      <div className="wrap">
        <span className="eyebrow">How it works</span>
        <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:10}}>From scan to documented in 3 steps</h2>
        <p className="subtext" style={{maxWidth:480,marginBottom:44}}>Built for founders and business owners — not compliance specialists.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:44}}>
          {[{n:'01',title:'Scan your website',desc:'Paste your URL. AlgoGrass fetches your live website and checks for cookies, trackers, data forms, and consent mechanisms against GDPR and UK DPA 2018.'},{n:'02',title:'Review your risk report',desc:'Get a plain-English compliance report with your score, every issue ranked by severity, the specific regulation it relates to, and clear guidance.'},{n:'03',title:'Generate your documents',desc:'One click generates a tailored privacy policy, cookie policy, and DPA — powered by AI and based on your actual scan results. Download instantly.'}].map(({n,title,desc},i)=>(
            <div key={n} style={{background:'var(--cream)',padding:'32px 28px',borderRadius:i===0?'18px 0 0 18px':i===2?'0 18px 18px 0':0}}>
              <div style={{fontFamily:'Syne,sans-serif',fontSize:46,fontWeight:800,color:'var(--green-m)',lineHeight:1,marginBottom:14,letterSpacing:'-2px'}}>{n}</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,color:'var(--ink)',marginBottom:9}}>{title}</h3>
              <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{textAlign:'center'}}><a href="/scan" className="btn btn-primary btn-lg">Try the free scanner →</a></div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section className="section">
      <div className="wrap">
        <span className="eyebrow">Features</span>
        <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:10}}>Everything you need to stay compliant</h2>
        <p className="subtext" style={{maxWidth:520,marginBottom:44}}>All features are live and available today.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,marginBottom:22}}>
          {[
            {icon:'🔍',title:'Live website scanner',desc:'Fetches your actual website and checks for cookies, trackers, data forms, HTTPS, and consent mechanisms. Real analysis of your real site — not a questionnaire.',badge:'Live'},
            {icon:'📄',title:'AI document generator',desc:'Generates privacy policies, cookie notices, and data processing agreements based on your scan. Powered by Claude AI. Download instantly as text files.',badge:'Live'},
            {icon:'📊',title:'Compliance dashboard',desc:'Track your score, view open issues by severity and regulation, get a prioritised remediation list, and re-scan any time to measure progress.',badge:'Live'},
            {icon:'🤖',title:'AI compliance assistant',desc:'Ask questions about GDPR, UK DPA 2018, cookie law, and data subject rights in plain English. Context-aware and powered by Claude AI.',badge:'Live'},
            {icon:'📋',title:'Scan history',desc:'Your last 10 scans are saved locally so you can track compliance improvement over time and re-scan with one click.',badge:'Live'},
            {icon:'⬇️',title:'Download compliance reports',desc:'Export your full compliance report as a text file — useful for internal audits, investor due diligence, or sharing with your legal team.',badge:'Live'},
          ].map(({icon,title,desc,badge})=>(
            <div key={title} className="card card-hover">
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                <div style={{width:42,height:42,borderRadius:10,background:'var(--green-p)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>{icon}</div>
                {badge&&<span style={{fontSize:10,fontWeight:700,background:'#F0FDF4',color:'var(--green)',padding:'2px 8px',borderRadius:100,letterSpacing:'.05em',textTransform:'uppercase'}}>{badge}</span>}
              </div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:600,color:'var(--ink)',marginBottom:8}}>{title}</h3>
              <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{background:'var(--green-p)',border:'1px solid var(--green-m)',borderRadius:12,padding:'16px 20px',marginBottom:28}}>
          <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7}}><strong style={{color:'var(--green)'}}>Important:</strong> AlgoGrass delivers expert GDPR compliance — scanning, risk assessment, document generation, and regulatory guidance — built for UK and EU businesses. Trusted, accurate, and actionable.</p>
        </div>
        <div style={{textAlign:'center',display:'flex',gap:12,justifyContent:'center'}}>
          <a href="/pricing" className="btn btn-secondary">See pricing</a>
          <a href="/scan" className="btn btn-primary">Try the free scanner →</a>
        </div>
      </div>
    </section>
  )
}

function EarlyAccess() {
  const [email,setEmail]=useState('')
  const [done,setDone]=useState(false)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function join() {
    if (!email) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email, source: 'homepage-early-access' })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <section style={{padding:'88px 0',background:'var(--green)'}}>
      <div className="wrap">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center'}}>
          <div>
            <span style={{fontSize:11,fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--lime)',marginBottom:12,display:'block'}}>Early access</span>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(24px,3vw,38px)',fontWeight:700,color:'#fff',marginBottom:16,lineHeight:1.15}}>AlgoGrass is live — start for free today</h2>
            <p style={{fontSize:15,color:'rgba(255,255,255,.75)',lineHeight:1.75,fontWeight:300,marginBottom:24}}>Our full compliance platform is available now. Scan your website, generate documents, and track your compliance score — all in one place.</p>
            {[
              '✓  Free compliance scanner — available right now',
              '✓  AI document generation — live now',
              '✓  Compliance dashboard — live now',
              '✓  Early access members get 3 months free on annual plan',
            ].map(t=>(
              <div key={t} style={{fontSize:14,color:'rgba(255,255,255,.85)',marginBottom:8}}>{t}</div>
            ))}
          </div>
          <div style={{background:'rgba(255,255,255,.1)',border:'1px solid rgba(255,255,255,.2)',borderRadius:18,padding:'36px 32px'}}>
            {done ? (
              <div style={{textAlign:'center',padding:'24px 0'}}>
                <div style={{fontSize:48,marginBottom:16}}>🎉</div>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'#fff',marginBottom:10}}>You are on the list!</h3>
                <p style={{fontSize:14,color:'rgba(255,255,255,.75)',marginBottom:20}}>We have saved your spot. Try the free scanner now.</p>
                <a href="/scan" className="btn btn-lime">Try the free scanner →</a>
              </div>
            ) : (
              <>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'#fff',marginBottom:8}}>Join the early access list</h3>
                <p style={{fontSize:13,color:'rgba(255,255,255,.65)',marginBottom:22,lineHeight:1.6}}>Get 3 months free on any annual plan. No spam. Unsubscribe any time.</p>
                <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&join()}
                  style={{width:'100%',border:'1.5px solid rgba(255,255,255,.25)',borderRadius:9,padding:'12px 14px',fontSize:14,background:'rgba(255,255,255,.1)',color:'#fff',outline:'none',marginBottom:12,boxSizing:'border-box'}}/>
                {error&&<p style={{fontSize:12,color:'#fca5a5',marginBottom:8}}>{error}</p>}
                <button onClick={join} disabled={loading} className="btn btn-lime btn-full">
                  {loading ? 'Saving...' : 'Join early access →'}
                </button>
                <p style={{fontSize:11,color:'rgba(255,255,255,.4)',marginTop:10,textAlign:'center'}}>Your email will only be used for AlgoGrass updates.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section style={{padding:'88px 0',background:'var(--green-p)',textAlign:'center'}}>
      <div className="wrap" style={{maxWidth:600}}>
        <span className="eyebrow" style={{textAlign:'center'}}>Start today — it is free</span>
        <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:14,textAlign:'center'}}>Find out your compliance score right now</h2>
        <p className="subtext" style={{textAlign:'center',margin:'0 auto 32px'}}>No account required. No credit card. Scan any website and get your report in seconds.</p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/scan" className="btn btn-primary btn-lg">Scan my website free →</a>
          <a href="/pricing" className="btn btn-secondary btn-lg">View pricing</a>
        </div>
        <p style={{fontSize:11,color:'var(--ink2)',marginTop:16}}>AlgoGrass — The GDPR compliance platform trusted by UK & EU businesses. Scan, document, and stay compliant with confidence.</p>
      </div>
    </section>
  )
}
