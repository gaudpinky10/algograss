'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import ParticleCanvas from '@/components/ParticleCanvas'
import CountUp from '@/components/CountUp'
import TiltCard from '@/components/TiltCard'

export default function Home() {
  return (<><Hero/><Logos/><Problem/><HowItWorks/><Features/><EarlyAccess/><CtaBanner/></>)
}

function Hero() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  return (
    <section style={{minHeight:'91vh',display:'flex',alignItems:'center',padding:'56px 0',position:'relative',overflow:'hidden'}}>
      {/* Particle network background */}
      <ParticleCanvas count={90} speed={0.35} connectDist={120} />

      {/* Glow orbs */}
      <div className="orb orb-teal" style={{width:700,height:700,top:'-20%',right:'-10%',opacity:0.8}}/>
      <div className="orb orb-purple" style={{width:500,height:500,bottom:'-10%',left:'-8%',opacity:0.7}}/>
      <div className="orb orb-blue" style={{width:400,height:400,top:'30%',left:'30%',opacity:0.4}}/>

      {/* Grid overlay */}
      <div style={{position:'absolute',inset:0,opacity:.028,backgroundImage:'linear-gradient(var(--ink) 1px,transparent 1px),linear-gradient(90deg,var(--ink) 1px,transparent 1px)',backgroundSize:'44px 44px',pointerEvents:'none'}}/>

      <div className="wrap" style={{position:'relative',zIndex:1,width:'100%',display:'grid',gridTemplateColumns:'1fr 360px',gap:64,alignItems:'center'}}>
        <div>
          {/* Badge */}
          <div className="animate-fade-up" style={{animationDelay:'0.1s',display:'inline-flex',alignItems:'center',gap:7,background:'var(--green-p)',border:'1px solid var(--green-m)',padding:'5px 13px',borderRadius:100,marginBottom:28,fontSize:11,fontWeight:600,color:'var(--green)',letterSpacing:'.06em',textTransform:'uppercase'}}>
            <span className="ping" style={{width:6,height:6,background:'var(--accent)',borderRadius:'50%',display:'inline-block'}}/>
            AI compliance tools for UK & EU SMEs — Live now
          </div>

          {/* Headline */}
          <h1 className="display animate-fade-up" style={{animationDelay:'0.2s',fontSize:'clamp(42px, 5.5vw, 74px)',marginBottom:22}}>
            GDPR compliance<br/>made simple for<br/>
            <span className="animate-gradient-text">small businesses</span>
          </h1>

          <p className="subtext animate-fade-up" style={{animationDelay:'0.35s',maxWidth:500,marginBottom:34}}>
            AlgoGrass scans your website, identifies GDPR risks, and generates privacy documents automatically — in minutes, not months.
          </p>

          {/* Scan form */}
          <form className="animate-fade-up" style={{animationDelay:'0.45s'}} onSubmit={e=>{e.preventDefault();router.push('/scan')}}>
            <div style={{display:'flex',background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(0,212,170,0.3)',borderRadius:12,padding:'5px 5px 5px 16px',maxWidth:470,marginBottom:14,gap:8,backdropFilter:'blur(8px)',transition:'border-color 0.3s'}}
              onFocus={e=>e.currentTarget.style.borderColor='rgba(0,212,170,0.7)'}
              onBlur={e=>e.currentTarget.style.borderColor='rgba(0,212,170,0.3)'}>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="yourwebsite.co.uk"
                style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,color:'var(--ink)'}}/>
              <button type="submit" className="btn btn-primary btn-sm animate-pulse-glow">Scan free →</button>
            </div>
          </form>
          <p className="animate-fade-up" style={{animationDelay:'0.5s',fontSize:12,color:'var(--ink2)'}}>No credit card · No account needed · GDPR + UK DPA 2018 + ePrivacy</p>

          {/* Animated stats */}
          <div className="animate-fade-up" style={{animationDelay:'0.65s',display:'flex',gap:36,marginTop:44}}>
            {[
              {end:20,suffix:'M',prefix:'€',label:'Max GDPR fine',src:'GDPR Art. 83'},
              {end:72,suffix:' hrs',label:'Breach notification',src:'GDPR Art. 33'},
              {end:29,prefix:'£',suffix:'/mo',label:'Starting price',src:''},
            ].map(({end,suffix,prefix,label,src})=>(
              <div key={label}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:700,color:'var(--accent)',lineHeight:1}}>
                  <CountUp end={end} suffix={suffix} prefix={prefix}/>
                </div>
                <div style={{fontSize:11,color:'var(--ink2)',marginTop:3}}>{label}</div>
                {src&&<div style={{fontSize:10,color:'var(--accent)',marginTop:1,opacity:.75}}>Source: {src}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Hero card — 3D tilt */}
        <TiltCard intensity={8}>
          <div className="card animate-scale-in" style={{animationDelay:'0.5s',padding:22,boxShadow:'0 24px 80px rgba(0,0,0,0.4)',border:'1px solid rgba(0,212,170,0.15)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:8,padding:'9px 13px',marginBottom:18,fontSize:12,color:'var(--ink2)'}}>
              <span style={{width:7,height:7,background:'var(--accent)',borderRadius:'50%'}} className="animate-pulse-glow"/>
              example-site.co.uk — scan complete
            </div>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'conic-gradient(var(--accent) 252deg, rgba(0,212,170,0.1) 252deg)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',flexShrink:0}} className="animate-pulse-glow">
                <div style={{position:'absolute',width:48,height:48,background:'var(--bg2)',borderRadius:'50%'}}/>
                <span style={{position:'relative',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:17,color:'var(--accent)',zIndex:1}}>70</span>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Compliance score</div>
                <div style={{fontSize:11,color:'var(--ink2)',marginTop:2}}>3 issues found · action needed</div>
              </div>
            </div>
            {[['High','chip-high','No cookie consent banner'],['Medium','chip-medium','Privacy policy missing lawful basis'],['Low','chip-low','Contact form lacks privacy notice']].map(([sev,cls,text])=>(
              <div key={sev} style={{display:'flex',alignItems:'flex-start',gap:9,padding:'9px 0',borderBottom:'1px solid rgba(0,212,170,0.08)'}}>
                <span className={`chip ${cls}`} style={{marginTop:1}}>{sev}</span>
                <span style={{fontSize:12,color:'var(--ink2)',lineHeight:1.4,paddingTop:1}}>{text}</span>
              </div>
            ))}
            <a href="/scan" className="btn btn-primary btn-full" style={{marginTop:14,borderRadius:8}}>Scan your website →</a>
            <p style={{fontSize:10,color:'var(--ink2)',textAlign:'center',marginTop:8}}>Example result · scan your own site for free</p>
          </div>
        </TiltCard>
      </div>
    </section>
  )
}

