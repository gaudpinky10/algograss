'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const UPDATES = [
  { id:1,  date:'Jul 2026', title:'EU AI Act: high-risk rules delayed by the Digital Omnibus', body:'The EU\'s amendment to the AI Act came into force on 27 July 2026. Rules for stand-alone high-risk AI systems (Annex III, such as recruitment and credit scoring) now apply from 2 December 2027, and for AI in regulated products (Annex I) from 2 August 2028. Generative AI systems already on the market before 2 August 2026 have until 2 December 2026 to label AI-generated content. Affects UK businesses that place AI on the EU market or whose AI output is used in the EU.', source:'Digital Omnibus on AI', severity:'high', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:2,  date:'Jun 2026', title:'Data protection complaints: new legal duty in force', body:'From 19 June 2026, organisations must make it easy for people to complain about how their personal data is used (for example with a form that can be filled in online), acknowledge each complaint within 30 days, look into it without undue delay, keep the person updated and tell them the outcome. Keep a record of complaints: the ICO can ask to see it. Mention the process in your privacy notice.', source:'DUAA 2025 s.103 (new s.164A DPA 2018)', severity:'critical', category:'UK GDPR', url:'https://www.legislation.gov.uk/ukpga/2025/18/section/103' },
  { id:3,  date:'May 2026', title:'ICO fines KRA Consultancy £300,000 for spam texts', body:'The ICO fined KRA Consultancy Ltd £300,000 for sending over 5.5 million unsolicited marketing texts, including fake bailiff messages, which led to more than 60,000 complaints to the 7726 spam reporting service. Marketing texts and emails to individuals need consent, unless the soft opt-in applies.', source:'ICO (PECR regs. 22-23)', severity:'medium', category:'Enforcement', url:'https://ico.org.uk/action-weve-taken/enforcement/2026/05/kra-consultancy-ltd-mpn/' },
  { id:4,  date:'Feb 2026', title:'Most DUAA data protection changes now in force', body:'On 5 February 2026 most of the Data (Use and Access) Act\'s changes to UK GDPR, the DPA 2018 and PECR came into force, including: recognised legitimate interests (a new lawful basis for a short list of purposes, with no balancing test); subject access requests needing only reasonable and proportionate searches, with the clock paused while ID or clarification is awaited; new rules on automated decision-making; new exemptions from cookie consent for some analytics and functionality cookies; and PECR fines raised to the UK GDPR level of up to £17.5 million or 4% of worldwide turnover.', source:'DUAA 2025 (Commencement No. 6) Regulations 2026', severity:'critical', category:'UK GDPR', url:'https://www.legislation.gov.uk/ukpga/2025/18' },
  { id:5,  date:'Feb 2026', title:'ICO fines Reddit £14.47m over children\'s data', body:'The ICO fined Reddit £14.47 million for failing to use effective age checks, which meant it processed the data of children under 13 without a lawful basis. The ICO said asking users to declare their own age is not enough where children are at risk. It is one of the largest ICO fines to date, after British Airways (£20m) and Marriott (£18.4m).', source:'ICO', severity:'high', category:'Enforcement', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2026/02/reddit-issued-with-1447m-fine-for-children-s-privacy-failures/' },
  { id:6,  date:'Dec 2025', title:'ICO: 95% of top 1,000 websites now give a fair cookie choice', body:'After testing the UK\'s 1,000 most-visited websites, the ICO reported that 979 met its rules on advertising cookies (no cookies before a choice, rejecting as easy as accepting). 564 of them fixed their banners after ICO letters or preliminary enforcement notices. The ICO says it will keep testing sites and act against those that still fail.', source:'ICO', severity:'high', category:'PECR / Cookies', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/12/ico-action-secures-increased-cookie-compliance/' },
  { id:7,  date:'Oct 2025', title:'ICO fines Capita £14m after cyber attack', body:'Capita plc (£8m) and Capita Pension Solutions (£6m) were fined a total of £14 million after a 2023 cyber attack exposed the data of 6.6 million people. The ICO found weaknesses in access controls, a 58-hour delay in responding to a high-priority security alert, and gaps in penetration testing and risk management.', source:'ICO', severity:'high', category:'Enforcement', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/10/capita-fined-14m-for-data-breach-affecting-over-6m-people/' },
  { id:8,  date:'Nov 2025', title:'UK Cyber Security and Resilience Bill introduced', body:'The Bill was introduced to Parliament in November 2025 to update the NIS Regulations 2018: more digital services and suppliers in scope, stronger regulator powers and faster incident reporting. It was carried over into the 2026-27 session and is not yet law.', source:'UK Parliament', severity:'medium', category:'Cybersecurity', url:'https://bills.parliament.uk/bills/4035' },
  { id:9,  date:'Aug 2025', title:'EU AI Act: rules for general-purpose AI models apply', body:'From 2 August 2025, providers of general-purpose AI models must keep technical documentation, publish a summary of their training content and have a copyright policy, with extra duties for models with systemic risk. Businesses that only use these models mainly need to check what their provider gives them.', source:'EU AI Act Arts. 53-55', severity:'medium', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:10, date:'Jun 2025', title:'ICO fines 23andMe £2.31m for security failings', body:'The ICO fined genetic testing company 23andMe £2.31 million after a 2023 credential stuffing attack exposed the data of 155,592 UK users. The ICO found no mandatory multi-factor authentication, weak password rules, no extra checks before raw genetic data could be downloaded, and a slow response to the attack.', source:'ICO', severity:'medium', category:'Enforcement', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/06/23andme-fined-for-failing-to-protect-uk-users-genetic-data/' },
  { id:11, date:'Jun 2025', title:'Data (Use and Access) Act 2025 becomes law', body:'The Data (Use and Access) Act 2025 received Royal Assent on 19 June 2025. It amends UK GDPR, the DPA 2018 and PECR, with changes brought into force in stages (most on 5 February 2026, the complaints duty on 19 June 2026).', source:'DUAA 2025', severity:'high', category:'UK GDPR', url:'https://www.legislation.gov.uk/ukpga/2025/18' },
  { id:12, date:'May 2025', title:'TikTok fined €530m in the EU over transfers to China', body:'Ireland\'s Data Protection Commission fined TikTok €530 million for transferring EEA users\' data to China without ensuring equivalent protection, and for not being clear about it. It is among the largest EU GDPR fines, after Meta (€1.2bn, 2023) and Amazon (€746m, 2021).', source:'Irish DPC', severity:'medium', category:'EU GDPR', url:'https://www.dataprotection.ie/' },
  { id:13, date:'Apr 2025', title:'Law firm fined £60,000 after cyber attack', body:'The ICO fined DPP Law Ltd £60,000. Attackers got in through a rarely used administrator account without multi-factor authentication and took 32GB of data. The firm also reported the breach 43 days late, because it hadn\'t realised that losing access to personal data is a breach too.', source:'ICO', severity:'high', category:'Enforcement', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/04/law-firm-fined-60-000-following-cyber-attack/' },
  { id:14, date:'Mar 2025', title:'IT supplier Advanced fined £3.07m: first fine on a processor', body:'The ICO fined Advanced Computer Software Group £3.07 million after a ransomware attack that disrupted NHS 111 and other services. Attackers used a customer account that lacked multi-factor authentication. It was the ICO\'s first fine on a data processor.', source:'ICO', severity:'high', category:'Enforcement', url:'https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/03/software-provider-fined-3m-following-2022-ransomware-attack/' },
  { id:15, date:'Feb 2025', title:'ICO data protection fee goes up', body:'From February 2025 the annual data protection fee is £52 for tier 1 (micro organisations), £78 for tier 2 (small and medium) and £3,763 for tier 3 (large), with £5 off by direct debit. Most organisations that process personal data must pay it unless exempt.', source:'ICO', severity:'low', category:'ICO Guidance', url:'https://ico.org.uk/for-organisations/data-protection-fee/' },
  { id:16, date:'Feb 2025', title:'EU AI Act: banned practices and AI literacy apply', body:'From 2 February 2025, AI practices listed in Article 5 are banned in the EU, including social scoring, harmful manipulation, exploiting vulnerabilities, emotion recognition at work or in education, and untargeted scraping of faces. Organisations using AI must also take steps to make sure their staff have enough AI literacy (Art. 4).', source:'EU AI Act Arts. 4-5', severity:'medium', category:'EU AI Act', url:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689' },
  { id:17, date:'Dec 2024', title:'EDPB opinion on AI models and personal data', body:'The European Data Protection Board\'s Opinion 28/2024 says legitimate interests can be a lawful basis for developing and using AI models, but only after a careful three-step test (purpose, necessity, balancing), and that a model trained on personal data is not automatically anonymous. It applies to EU GDPR, but UK organisations often find it a useful guide.', source:'EDPB Opinion 28/2024', severity:'medium', category:'EU GDPR', url:'https://www.edpb.europa.eu/' },
  { id:18, date:'Oct 2024', title:'EU NIS2 cyber security rules apply', body:'EU member states had to apply the NIS2 Directive from 18 October 2024. It covers more sectors, requires stronger security measures and an early warning within 24 hours of a significant incident, followed by a fuller report within 72 hours. UK businesses are affected if they provide in-scope services in the EU.', source:'NIS2 Directive', severity:'medium', category:'Cybersecurity', url:'https://digital-strategy.ec.europa.eu/en/policies/nis2-directive' },
  { id:19, date:'Oct 2023', title:'UK-US data bridge in force', body:'Since 12 October 2023, UK organisations can send personal data to US organisations certified under the UK Extension to the EU-US Data Privacy Framework without other safeguards. Check the US company\'s certification covers UK data before relying on it.', source:'DSIT', severity:'low', category:'International Transfers', url:'https://www.gov.uk/government/publications/uk-us-data-bridge-supporting-documents' },
]

const CATS = ['All', 'UK GDPR', 'EU GDPR', 'EU AI Act', 'ICO Guidance', 'Enforcement', 'PECR / Cookies', 'Cybersecurity', 'International Transfers']
const SEV = {
  critical: { bg:'rgba(220,38,38,0.15)', color:'#EF4444', label:'Critical' },
  high:     { bg:'rgba(245,158,11,0.15)', color:'#F59E0B', label:'High Impact' },
  medium:   { bg:'rgba(99,102,241,0.15)', color:'#818CF8', label:'Medium' },
  low:      { bg:'rgba(139,92,246,0.12)',  color:'#9B7BFA', label:'Low' },
}
const CAT_ICONS = { 'UK GDPR':'🇬🇧','EU GDPR':'🇪🇺','EU AI Act':'🤖','ICO Guidance':'📘','Enforcement':'⚖️','PECR / Cookies':'🍪','Cybersecurity':'🔐','International Transfers':'🌍' }


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(decodeURIComponent(cookie.slice(cookie.indexOf('=')+1).trim())))
  } catch { return null }
}
export default function RegulatoryMonitorPage() {
  const [cat, setCat]       = useState('All')
  const [sev, setSev]       = useState('All')
  const [search, setSearch] = useState('')
  const [open, setOpen]     = useState(null)
  const [email, setEmail]   = useState('')
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
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(139,92,246,.1)', border:'1px solid rgba(139,92,246,.25)', padding:'5px 13px', borderRadius:100, marginBottom:16, fontSize:11, fontWeight:600, color:'#9B7BFA', letterSpacing:'.08em', textTransform:'uppercase' }}>
            📡 Regulatory updates · Checked October 2026
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(26px,3vw,42px)', fontWeight:800, color:'#fff', marginBottom:12 }}>Regulatory Change Monitor</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:600, lineHeight:1.7, marginBottom:28 }}>
            Track the latest GDPR enforcement actions, ICO guidance, EU AI Act updates, and UK data protection law changes — all in one place.
          </p>
          <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
            {[['🔴', stats.critical, 'Critical updates'],['🟡', stats.high, 'High-impact changes'],['📅', stats.recent, 'Updates since 2025'],['📚', UPDATES.length, 'Total entries']].map(([icon, n, label]) => (
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
      <div style={{ background:'rgba(255,255,255,0.04)', borderBottom:'1px solid var(--border)', padding:'14px 0', position:'sticky', top:64, zIndex:10, backdropFilter:'blur(12px)' }}>
        <div className="wrap" style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search updates..."
            style={{ flex:1, minWidth:180, background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 14px', fontSize:13, color:'#fff', outline:'none' }} />
          <select value={cat} onChange={e => setCat(e.target.value)}
            style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#fff', cursor:'pointer' }}>
            {CATS.map(c => <option key={c} value={c} style={{ background:'#0D0D1E' }}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
          <select value={sev} onChange={e => setSev(e.target.value)}
            style={{ background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#fff', cursor:'pointer' }}>
            {['All','Critical','High','Medium','Low'].map(s => <option key={s} value={s} style={{ background:'#0D0D1E' }}>{s === 'All' ? 'All Severities' : s}</option>)}
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
              <div key={u.id} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${isOpen ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius:14, overflow:'hidden', transition:'border-color .2s' }}>
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
                      {u.url && <a href={u.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(139,92,246,.3)', color:'#9B7BFA', textDecoration:'none', fontWeight:600 }}>Read source →</a>}
                      {u.category === 'EU AI Act' && <a href="/ai-governance" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(124,158,255,.25)', color:'#C084FC', textDecoration:'none', fontWeight:600 }}>Check AI Governance →</a>}
                      {(u.category === 'UK GDPR' || u.category === 'EU GDPR') && <a href="/grc" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(124,158,255,.25)', color:'#C084FC', textDecoration:'none', fontWeight:600 }}>Review GRC →</a>}
                      {u.category === 'Enforcement' && <a href="/scan" style={{ fontSize:11, padding:'5px 12px', borderRadius:6, border:'1px solid rgba(124,158,255,.25)', color:'#C084FC', textDecoration:'none', fontWeight:600 }}>Scan Your Site →</a>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* SIDEBAR */}
        <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:120 }}>

          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(139,92,246,.2)', borderRadius:16, padding:'20px' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#9B7BFA', marginBottom:6 }}>📬 Get Regulatory Alerts</div>
            <p style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginBottom:14, lineHeight:1.6 }}>Paying customers and trial users can get a weekly email of new updates. Turn it on or off under Email Notifications in Settings.</p>
            <a href="/settings" style={{ display:'block', textAlign:'center', width:'100%', padding:'10px', borderRadius:8, background:'linear-gradient(135deg,#9B7BFA,#7C3AED)', color:'#fff', fontWeight:700, fontSize:13, textDecoration:'none', boxSizing:'border-box' }}>
              Email settings →
            </a>
          </div>

          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,.06)', borderRadius:16, padding:'18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:12 }}>Quick Actions</div>
            {[['🛡️','Review GRC Controls','/grc'],['🤖','AI Governance','/ai-governance'],['🔍','Scan Your Website','/scan'],['📋','DPIA Wizard','/dpia'],['🏢','Vendor Risk','/vendor-risk']].map(([icon, label, href]) => (
              <a key={href} href={href} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.04)', textDecoration:'none', color:'rgba(255,255,255,.6)', fontSize:13 }}>
                <span>{icon}</span><span>{label}</span><span style={{ marginLeft:'auto', fontSize:11, color:'rgba(255,255,255,.2)' }}>→</span>
              </a>
            ))}
          </div>

          <div style={{ background:'rgba(220,38,38,0.07)', border:'1px solid rgba(220,38,38,.18)', borderRadius:16, padding:'18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#EF4444', marginBottom:12 }}>⏰ Upcoming Deadlines</div>
            {[['Dec 2026','EU AI Act: labelling AI-generated content (existing systems)','high'],['Dec 2027','EU AI Act high-risk (Annex III) obligations','critical'],['TBC','UK Cyber Security and Resilience Bill','high']].map(([date, label, s]) => (
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
