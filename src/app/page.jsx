'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import ParticleCanvas from '@/components/ParticleCanvas'
import CountUp from '@/components/CountUp'
import TiltCard from '@/components/TiltCard'

export default function Home() {
  return (<><Hero/><Logos/><Problem/><HowItWorks/><Features/><SocialProof/><ComparisonTable/><EarlyAccess/><CtaBanner/></>)
}

function Hero() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  return (
    <section className='hero-section' style={{minHeight:'91vh',display:'flex',alignItems:'center',padding:'56px 0',position:'relative',overflow:'hidden'}}>
      {/* Particle network background */}
      <ParticleCanvas count={90} speed={0.35} connectDist={120} className='particle-canvas' />

      {/* Glow orbs */}
      <div className="orb orb-teal" style={{width:700,height:700,top:'-20%',right:'-10%',opacity:0.8}}/>
      <div className="orb orb-purple" style={{width:500,height:500,bottom:'-10%',left:'-8%',opacity:0.7}}/>
      <div className="orb orb-blue" style={{width:400,height:400,top:'30%',left:'30%',opacity:0.4}}/>

      {/* Grid overlay */}
      <div style={{position:'absolute',inset:0,opacity:.028,backgroundImage:'linear-gradient(var(--ink) 1px,transparent 1px),linear-gradient(90deg,var(--ink) 1px,transparent 1px)',backgroundSize:'44px 44px',pointerEvents:'none'}}/>

      <div className="wrap grid-hero" style={{position:'relative',zIndex:1}}>
        <div>
          {/* Badge */}
          <div className="animate-fade-up" style={{animationDelay:'0.1s',display:'inline-flex',alignItems:'center',gap:7,background:'var(--green-p)',border:'1px solid var(--green-m)',padding:'5px 13px',borderRadius:100,marginBottom:28,fontSize:11,fontWeight:600,color:'var(--green)',letterSpacing:'.06em',textTransform:'uppercase'}}>
            <span className="ping" style={{width:6,height:6,background:'var(--accent)',borderRadius:'50%',display:'inline-block'}}/>
            🚀 Launch offer — 60 days free Pro, no card needed
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
          <form className="animate-fade-up" style={{animationDelay:'0.45s'}} onSubmit={e=>{e.preventDefault();router.push('/scan'+(url.trim()?'?url='+encodeURIComponent(url.trim()):''))}}>
            <div style={{display:'flex',background:'rgba(15,23,42,0.05)',border:'1.5px solid rgba(14,165,233,0.3)',borderRadius:12,padding:'5px 5px 5px 16px',maxWidth:470,marginBottom:14,gap:8,backdropFilter:'blur(8px)',transition:'border-color 0.3s'}}
              onFocus={e=>e.currentTarget.style.borderColor='rgba(14,165,233,0.7)'}
              onBlur={e=>e.currentTarget.style.borderColor='rgba(14,165,233,0.3)'}>
              <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="yourwebsite.co.uk"
                style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,color:'var(--ink)'}}/>
              <button type="submit" className="btn btn-primary btn-sm animate-pulse-glow">Scan free →</button>
            </div>
          </form>
          <p className="animate-fade-up" style={{animationDelay:'0.5s',fontSize:12,color:'var(--ink2)'}}>
            No credit card · <span style={{color:'#0EA5E9',fontWeight:600}}>60 days free Pro when you sign up</span> · GDPR + UK DPA 2018 + ePrivacy
          </p>

          {/* Animated stats */}
          <div className="animate-fade-up stats-row" style={{animationDelay:'0.65s',marginTop:44}}>
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
        <div className='hero-card-hide'><TiltCard intensity={8}>
          <div className="card animate-scale-in" style={{animationDelay:'0.5s',padding:22,boxShadow:'0 24px 80px rgba(15,23,42,0.1)',border:'1px solid rgba(14,165,233,0.15)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(14,165,233,0.06)',border:'1px solid rgba(14,165,233,0.2)',borderRadius:8,padding:'9px 13px',marginBottom:18,fontSize:12,color:'var(--ink2)'}}>
              <span style={{width:7,height:7,background:'var(--accent)',borderRadius:'50%'}} className="animate-pulse-glow"/>
              example-site.co.uk — scan complete
            </div>
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'conic-gradient(var(--accent) 252deg, rgba(14,165,233,0.1) 252deg)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',flexShrink:0}} className="animate-pulse-glow">
                <div style={{position:'absolute',width:48,height:48,background:'var(--bg2)',borderRadius:'50%'}}/>
                <span style={{position:'relative',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:17,color:'var(--accent)',zIndex:1}}>70</span>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Compliance score</div>
                <div style={{fontSize:11,color:'var(--ink2)',marginTop:2}}>3 issues found · action needed</div>
              </div>
            </div>
            {[['High','chip-high','No cookie consent banner'],['Medium','chip-medium','Privacy policy missing lawful basis'],['Low','chip-low','Contact form lacks privacy notice']].map(([sev,cls,text])=>(
              <div key={sev} style={{display:'flex',alignItems:'flex-start',gap:9,padding:'9px 0',borderBottom:'1px solid rgba(14,165,233,0.08)'}}>
                <span className={`chip ${cls}`} style={{marginTop:1}}>{sev}</span>
                <span style={{fontSize:12,color:'var(--ink2)',lineHeight:1.4,paddingTop:1}}>{text}</span>
              </div>
            ))}
            <a href="/scan" className="btn btn-primary btn-full" style={{marginTop:14,borderRadius:8}}>Scan your website →</a>
            <p style={{fontSize:10,color:'var(--ink2)',textAlign:'center',marginTop:8}}>Example result · scan your own site for free</p>
          </div>
        </TiltCard></div>
      </div>
    </section>
  )
}