function Logos() {
  return (
    <AnimateOnScroll>
      <div style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.02)',padding:'18px 0'}}>
        <div className="wrap" style={{display:'flex',alignItems:'center',gap:36,flexWrap:'wrap'}}>
          <span style={{fontSize:11,fontWeight:600,color:'var(--ink2)',letterSpacing:'.08em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Works with websites built on</span>
          {['Shopify','WordPress','Wix','Squarespace','Webflow','HubSpot'].map((l,i)=>(
            <span key={l} style={{fontSize:13,fontWeight:600,color:'var(--ink2)',opacity:.4,transition:'opacity 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='.9'}
              onMouseLeave={e=>e.currentTarget.style.opacity='.4'}>{l}</span>
          ))}
        </div>
      </div>
    </AnimateOnScroll>
  )
}

function Problem() {
  return (
    <section className="section" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-purple" style={{width:500,height:500,top:'-10%',right:'-15%',opacity:0.4}}/>
      <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center',position:'relative',zIndex:1}}>
        <AnimateOnScroll direction="left">
          <span className="eyebrow">The challenge</span>
          <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:16}}>Privacy compliance is a real obligation — and most SMEs are not fully prepared</h2>
          <p className="subtext" style={{marginBottom:14}}>GDPR and the UK Data Protection Act 2018 impose genuine legal obligations on any business collecting personal data — including something as routine as a contact form.</p>
          <p style={{fontSize:13,color:'var(--ink2)',marginBottom:28,lineHeight:1.6,fontStyle:'italic'}}>AlgoGrass gives you everything you need to become fully GDPR compliant — from identifying risks to generating all required documentation.</p>
          <a href="/scan" className="btn btn-primary">Check your website →</a>
        </AnimateOnScroll>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[
            {end:20,suffix:'M',prefix:'€',l:'Maximum GDPR fine — or 4% of global annual turnover',src:'GDPR Art. 83',d:1},
            {end:72,suffix:' hrs',l:'Time limit to notify the ICO after a personal data breach',src:'GDPR Art. 33',d:2},
            {end:13,suffix:'',prefix:'Art. ',l:'GDPR article requiring a privacy notice for all data collection',src:'GDPR Art. 13',d:3},
            {end:8,suffix:' rights',l:'Data subject rights every business collecting data must uphold',src:'GDPR Art. 15–22',d:4},
          ].map(({end,suffix,prefix,l,src,d})=>(
            <AnimateOnScroll key={src} delay={d} direction="scale">
              <TiltCard intensity={6}>
                <div className="card card-hover" style={{padding:'20px 18px',height:'100%'}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,color:'var(--accent)',marginBottom:5}}>
                    <CountUp end={end} suffix={suffix} prefix={prefix||''}/>
                  </div>
                  <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.5,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:10,color:'var(--accent)',opacity:.8}}>Source: {src}</div>
                </div>
              </TiltCard>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="section-white" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-teal" style={{width:400,height:400,bottom:'-15%',right:'5%',opacity:0.3}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <span className="eyebrow">How it works</span>
          <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:10}}>From scan to documented in 3 steps</h2>
          <p className="subtext" style={{maxWidth:480,marginBottom:44}}>Built for founders and business owners — not compliance specialists.</p>
        </AnimateOnScroll>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3,marginBottom:44}}>
          {[
            {n:'01',title:'Scan your website',desc:'Paste your URL. AlgoGrass fetches your live website and checks for cookies, trackers, data forms, and consent mechanisms against GDPR and UK DPA 2018.'},
            {n:'02',title:'Review your risk report',desc:'Get a plain-English compliance report with your score, every issue ranked by severity, the specific regulation it relates to, and clear guidance.'},
            {n:'03',title:'Generate your documents',desc:'One click generates a tailored privacy policy, cookie policy, and DPA — powered by AI and based on your actual scan results. Download instantly.'},
          ].map(({n,title,desc},i)=>(
            <AnimateOnScroll key={n} delay={i+1}>
              <div style={{background:'var(--bg2)',padding:'32px 28px',borderRadius:i===0?'18px 0 0 18px':i===2?'0 18px 18px 0':0,height:'100%',transition:'transform 0.3s,box-shadow 0.3s',cursor:'default'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(0,212,170,0.12)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:56,fontWeight:800,color:'rgba(0,212,170,0.18)',lineHeight:1,marginBottom:14,letterSpacing:'-2px'}}>{n}</div>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,color:'var(--ink)',marginBottom:9}}>{title}</h3>
                <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>{desc}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll>
          <div style={{textAlign:'center'}}><a href="/scan" className="btn btn-primary btn-lg">Try the free scanner →</a></div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}

