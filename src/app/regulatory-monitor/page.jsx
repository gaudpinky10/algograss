'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const UPDATES = [
  { id:1,  date:'Jun 2026', title:'Data (Use and Access) Act — Mandatory complaints process live', body:'From 19 June 2026, UK GDPR controllers must have a documented internal data protection complaints process. Individuals must be able to complain directly to the controller before escalating to the ICO. Failure to provide this process is now a separate breach under the DUAA 2025. Businesses must update their privacy notices to include the complaints procedure.', source:'DUAA 2025 s.4', severity:'critical', category:'UK GDPR', url:'https://www.legislation.gov.uk/ukpga/2025/9' },
  { id:2,  date:'Jun 2026', title:'PECR fines increase to £17.5m under DUAA 2025', body:'The Data (Use and Access) Act 2025 increased maximum PECR fines to £17.5 million or 4% of global annual turnover — bringing them in line with UK GDPR. This applies to cookie consent violations, unsolicited marketing calls and texts, and security failures. The ICO has signalled increased enforcement focus on cookie dark patterns.', source:'DUAA 2025 / PECR', severity:'critical', category:'PECR / Cookies', url:'https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/' },
  { id:3,  date:'Feb 2026', title:'ICO fines Reddit £14.47m for children\'s data failures', body:'The ICO fined Reddit £14.47m following investigation into the use of children\'s personal data in AI training. Reddit failed to implement adequate age assurance measures and did not apply appropriate safeguards for under-18 users. This is the second largest ICO fine ever and signals serious enforcement of the Children\'s Code.', source:'ICO Enforcement', severity:'high', category:'Enforcement', url:'https://ico.org.uk/' },
  { id:4,  date:'Jan 2026', title:'EU AI Act — GPAI model obligations fully in force', body:'General Purpose AI model obligations under the EU AI Act have been fully in force since August 2025. GPAI providers must maintain technical documentation, publish summaries of training data, implement copyright policies, and report serious incidents. Affects UK businesses deploying EU AI models.', source:'EU AI Act Art. 53-55', severity:'high', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:5,  date:'Nov 2025', title:'UK Cyber Security and Resilience Bill introduced', body:'The UK Cyber Security and Resilience Bill was introduced to Parliament in November 2025. It will replace the NIS Regulations 2018, expand scope to include more digital services and supply chains, give regulators stronger powers, and introduce mandatory incident reporting within 24 hours. Expected Royal Assent in 2026.', source:'DSIT / Parliament', severity:'high', category:'Cybersecurity', url:'https://www.gov.uk/government/publications/cyber-security-and-resilience-bill' },
  { id:6,  date:'Oct 2025', title:'ICO fines Capita £14m — UK\'s largest ever ICO fine', body:'Capita plc fined £14.4 million following a 2023 cyber attack that exposed personal data of up to 90,000 people. ICO found Capita failed to implement adequate security measures, had poor patch management, and inadequate incident response. This is the largest ICO fine in UK history.', source:'ICO Enforcement', severity:'high', category:'Enforcement', url:'https://ico.org.uk/' },
  { id:7,  date:'Aug 2025', title:'EU AI Act — Prohibited AI practices ban takes full effect', body:'The full ban on prohibited AI practices under Article 5 has been in effect since February 2025. By August 2025, the EU AI Office issued enforcement guidance. Prohibited systems include: subliminal manipulation, exploitation of vulnerabilities, social scoring by public authorities, and real-time biometric ID in public spaces. Penalties up to €35m or 7% global turnover.', source:'EU AI Act Art. 5', severity:'critical', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:8,  date:'Jun 2025', title:'Data (Use and Access) Act 2025 — Royal Assent', body:'The DUAA 2025 received Royal Assent on 19 June 2025, amending UK GDPR significantly: Recognised Legitimate Interests (no balancing test for listed purposes), SAR "reasonable and proportionate" search standard, low-risk analytics cookie exemption, smart data schemes, and mandatory internal complaints processes.', source:'DUAA 2025', severity:'high', category:'UK GDPR', url:'https://www.legislation.gov.uk/ukpga/2025/9' },
  { id:9,  date:'Apr 2025', title:'ICO publishes comprehensive AI and data protection guidance', body:'The ICO published comprehensive guidance on AI and data protection covering: lawful basis for AI training data, data minimisation in AI systems, transparency obligations for AI-generated decisions, automated decision-making safeguards, and DPIAs for AI deployment. Essential reading for any organisation using AI tools.', source:'ICO', severity:'medium', category:'ICO Guidance', url:'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/' },
  { id:10, date:'Feb 2025', title:'EU AI Act — Article 5 prohibited practices ban in force', body:'From 2 February 2025, all prohibited AI practices under Article 5 of the EU AI Act are banned across the EU. This includes systems for social scoring, subliminal manipulation, exploiting vulnerabilities, emotion recognition in workplaces/education, and real-time biometric identification in public spaces.', source:'EU AI Act Art. 5', severity:'critical', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:11, date:'Jan 2025', title:'ICO refreshes Accountability Framework with AI modules', body:'The ICO updated its Accountability Framework with new modules covering: AI transparency requirements, automated decision-making documentation, data minimisation for AI training, and updated DPIA guidance. Organisations should review against the updated framework and update their AI governance registers.', source:'ICO', severity:'medium', category:'ICO Guidance', url:'https://ico.org.uk/for-organisations/accountability-framework/' },
  { id:12, date:'Dec 2024', title:'EDPB Opinion 28/2024 — AI model training and legitimate interests', body:'The EDPB published Opinion 28/2024 on legitimate interests for AI model training. Key finding: LI CAN be used as lawful basis but requires a rigorous 3-step test (purpose, necessity, balancing). Scraped public data is not automatically lawful. Controllers must document their Legitimate Interests Assessment carefully.', source:'EDPB Opinion 28/2024', severity:'high', category:'EU GDPR', url:'https://www.edpb.europa.eu/' },
  { id:13, date:'Dec 2024', title:'ICO Children\'s Code — 25% threshold confirmed', body:'The ICO confirmed the "likely to be accessed by children" threshold is 25% or more of users expected to be under 18. Services must implement age assurance proportionate to risk. Social media, gaming, and streaming services face highest scrutiny. Age assurance technology requirements are now more prescriptive.', source:'ICO', severity:'medium', category:'ICO Guidance', url:'https://ico.org.uk/for-organisations/childrens-code-hub/' },
  { id:14, date:'Oct 2024', title:'EU NIS2 Directive — in force across EU member states', body:'The EU NIS2 Directive came into force in October 2024, replacing the original NIS Directive. NIS2 extends to more sectors, requires stricter security measures, mandates 24-hour early warning and 72-hour full incident reports, and introduces personal liability for senior management. The UK is developing its equivalent Cyber Security and Resilience Bill.', source:'NIS2 Directive', severity:'high', category:'Cybersecurity', url:'https://digital-strategy.ec.europa.eu/en/policies/nis2-directive' },
  { id:15, date:'Aug 2024', title:'EU AI Act enters into force — 24-month implementation clock starts', body:'The EU AI Act entered into force on 1 August 2024. Key dates: prohibited practices banned from Feb 2025, GPAI obligations from Aug 2025, high-risk AI (Annex III) from Aug 2026. UK businesses selling into EU must comply. AI governance registers are now essential.', source:'EU AI Act 2024/1689', severity:'critical', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:19, date:'May 2025', title:'TikTok fined €530m — EU\'s second-largest GDPR fine ever', body:'Ireland\'s Data Protection Commission fined TikTok €530 million for unlawfully transferring EEA user data to China and insufficient transparency about data flows to Chinese-based employees of its parent company ByteDance. This is the second largest GDPR fine in history, after Meta\'s €1.2B (2023). Both fines relate to Art. 44–46 international transfer obligations, reinforcing that data transfer mechanisms are a top enforcement priority.', source:'Ireland DPC / Art. 44–46 GDPR', severity:'critical', category:'Enforcement', url:'https://www.dataprotection.ie/' },
  { id:20, date:'May 2025', title:'GDPR enforcement: €6.31B in fines across 3,202 cases since 2018', body:'The GDPR Enforcement Tracker (enforcementtracker.com) shows cumulative GDPR enforcement has reached 3,202 cases and €6.31 billion in fines across 32 countries as of 2025. The top violation types are: (1) Insufficient legal basis for data processing (Art. 6) — ~950 cases; (2) Non-compliance with data processing principles (Art. 5) — ~800 cases; (3) Insufficient technical & organisational measures (Art. 32) — ~600 cases. Spain\'s AEPD has the most cases (1,078). The data confirms: no lawful basis, weak security, and transparency failures are the highest-risk compliance gaps. Most cited articles: Art. 5, Art. 6, Art. 32, Art. 13.', source:'GDPR Enforcement Tracker', severity:'high', category:'Enforcement', url:'https://www.enforcementtracker.com/' },
  { id:16, date:'Jun 2024', title:'ICO letter campaign to 53 data brokers on legitimate interests', body:'The ICO wrote to 53 data broker companies requiring evidence of valid legitimate interest basis for processing personal data for marketing intelligence. Several received enforcement notices. This signals broad ICO scrutiny of LI claims in the marketing data sector. Businesses relying on LI for marketing should review their LIAs.', source:'ICO', severity:'medium', category:'Enforcement', url:'https://ico.org.uk/' },
  { id:17, date:'Apr 2024', title:'UK-US Data Bridge confirmed as valid transfer mechanism', body:'The UK Extension to the EU-US Data Privacy Framework (UK-US Data Bridge) remains a valid transfer mechanism. UK organisations can transfer personal data to certified US organisations without needing SCCs. Regular review of the US organisation\'s DPF certification status is recommended.', source:'DSIT / ICO', severity:'low', category:'International Transfers', url:'https://www.gov.uk/government/publications/uk-us-data-bridge' },
  { id:18, date:'Mar 2024', title:'ICO Direct Marketing Guidance updated — consent now per channel', body:'The ICO published updated direct marketing guidance: the soft opt-in exemption is narrowly interpreted, consent must be granular per channel (email, SMS, calls), legitimate interests requirements tightened for B2B marketing, and suppression list obligations clarified. Key change: one consent form cannot cover all marketing channels.', source:'ICO', severity:'medium', category:'PECR / Cookies', url:'https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/' },
]

