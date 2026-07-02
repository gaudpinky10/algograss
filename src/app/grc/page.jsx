'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ─── DATA ────────────────────────────────────────────────────────────────────

const TABS = [
  { id:'gdpr',       label:'GDPR Controls',        icon:'🛡️' },
  { id:'cyber',      label:'Cyber & Digital',       icon:'🔐' },
  { id:'complaints', label:'UK Gov Complaints',     icon:'📋' },
  { id:'audit',      label:'Audit & Reports',       icon:'📊' },
]

const GDPR_CONTROLS = [
  { id:'dpo',                  cat:'Governance',         name:'Data Protection Officer appointed',     ref:'Art. 37',       desc:'DPO appointed and registered with ICO where required. Mandatory for public authorities and certain high-risk processing.' },
  { id:'ropa',                 cat:'Governance',         name:'Records of Processing Activities',      ref:'Art. 30',       desc:'Maintained and up-to-date ROPA documenting all data processing purposes, categories, recipients, and retention periods.' },
  { id:'privacy-notice',       cat:'Governance',         name:'Privacy Notice published',              ref:'Art. 13-14',    desc:'GDPR-compliant privacy notice accessible from all pages, covering lawful basis, rights, DPO contact, and retention.' },
  { id:'dpia',                 cat:'Governance',         name:'DPIA process in place',                 ref:'Art. 35',       desc:'DPIAs conducted for high-risk processing activities before processing begins. Register of DPIAs maintained.' },
  { id:'lawful-basis',         cat:'Governance',         name:'Lawful basis documented',               ref:'Art. 6',        desc:'Lawful basis identified and recorded for each processing purpose. LIA conducted where legitimate interests relied on.' },
  { id:'dsar-process',         cat:'Data Subject Rights',name:'DSAR handling process',                 ref:'Art. 12-15',    desc:'Documented process to handle Subject Access Requests within 30 days. Log of SARs maintained.' },
  { id:'erasure',              cat:'Data Subject Rights',name:'Right to Erasure procedure',            ref:'Art. 17',       desc:'Process to delete personal data on valid erasure requests, with exceptions documented.' },
  { id:'portability',          cat:'Data Subject Rights',name:'Data Portability capability',           ref:'Art. 20',       desc:'Ability to provide data in machine-readable format (CSV/JSON) where processing is automated and consent/contract-based.' },
  { id:'consent-records',      cat:'Data Subject Rights',name:'Consent records maintained',            ref:'Art. 7',        desc:'Records of when/how consent was obtained with easy withdrawal mechanism. Separate from T&Cs.' },
  { id:'data-breach',          cat:'Security',           name:'Data Breach Response Plan',             ref:'Art. 33-34',    desc:'72-hour ICO notification process and data subject notification procedure documented and tested.' },
  { id:'encryption',           cat:'Security',           name:'Data encryption at rest & transit',     ref:'Art. 32',       desc:'Personal data encrypted in storage and in transit (TLS 1.2+ minimum). Encryption keys managed securely.' },
  { id:'access-control',       cat:'Security',           name:'Access controls & least privilege',     ref:'Art. 32',       desc:'Role-based access, MFA for admin accounts, access logs maintained, quarterly access reviews.' },
  { id:'retention',            cat:'Security',           name:'Data retention & deletion policy',      ref:'Art. 5(1)(e)',  desc:'Documented retention periods with automated or scheduled deletion. Retention schedule reviewed annually.' },
  { id:'dpa-contracts',        cat:'Vendor Management',  name:'Data Processing Agreements (DPAs)',     ref:'Art. 28',       desc:'DPAs in place with all data processors before processing begins. Covers security, sub-processors, return/deletion.' },
  { id:'vendor-audit',         cat:'Vendor Management',  name:'Vendor due diligence conducted',        ref:'Art. 28',       desc:'Annual reviews of all processors for security and compliance. Questionnaires or certifications reviewed.' },
  { id:'international',        cat:'Vendor Management',  name:'International transfer safeguards',     ref:'Art. 44-49',    desc:'SCCs, adequacy decisions, or BCRs in place for non-UK/EEA transfers. Transfer impact assessments completed.' },
  { id:'staff-training',       cat:'Training',           name:'Staff GDPR training completed',         ref:'Art. 39',       desc:'All staff completed data protection training in last 12 months. Records of completion maintained.' },
  { id:'incident-response',    cat:'Training',           name:'Incident response training',            ref:'Art. 32',       desc:'Staff know how to identify and report data breaches immediately. Tabletop exercise completed annually.' },
  { id:'ico-registration',     cat:'Training',           name:'ICO registration current',              ref:'DPA 2018',      desc:'Organisation registered with ICO and fee paid (renews annually). Check: ico.org.uk/about-the-ico/what-we-do/register-with-the-ico/' },
  { id:'cookie-compliance',    cat:'Training',           name:'Cookie consent compliance',             ref:'PECR',          desc:'Cookie banner with Reject All as prominent as Accept All. Consent records kept. Non-essential cookies blocked until consent.' },
]

