export default function AboutPage() {
  return (
    <>
      <section className="section">
        <div className="wrap">
          <div style={{maxWidth:680}}>
            <span className="eyebrow">About AlgoGrass</span>
            <h1 className="heading" style={{fontSize:'clamp(30px,3.5vw,50px)',marginBottom:18}}>Making GDPR compliance understandable for every small business</h1>
            <p className="subtext" style={{marginBottom:14}}>AlgoGrass was founded in the UK with a straightforward goal: make it easier for small businesses to understand their data protection obligations and build the documentation they need.</p>
            <p className="subtext" style={{marginBottom:14}}>We are a small, early-stage team building this product in the open. The free compliance scanner is live today.</p>
            <p style={{fontSize:14,color:'var(--ink2)',lineHeight:1.7,marginBottom:32,fontStyle:'italic'}}>We are honest about what we are: a compliance guidance and documentation tool, not a law firm. Everything AlgoGrass produces should be treated as a starting point — always review documents with a qualified solicitor before use.</p>
            <div style={{display:'flex',gap:12}}>
              <a href="/scan" className="btn btn-primary">Try the free scanner</a>
              <a href="/contact" className="btn btn-secondary">Get in touch</a>
            </div>
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'start'}}>
          <div>
            <h2 className="heading" style={{fontSize:'clamp(22px,2.5vw,34px)',marginBottom:14}}>Our mission</h2>
            <p className="subtext" style={{marginBottom:14}}>To give every small business owner a clear, honest picture of their GDPR compliance position — and practical tools to address what they find.</p>
            <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7,marginBottom:28}}>We work collaboratively with data protection professionals. We are not here to replace solicitors — we are here to help businesses come to those conversations better informed.</p>
            <a href="/pricing" className="btn btn-primary">See our plans</a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {[['2025','Founded in the UK'],['GDPR','UK DPA 2018 & ePrivacy covered'],['60s','Time to your first free scan result'],['Free','Cost of your first website scan']].map(([n,l])=>(
              <div key={n} className="card" style={{padding:'20px 16px'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,color:'var(--green)',marginBottom:6}}>{n}</div>
                <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.5}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <span className="eyebrow">Our values</span>
          <h2 className="heading" style={{fontSize:'clamp(22px,2.5vw,36px)',marginBottom:44}}>What we stand for</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18}}>
            {[{icon:'🎯',title:'Honest',desc:'We are clear about what AlgoGrass is and is not. A guidance tool, not a law firm. We always tell you when you need professional legal advice.'},{icon:'💡',title:'Plain English',desc:'No jargon. We translate real regulation into clear, actionable language that any business owner can understand.'},{icon:'🔒',title:'Accurate',desc:'Every regulation reference is real and verified. Our legal content is checked against current GDPR and UK DPA 2018. We never fabricate claims.'},{icon:'⚡',title:'Practical',desc:'We focus on what you can actually do. Real checks, real issues, real guidance — not abstract compliance theory.'}].map(({icon,title,desc})=>(
              <div key={title} className="card card-hover">
                <div style={{fontSize:28,marginBottom:14}}>{icon}</div>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:600,color:'var(--ink)',marginBottom:7}}>{title}</h3>
                <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-white">
        <div className="wrap">
          <span className="eyebrow">The team</span>
          <h2 className="heading" style={{fontSize:'clamp(22px,2.5vw,36px)',marginBottom:16}}>The people behind AlgoGrass</h2>
          <p className="subtext" style={{maxWidth:560,marginBottom:48}}>A passionate team making GDPR compliance accessible for every UK and EU small business.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:28,maxWidth:780,margin:'0 auto'}}>

            {/* Founder — Pinki Gaud */}
            <div className="card" style={{textAlign:'center',padding:'36px 28px',border:'2px solid var(--green-m)',background:'var(--green-p)'}}>
              <div style={{width:110,height:140,borderRadius:10,overflow:'hidden',margin:'0 auto 20px',border:'3px solid var(--green)',boxShadow:'0 4px 16px rgba(0,0,0,.12)',background:'#e8ede6'}}>
                <img src="/team/pinki.jpg" alt="Pinki Gaud" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px">👩‍💼</div>' }} />
              </div>
              <div style={{display:'inline-block',padding:'3px 12px',borderRadius:100,background:'var(--green)',color:'#fff',fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:10}}>Founder</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'var(--ink)',marginBottom:4}}>Pinki Gaud</h3>
              <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65,marginBottom:18}}>Building AlgoGrass with a background in LegalTech and AI. Passionate about making GDPR compliance practical and affordable for SMEs across the UK and EU.</p>
              <a href="https://www.linkedin.com/in/pinkigaud/" target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:13,fontWeight:600,color:'#0A66C2',textDecoration:'none',padding:'8px 16px',borderRadius:8,border:'1.5px solid #0A66C2',background:'#fff'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>

            {/* Co-Founder — Kumar Kuppusamy */}
            <div className="card" style={{textAlign:'center',padding:'36px 28px',border:'2px solid var(--green-m)',background:'var(--green-p)'}}>
              <div style={{width:110,height:140,borderRadius:10,overflow:'hidden',margin:'0 auto 20px',border:'3px solid var(--green)',boxShadow:'0 4px 16px rgba(0,0,0,.12)',background:'#e8ede6'}}>
                <img src="/team/kumar.jpg" alt="Kumar Kuppusamy" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top'}} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:40px">👨‍💼</div>' }} />
              </div>
              <div style={{display:'inline-block',padding:'3px 12px',borderRadius:100,background:'var(--green)',color:'#fff',fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',marginBottom:10}}>Co-Founder</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'var(--ink)',marginBottom:4}}>Kumar Kuppusamy</h3>
              <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65,marginBottom:18}}>Co-founding AlgoGrass with deep expertise in technology and business strategy. Focused on scaling compliant, AI-driven tools for businesses of all sizes.</p>
              <a href="https://www.linkedin.com/in/kumar-kuppusamy/" target="_blank" rel="noopener noreferrer"
                style={{display:'inline-flex',alignItems:'center',gap:7,fontSize:13,fontWeight:600,color:'#0A66C2',textDecoration:'none',padding:'8px 16px',borderRadius:8,border:'1.5px solid #0A66C2',background:'#fff'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
            </div>

          </div>
        </div>
      </section>
      <section style={{padding:'72px 0',background:'var(--green)',textAlign:'center'}}>
        <div className="wrap" style={{maxWidth:520}}>
          <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(24px,3vw,38px)',fontWeight:700,color:'#fff',marginBottom:14}}>Try the free scanner today</h2>
          <p style={{fontSize:15,color:'rgba(255,255,255,.7)',marginBottom:28,lineHeight:1.7,fontWeight:300}}>No account, no card. See your compliance position in seconds.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center'}}>
            <a href="/scan" className="btn btn-lime btn-lg">Scan my website free →</a>
            <a href="/pricing" className="btn btn-white btn-lg">View pricing</a>
          </div>
        </div>
      </section>
    </>
  )
}