function Features() {
  const feats = [
    {icon:'🔍',title:'Live website scanner',desc:'Fetches your actual website and checks for cookies, trackers, data forms, HTTPS, and consent mechanisms. Real analysis of your real site — not a questionnaire.',badge:'Live'},
    {icon:'📄',title:'AI document generator',desc:'Generates privacy policies, cookie notices, and data processing agreements based on your scan. Powered by Claude AI. Download instantly as text files.',badge:'Live'},
    {icon:'📊',title:'Compliance dashboard',desc:'Track your score, view open issues by severity and regulation, get a prioritised remediation list, and re-scan any time to measure progress.',badge:'Live'},
    {icon:'🤖',title:'AI compliance assistant',desc:'Ask questions about GDPR, UK DPA 2018, cookie law, and data subject rights in plain English. Context-aware and powered by Claude AI.',badge:'Live'},
    {icon:'📋',title:'Scan history',desc:'Your last 10 scans are saved locally so you can track compliance improvement over time and re-scan with one click.',badge:'Live'},
    {icon:'⬇️',title:'Download compliance reports',desc:'Export your full compliance report as a text file — useful for internal audits, investor due diligence, or sharing with your legal team.',badge:'Live'},
  ]
  return (
    <section className="section" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-teal" style={{width:600,height:600,top:'-20%',left:'-15%',opacity:0.3}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <span className="eyebrow">Features</span>
          <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:10}}>Everything you need to stay compliant</h2>
          <p className="subtext" style={{maxWidth:520,marginBottom:44}}>All features are live and available today.</p>
        </AnimateOnScroll>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20,marginBottom:22}}>
          {feats.map(({icon,title,desc,badge},i)=>(
            <AnimateOnScroll key={title} delay={(i%3)+1} direction={i%2===0?'left':'right'}>
              <TiltCard intensity={5}>
                <div className="card card-hover" style={{height:'100%'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                    <div style={{width:44,height:44,borderRadius:12,background:'rgba(0,212,170,0.1)',border:'1px solid rgba(0,212,170,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,transition:'transform 0.3s'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.15) rotate(-5deg)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='none'}>{icon}</div>
                    {badge&&<span style={{fontSize:10,fontWeight:700,background:'rgba(0,212,170,0.12)',color:'var(--accent)',padding:'2px 8px',borderRadius:100,letterSpacing:'.05em',textTransform:'uppercase',border:'1px solid rgba(0,212,170,0.2)'}}>{badge}</span>}
                  </div>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:600,color:'var(--ink)',marginBottom:8}}>{title}</h3>
                  <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>{desc}</p>
                </div>
              </TiltCard>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll>
          <div style={{background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:28}}>
            <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7}}><strong style={{color:'var(--accent)'}}>Important:</strong> AlgoGrass delivers expert GDPR compliance — scanning, risk assessment, document generation, and regulatory guidance — built for UK and EU businesses. Trusted, accurate, and actionable.</p>
          </div>
          <div style={{textAlign:'center',display:'flex',gap:12,justifyContent:'center'}}>
            <a href="/pricing" className="btn btn-secondary">See pricing</a>
            <a href="/scan" className="btn btn-primary">Try the free scanner →</a>
          </div>
        </AnimateOnScroll>
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
      const res = await fetch('/api/waitlist', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,source:'homepage-early-access'}) })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setDone(true)
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  return (
    <s