const CYBER_CONTROLS = [
  { id:'ce-firewall', cat:'Cyber Essentials', name:'Boundary firewalls & internet gateways', ref:'CE v3.1',      desc:'Firewalls configured to block unauthorised inbound connections. Default-deny rules applied. Reviewed quarterly.' },
  { id:'ce-patch',    cat:'Cyber Essentials', name:'Security update management (patching)',  ref:'CE v3.1',      desc:'OS and software patched within 14 days of critical updates. End-of-life software removed. Auto-updates enabled where possible.' },
  { id:'ce-malware',  cat:'Cyber Essentials', name:'Malware protection',                    ref:'CE v3.1',      desc:'Antivirus/EDR deployed and updated on all devices. Signatures updated automatically. Scans run at least weekly.' },
  { id:'ce-access',   cat:'Cyber Essentials', name:'Access control & admin privileges',     ref:'CE v3.1',      desc:'Admin accounts separate from standard use. MFA enforced on all admin and cloud accounts. Inactive accounts removed within 14 days.' },
  { id:'ce-config',   cat:'Cyber Essentials', name:'Secure configuration',                  ref:'CE v3.1',      desc:'Default passwords changed on all devices and services. Unnecessary services and ports disabled. Guest Wi-Fi isolated.' },
  { id:'ncsc-monitor',cat:'NCSC 10 Steps',    name:'Network security monitoring',           ref:'NCSC 10 Steps',desc:'Network traffic monitored, anomalies logged and alerted. SIEM or log aggregation in place. Alerts reviewed daily.' },
  { id:'ncsc-backup', cat:'NCSC 10 Steps',    name:'Backup & recovery tested',              ref:'NCSC 10 Steps',desc:'Backups taken daily, restoration tested quarterly, stored offsite/immutable. RTO and RPO defined and documented.' },
  { id:'ncsc-vuln',   cat:'NCSC 10 Steps',    name:'Vulnerability management programme',   ref:'NCSC 10 Steps',desc:'Regular scanning, pen testing annually by CREST/CHECK provider, CVE tracking in place. Risk register updated.' },
  { id:'dspt-ig',     cat:'NHS DSPT',         name:'Data Security & Protection Toolkit',   ref:'DSPT 2024/25', desc:'DSPT completed and submitted before 30 June deadline. Evidence uploaded. Senior management signed off submission.' },
  { id:'dspt-train',  cat:'NHS DSPT',         name:'Mandatory IG training completed',      ref:'DSPT 2024/25', desc:'All staff completed NHS IG training via ESR or equivalent. 95%+ completion required for Standards Met.' },
  { id:'gov-cloud',   cat:'Digital Operations',name:'Cloud services assessed (G-Cloud)',    ref:'GDS/CDDO',     desc:'Cloud services procured via G-Cloud or assessed against NCSC cloud security principles (14 principles).' },
  { id:'pen-test',    cat:'Digital Operations',name:'Annual penetration test',              ref:'NCSC',         desc:'CHECK/CREST-certified pen test on all public-facing systems. Findings remediated and tracked to closure.' },
  { id:'iso27001',    cat:'Digital Operations',name:'ISO 27001 / Cyber Essentials Plus',   ref:'ISO / NCSC',   desc:'Certification held or formal gap assessment in progress. Provides customer assurance for enterprise contracts.' },
  { id:'dsp-gov',     cat:'Digital Operations',name:'GovAssure / NCSC CAF assessment',     ref:'CDDO',         desc:'Government security assurance completed where applicable (departments, ALBs, OES). CAF profile defined.' },
]