const CATS = ['All', 'UK GDPR', 'EU GDPR', 'EU AI Act', 'ICO Guidance', 'Enforcement', 'PECR / Cookies', 'Cybersecurity', 'International Transfers']
const SEV = {
  critical: { bg:'rgba(220,38,38,0.15)', color:'#EF4444', label:'Critical' },
  high:     { bg:'rgba(245,158,11,0.15)', color:'#F59E0B', label:'High Impact' },
  medium:   { bg:'rgba(99,102,241,0.15)', color:'#818CF8', label:'Medium' },
  low:      { bg:'rgba(14,165,233,0.12)',  color:'#0EA5E9', label:'Low' },
}
const CAT_ICONS = { 'UK GDPR':'🇬🇧','EU GDPR':'🇪🇺','EU AI Act':'🤖','ICO Guidance':'📘','Enforcement':'⚖️','PECR / Cookies':'🍪','Cybersecurity':'🔐','International Transfers':'🌍' }


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(cookie.split('=')[1]))
  } catch { return null }
}
export default function RegulatoryMonitorPage() {
  const [cat, setCat]       = useState('All')
  const [sev, setSev]       = useState('All')
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(null)
  const [email, setEmail]   = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = UPDATES.filter(u =>
    (cat === 'All' || u.category === cat) &&
    (sev === 'All' || u.severity === sev.toLowerCase()) &&
    (!search || u.title.toLowerCase().includes(search.toLowerCase()) || u.body.toLowerCase().includes(search.toLowerCase()) || u.category.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = {
    critical: UPDATES.filter(u => u.severity === 'critical').length,
    high:     UPDATES.filter(u => u.severity === 'high').length,
    recent:   UPDATES.filter(u => u.date.includes('2026') || (u.date.includes('2025') && !u.date.includes('2024'))).length,
  }

  return (
    <div style={{ minHeight:'90vh', background:'var(--bg)' }}>

      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg,var(--bg) 0%,var(--bg2) 100%)', padding:'52px 0 40px', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(14,165,233,.1)', border:'1px solid rgba(14,165,233,.25)', padding:'5px 13px', borderRadius:100, marginBottom:16, fontSize:11, fontWeight:600, color:'#0EA5E9', letterSpacing:'.08em', textTransform:'uppercase' }}>
            📡 Live Regulatory Feed · Updated June 2026
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(26px,3vw,42px)', fontWeight:800, color:'#fff', marginBottom:12 }}>Regulatory Change Monitor</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:600, lineHeight:1.7, marginBottom:28 }}>
            Track the latest GDPR enforcement actions, ICO guidance, EU AI Act updates, and UK data protection law changes — all in one place.
          </p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {[['🔴', stats.critical, 'Critical updates'],['🟡', stats.high, 'High-impact changes'],['📅', stats.recent, 'Updates in 2025-26'],['📚', UPDATES.length, 'Total entries']].map(([icon, n, label]) => (
              <div key={label} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:'14px 20px', minWidth:120 }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>{n}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STICKY FILTERS */}
      <div style={{ background:'rgba(255,255,255,0.95)', borderBottom:'1px solid var(--border)', padding:'14px 0', position:'sticky', top:64, zIndex:10, backdropFilter:'blur(12px)' }}>
        <div className="wrap" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search updates..."
            style={{ flex:1, minWidth:180, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 14px', fontSize:13, color:'#fff', outline:'none' }} />
          <select value={cat} onChange={e => setCat(e.target.value)}
            style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#fff', cursor:'pointer' }}>
            {CATS.map(c => <option key={c} value={c} style={{ background:'#F8FAFC' }}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={sev} onChange={e => setSev(e.target.value)}
            style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#fff', cursor:'pointer' }}>
            {['All','Critical','High','Medium','Low'].map(s => <option key={s} value={s} style={{ background:'#F8FAFC' }}>{s === 'All' ? 'All Severities' : s}</option>)}
          </select>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.35)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="wrap" style={{ padding:'32px 0', display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

        {/* UPDATES LIST */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'rgba(255,255,255,.35)' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <p>No updates match your filters.</p>
            </div>
          ) : filtered.map(u => {
            const s = SEV[u.severity] || SEV.medium
            const isOpen = open === u.id
            return (
              <div key={u.id} style={{ background:'rgba(255,255,255,0.9)', border:`1px solid ${isOpen ? 'rgba(14,165,233,0.3)' : 'rgba(15,23,42,0.07)'}`, borderRadius:14, overflow:'hidden', transition:'border-color .2s' }}>
                <button onClick={() => setOpen(isOpen ? null : u.id)}
                  style={{ width:'100%', textAlign:'left', background:'transparent', border:'none', padding:'18px 20px', cursor:'pointer', display:'flex', gap:14, alignItems:'flex-start' }}>
                  <div style={{ flexShrink:0, fontSize:11, color:'rgba(255,255,255,.3)', marginTop:2, minWidth:58 }}>{u.date}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:7, marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, background:s.bg, color:s.color }}>{s.label}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, background:'rgba(255,255,255,.05)', color:'rgba(255,255,255,.45)' }}>{CAT_ICONS[u.category]} {u.category}</span>
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#fff', lineHeight:1.4 }}>{u.title}</div>
                    {!isOpen && <div style={{ fontSize:12, color:'rgba(255,255,255,.38)', marginTop:5, lineHeight:1.5 }}>{u.body.slice(0, 110)}...</div>}
                  </div>
                  <span style={{ flexShrink:0, fontSize:14, color:'rgba(255,255,255,.25)', transition:'transform .2s', display:'block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                </button>
                {isOpen && (
                  <div style={{ padding:'0 20px 20px 52px', borderTop:'1px solid rgba(255,255,255,.05)' }}>
                    <p style={{ fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.8, marginTop:14, marginBottom:14 }}>{u.body}</p>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                      <span style={{ fontSize:11, color:'rgba(255,255,255,.3)' }}>Source: {u.source}</span>
                      {u.url && <a href={u.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(14,165,233,.3)', color:'#0EA5E9', textDecoration:'none', fontWeight:600 }}>Read source →</a>}
                      {u.category === 'EU AI Act' && <a href="/ai-governance" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(124,158,255,.25)', color:'#7C9EFF', textDecoration:'none', fontWeight:600 }}>Check AI Governance →</a>}
                      {(u.category === 'UK GDPR' || u.category === 'EU GDPR') && <a href="/grc" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(124,158,255,.25)', color:'#7C9EFF', textDecoration:'none', fontWeight:600 }}>Review GRC →</a>}
                      {u.category === 'Enforcement' && <a href="/scan" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(124,158,255,.25)', color:'#7C9EFF', textDecoration:'none', fontWeight:600 }}>Scan Your Site →</a>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SIDEBAR */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:120 }}>

          <div style={{ background:'rgba(255,255,255,0.93)', border:'1px solid rgba(14,165,233,.2)', borderRadius:16, padding:'20px' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0EA5E9', marginBottom:6 }}>📬 Get Regulatory Alerts</div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.45)', marginBottom:14, lineHeight:1.6 }}>Notified when major GDPR fines, ICO guidance, or law changes happen.</p>
            {subscribed ? (
              <div style={{ background:'rgba(14,165,233,.1)', border:'1px solid rgba(14,165,233,.25)', borderRadius:8, padding:'12px', fontSize:13, color:'#0EA5E9', textAlign:'center' }}>✅ You're subscribed!</div>
            ) : (
              <>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'9px 12px', fontSize:13, color:'#fff', outline:'none', marginBottom:8, boxSizing:'border-box' }} />
                <button onClick={() => { if (email.includes('@')) setSubscribed(true) }}
                  style={{ width:'100%', padding:'10px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#0EA5E9,#0284C7)', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                  Subscribe to alerts
                </button>
              </>
            )}
          </div>

          <div style={{ background:'rgba(255,255,255,0.9)', border:'1px solid rgba(255,255,255,.06)', borderRadius:16, padding:'18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:12 }}>Quick Actions</div>
            {[['🛡️','Review GRC Controls','/grc'],['🤖','AI Governance','/ai-governance'],['🔍','Scan Your Website','/scan'],['📋','DPIA Wizard','/dpia'],['🏢','Vendor Risk','/vendor-risk']].map(([icon, label, href]) => (
              <a key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.04)', textDecoration:'none', color:'rgba(255,255,255,.6)', fontSize:13 }}>
                <span>{icon}</span><span>{label}</span><span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,.2)' }}>→</span>
              </a>
            ))}
          </div>

          <div style={{ background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,.18)', borderRadius:16, padding:'18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#EF4444', marginBottom:12 }}>⏰ Upcoming Deadlines</div>
            {[['Aug 2026','EU AI Act high-risk AI obligations','critical'],['2026','UK Cyber Resilience Bill','high'],['Ongoing','DUAA 2025 rolling implementation','medium']].map(([date, label, s]) => (
              <div key={date} style={{ display:'flex', gap:8, marginBottom:10, alignItems:'flex-start' }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:20, background:s==='critical'?'rgba(220,38,38,.15)':s==='high'?'rgba(245,158,11,.15)':'rgba(99,102,241,.15)', color:s==='critical'?'#EF4444':s==='high'?'#F59E0B':'#818CF8', whiteSpace:'nowrap', marginTop:2 }}>{date}</span>
                <span style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.5 }}>{label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
