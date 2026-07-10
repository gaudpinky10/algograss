'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import ParticleCanvas from '@/components/ParticleCanvas'
import CountUp from '@/components/CountUp'
import TiltCard from '@/components/TiltCard'

export default function Home() {
  return (<><Hero/><Logos/><Stats/><HowItWorks/><Features/><SocialProof/><CtaBanner/></>)
}

function Hero() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  return (
    <section className='hero-section' style={{minHeight:'92vh',display:'flex',alignItems:'center',padding:'56px 0',position:'relative',overflow:'hidden'}}>
      <ParticleCanvas count={90} speed={0.35} connectDist={120} className='particle-canvas' />
      <div className="orb orb-teal"   style={{width:700,height:700,top:'-20%',right:'-10%',opacity:0.8}}/>
      <div className="orb orb-purple" style={{width:500,height:500,bottom:'-10%',left:'-8%',opacity:0.7}}/>
      <div style={{position:'absolute',inset:0,opacity:.025,backgroundImage:'linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)',backgroundSize:'48px 48px',pointerEvents:'none'}}/>

      <div className="wrap grid-hero" style={{position:'relative',zIndex:1}}>
        <div>
          {/* Badge */}
          <div className="animate-fade-up" style={{animationDelay:'0.1s',display:'inline-flex',alignItems:'center',gap:7,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',padding:'5px 14px',borderRadius:100,marginBottom:32,fontSize:11,fontWeight:700,color:'var(--accent)',letterSpacing:'.07em',textTransform:'uppercase'}}>
            <span style={{width:6,height:6,background:'var(--accent)',borderRadius:'50%',display:'inline-block',boxShadow:'0 0 6px rgba(139,92,246,0.8)'}}/>
            ✦ GDPR · UK DPA 2018 · EU AI Act
          </div>

          <h1 className="display animate-fade-up" style={{animationDelay:'0.2s',fontSize:'clamp(48px,6vw,82px)',marginBottom:24,lineHeight:1.02,letterSpacing:'-2px'}}>
            Compliance is<br/>
            <span className="animate-gradient-text">everything.</span>
          </h1>

          <p className="subtext animate-fade-up" style={{animationDelay:'0.35s',maxWidth:440,marginBottom:36,fontSize:17,lineHeight:1.65}}>
            Scan your website. Find GDPR risks. Fix them in minutes.
          </p>

          {/* Scan form */}
          <form className="animate-fade-up" style={{animationDelay:'0.45s'}} onSubmit={e=>{e.preventDefault();router.push('/scan'+(url.trim()?'?url='+encodeURIComponent(url.trim()):''))}}>
            <div style={{display:'flex',background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(139,92,246,0.3)',borderRadius:12,padding:'5px 5px 5px 16px',maxWidth:460,marginBottom:12,gap:8,backdropFilter:'blur(8px)',transition:'border-color 0.3s'}}
              onFocus={e=>e.currentTarget.style.borderColor='rgba(139,92,246,0.7)'}
              onBlur={e=>e.currentTarget.style.borderColor='rgba(139,92,246,0.3)'}>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="yourwebsite.co.uk"
                style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,color:'var(--ink)'}}/>
              <button type="submit" className="btn btn-primary btn-sm animate-pulse-glow">Scan free →</button>
            </div>
          </form>
          <p className="animate-fade-up" style={{animationDelay:'0.5s',fontSize:12,color:'var(--ink3)'}}>
            Free · No card · Results in 60 seconds · <span style={{color:'var(--accent)',fontWeight:600}}>60 days Pro on signup</span>
          </p>

          {/* 3 hero stats */}
          <div className="animate-fade-up stats-row" style={{animationDelay:'0.65s',marginTop:44,display:'flex',gap:36}}>
            {[
              {end:20,suffix:'M',prefix:'€',label:'Max fine'},
              {end:72,suffix:'h',label:'Breach deadline'},
              {end:29,prefix:'£',suffix:'/mo',label:'Start free'},
            ].map(({end,suffix,prefix,label})=>(
              <div key={label}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color:'var(--accent)',lineHeight:1}}>
                  <CountUp end={end} suffix={suffix} prefix={prefix||''}/>
                </div>
                <div style={{fontSize:11,color:'var(--ink3)',marginTop:2}}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live scan result card */}
        <div className='hero-card-hide'><TiltCard intensity={8}>
          <div className="animate-scale-in" style={{animationDelay:'0.5s',padding:22,borderRadius:18,boxShadow:'0 24px 80px rgba(139,92,246,0.18),0 0 0 1px rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.2)',background:'rgba(13,13,30,0.96)'}}>
            {/* Status bar */}
            <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.18)',borderRadius:8,padding:'8px 13px',marginBottom:18,fontSize:12,color:'var(--ink2)'}}>
              <span style={{width:7,height:7,background:'#22C55E',borderRadius:'50%',boxShadow:'0 0 6px rgba(34,197,94,0.7)'}}/>
              example-site.co.uk — scan complete
            </div>
            {/* Score ring */}
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
              <div style={{width:60,height:60,borderRadius:'50%',background:'conic-gradient(var(--accent) 252deg, rgba(139,92,246,0.12) 252deg)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',flexShrink:0}}>
                <div style={{position:'absolute',width:46,height:46,background:'#0D0D1E',borderRadius:'50%'}}/>
                <span style={{position:'relative',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:17,color:'var(--accent)',zIndex:1}}>70</span>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:'#fff'}}>Compliance score</div>
                <div style={{fontSize:11,color:'var(--ink2)',marginTop:2}}>3 issues need attention</div>
              </div>
            </div>
            {/* Issues */}
            {[['High','#F87171','rgba(248,113,113,0.1)','No cookie consent banner'],
              ['Medium','#FBBF24','rgba(251,191,36,0.1)','Privacy policy missing lawful basis'],
              ['Low','var(--accent)','rgba(139,92,246,0.1)','Contact form lacks privacy notice']].map(([sev,c,bg,text])=>(
              <div key={sev} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:bg,color:c,whiteSpace:'nowrap'}}>{sev}</span>
                <span style={{fontSize:12,color:'var(--ink2)',lineHeight:1.4}}>{text}</span>
              </div>
            ))}
            <a href="/scan" className="btn btn-primary btn-full" style={{marginTop:14,borderRadius:8,fontSize:13}}>Scan your site free →</a>
          </div>
        </TiltCard></div>
      </div>
    </section>
  )
}