const UK_GOV_COMPLAINTS = [
  {
    id:'ico', body:"Information Commissioner's Office (ICO)", icon:'🏛️', scope:'Data protection, GDPR, PECR, Freedom of Information', color:'#3B82F6',
    complaintTypes:[
      { type:'Data Protection Complaint', url:'https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/', desc:'Organisation mishandled personal data or denied a Subject Access Request', timeLimit:'3 months from last contact with the organisation', form:'Online form at ico.org.uk' },
      { type:'PECR / Marketing Complaint', url:'https://ico.org.uk/make-a-complaint/nuisance-calls-and-messages/report-a-nuisance-call-or-message/', desc:'Unwanted marketing emails, texts, or calls; cookie law breaches; no reject-all button', timeLimit:'No strict limit', form:'ICO Report a nuisance call/message' },
      { type:'Freedom of Information', url:'https://ico.org.uk/make-a-complaint/foi-and-eir-complaints/', desc:'Public authority failed to respond to FOI request within 20 working days', timeLimit:'3 months from public authority response (or non-response)', form:'ICO FOI complaint form' },
      { type:'DSAR Not Fulfilled', url:'https://ico.org.uk/make-a-complaint/', desc:'Organisation failed to respond to Subject Access Request within 30 days', timeLimit:'3 months from the 30-day deadline expiry', form:'ICO online complaint' },
    ],
    audits:[
      { name:'ICO Accountability Framework Self-Assessment', url:'https://ico.org.uk/for-organisations/accountability-framework/', desc:'Free tool to assess GDPR accountability across 10 themes' },
      { name:'ICO Data Protection Self-Assessment (SMEs)', url:'https://ico.org.uk/for-organisations/advice-for-small-organisations/data-protection-self-assessment/', desc:'Quick self-assessment toolkit for small organisations' },
    ],
    applications:[
      { name:'ICO Registration (Data Controller)', url:'https://ico.org.uk/about-the-ico/what-we-do/register-with-the-ico/', desc:'Annual registration required for most data controllers — £40 (Tier 1) or £60 (Tier 2)', deadline:'Annually on registration anniversary — failure is a criminal offence' },
    ],
  },
  {
    id:'cma', body:'Competition & Markets Authority (CMA)', icon:'⚖️', scope:'Consumer rights, unfair contract terms, digital markets, competition', color:'#8B5CF6',
    complaintTypes:[
      { type:'Consumer Rights Complaint', url:'https://www.gov.uk/report-problem-business', desc:'Business using unfair contract terms, misleading practices, or subscription traps', timeLimit:'6 years for contract claims; report ASAP', form:'Report via gov.uk consumer rights portal' },
      { type:'Digital Markets Competition Complaint', url:'https://www.gov.uk/guidance/report-suspected-breaches-of-digital-markets-competition-and-consumers-act', desc:'Breach of Digital Markets, Competition and Consumers Act 2024 by a strategic market status firm', timeLimit:'As soon as possible', form:'CMA digital complaints portal' },
    ],
    audits:[
      { name:'CMA Consumer Law Compliance Checklist', url:'https://www.gov.uk/guidance/consumer-law-compliance-review', desc:'Assess compliance with Consumer Rights Act 2015 and Consumer Protection Regulations' },
    ],
    applications:[],
  },
  {
    id:'ofcom', body:'Ofcom', icon:'📡', scope:'Online Safety Act, broadcasting, telecoms, postal services', color:'#10B981',
    complaintTypes:[
      { type:'Online Safety Act Complaint', url:'https://www.ofcom.org.uk/online-safety/information-for-industry/complaints-about-regulated-services', desc:'Regulated service failed duties under Online Safety Act 2023 (illegal content, child safety, transparency)', timeLimit:'Report as soon as possible', form:'Ofcom complaints portal' },
      { type:'Telecoms Complaint (post-deadlock)', url:'https://www.ofcom.org.uk/phones-and-broadband/making-a-complaint', desc:'Broadband or phone provider dispute unresolved after 8 weeks', timeLimit:'8 weeks after raising with provider', form:'Ombudsman Services or CISAS (depending on provider)' },
    ],
    audits:[
      { name:'Online Safety Act Readiness Guidance', url:'https://www.ofcom.org.uk/online-safety', desc:'Guidance for services in scope — risk assessments, illegal content duties, children\'s safety' },
    ],
    applications:[
      { name:'Register as In-Scope Service (OSA 2023)', url:'https://www.ofcom.org.uk/online-safety/information-for-industry', desc:'User-to-user and search services must register and submit annual transparency reports', deadline:'Phased — Category 1 services 2024; others from 2025' },
    ],
  },
  {
    id:'fca', body:'Financial Conduct Authority (FCA)', icon:'🏦', scope:'Financial services, Consumer Duty, data in finance, AI in finance', color:'#F59E0B',
    complaintTypes:[
      { type:'Consumer Duty / Mis-Selling Complaint', url:'https://www.fca.org.uk/consumers/how-complain', desc:'Financial firm failed Consumer Duty, mis-sold a product, or provided poor service', timeLimit:'8 weeks after raising with firm, then Financial Ombudsman', form:'Financial Ombudsman Service (FOS) — free, binding up to £415,000' },
      { type:'Regulatory Breach Report', url:'https://www.fca.org.uk/firms/report-misconduct', desc:'Report suspected breach of FCA rules by an authorised firm', timeLimit:'As soon as possible', form:'FCA reporting portal (confidential)' },
    ],
    audits:[
      { name:'Consumer Duty Board Report Template', url:'https://www.fca.org.uk/firms/consumer-duty/consumer-duty-assessment-tool', desc:'FCA tool and guidance to produce annual Consumer Duty board reports (due 31 July each year)' },
    ],
    applications:[
      { name:'FCA Authorisation', url:'https://www.fca.org.uk/firms/authorisation', desc:'Apply to be an FCA-authorised firm before conducting regulated financial activities', deadline:'Before conducting any regulated activity — processing takes 6-12 months' },
    ],
  },
  {
    id:'ncsc', body:'National Cyber Security Centre (NCSC)', icon:'🔐', scope:'Cyber incidents, Cyber Essentials, CNI, government cyber assurance', color:'#EF4444',
    complaintTypes:[
      { type:'Report Significant Cyber Incident', url:'https://report.ncsc.gov.uk/', desc:'Report a cyber attack, ransomware, data exfiltration, or significant security breach affecting UK systems', timeLimit:'As soon as possible — early reporting enables NCSC support', form:'NCSC Incident Reporting portal (report.ncsc.gov.uk)' },
      { type:'Report Phishing Email', url:'https://www.ncsc.gov.uk/section/about-this-website/report-phishing', desc:'Forward phishing or suspicious emails to NCSC', timeLimit:'Immediately', form:'Email: report@phishing.gov.uk' },
    ],
    audits:[
      { name:'Cyber Assessment Framework (CAF)', url:'https://www.ncsc.gov.uk/collection/caf', desc:'For Operators of Essential Services (OES) and CNI — 4 objectives, 14 principles' },
      { name:'Cyber Essentials Self-Assessment Tool', url:'https://www.ncsc.gov.uk/cyberessentials/overview', desc:'Free online tool — Verimass/IASME portal; required for some government contracts' },
    ],
    applications:[
      { name:'Cyber Essentials Certification', url:'https://www.ncsc.gov.uk/cyberessentials/overview', desc:'Verified self-assessment — from £300+VAT; mandatory for MoD and some NHS/central gov contracts', deadline:'Annual renewal' },
      { name:'Cyber Essentials Plus', url:'https://www.ncsc.gov.uk/cyberessentials/overview', desc:'Independently tested by IASME-accredited body — higher assurance for enterprise clients', deadline:'Annual renewal' },
    ],
  },
  {
    id:'dspt', body:'NHS Data Security & Protection Toolkit (DSPT)', icon:'🏥', scope:'NHS orgs, GP practices, health data processors, care providers', color:'#06B6D4',
    complaintTypes:[
      { type:'DSPT Non-Compliance Report', url:'https://www.dsptoolkit.nhs.uk/', desc:'Report an NHS-connected organisation not meeting data security standards or overdue on submission', timeLimit:'Submissions due 30 June annually; report non-compliance any time', form:'NHS DSPT portal or via NHS England regional team' },
    ],
    audits:[
      { name:'DSPT Self-Assessment 2024/25', url:'https://www.dsptoolkit.nhs.uk/', desc:'Annual mandatory submission — "Standards Met" (100% mandatory evidence) or "Standards Exceeded"' },
      { name:'NHS IG Training (ESR)', url:'https://www.e-lfh.org.uk/programmes/data-security-awareness/', desc:'Free online training for all staff with access to NHS patient data — Level 1 & Level 2' },
    ],
    applications:[
      { name:'DSPT Organisation Registration', url:'https://www.dsptoolkit.nhs.uk/Account/Register', desc:'Register your organisation before accessing NHS patient data or systems', deadline:'Before data access; annual resubmission by 30 June' },
      { name:'NHS Data Access Request (DARS)', url:'https://digital.nhs.uk/services/data-access-request-service-dars', desc:'Apply for access to NHS data for research or operational purposes via NHS England DARS', deadline:'Ongoing — processing takes 3-6 months for new applications' },
    ],
  },
]

