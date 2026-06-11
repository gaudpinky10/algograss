'use client'
import { useState } from 'react'

const UPDATES = [
  { id:1, date:'May 2025', title:'EU AI Act — High-risk AI system obligations in force', body:'Article 6 and Annex III obligations for high-risk AI systems became applicable from 2 August 2025. Providers and deployers of systems listed in Annex III (biometrics, critical infrastructure, employment, education, law enforcement) must have conformity assessments, technical documentation, and EU GPAI model rules apply from August 2025.', source:'EU AI Act 2024/1689', severity:'high', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:2, date:'Feb 2026', title:'Data (Use and Access) Act 2025 — Core provisions in force', body:'Key DUAA provisions took effect 5 February 2026 following Royal Assent on 19 June 2025. Changes include: Recognised Legitimate Interests (Article 6(1)(f) with no balancing test for listed purposes), SAR "reasonable and proportionate" search standard replacing the unlimited obligation, and low-risk analytics cookie exemption from prior consent (opt-out model).', source:'Data (Use and Access) Act 2025', severity:'high', category:'UK GDPR', url:'https://www.legislation.gov.uk/ukpga/2025/9' },
  { id:3, date:'Jan 2025', title:'ICO publishes updated Accountability Framework', body:'The ICO refreshed its Accountability Framework in January 2025, adding new modules on AI transparency, automated decision-making documentation, and data minimisation for AI training data. Organisations should review against the updated framework, especially if using AI tools.', source:'ICO', severity:'medium', category:'ICO Guidance', url:'https://ico.org.uk/for-organisations/accountability-framework/' },
  { id:4, date:'Dec 2024', title:'ICO Children\'s code enforcement — stricter position', body:'The ICO issued updated enforcement guidance on the Children\'s Code (Age Appropriate Design Code), confirming that services "likely to be accessed by children" face the full code obligations. "Likelihood" is assessed at 25% or more of users expected to be under 18.', source:'ICO', severity:'medium', category:'ICO Guidance', url:'https://ico.org.uk/for-organisations/childrens-code-hub/' },
  { id:5, date:'Oct 2024', title:'EU-US Data Privacy Framework — ongoing validity confirmed', body:'The EU-US Data Privacy Framework (DPF) was challenged at the French Conseil d\'État in October 2024; the referral was rejected. The DPF remains a valid transfer mechanism for EU-to-US transfers. UK Extension to the DPF also remains in effect for UK-to-US transfers.', source:'CJEU / DPF', severity:'low', category:'International Transfers', url:'https://www.dataprivacyframework.gov/' },
  { id:6, date:'Sep 2024', title:'ICO Fines Advanced Computer Software £3.07m for ransomware failures', body:'Advanced Computer Software Group fined £3.07 million after a 2022 ransomware attack disrupted NHS systems. Key finding: MFA was not consistently applied across all systems, including legacy remote access tools. Takeaway: MFA must be applied to all remote access, not just primary systems.', source:'ICO', severity:'medium', category:'Enforcement', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/08/advanced-computer-software-group-ltd-fined-3-07-million/' },
  { id:7, date:'Aug 2024', title:'ePrivacy Regulation — EU negotiations stalled, PECR remains for UK', body:'The proposed EU ePrivacy Regulation (which would replace the Cookie Directive) remains stalled in EU Council negotiations. For UK businesses, PECR remains the applicable law for cookies and e-marketing. The UK government has not proposed PECR replacement legislation as of 2025.', source:'European Commission / DCMS', severity:'low', category:'ePrivacy / Cookies', url:'https://digital-strategy.ec.europa.eu/en/policies/eprivacy-regulation' },
  { id:8, date:'Jul 2024', title:'EU AI Act enters into force — 24-month implementation begins', body:'The EU AI Act entered into force on 1 August 2024. The 24-month implementation clock for most provisions started. Prohibited AI systems (Article 5) are banned from 2 February 2025. High-risk AI (Annex III) obligations apply from 2 August 2026. GPAI model obligations apply from 2 August 2025.', source:'EU AI Act 2024/1689', severity:'high', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:9, date:'May 2024', title:'ICO letter to 53 data brokers — legitimate interest review', body:'ICO wrote to 53 data brokers requiring them to demonstrate a valid legitimate interest basis for processing personal data for marketing intelligence purposes. Several companies received enforcement notices. This signals broader scrutiny of "legitimate interest" claims in the marketing data sector.', source:'ICO', severity:'medium', category:'Enforcement', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/05/ico-issues-notices-to-data-brokers/' },
  { id:10, date:'Apr 2024', title:'UK-US Data Bridge — extension confirmed valid', body:'The UK Extension to the EU-US Data Privacy Framework (UK-US Data Bridge) was confirmed as a valid transfer mechanism. UK organisations can transfer personal data to US organisations certified under the DPF without needing SCCs or BCRs for those transfers.', source:'DSIT / ICO', severity:'low', category:'International Transfers', url:'https://www.gov.uk/government/publications/uk-us-data-bridge' },
]

const CATS = ['All','UK GDPR','EU AI Act','ICO Guidance','Enforcement','International Transfers','ePrivacy / Cookies']
const SEVCOLOR = { high:{bg:'rgba(239,68,68,0.1)',color:'#EF4444',label:'High impact'}, medium:{bg:'rgba(245,158,11,0.1)',color:'#F59E0B',label:'Medium'}, low:{bg:'rgba(0,212,170,0.1)',color:'var(--accent)',label:'Low'} }

export default function RegulatoryMonitorPage() {
  const [cat, setCat]       = useState('All')
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(null)

  const filtered = UPDATES.filter(u=>(cat==='All'||u.category===cat)&&(!search||u.title.toLowerCase().includes(search.toLowerCase())||u.body.toLowerCase().includes(search.toLowerCase())))

  return (
    <div style={{minHeight:'90vh',background:'var(--bg)'}}>
      <section style={{background:'var(--bg2)',padding:'48px 0 36px',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap">
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--accent)',display:'block',marginBottom:10}}>Live Tracker</span>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'var(--ink)',marginBottom:8}}>Regulatory Change Monitor</h1>
          <p style={{fontSize:14,color:'var(--ink2)',maxWidth:580}}>Stay ahead of GDPR, UK GDPR, EU AI Act, ICO enforcement, and ePrivacy changes. Curated and updated by our compliance team.</p>
        </div>
      </section>

      <section style={{padding:'32px 0 80px'}}>
        <div className="wrap">
          <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search updates..." style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:9,padding:'8px 14px',fontSize:13,color:'var(--ink)',outline:'none',flex:1,minWidth:180}}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {CATS.map(c=>(
                <button key={c} onClick={()=>setCat(c)} style={{fontSize:11,fontWeight:600,padding:'6px 14px',borderRadius:20,border:'1px solid',borderColor:cat===c?'var(--accent)':'var(--border)',background:cat===c?'rgba(0,212,170,0.1)':'transparent',color:cat===c?'var(--accent)':'var(--ink2)',cursor:'pointer',whiteSpace:'nowrap'}}>{c}</button>
              ))}
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map(u=>{
              const sev = SEVCOLOR[u.severity]
              const isOpen = open===u.id
              return (
                <div key={u.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',transition:'border-color .2s',borderColor:isOpen?'rgba(0,212,170,0.3)':'var(--border)'}}>
                  <button onClick={()=>setOpen(isOpen?null:u.id)} style={{width:'100%',background:'none',border:'none',padding:'18px 22px',cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:14}}>
                    <div style={{flexShrink:0,fontSize:11,fontWeight:700,color:'var(--ink2)',minWidth:52}}>{u.date}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
                        <span style={{fontSize:14,fontWeight:600,color:'var(--ink)'}}>{u.title}</span>
                      </div>
                      <div style={{display:'flex',gap:7}}>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 9px',borderRadius:20,background:sev.bg,color:sev.color}}>{sev.label}</span>
                        <span style={{fontSize:10,fontWeight:600,padding:'2px 9px',borderRadius:20,background:'rgba(255,255,255,0.04)',color:'var(--ink2)'}}>{u.category}</span>
                      </div>
                    </div>
                    <span style={{color:'var(--accent)',fontSize:16,flexShrink:0,transition:'transform .2s',transform:isOpen?'rotate(180deg)':'none'}}>▾</span>
                  </button>
                  {isOpen&&(
                    <div style={{padding:'0 22px 20px',borderTop:'1px solid var(--border)'}}>
                      <p style={{fontSize:14,color:'var(--ink2)',lineHeight:1.8,marginTop:16,marginBottom:14}}>{u.body}</p>
                      <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
                        <span style={{fontSize:11,color:'var(--ink2)'}}>Source: <span style={{color:'var(--accent)'}}>{u.source}</span></span>
                        {u.url&&<a href={u.url} target="_blank" rel="noreferrer" style={{fontSize:12,color:'var(--accent)',textDecoration:'none',padding:'4px 12px',border:'1px solid rgba(0,212,170,0.3)',borderRadius:7}}>Read official text →</a>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filtered.length===0&&(
            <div style={{textAlign:'center',padding:'60px 0',color:'var(--ink2)'}}>
              <div style={{fontSize:40,marginBottom:14}}>🔍</div>
              <p style={{fontSize:15,color:'var(--ink)'}}>No updates match your search</p>
            </div>
          )}

          <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:14,padding:'20px 24px',marginTop:32}}>
            <p style={{fontSize:14,color:'var(--ink)',fontWeight:600,marginBottom:6}}>📋 Updates are manually curated by our compliance team</p>
            <p style={{fontSize:13,color:'var(--ink2)',margin:0}}>This tracker covers UK GDPR, EU GDPR, EU AI Act, ICO enforcement, and ePrivacy/PECR. Last updated: June 2026. Sign up for email alerts when new regulatory changes are added.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
