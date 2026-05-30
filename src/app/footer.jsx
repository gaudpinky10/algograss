const COLS = [
  {title:'Product',links:[['/', 'Home'],['/scan','Free scanner'],['/pricing','Pricing'],['/dashboard','Dashboard'],['/blog','Blog']]},
  {title:'Company',links:[['/about','About'],['/contact','Contact'],['/signup','Sign Up']]},
  {title:'Legal',links:[['#','Privacy Policy'],['#','Terms of Service'],['#','Cookie Policy']]},
]
export default function Footer() {
  return (
    <footer style={{background:'var(--ink)',padding:'56px 0 32px'}}>
      <div className="wrap">
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:48,marginBottom:44}}>
          <div>
            <div style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:'#5A8F6E',marginBottom:12,display:'flex',alignItems:'center',gap:8}}>
              <svg width="20" height="22" viewBox="0 0 32 36" fill="none"><path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52"/><path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              AlgoGrass
            </div>
            <p style={{fontSize:13,color:'rgba(247,245,239,0.45)',lineHeight:1.7,maxWidth:260,marginBottom:10}}>AI-powered GDPR and UK DPA 2018 compliance guidance for small businesses.</p>
            <p style={{fontSize:12,color:'rgba(247,245,239,0.3)',lineHeight:1.6,maxWidth:260,marginBottom:14}}>Guidance tool only — not a law firm. Always review documents with a qualified solicitor.</p>
            <a href="mailto:hello@algograss.ltd" className="footer-link">hello@algograss.ltd</a>
          </div>
          {COLS.map(col=>(
            <div key={col.title}>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:'.09em',textTransform:'uppercase',color:'var(--lime-d)',marginBottom:14}}>{col.title}</div>
              <ul style={{listStyle:'none'}}>
                {col.links.map(([href,label])=>(
                  <li key={label} style={{marginBottom:9}}>
                    <a href={href} className="footer-link">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{borderTop:'1px solid rgba(255,255,255,0.07)',paddingTop:20,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
          <span style={{fontSize:12,color:'rgba(247,245,239,0.25)'}}>© 2025 AlgoGrass Ltd · Registered in England & Wales</span>
          <span style={{fontSize:12,color:'rgba(247,245,239,0.25)'}}>AI guidance only — not legal advice</span>
        </div>
      </div>
    </footer>
  )
}