const AUDIT_TEMPLATES = [
  { id:'gdpr-audit', name:'Annual GDPR Audit Checklist', icon:'📋', desc:'20-point annual review covering all UK GDPR obligations', items:['Review and update Records of Processing Activities (ROPA)','Confirm ICO registration is current and fee paid','Test DSAR process end-to-end — time a test request','Review all vendor DPAs for completeness','Check retention schedules have been actioned (deletions run)','Test data breach response plan with a tabletop exercise','Verify cookie consent is compliant — Reject All as prominent as Accept','Review privacy notice for accuracy — check new products/services','Check staff GDPR training completion rates (target 100%)','Assess cross-border transfer safeguards — SCCs still valid?','Review DPIA register — new high-risk activities identified?','Test data deletion/erasure on a live request','Confirm DPO details registered with ICO and on privacy notice','Review security measures — encryption, MFA, patching','Audit access control list — remove leavers and excess privileges','Review complaint and DSAR log outcomes — any trends?','Review Legitimate Interests Assessments for continued validity','Test Right to Portability — can you produce CSV/JSON export?','Confirm lawful basis for all marketing is documented','Prepare board/management GDPR report — include KPIs and incidents'] },
  { id:'cyber-audit', name:'Cyber Essentials Pre-Assessment', icon:'🔐', desc:'Checklist to prepare for Cyber Essentials certification', items:['Document all boundary firewalls and confirm default-deny rules','List all internet-connected services and remove unused ones','Check patch levels on all devices — critical patches within 14 days','Remove or replace end-of-life operating systems and software','Change all default passwords on devices, routers, and cloud services','Enable MFA on all admin and cloud service accounts','Document all user accounts and remove inactive accounts within 14 days','Separate admin accounts from standard user accounts','Enable and update antivirus/EDR on all devices','Identify all cloud services in scope — including shadow IT','Document mobile device management (MDM) policy','Verify network segregation — guest Wi-Fi isolated from internal','Enable DNS filtering to block malicious domains','Check email filtering (anti-phishing, DMARC, SPF, DKIM)','Prepare complete asset inventory (hardware and software)'] },
  { id:'dpia-report', name:'DPIA Report Template', icon:'📊', desc:'ICO-compliant Data Protection Impact Assessment structure', items:['Describe the processing in detail — what data, why, how, who','Assess necessity — is processing limited to what is needed?','Assess proportionality — is there a less intrusive alternative?','Identify risks to data subjects (unauthorised access, inaccuracy, loss)','Assess likelihood and severity of each risk (High/Med/Low)','Identify risk mitigation measures for each risk','Re-assess residual risk after mitigations','Consult DPO — record their recommendations and your response','Consult data subjects or their representatives where appropriate','Sign off by senior management / data controller','Determine: is residual risk still High? If yes, consult ICO before proceeding','Schedule review date — at least every 3 years or on significant change'] },
  { id:'breach-report', name:'Data Breach Response Report', icon:'🚨', desc:'ICO 72-hour breach notification procedure', items:['Record exact time breach was discovered','Contain the breach — isolate affected systems if necessary','Identify nature of breach (confidentiality / integrity / availability)','Identify personal data affected and categories of individuals','Estimate approximate number of individuals affected','Identify likely cause — human error, cyber attack, lost device, etc.','Assess risk of harm to individuals — likelihood and severity','Decision: is the breach notifiable to ICO? (risk to rights and freedoms)','If notifiable: submit ICO report within 72 hours at ico.org.uk/report-a-breach','Decision: must affected individuals be notified? (high risk of harm)','Draft and send communication to affected individuals if required','Implement containment and remediation measures','Document lessons learned and update policies','Update internal data breach register','Board/management notification completed'] },
]

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page:      { minHeight:'100vh', background:'var(--bg)', color:'var(--ink)', fontFamily:'Inter,sans-serif', paddingBottom:60 },
  hero:      { background:'linear-gradient(135deg,#0D1525 0%,#111827 100%)', padding:'40px 24px 32px', borderBottom:'1px solid rgba(255,255,255,0.06)' },
  heroInner: { maxWidth:1100, margin:'0 auto' },
  heroTitle: { fontSize:28, fontWeight:700, margin:'0 0 6px', color:'var(--ink)' },
  heroSub:   { fontSize:14, color:'#94A3B8', margin:'0 0 24px' },
  tabBar:    { display:'flex', gap:8, flexWrap:'wrap' },
  tab: a => ({ padding:'8px 18px', borderRadius:8, border:`1px solid ${a?'var(--accent)':'rgba(255,255,255,0.12)'}`, background:a?'rgba(0,212,170,0.12)':'transparent', color:a?'var(--accent)':'#94A3B8', cursor:'pointer', fontSize:14, fontWeight:500, transition:'all .15s' }),
  body:      { maxWidth:1100, margin:'0 auto', padding:'28px 24px 0' },
  card:      { background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:20, marginBottom:16 },
  label:     { fontSize:11, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color:'#64748B', marginBottom:12 },
  badge: s => { const c={Compliant:'#22C55E','In Progress':'#F59E0B','Not Started':'#EF4444','N/A':'#64748B'}[s]||'#64748B'; return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:`${c}22`, color:c, border:`1px solid ${c}44` } },
  btn:       { padding:'6px 14px', borderRadius:6, border:'1px solid rgba(0,212,170,0.4)', background:'rgba(0,212,170,0.08)', color:'var(--accent)', fontSize:12, cursor:'pointer', fontWeight:500 },
  btnSm:     { padding:'4px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.15)', background:'transparent', color:'#94A3B8', fontSize:11, cursor:'pointer' },
  aiBox:     { background:'rgba(0,212,170,0.06)', border:'1px solid rgba(0,212,170,0.2)', borderRadius:8, padding:14, marginTop:12, fontSize:13, lineHeight:1.8, color:'#CBD5E1', whiteSpace:'pre-wrap' },
  tag:   c => ({ display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, background:`${c}22`, color:c, border:`1px solid ${c}44`, marginRight:4 }),
  link:      { color:'var(--accent)', textDecoration:'none', fontSize:13, fontWeight:500 },
  grid2:     { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:14 },
  progWrap:  { height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginTop:8, position:'relative' },
  progBar: (p,c='#00D4AA') => ({ position:'absolute', left:0, top:0, height:'100%', width:`${p}%`, background:c, borderRadius:3, transition:'width .4s' }),
}