function Logos() {
  return (
    <div style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'rgba(255,255,255,0.02)',padding:'16px 0'}}>
      <div className="wrap" style={{display:'flex',alignItems:'center',gap:32,flexWrap:'wrap'}}>
        <span style={{fontSize:11,fontWeight:600,color:'var(--ink3)',letterSpacing:'.1em',textTransform:'uppercase',whiteSpace:'nowrap'}}>Works with</span>
        {['Shopify','WordPress','Wix','Squarespace','Webflow','HubSpot'].map(l=>(
          <span key={l} style={{fontSize:13,fontWeight:600,color:'var(--ink3)',opacity:.45,transition:'opacity 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='1'}
            onMouseLeave={e=>e.currentTarget.style.opacity='.45'}>{l}</span>
        ))}
      </div>
    </div>
  )
}

function Stats() {
  return (
    <section className="section" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-purple" style={{width:500,height:500,top:'-10%',right:'-15%',opacity:0.35}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <div style={{textAlign:'center',marginBottom:52}}>
            <span className="eyebrow">Why it matters</span>
            <h2 className="heading" style={{fontSize:'clamp(28px,3vw,44px)',marginBottom:10}}>GDPR isn't optional</h2>
            <p style={{fontSize:15,color:'var(--ink2)',maxWidth:380,margin:'0 auto'}}>Every business that collects personal data must comply — or face the consequences.</p>
          </div>
        </AnimateOnScroll>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:40}}>
          {[
            {icon:'⚖️',num:'€20M',label:'Maximum GDPR fine',sub:'or 4% global turnover'},
            {icon:'⏱️',num:'72h',label:'To notify the ICO',sub:'after a data breach'},
            {icon:'📋',num:'8',label:'Data subject rights',sub:'you must uphold'},
            {icon:'🔍',num:'Art. 13',label:'Privacy notice required',sub:'for every data collection'},
          ].map(({icon,num,label,sub})=>(
            <AnimateOnScroll key={label} direction="scale">
              <TiltCard intensity={5}>
                <div className="card card-hover" style={{textAlign:'center',padding:'28px 20px'}}>
                  <div style={{fontSize:28,marginBottom:10}}>{icon}</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:30,fontWeight:800,color:'var(--accent)',marginBottom:6,letterSpacing:'-1px'}}>{num}</div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:3}}>{label}</div>
                  <div style={{fontSize:11,color:'var(--ink3)'}}>{sub}</div>
                </div>
              </TiltCard>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll>
          <div style={{textAlign:'center'}}>
            <a href="/scan" className="btn btn-primary">Check my website →</a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {n:'01',icon:'🔍',title:'Paste your URL',sub:'We scan your live website instantly'},
    {n:'02',icon:'📊',title:'See your risks',sub:'Plain-English report, ranked by severity'},
    {n:'03',icon:'✅',title:'Fix & download',sub:'AI generates your compliance documents'},
  ]
  return (
    <section className="section-white" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-teal" style={{width:400,height:400,bottom:'-15%',right:'5%',opacity:0.25}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <div style={{textAlign:'center',marginBottom:48}}>
            <span className="eyebrow">How it works</span>
            <h2 className="heading" style={{fontSize:'clamp(28px,3vw,44px)',marginBottom:8}}>3 steps to compliant</h2>
            <p style={{fontSize:14,color:'var(--ink2)'}}>Under 60 seconds to your first result.</p>
          </div>
        </AnimateOnScroll>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:2,marginBottom:40}}>
          {steps.map(({n,icon,title,sub},i)=>(
            <AnimateOnScroll key={n} delay={i+1}>
              <div style={{background:'var(--bg2)',padding:'36px 28px',borderRadius:i===0?'18px 0 0 18px':i===2?'0 18px 18px 0':0,height:'100%',textAlign:'center',cursor:'default',transition:'transform 0.3s,box-shadow 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 16px 40px rgba(139,92,246,0.14)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                <div style={{fontSize:40,marginBottom:12}}>{icon}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:11,fontWeight:700,color:'rgba(139,92,246,0.4)',letterSpacing:'.14em',marginBottom:10}}>{n}</div>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'var(--ink)',marginBottom:6}}>{title}</h3>
                <p style={{fontSize:13,color:'var(--ink2)'}}>{sub}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll>
          <div style={{textAlign:'center'}}>
            <a href="/scan" className="btn btn-primary btn-lg animate-pulse-glow">Try it free →</a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}

function Features() {
  const [active, setActive] = useState(null)

  const feats = [
    {
      icon:'🔍', title:'Live scanner', sub:'Checks cookies, trackers & consent on your real site',
      href:'/scan',
      desc:'AlgoGrass scans your live website in real time — no install required. We detect missing cookie banners, third-party trackers, consent mechanisms, and GDPR-risk patterns across every page.',
      bullets:['Detects cookies, pixels & trackers','Checks consent banner presence & wording','Flags missing privacy notices on forms','Severity-ranked findings in plain English'],
    },
    {
      icon:'📄', title:'AI documents', sub:'Privacy policy, cookie notice & DPA — one click',
      href:'/dashboard',
      desc:'Our AI generates legally-grounded GDPR documents tailored to your business — privacy policy, cookie notice, data processing agreement, and more — in seconds, not hours.',
      bullets:['Privacy policy generator','Cookie notice & consent text','Data Processing Agreement (DPA)','Downloadable PDF & editable Word doc'],
    },
    {
      icon:'📊', title:'Risk dashboard', sub:'Score, open issues, severity — always up to date',
      href:'/dashboard',
      desc:'Your live GDPR compliance score in one place. See open risks, track remediation progress, and monitor changes over time. Built for founders and DPOs who need clarity, not complexity.',
      bullets:['Live compliance score (0–100)','Open issues by severity (High / Med / Low)','Remediation tracking & history','Export as PDF for stakeholders'],
    },
    {
      icon:'🤖', title:'AI assistant', sub:'Ask GDPR questions in plain English, get instant answers',
      href:'/ai-assistant',
      desc:'Ask anything about GDPR, UK DPA 2018, or EU AI Act and get an instant, accurate, plain-English answer — grounded in ICO guidance and real enforcement decisions.',
      bullets:['Powered by live ICO & EDPB guidance','Answers about lawful basis, consent, transfers','Cites real enforcement cases','Available 24/7 — no waiting for a solicitor'],
    },
    {
      icon:'📋', title:'DSAR handler', sub:'Respond to Subject Access Requests in minutes',
      href:'/dsar',
      desc:'When someone asks for their data, you have 30 days. AlgoGrass guides you through every step — logging the request, gathering data, and generating the response letter automatically.',
      bullets:['Intake form for subjects to submit DSARs','30-day deadline tracker with alerts','Auto-generated response letter','Full audit trail for ICO evidence'],
    },
    {
      icon:'⚖️', title:'GRC platform', sub:'20 GDPR controls, risks, policies & incidents',
      href:'/grc',
      desc:'A full Governance, Risk & Compliance platform built for SMEs. Map your GDPR controls, log risks, manage policies, and track incidents — all in one place.',
      bullets:['20 pre-built GDPR control areas','Risk register with likelihood & impact','Policy library with version history','Incident log & root cause tracking'],
    },
    {
      icon:'🏢', title:'Vendor risk', sub:'Track processor contracts & third-party DPAs',
      href:'/vendor-risk',
      desc:'Every supplier you share personal data with needs a Data Processing Agreement. AlgoGrass tracks all your vendors, flags missing DPAs, and monitors contract renewal dates.',
      bullets:['Vendor register with data-sharing details','DPA status tracker per supplier','Risk rating per vendor','Renewal date alerts'],
    },
    {
      icon:'📡', title:'Reg monitor', sub:'Live GDPR & EU AI Act enforcement updates',
      href:'/regulatory-monitor',
      desc:'Stay ahead of the regulators. AlgoGrass monitors ICO fines, EDPB opinions, and EU AI Act developments in real time — so you know what\'s changing before it affects your business.',
      bullets:['Live ICO enforcement actions','EDPB opinions & guidance','EU AI Act readiness updates','Weekly digest email option'],
    },
    {
      icon:'🎓', title:'GDPR training', sub:'Staff awareness certificates in 20 minutes',
      href:'/training',
      desc:'Get your whole team GDPR-aware fast. AlgoGrass training modules cover data protection basics, breach reporting, email marketing rules, and more — with completion certificates.',
      bullets:['8 modules covering core GDPR topics','Completion certificate per employee','Track team progress from dashboard','Covers UK DPA 2018 & EU GDPR'],
    },
    {
      icon:'🔗', title:'Integrations', sub:'Slack, Zapier & developer API included',
      href:'/integrations',
      desc:'Connect AlgoGrass to the tools you already use. Get DSAR alerts in Slack, trigger workflows in Zapier, or build custom integrations via our REST API.',
      bullets:['Slack notifications for DSARs & breaches','Zapier integration (1,000+ apps)','REST API with full documentation','Webhook support for custom triggers'],
    },
    {
      icon:'🚨', title:'Breach tool', sub:'72-hour ICO notification, guided step-by-step',
      href:'/breach',
      desc:'A data breach requires ICO notification within 72 hours. AlgoGrass walks you through the entire process — from detection to submission — so you never miss the deadline.',
      bullets:['Breach severity assessment','Step-by-step ICO notification builder','Subject notification letter generator','Breach log & post-incident review'],
    },
    {
      icon:'🛡️', title:'DPIA wizard', sub:'Data Protection Impact Assessments, automated',
      href:'/dpia',
      desc:'Any high-risk processing activity legally requires a DPIA. AlgoGrass walks you through the ICO-approved process, identifies risks, and generates a compliant DPIA report automatically.',
      bullets:['ICO DPIA framework built in','Risk identification & scoring','Necessity & proportionality assessment','Downloadable DPIA report for sign-off'],
    },
  ]

  return (
    <>
    {/* Feature modal */}
    {active !== null && (
      <div onClick={()=>setActive(null)} style={{position:'fixed',inset:0,zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(6px)',padding:'0 16px 0'}}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#0D0D1E',border:'1px solid rgba(139,92,246,0.3)',borderRadius:'24px 24px 0 0',padding:'36px 36px 44px',maxWidth:600,width:'100%',maxHeight:'85vh',overflowY:'auto',boxShadow:'0 -24px 80px rgba(139,92,246,0.2)',animation:'slideUp 0.3s ease'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
            <div style={{display:'flex',gap:14,alignItems:'center'}}>
              <div style={{width:52,height:52,borderRadius:14,background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>
                {feats[active].icon}
              </div>
              <div>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,color:'var(--ink)',marginBottom:2}}>{feats[active].title}</h3>
                <p style={{fontSize:13,color:'var(--accent)'}}>{feats[active].sub}</p>
              </div>
            </div>
            <button onClick={()=>setActive(null)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,width:32,height:32,cursor:'pointer',color:'var(--ink2)',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
          </div>

          <p style={{fontSize:15,color:'var(--ink2)',lineHeight:1.7,marginBottom:20}}>{feats[active].desc}</p>

          <div style={{marginBottom:28}}>
            {feats[active].bullets.map(b=>(
              <div key={b} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
                <span style={{color:'var(--accent)',fontWeight:700,fontSize:14,marginTop:1,flexShrink:0}}>✓</span>
                <span style={{fontSize:14,color:'var(--ink)',lineHeight:1.5}}>{b}</span>
              </div>
            ))}
          </div>

          <a href={feats[active].href} className="btn btn-primary" style={{width:'100%',justifyContent:'center',borderRadius:12,fontSize:15}}>
            Try {feats[active].title} →
          </a>
        </div>
      </div>
    )}

    <style>{`@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

    <section className="section" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-teal" style={{width:600,height:600,top:'-20%',left:'-15%',opacity:0.25}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <div style={{textAlign:'center',marginBottom:44}}>
            <span className="eyebrow">Everything included</span>
            <h2 className="heading" style={{fontSize:'clamp(28px,3vw,44px)',marginBottom:8}}>One platform. All of GDPR.</h2>
            <p style={{fontSize:14,color:'var(--ink2)'}}>Click any feature to learn more.</p>
          </div>
        </AnimateOnScroll>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12,marginBottom:32}}>
          {feats.map(({icon,title,sub},i)=>(
            <AnimateOnScroll key={title} delay={(i%4)+1}>
              <div
                className="card card-hover"
                onClick={()=>setActive(i)}
                style={{padding:'20px 18px',display:'flex',gap:14,alignItems:'flex-start',cursor:'pointer'}}
                title="Click to learn more"
              >
                <div style={{width:40,height:40,borderRadius:10,background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.18)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                  {icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:'var(--ink)',marginBottom:3}}>{title}</div>
                  <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.5}}>{sub}</div>
                </div>
                <span style={{fontSize:11,color:'rgba(139,92,246,0.5)',alignSelf:'center',flexShrink:0}}>›</span>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll>
          <div style={{textAlign:'center',display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/pricing" className="btn btn-secondary">See pricing</a>
            <a href="/scan"    className="btn btn-primary">Start free scan →</a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
    </>
  )
}

function SocialProof() {
  const [scanCount, setScanCount] = useState(null)
  useEffect(() => {
    fetch('/api/scan/count').then(r=>r.json()).then(d=>setScanCount(d.count)).catch(()=>{})
  }, [])
  const reviews = [
    {q:'Found our contact form had no privacy notice. Fixed it in an afternoon.',       name:'Sarah M.',  role:'Founder · Bristol'},
    {q:'The AI privacy policy was actually readable. Our old template was 12 pages.',   name:'James C.',  role:'Ops Director · London'},
    {q:'Showed us exactly where our data gaps were. DSAR handler alone saved us hours.',name:'Priya S.',  role:'Partner · Manchester'},
    {q:'Found 4 issues I didn\'t know about. Plain English explanations throughout.',   name:'Tom R.',    role:'Director · Leeds'},
  ]
  return (
    <section className="section-white" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-teal" style={{width:500,height:500,top:'-20%',left:'-10%',opacity:0.25}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <div style={{textAlign:'center',marginBottom:44}}>
            {/* Live scan counter */}
            <div style={{display:'inline-flex',alignItems:'center',gap:10,background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.22)',borderRadius:100,padding:'8px 22px',marginBottom:20}}>
              <span style={{width:7,height:7,background:'#9B7BFA',borderRadius:'50%'}} className="animate-pulse-glow"/>
              <span style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:800,color:'#9B7BFA'}}>
                {scanCount != null ? (scanCount + 47).toLocaleString() : '100+'}
              </span>
              <span style={{fontSize:13,color:'var(--ink2)'}}>businesses scanned</span>
            </div>
            <h2 className="heading" style={{fontSize:'clamp(26px,3vw,40px)',marginBottom:4}}>Trusted by UK businesses</h2>
          </div>
        </AnimateOnScroll>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14,marginBottom:28}}>
          {reviews.map(({q,name,role,init},i)=>(
            <AnimateOnScroll key={name} delay={(i%3)+1}>
              <div className="card" style={{padding:'20px 20px'}}>
                <div style={{display:'flex',gap:2,marginBottom:12}}>
                  {[0,1,2,3,4].map(si=><svg key={si} width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65,marginBottom:14,fontStyle:'italic'}}>"{q}"</p>
                <div style={{display:'flex',alignItems:'center',gap:10,borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:12}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#9B7BFA,#C084FC)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:11,color:'#06060F',flexShrink:0}}>
                    {name.charAt(0)+name.split(' ')[1]?.charAt(0)}
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:'var(--ink)'}}>{name}</div>
                    <div style={{fontSize:11,color:'var(--ink3)'}}>{role}</div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* Trust badges */}
        <AnimateOnScroll>
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center'}}>
            {['🔒 GDPR compliant','🇬🇧 UK-based','⚡ Real-time scan','🤖 AI-powered','📄 Auto-docs','🎁 60 days free'].map(b=>(
              <span key={b} style={{fontSize:12,color:'var(--ink2)',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:100,padding:'4px 12px'}}>{b}</span>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section style={{padding:'72px 0',background:'linear-gradient(135deg,rgba(139,92,246,0.08) 0%,rgba(192,132,252,0.06) 100%)',borderTop:'1px solid var(--border)'}}>
      <div className="wrap" style={{textAlign:'center'}}>
        <AnimateOnScroll>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(28px,3.5vw,48px)',fontWeight:800,color:'var(--ink)',marginBottom:12,letterSpacing:'-1px'}}>
            Is your website compliant?
          </h2>
          <p style={{fontSize:15,color:'var(--ink2)',marginBottom:32}}>Free scan. No account. 60 seconds.</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/scan"    className="btn btn-primary btn-lg animate-pulse-glow">Scan my website →</a>
            <a href="/pricing" className="btn btn-secondary btn-lg">View plans</a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}
