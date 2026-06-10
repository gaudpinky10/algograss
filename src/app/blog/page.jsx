const POSTS=[
  {slug:'gdpr-checklist-2025',cat:'GDPR',date:'15 Jan 2025',read:'8 min',title:'The 2025 GDPR Compliance Checklist for UK SMEs',excerpt:'Everything your small business needs to do to be GDPR compliant — explained in plain English without the legal jargon.'},
  {slug:'cookie-banner-guide',cat:'Cookies',date:'28 Jan 2025',read:'6 min',title:'How to Set Up a Legally Compliant Cookie Banner',excerpt:'Cookie banners are not optional under UK and EU law. Here is exactly what yours must say and the mistakes to avoid.'},
  {slug:'privacy-policy-requirements',cat:'GDPR',date:'5 Feb 2025',read:'10 min',title:'What Must Be in Your Privacy Policy Under GDPR',excerpt:'GDPR Articles 13 and 14 set out exactly what your privacy policy must include. We break down every requirement.'},
  {slug:'ico-fines-guide',cat:'Compliance',date:'12 Feb 2025',read:'7 min',title:'Understanding ICO Fines: What Gets UK Businesses Fined?',excerpt:'The ICO has fined small businesses as well as large corporations. Learn what triggers an investigation.'},
  {slug:'data-processing-agreement',cat:'GDPR',date:'20 Feb 2025',read:'5 min',title:'When Does Your Business Need a Data Processing Agreement?',excerpt:'If you use third-party tools that process customer data, you likely need a DPA. Here is what it must contain.'},
  {slug:'uk-gdpr-vs-eu-gdpr',cat:'UK Law',date:'1 Mar 2025',read:'9 min',title:'UK GDPR vs EU GDPR: Key Differences for UK Businesses',excerpt:'Post-Brexit, UK businesses serving EU customers must comply with both UK GDPR and EU GDPR. We explain the differences.'},
]
const CAT={GDPR:['#EAF2EC','#3D6B52'],Cookies:['#FEF6E4','#B7770D'],Compliance:['#EEF2FF','#4B5CB8'],'UK Law':['#FDF2F8','#9B3FAF']}
export default function BlogPage() {
  const [featured,...rest]=POSTS
  return (
    <>
      <section className="section-white" style={{paddingBottom:48}}>
        <div className="wrap">
          <span className="eyebrow">Resources & Blog</span>
          <h1 className="heading" style={{fontSize:'clamp(28px,3.5vw,48px)',maxWidth:540,marginBottom:12}}>Compliance explained in plain English</h1>
          <p className="subtext" style={{maxWidth:500}}>Practical guides, regulatory updates, and compliance tips for UK and EU small businesses.</p>
        </div>
      </section>
      <section style={{padding:'0 0 88px',background:'var(--white)'}}>
        <div className="wrap">
          <div style={{background:'var(--green)',borderRadius:22,padding:'44px 52px',marginBottom:40,display:'flex',flexWrap:'wrap',gap:24,alignItems:'center'}}>
            <div>
              <span style={{display:'inline-block',background:'var(--lime)',color:'var(--ink)',fontSize:9,fontWeight:700,padding:'4px 10px',borderRadius:100,marginBottom:14,textTransform:'uppercase',letterSpacing:'.07em'}}>Featured</span>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(18px,2.5vw,26px)',fontWeight:700,color:'#fff',marginBottom:10,lineHeight:1.25}}>{featured.title}</h2>
              <p style={{fontSize:14,color:'rgba(255,255,255,.75)',lineHeight:1.65,marginBottom:22,maxWidth:500}}>{featured.excerpt}</p>
              <a href={'/blog/'+featured.slug} style={{display:'inline-block',background:'rgba(255,255,255,.15)',color:'#fff',padding:'11px 22px',borderRadius:9,fontSize:13,fontWeight:500,textDecoration:'none',border:'1px solid rgba(255,255,255,.2)'}}>Read article →</a>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)'}}>{featured.date}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',marginTop:4}}>{featured.read} read</div>
            </div>
          </div>
          <div className='grid-3col' style={{gap:20}}>
            {rest.map(post=>{
              const [bg,col]=(CAT[post.cat]||['#F5F5F5','#444'])
              return (
                <a key={post.slug} href={'/blog/'+post.slug} className="card card-hover" style={{display:'block',textDecoration:'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                    <span style={{fontSize:9,fontWeight:700,background:bg,color:col,padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em'}}>{post.cat}</span>
                    <span style={{fontSize:11,color:'var(--ink2)'}}>{post.read} read</span>
                  </div>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:600,color:'var(--ink)',marginBottom:9,lineHeight:1.3}}>{post.title}</h3>
                  <p style={{fontSize:12,color:'var(--ink2)',lineHeight:1.6,marginBottom:14}}>{post.excerpt}</p>
                  <div style={{fontSize:11,color:'var(--ink2)'}}>{post.date}</div>
                </a>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