const STATUS_OPTIONS = ['Not Started','In Progress','Compliant','N/A']


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(cookie.split('=')[1]))
  } catch { return null }
}
export default function GRCPage() {
  const [activeTab,    setActiveTab]    = useState('gdpr')
  const [gdprStatus,   setGdprStatus]   = useState({})
  const [cyberStatus,  setCyberStatus]  = useState({})
  const [suggestions,  setSuggestions]  = useState({})
  const [loadingAI,    setLoadingAI]    = useState({})
  const [openCard,     setOpenCard]     = useState(null)
  const [openBody,     setOpenBody]     = useState(null)
  const [openAudit,    setOpenAudit]    = useState(null)
  const [auditChecked, setAuditChecked] = useState({})
  const [exportMsg,    setExportMsg]    = useState('')
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getStatus  = (id, g=true) => g ? (gdprStatus[id]||'Not Started')  : (cyberStatus[id]||'Not Started')
  const setStatus  = (id, v, g=true) => g ? setGdprStatus(p=>({...p,[id]:v})) : setCyberStatus(p=>({...p,[id]:v}))
  const scoreOf    = (controls, map) => { const na=controls.filter(c=>(map[c.id]||'Not Started')==='N/A').length; const t=controls.length-na; return t>0?Math.round(controls.filter(c=>(map[c.id]||'Not Started')==='Compliant').length/t*100):0 }
  const scoreColor = s => s>=80?'#22C55E':s>=50?'#F59E0B':'#EF4444'

  async function getSuggestion(ctrl, isGdpr) {
    const k = ctrl.id
    if (suggestions[k]) { setSuggestions(p=>({...p,[k]:null})); return }
    setLoadingAI(p=>({...p,[k]:true}))
    try {
      const r = await fetch('/api/grc/suggest', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ controlId:ctrl.id, controlName:ctrl.name, status:getStatus(ctrl.id,isGdpr), category:ctrl.cat }) })
      const d = await r.json()
      setSuggestions(p=>({...p,[k]:d.suggestion}))
    } catch { setSuggestions(p=>({...p,[k]:'Could not load suggestion. Please try again.'})) }
    finally { setLoadingAI(p=>({...p,[k]:false})) }
  }

  function exportCSV(controls, map, filename) {
    const csv = [['Control','Category','Reference','Status'],...controls.map(c=>[c.name,c.cat,c.ref,map[c.id]||'Not Started'])].map(r=>r.map(x=>`"${x}"`).join(',')).join('\n')
    const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=filename; a.click()
    setExportMsg('✓ Exported'); setTimeout(()=>setExportMsg(''),2000)
  }

  function ControlList({ controls, isGdpr }) {
    const map = isGdpr ? gdprStatus : cyberStatus
    const score = scoreOf(controls, map)
    const color = scoreColor(score)
    const cats  = [...new Set(controls.map(c=>c.cat))]
    return (
      <>
        <div style={{...S.card, display:'flex', alignItems:'center', gap:32, marginBottom:24, flexWrap:'wrap'}}>
          <div style={{flex:1, minWidth:180}}>
            <div style={{fontSize:13, color:'#94A3B8', marginBottom:4}}>Compliance Score</div>
            <div style={{fontSize:48, fontWeight:700, color, lineHeight:1}}>{score}<span style={{fontSize:20, color:'#64748B'}}>%</span></div>
            <div style={S.progWrap}><div style={S.progBar(score, color)}/></div>
          </div>
          <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
            {['Compliant','In Progress','Not Started','N/A'].map(s=>{
              const n=controls.filter(c=>(map[c.id]||'Not Started')===s).length
              const c={Compliant:'#22C55E','In Progress':'#F59E0B','Not Started':'#EF4444','N/A':'#64748B'}[s]
              return <div key={s} style={{textAlign:'center'}}><div style={{fontSize:22,fontWeight:700,color:c}}>{n}</div><div style={{fontSize:11,color:'#64748B'}}>{s}</div></div>
            })}
          </div>
          <div>
            <button style={S.btn} onClick={()=>exportCSV(controls, map, isGdpr?'gdpr-controls.csv':'cyber-controls.csv')}>⬇ Export CSV</button>
            {exportMsg && <div style={{color:'#22C55E',fontSize:12,marginTop:4}}>{exportMsg}</div>}
          </div>
        </div>
        {cats.map(cat=>(
          <div key={cat} style={{marginBottom:24}}>
            <div style={S.label}>{cat}</div>
            {controls.filter(c=>c.cat===cat).map(ctrl=>{
              const status=getStatus(ctrl.id,isGdpr), isOpen=openCard===ctrl.id
              return (
                <div key={ctrl.id} style={{...S.card, padding:0, overflow:'hidden', marginBottom:10}}>
                  <div style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={()=>setOpenCard(isOpen?null:ctrl.id)}>
                    <span style={{flex:1, fontSize:14, fontWeight:500}}>{ctrl.name}</span>
                    <span style={S.tag('#64748B')}>{ctrl.ref}</span>
                    <span style={S.badge(status)}>{status}</span>
                    <span style={{color:'#64748B',fontSize:12}}>{isOpen?'▲':'▼'}</span>
                  </div>
                  {isOpen&&(
                    <div style={{padding:'0 18px 16px', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                      <p style={{fontSize:13,color:'#94A3B8',margin:'12px 0'}}>{ctrl.desc}</p>
                      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                        {STATUS_OPTIONS.map(s=><button key={s} style={{...S.btnSm,...(status===s?{background:'rgba(0,212,170,0.12)',color:'var(--accent)',borderColor:'var(--accent)'}:{})}} onClick={()=>setStatus(ctrl.id,s,isGdpr)}>{s}</button>)}
                      </div>
                      <button style={S.btn} onClick={()=>getSuggestion(ctrl,isGdpr)}>
                        {loadingAI[ctrl.id]?'⏳ Loading…':suggestions[ctrl.id]?'✕ Hide AI Advice':'🤖 Get AI Advice'}
                      </button>
                      {suggestions[ctrl.id]&&<div style={S.aiBox}>{suggestions[ctrl.id]}</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </>
    )
  }

  function renderComplaints() {
    return (
      <>
        <div style={{...S.card, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', marginBottom:24}}>
          <div style={{fontSize:14, fontWeight:600, marginBottom:6}}>🏛️ UK Government Regulatory Complaints Library</div>
          <p style={{fontSize:13, color:'#94A3B8', margin:0}}>Click any regulator to view complaint types, time limits, audit tools, and registration requirements. Before complaining to a regulator you must first raise the issue with the organisation and give them time to respond (usually 8 weeks).</p>
        </div>
        <div style={S.grid2}>
          {UK_GOV_COMPLAINTS.map(body=>{
            const isOpen = openBody===body.id
            return (
              <div key={body.id} style={{...S.card, cursor:'pointer', borderColor:isOpen?body.color+'66':'rgba(255,255,255,0.06)'}}>
                <div onClick={()=>setOpenBody(isOpen?null:body.id)}>
                  <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
                    <span style={{fontSize:24}}>{body.icon}</span>
                    <div>
                      <div style={{fontSize:14, fontWeight:600}}>{body.body}</div>
                      <div style={{fontSize:11, color:'#64748B'}}>{body.scope}</div>
                    </div>
                  </div>
                  <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom: isOpen?0:0}}>
                    <span style={S.tag(body.color)}>{body.complaintTypes.length} complaint types</span>
                    {body.applications.length>0&&<span style={S.tag('#F59E0B')}>{body.applications.length} registration{body.applications.length>1?'s':''}</span>}
                    {body.audits.length>0&&<span style={S.tag('#8B5CF6')}>{body.audits.length} audit tool{body.audits.length>1?'s':''}</span>}
                  </div>
                </div>
                {isOpen&&(
                  <div style={{marginTop:16, borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:14}}>
                    {body.complaintTypes.length>0&&<>
                      <div style={S.label}>Complaint Types</div>
                      {body.complaintTypes.map((ct,i)=>(
                        <div key={i} style={{marginBottom:12, background:'rgba(255,255,255,0.03)', borderRadius:8, padding:12}}>
                          <div style={{fontSize:13, fontWeight:600, marginBottom:4}}>{ct.type}</div>
                          <div style={{fontSize:12, color:'#94A3B8', marginBottom:6}}>{ct.desc}</div>
                          <div style={{fontSize:11, color:'#64748B', marginBottom:6}}>⏱ Time limit: {ct.timeLimit}</div>
                          <div style={{fontSize:11, color:'#64748B', marginBottom:8}}>📝 {ct.form}</div>
                          <a href={ct.url} target="_blank" rel="noopener" style={S.link}>Make complaint →</a>
                        </div>
                      ))}
                    </>}
                    {body.audits.length>0&&<>
                      <div style={{...S.label, marginTop:14}}>Audit & Assessment Tools</div>
                      {body.audits.map((a,i)=>(
                        <div key={i} style={{marginBottom:10, display:'flex', alignItems:'flex-start', gap:8}}>
                          <span style={{color:'#8B5CF6', marginTop:1}}>📊</span>
                          <div><a href={a.url} target="_blank" rel="noopener" style={S.link}>{a.name}</a><div style={{fontSize:12, color:'#64748B', marginTop:2}}>{a.desc}</div></div>
                        </div>
                      ))}
                    </>}
                    {body.applications.length>0&&<>
                      <div style={{...S.label, marginTop:14}}>Registration & Applications</div>
                      {body.applications.map((a,i)=>(
                        <div key={i} style={{marginBottom:10, background:'rgba(245,158,11,0.06)', borderRadius:8, padding:10}}>
                          <div style={{fontSize:13, fontWeight:600, marginBottom:2}}>{a.name}</div>
                          <div style={{fontSize:12, color:'#94A3B8', marginBottom:4}}>{a.desc}</div>
                          {a.deadline&&<div style={{fontSize:11, color:'#F59E0B', marginBottom:6}}>📅 {a.deadline}</div>}
                          <a href={a.url} target="_blank" rel="noopener" style={S.link}>Apply / Register →</a>
                        </div>
                      ))}
                    </>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </>
    )
  }

  function renderAudit() {
    return (
      <>
        <div style={{...S.card, background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', marginBottom:24}}>
          <div style={{fontSize:14, fontWeight:600, marginBottom:4}}>📊 Interactive Audit & Report Templates</div>
          <p style={{fontSize:13, color:'#94A3B8', margin:0}}>Tick off items as you complete them. Use these during annual reviews, certification prep, or board reporting.</p>
        </div>
        {AUDIT_TEMPLATES.map(tmpl=>{
          const checked = auditChecked[tmpl.id]||{}
          const done = tmpl.items.filter((_,i)=>checked[i]).length
          const pct  = Math.round(done/tmpl.items.length*100)
          const isOpen = openAudit===tmpl.id
          return (
            <div key={tmpl.id} style={S.card}>
              <div style={{display:'flex', alignItems:'center', gap:12, cursor:'pointer', marginBottom:isOpen?12:0}} onClick={()=>setOpenAudit(isOpen?null:tmpl.id)}>
                <span style={{fontSize:24}}>{tmpl.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:15, fontWeight:600}}>{tmpl.name}</div>
                  <div style={{fontSize:12, color:'#94A3B8'}}>{tmpl.desc}</div>
                  <div style={S.progWrap}><div style={S.progBar(pct)}/></div>
                </div>
                <div style={{textAlign:'center', minWidth:60}}>
                  <div style={{fontSize:20, fontWeight:700, color:pct===100?'#22C55E':'var(--accent)'}}>{done}/{tmpl.items.length}</div>
                  <div style={{fontSize:11, color:'#64748B'}}>done</div>
                </div>
                <span style={{color:'#64748B'}}>{isOpen?'▲':'▼'}</span>
              </div>
              {isOpen&&(
                <div style={{borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14}}>
                  {tmpl.items.map((item,i)=>(
                    <div key={i} style={{display:'flex', alignItems:'flex-start', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer'}}
                      onClick={()=>setAuditChecked(p=>({...p,[tmpl.id]:{...(p[tmpl.id]||{}),[i]:!(p[tmpl.id]||{})[i]}}))}>
                      <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${checked[i]?'var(--accent)':'rgba(255,255,255,0.2)'}`,background:checked[i]?'var(--accent)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                        {checked[i]&&<span style={{color:'#000',fontSize:11,fontWeight:700}}>✓</span>}
                      </div>
                      <span style={{fontSize:13, color:checked[i]?'#64748B':'var(--ink)', textDecoration:checked[i]?'line-through':'none'}}>{item}</span>
                    </div>
                  ))}
                  {pct===100&&<div style={{marginTop:12, padding:12, borderRadius:8, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'#22C55E', fontSize:13, fontWeight:600}}>✅ All items complete! This audit is ready for sign-off.</div>}
                </div>
              )}
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.heroInner}>
          <h1 style={S.heroTitle}>🏛️ GRC Platform</h1>
          <p style={S.heroSub}>UK GDPR · Cyber Essentials · NCSC · ICO · NHS DSPT · UK Government Compliance Library</p>
          <div style={S.tabBar}>
            {TABS.map(t=><button key={t.id} style={S.tab(activeTab===t.id)} onClick={()=>setActiveTab(t.id)}>{t.icon} {t.label}</button>)}
          </div>
        </div>
      </div>
      <div style={S.body}>
        {activeTab==='gdpr'       && <ControlList controls={GDPR_CONTROLS}  isGdpr={true}  />}
        {activeTab==='cyber'      && <ControlList controls={CYBER_CONTROLS}  isGdpr={false} />}
        {activeTab==='complaints' && renderComplaints()}
        {activeTab==='audit'      && renderAudit()}
      </div>
    </div>
  )
}
