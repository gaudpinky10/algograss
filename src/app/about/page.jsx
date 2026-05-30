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
          <h2 className="heading" style={{fontSize:'clamp(22px,2.5vw,36px)',marginBottom:16}}>A small team building something we believe in</h2>
          <p className="subtext" style={{maxWidth:560,marginBottom:44}}>We are not listing names or roles we have not yet filled — honesty matters, especially for a compliance business.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:22}}>
            <div className="card" style={{background:'var(--green)',border:'none'}}>
              <div style={{fontSize:28,marginBottom:14}}>👩‍💻</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:600,color:'#fff',marginBottom:7}}>Founder</h3>
              <p style={{fontSize:13,color:'rgba(255,255,255,.75)',lineHeight:1.65}}>Building AlgoGrass with a background in LegalTech and AI. Passionate about making compliance practical for small businesses across the UK and EU.</p>
            </div>
            <div className="card card-hover" style={{border:'2px dashed var(--green-m)',background:'var(--green-p)'}}>
              <div style={{fontSize:28,marginBottom:14}}>⚖️</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:600,color:'var(--green)',marginBottom:7}}>Data Protection Advisor</h3>
              <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>Looking for a qualified solicitor or CIPP-certified data protection professional to advise on our legal content. <a href="/contact" style={{color:'var(--green)',fontWeight:500}}>Get in touch →</a></p>
            </div>
            <div className="card card-hover" style={{border:'2px dashed var(--green-m)',background:'var(--green-p)'}}>
              <div style={{fontSize:28,marginBottom:14}}>🚀</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:600,color:'var(--green)',marginBottom:7}}>Early Adopters</h3>
              <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.65}}>Looking for SMEs to use AlgoGrass and give honest feedback. Try our scanner and tell us what you think. <a href="/contact" style={{color:'var(--green)',fontWeight:500}}>Tell us →</a></p>
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