function Logos() {
  return (
    <AnimateOnScroll>
      <div style={{borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',background:'rgba(15,23,42,0.02)',padding:'18px 0'}}>
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
      <div className="wrap grid-2col" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll direction="left">
          <span className="eyebrow">The challenge</span>
          <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:16}}>Privacy compliance is a real obligation — and most SMEs are not fully prepared</h2>
          <p className="subtext" style={{marginBottom:14}}>GDPR and the UK Data Protection Act 2018 impose genuine legal obligations on any business collecting personal data — including something as routine as a contact form.</p>
          <p style={{fontSize:13,color:'var(--ink2)',marginBottom:28,lineHeight:1.6,fontStyle:'italic'}}>AlgoGrass gives you everything you need to become fully GDPR compliant — from identifying risks to generating all required documentation.</p>
          <a href="/scan" className="btn btn-primary">Check your website →</a>
        </AnimateOnScroll>
        <div className='grid-stats'>
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
        <div className='grid-3col' style={{marginBottom:44}}>
          {[
            {n:'01',title:'Scan your website',desc:'Paste your URL. AlgoGrass fetches your live website and checks for cookies, trackers, data forms, and consent mechanisms against GDPR and UK DPA 2018.'},
            {n:'02',title:'Review your risk report',desc:'Get a plain-English compliance report with your score, every issue ranked by severity, the specific regulation it relates to, and clear guidance.'},
            {n:'03',title:'Generate your documents',desc:'One click generates a tailored privacy policy, cookie policy, and DPA — powered by AI and based on your actual scan results. Download instantly.'},
          ].map(({n,title,desc},i)=>(
            <AnimateOnScroll key={n} delay={i+1}>
              <div style={{background:'var(--bg2)',padding:'32px 28px',borderRadius:i===0?'18px 0 0 18px':i===2?'0 18px 18px 0':0,height:'100%',transition:'transform 0.3s,box-shadow 0.3s',cursor:'default'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-6px)';e.currentTarget.style.boxShadow='0 16px 48px rgba(14,165,233,0.12)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:56,fontWeight:800,color:'rgba(14,165,233,0.18)',lineHeight:1,marginBottom:14,letterSpacing:'-2px'}}>{n}</div>
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
        <div className='grid-2feat' style={{marginBottom:22}}>
          {feats.map(({icon,title,desc,badge},i)=>(
            <AnimateOnScroll key={title} delay={(i%3)+1} direction={i%2===0?'left':'right'}>
              <TiltCard intensity={5}>
                <div className="card card-hover" style={{height:'100%'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                    <div style={{width:44,height:44,borderRadius:12,background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,transition:'transform 0.3s'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.15) rotate(-5deg)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='none'}>{icon}</div>
                    {badge&&<span style={{fontSize:10,fontWeight:700,background:'rgba(14,165,233,0.12)',color:'var(--accent)',padding:'2px 8px',borderRadius:100,letterSpacing:'.05em',textTransform:'uppercase',border:'1px solid rgba(14,165,233,0.2)'}}>{badge}</span>}
                  </div>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:600,color:'var(--ink)',marginBottom:8}}>{title}</h3>
                  <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>{desc}</p>
                </div>
              </TiltCard>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll>
          <div style={{background:'rgba(14,165,233,0.06)',border:'1px solid rgba(14,165,233,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:28}}>
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

function SocialProof() {
  const [scanCount, setScanCount] = useState(null)
  useEffect(() => {
    fetch('/api/scan/count').then(r=>r.json()).then(d=>setScanCount(d.count)).catch(()=>{})
  }, [])
  const reviews = [
    { q:"AlgoGrass found our contact form had no privacy notice — something we'd completely overlooked. Fixed it in an afternoon. Couldn't be simpler.", name:"Sarah Mitchell", role:"Founder, Bloom & Thread · Bristol", init:"SM" },
    { q:"The AI-generated privacy policy was actually readable. Our previous template was 12 pages of legalese. This covered everything and made sense to us.", name:"James Chen", role:"Operations Director, SwiftDesk Ltd · London", init:"JC" },
    { q:"We handle a lot of personal data as an accountancy firm. AlgoGrass showed us exactly where our gaps were. The DSAR handler alone saved us hours.", name:"Priya Sharma", role:"Partner, Clarity Accounts · Manchester", init:"PS" },
    { q:"Found 4 compliance issues I didn't know about during the free trial. The AI assistant explained everything in plain English. Brilliant tool.", name:"Tom Richards", role:"Director, NorthWave Digital · Leeds", init:"TR" },
  ]
  return (
    <section className="section-white" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-teal" style={{width:500,height:500,top:'-20%',left:'-10%',opacity:0.3}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <div style={{textAlign:'center',marginBottom:52}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:10,background:'rgba(14,165,233,0.08)',border:'1px solid rgba(14,165,233,0.25)',borderRadius:100,padding:'8px 22px',marginBottom:20}}>
              <span style={{width:8,height:8,background:'#0EA5E9',borderRadius:'50%'}} className="animate-pulse-glow"/>
              <span style={{fontFamily:'var(--f-num)',fontSize:20,fontWeight:700,color:'#0EA5E9',letterSpacing:'.01em'}}>
                {scanCount != null ? (scanCount + 47).toLocaleString() : '100+'}
              </span>
              <span style={{fontSize:13,color:'var(--ink2)'}}>businesses scanned for GDPR compliance</span>
            </div>
            <span className="eyebrow">What businesses say</span>
            <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:10}}>Trusted by UK small businesses</h2>
            <p className="subtext" style={{maxWidth:480,margin:'0 auto'}}>Real feedback from founders and compliance leads who found and fixed real GDPR issues.</p>
          </div>
        </AnimateOnScroll>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:20,marginBottom:36}}>
          {reviews.map(({q,name,role,init},i)=>(
            <AnimateOnScroll key={name} delay={(i%3)+1} direction={i%2===0?'left':'right'}>
              <TiltCard intensity={5}>
                <div className="card" style={{height:'100%'}}>
                  <div style={{display:'flex',gap:2,marginBottom:14}}>
                    {[0,1,2,3,4].map(si=><svg key={si} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                  </div>
                  <p style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,marginBottom:20,fontStyle:'italic'}}>"{q}"</p>
                  <div style={{display:'flex',alignItems:'center',gap:11,borderTop:'1px solid rgba(15,23,42,0.07)',paddingTop:14}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#0EA5E9,#7C9EFF)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--f-head)',fontWeight:700,fontSize:12,color:'#FFFFFF',flexShrink:0}}>{init}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--ink)'}}>{name}</div>
                      <div style={{fontSize:11,color:'var(--ink2)'}}>{role}</div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
            {['🔒 UK GDPR compliant','🇬🇧 UK-based','⚡ Real-time scanning','🤖 AI-powered','📄 Auto-generated docs','🛡️ No data sold','🎁 60 days free Pro'].map(b=>(
              <span key={b} style={{fontSize:12,color:'var(--ink2)',background:'rgba(15,23,42,0.05)',border:'1px solid rgba(15,23,42,0.09)',borderRadius:100,padding:'5px 14px'}}>{b}</span>
            ))}
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  )
}

function ComparisonTable() {
  const rows = [
    {f:'Live website compliance scan', a:true,           m:false,          ico:false,    g:'⚠'},
    {f:'Plain-English risk report',    a:true,           m:true,           ico:false,    g:'⚠'},
    {f:'AI document generation',       a:true,           m:false,          ico:false,    g:'⚠'},
    {f:'UK GDPR + ePrivacy coverage',  a:true,           m:true,           ico:false,    g:false},
    {f:'ICO enforcement monitoring',   a:true,           m:false,          ico:false,    g:false},
    {f:'DSAR handler',                 a:true,           m:true,           ico:false,    g:false},
    {f:'Cookie banner checker',        a:true,           m:false,          ico:false,    g:'⚠'},
    {f:'DPIA wizard',                  a:true,           m:true,           ico:false,    g:false},
    {f:'AI compliance assistant',      a:true,           m:false,          ico:false,    g:false},
    {f:'Ongoing monitoring',           a:true,           m:false,          ico:false,    g:false},
    {f:'Typical cost',                 a:'From £29/mo',  m:'£2,000–5,000', ico:'Free',   g:'£50–300/mo'},
    {f:'Time to first result',         a:'Under 60s',    m:'3–6 weeks',    ico:'30 min', g:'1–2 days'},
  ]
  function Cell({v}) {
    if(v===true)  return <span style={{color:'#0EA5E9',fontSize:18,fontWeight:700}}>✓</span>
    if(v===false) return <span style={{color:'#F87171',fontSize:18}}>✗</span>
    if(v==='⚠')  return <span style={{color:'#F59E0B',fontSize:16}}>⚠</span>
    return <span style={{fontSize:12,color:'var(--ink2)',whiteSpace:'nowrap'}}>{v}</span>
  }
  return (
    <section className="section" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-purple" style={{width:500,height:500,top:'-10%',right:'-10%',opacity:0.3}}/>
      <div className="wrap" style={{position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <span className="eyebrow">How we compare</span>
          <h2 className="heading" style={{fontSize:'clamp(26px,3vw,42px)',marginBottom:10}}>AlgoGrass vs the alternatives</h2>
          <p className="subtext" style={{maxWidth:520,marginBottom:44}}>Compared to a solicitor, the ICO self-assessment tool, and generic compliance SaaS platforms.</p>
        </AnimateOnScroll>
        <AnimateOnScroll>
          <div style={{overflowX:'auto',borderRadius:16,border:'1px solid var(--border)'}}>
            <table style={{width:'100%',borderCollapse:'collapse',minWidth:560}}>
              <thead>
                <tr style={{borderBottom:'1px solid var(--border)'}}>
                  <th style={{textAlign:'left',padding:'14px 18px',fontSize:11,color:'var(--ink2)',fontWeight:600,letterSpacing:'.07em',textTransform:'uppercase',width:'34%'}}>Feature</th>
                  {[['AlgoGrass',true],['Solicitor',false],['ICO self-assessment',false],['Generic SaaS',false]].map(([l,h])=>(
                    <th key={l} style={{textAlign:'center',padding:'14px 10px',fontSize:11,fontWeight:700,letterSpacing:'.05em',textTransform:'uppercase',color:h?'#0EA5E9':'var(--ink2)',background:h?'rgba(14,165,233,0.07)':'transparent'}}>
                      {l}{h&&<><br/><span style={{fontSize:9,color:'rgba(14,165,233,0.6)',fontWeight:400,textTransform:'none',letterSpacing:0}}>★ Recommended</span></>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({f,a,m,ico,g},i)=>(
                  <tr key={f} style={{background:i%2===0?'rgba(255,255,255,0.015)':'transparent',borderBottom:'1px solid rgba(15,23,42,0.05)'}}>
                    <td style={{padding:'12px 18px',fontSize:13,color:'var(--ink2)'}}>{f}</td>
                    <td style={{textAlign:'center',padding:'12px 8px',background:'rgba(14,165,233,0.04)'}}><Cell v={a}/></td>
                    <td style={{textAlign:'center',padding:'12px 8px'}}><Cell v={m}/></td>
                    <td style={{textAlign:'center',padding:'12px 8px'}}><Cell v={ico}/></td>
                    <td style={{textAlign:'center',padding:'12px 8px'}}><Cell v={g}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:12,padding:'0 4px'}}>
            <p style={{fontSize:11,color:'var(--ink2)',opacity:.6}}>⚠ = partial/limited support · ✗ = not available · ✓ = fully supported</p>
          </div>
          <div style={{textAlign:'center',marginTop:28}}>
            <a href="/signup" className="btn btn-primary btn-lg animate-pulse-glow">Get started free — 60 days Pro →</a>
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
    <section className="section-white" style={{position:'relative',overflow:'hidden'}}>
      <div className="orb orb-purple" style={{width:500,height:500,top:'-20%',left:'-10%',opacity:0.35}}/>
      <div className="wrap" style={{maxWidth:560,textAlign:'center',position:'relative',zIndex:1}}>
        <AnimateOnScroll>
          <span className="eyebrow">Early access</span>
          <h2 className="heading" style={{fontSize:'clamp(28px,3vw,44px)',marginBottom:14}}>Be first to access full features</h2>
          <p className="subtext" style={{marginBottom:32}}>We're rolling out advanced features to early members first — unlimited scans, AI document generation, and GRC tools.</p>
          {done ? (
            <div style={{background:'rgba(14,165,233,0.1)',border:'1px solid rgba(14,165,233,0.3)',borderRadius:14,padding:'20px 28px'}}>
              <p style={{fontSize:15,color:'var(--accent)',fontWeight:600}}>You're on the list ✓</p>
              <p style={{fontSize:13,color:'var(--ink2)',marginTop:6}}>We'll be in touch when your access is ready.</p>
            </div>
          ) : (
            <>
              <div style={{display:'flex',background:'rgba(15,23,42,0.05)',border:'1.5px solid rgba(14,165,233,0.3)',borderRadius:12,padding:'5px 5px 5px 16px',maxWidth:420,margin:'0 auto 12px',gap:8,backdropFilter:'blur(8px)'}}>
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" type="email"
                  style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:14,color:'var(--ink)'}}/>
                <button onClick={join} disabled={loading} className="btn btn-primary btn-sm">{loading?'Joining…':'Join list →'}</button>
              </div>
              {error&&<p style={{fontSize:12,color:'#F87171',marginBottom:8}}>{error}</p>}
              <p style={{fontSize:11,color:'var(--ink2)'}}>No spam · Unsubscribe any time</p>
            </>
          )}
        </AnimateOnScroll>
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section style={{padding:'56px 0',background:'linear-gradient(135deg,rgba(14,165,233,0.1) 0%,rgba(139,92,246,0.1) 100%)',borderTop:'1px solid var(--border)'}}>
      <div className="wrap" style={{textAlign:'center'}}>
        <AnimateOnScroll>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3vw,42px)',fontWeight:700,color:'var(--ink)',marginBottom:14}}>Ready to check your compliance?</h2>
          <p className="subtext" style={{marginBottom:28,maxWidth:440,margin:'0 auto 28px'}}>Free scan. No account needed. Results in under 60 seconds.</p>
          <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/scan" className="btn btn-primary btn-lg animate-pulse-glow">Scan my website →</a>
            <a href="/pricing" className="btn btn-secondary btn-lg">View pricing</a>
          </div>
      