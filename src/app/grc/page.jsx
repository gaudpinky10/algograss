'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// ─── DATA ────────────────────────────────────────────────────────────────────

const TABS = [
  { id:'gdpr',       label:'GDPR Controls',        icon:'🛡️' },
  { id:'cyber',      label:'Cyber & Digital',       icon:'🔐' },
  { id:'iso27001',   label:'ISO 27001',             icon:'📜' },
  { id:'risk',       label:'Risk Register',         icon:'⚠️' },
  { id:'complaints', label:'UK Gov Complaints',     icon:'📋' },
  { id:'audit',      label:'Audit & Reports',       icon:'📊' },
]

const GDPR_CONTROLS = [
  { id:'dpo',             cat:'Governance',          name:'Data Protection Officer appointed',     ref:'Art. 37',      desc:'DPO appointed and registered with ICO where required. Mandatory for public authorities and certain high-risk processing.' },
  { id:'ropa',            cat:'Governance',          name:'Records of Processing Activities',      ref:'Art. 30',      desc:'Maintained and up-to-date ROPA documenting all data processing purposes, categories, recipients, and retention periods.' },
  { id:'privacy-notice',  cat:'Governance',          name:'Privacy Notice published',              ref:'Art. 13-14',   desc:'GDPR-compliant privacy notice accessible from all pages, covering lawful basis, rights, DPO contact, and retention.' },
  { id:'dpia',            cat:'Governance',          name:'DPIA process in place',                 ref:'Art. 35',      desc:'DPIAs conducted for high-risk processing activities before processing begins. Register of DPIAs maintained.' },
  { id:'lawful-basis',    cat:'Governance',          name:'Lawful basis documented',               ref:'Art. 6',       desc:'Lawful basis identified and recorded for each processing purpose. LIA conducted where legitimate interests relied on.' },
  { id:'dsar-process',    cat:'Data Subject Rights', name:'DSAR handling process',                 ref:'Art. 12-15',   desc:'Documented process to handle Subject Access Requests within 30 days. Log of SARs maintained.' },
  { id:'erasure',         cat:'Data Subject Rights', name:'Right to Erasure procedure',            ref:'Art. 17',      desc:'Process to delete personal data on valid erasure requests, with exceptions documented.' },
  { id:'portability',     cat:'Data Subject Rights', name:'Data Portability capability',           ref:'Art. 20',      desc:'Ability to provide data in machine-readable format (CSV/JSON) where processing is automated and consent/contract-based.' },
  { id:'consent-records', cat:'Data Subject Rights', name:'Consent records maintained',            ref:'Art. 7',       desc:'Records of when/how consent was obtained with easy withdrawal mechanism. Separate from T&Cs.' },
  { id:'data-breach',     cat:'Security',            name:'Data Breach Response Plan',             ref:'Art. 33-34',   desc:'72-hour ICO notification process and data subject notification procedure documented and tested.' },
  { id:'encryption',      cat:'Security',            name:'Data encryption at rest & transit',     ref:'Art. 32',      desc:'Personal data encrypted in storage and in transit (TLS 1.2+ minimum). Encryption keys managed securely.' },
  { id:'access-control',  cat:'Security',            name:'Access controls & least privilege',     ref:'Art. 32',      desc:'Role-based access, MFA for admin accounts, access logs maintained, quarterly access reviews.' },
  { id:'retention',       cat:'Security',            name:'Data retention & deletion policy',      ref:'Art. 5(1)(e)', desc:'Documented retention periods with automated or scheduled deletion. Retention schedule reviewed annually.' },
  { id:'dpa-contracts',   cat:'Vendor Management',   name:'Data Processing Agreements (DPAs)',     ref:'Art. 28',      desc:'DPAs in place with all data processors before processing begins. Covers security, sub-processors, return/deletion.' },
  { id:'vendor-audit',    cat:'Vendor Management',   name:'Vendor due diligence conducted',        ref:'Art. 28',      desc:'Annual reviews of all processors for security and compliance. Questionnaires or certifications reviewed.' },
  { id:'international',   cat:'Vendor Management',   name:'International transfer safeguards',     ref:'Art. 44-49',   desc:'SCCs, adequacy decisions, or BCRs in place for non-UK/EEA transfers. Transfer impact assessments completed.' },
  { id:'staff-training',  cat:'Training',            name:'Staff GDPR training completed',         ref:'Art. 39',      desc:'All staff completed data protection training in last 12 months. Records of completion maintained.' },
  { id:'incident-resp',   cat:'Training',            name:'Incident response training',            ref:'Art. 32',      desc:'Staff know how to identify and report data breaches immediately. Tabletop exercise completed annually.' },
  { id:'ico-reg',         cat:'Training',            name:'ICO registration current',              ref:'DPA 2018',     desc:'Organisation registered with ICO and fee paid (renews annually).' },
  { id:'cookie-compliance',cat:'Training',           name:'Cookie consent compliance',             ref:'PECR',         desc:'Cookie banner with Reject All as prominent as Accept All. Consent records kept. Non-essential cookies blocked until consent.' },
]

const CYBER_CONTROLS = [
  { id:'ce-firewall',  cat:'Cyber Essentials',    name:'Boundary firewalls & internet gateways',  ref:'CE v3.1',       desc:'Firewalls configured to block unauthorised inbound connections. Default-deny rules applied. Reviewed quarterly.' },
  { id:'ce-patch',     cat:'Cyber Essentials',    name:'Security update management (patching)',    ref:'CE v3.1',       desc:'OS and software patched within 14 days of critical updates. End-of-life software removed.' },
  { id:'ce-malware',   cat:'Cyber Essentials',    name:'Malware protection',                      ref:'CE v3.1',       desc:'Antivirus/EDR deployed and updated on all devices. Signatures updated automatically.' },
  { id:'ce-access',    cat:'Cyber Essentials',    name:'Access control & admin privileges',       ref:'CE v3.1',       desc:'Admin accounts separate from standard use. MFA enforced on all admin and cloud accounts.' },
  { id:'ce-config',    cat:'Cyber Essentials',    name:'Secure configuration',                    ref:'CE v3.1',       desc:'Default passwords changed on all devices and services. Unnecessary services and ports disabled.' },
  { id:'ncsc-monitor', cat:'NCSC 10 Steps',       name:'Network security monitoring',             ref:'NCSC 10 Steps', desc:'Network traffic monitored, anomalies logged and alerted. SIEM or log aggregation in place.' },
  { id:'ncsc-backup',  cat:'NCSC 10 Steps',       name:'Backup & recovery tested',               ref:'NCSC 10 Steps', desc:'Backups taken daily, restoration tested quarterly, stored offsite/immutable.' },
  { id:'ncsc-vuln',    cat:'NCSC 10 Steps',       name:'Vulnerability management programme',     ref:'NCSC 10 Steps', desc:'Regular scanning, pen testing annually by CREST/CHECK provider, CVE tracking in place.' },
  { id:'dspt-ig',      cat:'NHS DSPT',             name:'Data Security & Protection Toolkit',     ref:'DSPT 2024/25',  desc:'DSPT completed and submitted before 30 June deadline. Evidence uploaded. Senior management signed off.' },
  { id:'dspt-train',   cat:'NHS DSPT',             name:'Mandatory IG training completed',        ref:'DSPT 2024/25',  desc:'All staff completed NHS IG training. 95%+ completion required for Standards Met.' },
  { id:'gov-cloud',    cat:'Digital Operations',   name:'Cloud services assessed (G-Cloud)',      ref:'GDS/CDDO',      desc:'Cloud services procured via G-Cloud or assessed against NCSC cloud security principles.' },
  { id:'pen-test',     cat:'Digital Operations',   name:'Annual penetration test',                ref:'NCSC',          desc:'CHECK/CREST-certified pen test on all public-facing systems. Findings remediated and tracked.' },
  { id:'iso27001',     cat:'Digital Operations',   name:'ISO 27001 / Cyber Essentials Plus',      ref:'ISO / NCSC',    desc:'Certification held or formal gap assessment in progress.' },
]

const ISO_CONTROLS = [
  { id:'iso-scope',    cat:'Context & Leadership', name:'ISMS scope defined',                     ref:'A.4',    desc:'Information Security Management System scope documented and approved by senior management.' },
  { id:'iso-policy',   cat:'Context & Leadership', name:'Information security policy published',  ref:'A.5.1',  desc:'High-level information security policy approved by management, communicated to all staff, reviewed annually.' },
  { id:'iso-roles',    cat:'Context & Leadership', name:'IS roles and responsibilities assigned',  ref:'A.5.2',  desc:'All information security roles defined, assigned to named individuals, and communicated.' },
  { id:'iso-risk-proc',cat:'Risk Management',      name:'Risk assessment process documented',     ref:'A.6.1',  desc:'Methodology for identifying, analysing, and evaluating IS risks. Risk criteria defined.' },
  { id:'iso-risk-reg', cat:'Risk Management',      name:'Risk register maintained',               ref:'A.6.1',  desc:'All identified risks recorded with likelihood, impact, risk owner, and treatment plan.' },
  { id:'iso-soa',      cat:'Risk Management',      name:'Statement of Applicability (SoA)',       ref:'A.6.1',  desc:'All Annex A controls evaluated. Inclusions/exclusions documented with justification.' },
  { id:'iso-hr',       cat:'People Controls',      name:'Background screening conducted',         ref:'A.6.1',  desc:'Pre-employment screening appropriate to role and data access level. References verified.' },
  { id:'iso-aware',    cat:'People Controls',      name:'Security awareness training',            ref:'A.6.3',  desc:'All staff complete IS awareness training on joining and annually. Phishing simulation in place.' },
  { id:'iso-asset',    cat:'Asset Management',     name:'Asset inventory maintained',             ref:'A.5.9',  desc:'All information assets inventoried. Owner assigned. Classification applied (Public/Internal/Confidential/Restricted).' },
  { id:'iso-class',    cat:'Asset Management',     name:'Information classification policy',      ref:'A.5.12', desc:'Classification scheme defined and applied consistently across all data types and systems.' },
  { id:'iso-access',   cat:'Access Control',       name:'Access control policy',                  ref:'A.5.15', desc:'Access based on least privilege, need-to-know, and role. Reviewed quarterly.' },
  { id:'iso-priv',     cat:'Access Control',       name:'Privileged access management',           ref:'A.5.18', desc:'Privileged accounts tracked, logged, reviewed. PAM tooling or manual controls in place.' },
  { id:'iso-crypto',   cat:'Cryptography',         name:'Cryptographic controls policy',          ref:'A.8.24', desc:'Approved algorithms documented. Key management procedures in place. Encryption enforced at rest and in transit.' },
  { id:'iso-phys',     cat:'Physical Security',    name:'Physical security controls',             ref:'A.7.1',  desc:'Secure areas defined. Physical access controlled, logged, reviewed. Clean desk policy enforced.' },
  { id:'iso-ops',      cat:'Operations',           name:'Change management process',              ref:'A.8.32', desc:'All changes to systems and services formally managed through documented change control process.' },
  { id:'iso-cap',      cat:'Operations',           name:'Capacity management',                    ref:'A.8.6',  desc:'System capacity monitored, projected, and managed to prevent performance or availability failures.' },
  { id:'iso-audit-log',cat:'Operations',           name:'Audit logging and monitoring',           ref:'A.8.15', desc:'Event logging enabled on all critical systems. Logs protected from tampering. Reviewed regularly.' },
  { id:'iso-vuln',     cat:'Operations',           name:'Vulnerability management',               ref:'A.8.8',  desc:'Technical vulnerabilities identified, assessed, and remediated in line with risk. CVE monitoring in place.' },
  { id:'iso-netw',     cat:'Network Security',     name:'Network security controls',              ref:'A.8.20', desc:'Networks segmented. Traffic filtered. Monitoring in place. Wireless networks secured.' },
  { id:'iso-dev',      cat:'Development',          name:'Secure development practices',           ref:'A.8.25', desc:'SDLC security requirements defined. Security testing in dev pipeline. Code review in place.' },
  { id:'iso-supplier', cat:'Supplier Relations',   name:'Supplier security policy',               ref:'A.5.19', desc:'Security requirements in all supplier agreements. Annual assessments. Incident notification clauses.' },
  { id:'iso-bcm',      cat:'Business Continuity',  name:'Business continuity plan (BCP)',         ref:'A.5.29', desc:'BCP documented, tested annually, roles assigned. RTO and RPO defined for all critical services.' },
  { id:'iso-inc',      cat:'Incident Management',  name:'Incident management procedure',          ref:'A.5.24', desc:'IS incident types defined. Procedure documented. Incidents logged, classified, escalated, reviewed.' },
  { id:'iso-comply',   cat:'Compliance',           name:'Legal & regulatory compliance review',   ref:'A.5.31', desc:'All applicable legal, regulatory, and contractual requirements identified and reviewed annually.' },
  { id:'iso-int-audit',cat:'Compliance',           name:'Internal audit programme',              ref:'A.5.35', desc:'Internal ISMS audits conducted at planned intervals. Findings tracked, reported to management.' },
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
      { type:'Online Safety Act Complaint', url:'https://www.ofcom.org.uk/online-safety/information-for-industry/complaints-about-regulated-services', desc:'Regulated service failed duties under Online Safety Act 2023', timeLimit:'Report as soon as possible', form:'Ofcom complaints portal' },
      { type:'Telecoms Complaint (post-deadlock)', url:'https://www.ofcom.org.uk/phones-and-broadband/making-a-complaint', desc:'Broadband or phone provider dispute unresolved after 8 weeks', timeLimit:'8 weeks after raising with provider', form:'Ombudsman Services or CISAS' },
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
      { name:'Consumer Duty Board Report Template', url:'https://www.fca.org.uk/firms/consumer-duty/consumer-duty-assessment-tool', desc:'FCA tool to produce annual Consumer Duty board reports (due 31 July each year)' },
    ],
    applications:[
      { name:'FCA Authorisation', url:'https://www.fca.org.uk/firms/authorisation', desc:'Apply to be an FCA-authorised firm before conducting regulated financial activities', deadline:'Before conducting any regulated activity — processing takes 6-12 months' },
    ],
  },
  {
    id:'ncsc', body:'National Cyber Security Centre (NCSC)', icon:'🔐', scope:'Cyber incidents, Cyber Essentials, CNI, government cyber assurance', color:'#EF4444',
    complaintTypes:[
      { type:'Report Significant Cyber Incident', url:'https://report.ncsc.gov.uk/', desc:'Report a cyber attack, ransomware, data exfiltration, or significant security breach', timeLimit:'As soon as possible — early reporting enables NCSC support', form:'NCSC Incident Reporting portal' },
      { type:'Report Phishing Email', url:'https://www.ncsc.gov.uk/section/about-this-website/report-phishing', desc:'Forward phishing or suspicious emails to NCSC', timeLimit:'Immediately', form:'Email: report@phishing.gov.uk' },
    ],
    audits:[
      { name:'Cyber Assessment Framework (CAF)', url:'https://www.ncsc.gov.uk/collection/caf', desc:'For Operators of Essential Services (OES) and CNI — 4 objectives, 14 principles' },
      { name:'Cyber Essentials Self-Assessment Tool', url:'https://www.ncsc.gov.uk/cyberessentials/overview', desc:'Free online tool — required for some government contracts' },
    ],
    applications:[
      { name:'Cyber Essentials Certification', url:'https://www.ncsc.gov.uk/cyberessentials/overview', desc:'Verified self-assessment — from £300+VAT; mandatory for MoD and some NHS/central gov contracts', deadline:'Annual renewal' },
      { name:'Cyber Essentials Plus', url:'https://www.ncsc.gov.uk/cyberessentials/overview', desc:'Independently tested by IASME-accredited body — higher assurance for enterprise clients', deadline:'Annual renewal' },
    ],
  },
  {
    id:'dspt', body:'NHS Data Security & Protection Toolkit (DSPT)', icon:'🏥', scope:'NHS orgs, GP practices, health data processors, care providers', color:'#06B6D4',
    complaintTypes:[
      { type:'DSPT Non-Compliance Report', url:'https://www.dsptoolkit.nhs.uk/', desc:'Report an NHS-connected organisation not meeting data security standards', timeLimit:'Submissions due 30 June annually', form:'NHS DSPT portal or via NHS England regional team' },
    ],
    audits:[
      { name:'DSPT Self-Assessment 2024/25', url:'https://www.dsptoolkit.nhs.uk/', desc:'Annual mandatory submission — "Standards Met" or "Standards Exceeded"' },
      { name:'NHS IG Training (ESR)', url:'https://www.e-lfh.org.uk/programmes/data-security-awareness/', desc:'Free online training for all staff with access to NHS patient data' },
    ],
    applications:[
      { name:'DSPT Organisation Registration', url:'https://www.dsptoolkit.nhs.uk/Account/Register', desc:'Register your organisation before accessing NHS patient data or systems', deadline:'Before data access; annual resubmission by 30 June' },
    ],
  },
]

const AUDIT_TEMPLATES = [
  { id:'gdpr-audit', name:'Annual GDPR Audit Checklist', icon:'📋', desc:'20-point annual review covering all UK GDPR obligations', items:['Review and update Records of Processing Activities (ROPA)','Confirm ICO registration is current and fee paid','Test DSAR process end-to-end — time a test request','Review all vendor DPAs for completeness','Check retention schedules have been actioned (deletions run)','Test data breach response plan with a tabletop exercise','Verify cookie consent is compliant — Reject All as prominent as Accept','Review privacy notice for accuracy — check new products/services','Check staff GDPR training completion rates (target 100%)','Assess cross-border transfer safeguards — SCCs still valid?','Review DPIA register — new high-risk activities identified?','Test data deletion/erasure on a live request','Confirm DPO details registered with ICO and on privacy notice','Review security measures — encryption, MFA, patching','Audit access control list — remove leavers and excess privileges','Review complaint and DSAR log outcomes — any trends?','Review Legitimate Interests Assessments for continued validity','Test Right to Portability — can you produce CSV/JSON export?','Confirm lawful basis for all marketing is documented','Prepare board/management GDPR report — include KPIs and incidents'] },
  { id:'cyber-audit', name:'Cyber Essentials Pre-Assessment', icon:'🔐', desc:'Checklist to prepare for Cyber Essentials certification', items:['Document all boundary firewalls and confirm default-deny rules','List all internet-connected services and remove unused ones','Check patch levels on all devices — critical patches within 14 days','Remove or replace end-of-life operating systems and software','Change all default passwords on devices, routers, and cloud services','Enable MFA on all admin and cloud service accounts','Document all user accounts and remove inactive accounts within 14 days','Separate admin accounts from standard user accounts','Enable and update antivirus/EDR on all devices','Identify all cloud services in scope — including shadow IT','Document mobile device management (MDM) policy','Verify network segregation — guest Wi-Fi isolated from internal','Enable DNS filtering to block malicious domains','Check email filtering (anti-phishing, DMARC, SPF, DKIM)','Prepare complete asset inventory (hardware and software)'] },
  { id:'dpia-report', name:'DPIA Report Template', icon:'📊', desc:'ICO-compliant Data Protection Impact Assessment structure', items:['Describe the processing in detail — what data, why, how, who','Assess necessity — is processing limited to what is needed?','Assess proportionality — is there a less intrusive alternative?','Identify risks to data subjects (unauthorised access, inaccuracy, loss)','Assess likelihood and severity of each risk (High/Med/Low)','Identify risk mitigation measures for each risk','Re-assess residual risk after mitigations','Consult DPO — record their recommendations and your response','Consult data subjects or their representatives where appropriate','Sign off by senior management / data controller','Determine: is residual risk still High? If yes, consult ICO before proceeding','Schedule review date — at least every 3 years or on significant change'] },
  { id:'breach-report', name:'Data Breach Response Report', icon:'🚨', desc:'ICO 72-hour breach notification procedure', items:['Record exact time breach was discovered','Contain the breach — isolate affected systems if necessary','Identify nature of breach (confidentiality / integrity / availability)','Identify personal data affected and categories of individuals','Estimate approximate number of individuals affected','Identify likely cause — human error, cyber attack, lost device, etc.','Assess risk of harm to individuals — likelihood and severity','Decision: is the breach notifiable to ICO? (risk to rights and freedoms)','If notifiable: submit ICO report within 72 hours at ico.org.uk/report-a-breach','Decision: must affected individuals be notified? (high risk of harm)','Draft and send communication to affected individuals if required','Implement containment and remediation measures','Document lessons learned and update policies','Update internal data breach register','Board/management notification completed'] },
]

const RISK_LIKELIHOOD = ['Rare','Unlikely','Possible','Likely','Almost Certain']
const RISK_IMPACT     = ['Negligible','Minor','Moderate','Significant','Critical']
const RISK_CATS       = ['Data Protection','Cyber Security','Operational','Legal/Regulatory','Financial','Reputational','Third Party']

const RISK_COLORS = {
  Low:      { bg:'rgba(34,197,94,0.1)',  border:'rgba(34,197,94,0.3)',  text:'#22C55E' },
  Medium:   { bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)', text:'#F59E0B' },
  High:     { bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.3)',  text:'#EF4444' },
  Critical: { bg:'rgba(220,38,38,0.12)', border:'rgba(220,38,38,0.4)',  text:'#DC2626' },
}

function riskRating(l, i) {
  const score = (RISK_LIKELIHOOD.indexOf(l) + 1) * (RISK_IMPACT.indexOf(i) + 1)
  if (score <= 4)  return 'Low'
  if (score <= 9)  return 'Medium'
  if (score <= 16) return 'High'
  return 'Critical'
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  page:      { minHeight:'100vh', background:'var(--bg)', color:'var(--ink)', fontFamily:'Inter,sans-serif', paddingBottom:60 },
  hero:      { background:'linear-gradient(135deg,#0A0A18 0%,#0A0A18 100%)', padding:'40px 24px 32px', borderBottom:'1px solid rgba(255,255,255,0.07)' },
  heroInner: { maxWidth:1200, margin:'0 auto' },
  heroTitle: { fontSize:28, fontWeight:700, margin:'0 0 6px', color:'var(--ink)' },
  heroSub:   { fontSize:14, color:'#94A3B8', margin:'0 0 24px' },
  tabBar:    { display:'flex', gap:8, flexWrap:'wrap' },
  tab: a => ({ padding:'8px 18px', borderRadius:8, border:`1px solid ${a?'var(--accent)':'rgba(255,255,255,0.09)'}`, background:a?'rgba(139,92,246,0.12)':'transparent', color:a?'var(--accent)':'#94A3B8', cursor:'pointer', fontSize:14, fontWeight:500, transition:'all .15s' }),
  body:      { maxWidth:1200, margin:'0 auto', padding:'28px 24px 0' },
  card:      { background:'var(--bg2)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:20, marginBottom:16 },
  label:     { fontSize:11, fontWeight:600, letterSpacing:1, textTransform:'uppercase', color:'#64748B', marginBottom:12 },
  badge: s => { const c={Compliant:'#22C55E','In Progress':'#F59E0B','Not Started':'#EF4444','N/A':'#64748B'}[s]||'#64748B'; return { display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, background:`${c}22`, color:c, border:`1px solid ${c}44` } },
  btn:       { padding:'6px 14px', borderRadius:6, border:'1px solid rgba(139,92,246,0.4)', background:'rgba(139,92,246,0.08)', color:'var(--accent)', fontSize:12, cursor:'pointer', fontWeight:500 },
  btnSm:     { padding:'4px 10px', borderRadius:6, border:'1px solid rgba(255,255,255,0.09)', background:'transparent', color:'#94A3B8', fontSize:11, cursor:'pointer' },
  btnDanger: { padding:'4px 10px', borderRadius:6, border:'1px solid rgba(239,68,68,0.3)', background:'transparent', color:'#EF4444', fontSize:11, cursor:'pointer' },
  aiBox:     { background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:8, padding:14, marginTop:12, fontSize:13, lineHeight:1.8, color:'#CBD5E1', whiteSpace:'pre-wrap' },
  tag:   c => ({ display:'inline-block', padding:'2px 8px', borderRadius:4, fontSize:11, fontWeight:600, background:`${c}22`, color:c, border:`1px solid ${c}44`, marginRight:4 }),
  link:      { color:'var(--accent)', textDecoration:'none', fontSize:13, fontWeight:500 },
  grid2:     { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:14 },
  grid3:     { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12 },
  progWrap:  { height:6, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden', marginTop:8, position:'relative' },
  progBar: (p,c='#9B7BFA') => ({ position:'absolute', left:0, top:0, height:'100%', width:`${p}%`, background:c, borderRadius:3, transition:'width .4s' }),
  input:     { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:6, padding:'6px 10px', color:'var(--ink)', fontSize:13, width:'100%', outline:'none', fontFamily:'inherit' },
  select:    { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:6, padding:'6px 10px', color:'var(--ink)', fontSize:13, outline:'none', fontFamily:'inherit', cursor:'pointer' },
  textarea:  { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:6, padding:'8px 10px', color:'var(--ink)', fontSize:13, width:'100%', outline:'none', fontFamily:'inherit', resize:'vertical', minHeight:60 },
}

const STATUS_OPTIONS = ['Not Started','In Progress','Compliant','N/A']

function getUser() {
  try {
    const c = document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('algograss_user='))
    if (!c) return null
    return JSON.parse(atob(c.split('=')[1]))
  } catch { return null }
}

const LS_KEY = 'algograss_grc_v2'

function loadGRCState() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveGRCState(state) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)) } catch {}
}

export default function GRCPage() {
  const [activeTab,    setActiveTab]    = useState('gdpr')
  const [grcState,     setGrcState]     = useState({ gdpr:{}, cyber:{}, iso:{}, notes:{} })
  const [risks,        setRisks]        = useState([])
  const [suggestions,  setSuggestions]  = useState({})
  const [loadingAI,    setLoadingAI]    = useState({})
  const [openCard,     setOpenCard]     = useState(null)
  const [openBody,     setOpenBody]     = useState(null)
  const [openAudit,    setOpenAudit]    = useState(null)
  const [auditChecked, setAuditChecked] = useState({})
  const [exportMsg,    setExportMsg]    = useState('')
  const [newRisk,      setNewRisk]      = useState({ title:'', category:'Data Protection', description:'', likelihood:'Possible', impact:'Moderate', owner:'', treatment:'' })
  const [showRiskForm, setShowRiskForm] = useState(false)
  const [editRiskIdx,  setEditRiskIdx]  = useState(null)
  const router = useRouter()

  // Load persisted state on mount
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
    const saved = loadGRCState()
    if (saved.grcState) setGrcState(saved.grcState)
    if (saved.risks)    setRisks(saved.risks)
    if (saved.auditChecked) setAuditChecked(saved.auditChecked)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist on every state change
  useEffect(() => {
    saveGRCState({ grcState, risks, auditChecked })
  }, [grcState, risks, auditChecked])

  const getStatus  = (id, framework) => grcState[framework]?.[id] || 'Not Started'
  const getNote    = (id) => grcState.notes?.[id] || ''

  const setStatus = useCallback((id, v, framework) => {
    setGrcState(p => ({ ...p, [framework]: { ...p[framework], [id]: v } }))
  }, [])

  const setNote = useCallback((id, v) => {
    setGrcState(p => ({ ...p, notes: { ...p.notes, [id]: v } }))
  }, [])

  const scoreOf    = (controls, framework) => {
    const map = grcState[framework] || {}
    const na  = controls.filter(c => (map[c.id]||'Not Started') === 'N/A').length
    const t   = controls.length - na
    return t > 0 ? Math.round(controls.filter(c => (map[c.id]||'Not Started') === 'Compliant').length / t * 100) : 0
  }
  const scoreColor = s => s >= 80 ? '#22C55E' : s >= 50 ? '#F59E0B' : '#EF4444'

  async function getSuggestion(ctrl, framework) {
    const k = ctrl.id
    if (suggestions[k]) { setSuggestions(p => ({ ...p, [k]: null })); return }
    setLoadingAI(p => ({ ...p, [k]: true }))
    try {
      const r = await fetch('/api/grc/suggest', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ controlId: ctrl.id, controlName: ctrl.name, status: getStatus(ctrl.id, framework), category: ctrl.cat })
      })
      const d = await r.json()
      setSuggestions(p => ({ ...p, [k]: d.suggestion }))
    } catch { setSuggestions(p => ({ ...p, [k]: 'Could not load suggestion. Please try again.' })) }
    finally  { setLoadingAI(p => ({ ...p, [k]: false })) }
  }

  function exportCSV(controls, framework, filename) {
    const map = grcState[framework] || {}
    const csv = [
      ['Control','Category','Reference','Status','Notes'],
      ...controls.map(c => [c.name, c.cat, c.ref, map[c.id]||'Not Started', grcState.notes?.[c.id]||''])
    ].map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = filename; a.click()
    setExportMsg('✓ Exported'); setTimeout(() => setExportMsg(''), 2000)
  }

  function exportBoardReport() {
    const gdprScore  = scoreOf(GDPR_CONTROLS,  'gdpr')
    const cyberScore = scoreOf(CYBER_CONTROLS, 'cyber')
    const isoScore   = scoreOf(ISO_CONTROLS,   'iso')
    const overallScore = Math.round((gdprScore + cyberScore + isoScore) / 3)
    const critRisks  = risks.filter(r => r.rating === 'Critical' || r.rating === 'High')

    const statusCount = (controls, framework) => {
      const map = grcState[framework] || {}
      return { Compliant: controls.filter(c=>(map[c.id]||'Not Started')==='Compliant').length,
               'In Progress': controls.filter(c=>(map[c.id]||'Not Started')==='In Progress').length,
               'Not Started': controls.filter(c=>(map[c.id]||'Not Started')==='Not Started').length }
    }

    const gdprC  = statusCount(GDPR_CONTROLS,  'gdpr')
    const cyberC = statusCount(CYBER_CONTROLS, 'cyber')
    const isoC   = statusCount(ISO_CONTROLS,   'iso')

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>AlgoGrass GRC Board Report</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #0F172A; }
  h1 { color: #1A6B3C; font-size: 28px; margin-bottom: 4px; }
  h2 { color: #1A6B3C; font-size: 18px; border-bottom: 2px solid #BBF7D0; padding-bottom: 6px; margin-top: 32px; }
  .meta { color: #64748B; font-size: 13px; margin-bottom: 32px; }
  .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .score-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px; text-align: center; }
  .score-num { font-size: 36px; font-weight: 700; }
  .score-lbl { font-size: 12px; color: #64748B; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th { background: #0F172A; color: white; padding: 8px 12px; text-align: left; font-size: 13px; }
  td { padding: 8px 12px; font-size: 13px; border-bottom: 1px solid #E2E8F0; }
  .green { color: #16A34A; font-weight: 600; }
  .amber { color: #D97706; font-weight: 600; }
  .red   { color: #DC2626; font-weight: 600; }
  .risk-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .risk-Low { background: #DCFCE7; color: #16A34A; }
  .risk-Medium { background: #FEF9C3; color: #92400E; }
  .risk-High { background: #FEE2E2; color: #DC2626; }
  .risk-Critical { background: #FCA5A5; color: #7F1D1D; }
  footer { color: #94A3B8; font-size: 12px; text-align: center; margin-top: 48px; padding-top: 16px; border-top: 1px solid #E2E8F0; }
  @media print { body { padding: 20px; } }
</style></head><body>
<h1>GRC Board Report — AlgoGrass</h1>
<div class="meta">Generated: ${new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})} · Prepared by: Compliance Team · Classification: Confidential</div>

<h2>Executive Summary</h2>
<div class="score-grid">
  <div class="score-box"><div class="score-num" style="color:${scoreColor(overallScore)}">${overallScore}%</div><div class="score-lbl">Overall Score</div></div>
  <div class="score-box"><div class="score-num" style="color:${scoreColor(gdprScore)}">${gdprScore}%</div><div class="score-lbl">GDPR Controls</div></div>
  <div class="score-box"><div class="score-num" style="color:${scoreColor(cyberScore)}">${cyberScore}%</div><div class="score-lbl">Cyber & Digital</div></div>
  <div class="score-box"><div class="score-num" style="color:${scoreColor(isoScore)}">${isoScore}%</div><div class="score-lbl">ISO 27001 Controls</div></div>
</div>

<h2>GDPR Controls Summary</h2>
<table><tr><th>Status</th><th>Count</th><th>% of controls</th></tr>
<tr><td class="green">Compliant</td><td>${gdprC.Compliant}</td><td>${Math.round(gdprC.Compliant/GDPR_CONTROLS.length*100)}%</td></tr>
<tr><td class="amber">In Progress</td><td>${gdprC['In Progress']}</td><td>${Math.round(gdprC['In Progress']/GDPR_CONTROLS.length*100)}%</td></tr>
<tr><td class="red">Not Started</td><td>${gdprC['Not Started']}</td><td>${Math.round(gdprC['Not Started']/GDPR_CONTROLS.length*100)}%</td></tr>
</table>

<h2>Cyber & Digital Controls Summary</h2>
<table><tr><th>Status</th><th>Count</th><th>% of controls</th></tr>
<tr><td class="green">Compliant</td><td>${cyberC.Compliant}</td><td>${Math.round(cyberC.Compliant/CYBER_CONTROLS.length*100)}%</td></tr>
<tr><td class="amber">In Progress</td><td>${cyberC['In Progress']}</td><td>${Math.round(cyberC['In Progress']/CYBER_CONTROLS.length*100)}%</td></tr>
<tr><td class="red">Not Started</td><td>${cyberC['Not Started']}</td><td>${Math.round(cyberC['Not Started']/CYBER_CONTROLS.length*100)}%</td></tr>
</table>

<h2>ISO 27001 Controls Summary</h2>
<table><tr><th>Status</th><th>Count</th><th>% of controls</th></tr>
<tr><td class="green">Compliant</td><td>${isoC.Compliant}</td><td>${Math.round(isoC.Compliant/ISO_CONTROLS.length*100)}%</td></tr>
<tr><td class="amber">In Progress</td><td>${isoC['In Progress']}</td><td>${Math.round(isoC['In Progress']/ISO_CONTROLS.length*100)}%</td></tr>
<tr><td class="red">Not Started</td><td>${isoC['Not Started']}</td><td>${Math.round(isoC['Not Started']/ISO_CONTROLS.length*100)}%</td></tr>
</table>

${risks.length > 0 ? `
<h2>Risk Register Summary (${risks.length} risks)</h2>
<table>
<tr><th>Risk</th><th>Category</th><th>Rating</th><th>Owner</th><th>Treatment</th></tr>
${risks.map(r=>`<tr><td>${r.title}</td><td>${r.category}</td><td><span class="risk-badge risk-${r.rating}">${r.rating}</span></td><td>${r.owner||'—'}</td><td>${r.treatment||'—'}</td></tr>`).join('')}
</table>
${critRisks.length > 0 ? `<p><strong>⚠️ ${critRisks.length} High/Critical risk${critRisks.length>1?'s require':'requires'} board attention.</strong></p>` : ''}
` : ''}

<h2>Recommended Actions</h2>
<p>Controls marked "Not Started" should be prioritised. The compliance team recommends the following immediate actions:</p>
<ol>
${GDPR_CONTROLS.filter(c=>(grcState.gdpr?.[c.id]||'Not Started')==='Not Started').slice(0,3).map(c=>`<li><strong>${c.name}</strong> (${c.ref}) — ${c.desc.substring(0,80)}...</li>`).join('')}
${CYBER_CONTROLS.filter(c=>(grcState.cyber?.[c.id]||'Not Started')==='Not Started').slice(0,2).map(c=>`<li><strong>${c.name}</strong> (${c.ref}) — ${c.desc.substring(0,80)}...</li>`).join('')}
</ol>

<footer>AlgoGrass GRC Platform · algograss.co · Confidential — for internal use and board distribution only</footer>
</body></html>`

    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([html], { type:'text/html' }))
    a.download = `AlgoGrass_GRC_Board_Report_${new Date().toISOString().slice(0,10)}.html`
    a.click()
    setExportMsg('✓ Report downloaded'); setTimeout(() => setExportMsg(''), 3000)
  }

  // ─── CONTROL LIST ────────────────────────────────────────────────────────────
  function ControlList({ controls, framework }) {
    const map   = grcState[framework] || {}
    const score = scoreOf(controls, framework)
    const color = scoreColor(score)
    const cats  = [...new Set(controls.map(c => c.cat))]

    return (
      <>
        <div style={{ ...S.card, display:'flex', alignItems:'center', gap:32, marginBottom:24, flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ fontSize:13, color:'#94A3B8', marginBottom:4 }}>Compliance Score</div>
            <div style={{ fontSize:48, fontWeight:700, color, lineHeight:1 }}>{score}<span style={{ fontSize:20, color:'#64748B' }}>%</span></div>
            <div style={S.progWrap}><div style={S.progBar(score, color)}/></div>
          </div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            {['Compliant','In Progress','Not Started','N/A'].map(s => {
              const n = controls.filter(c => (map[c.id]||'Not Started') === s).length
              const c = {Compliant:'#22C55E','In Progress':'#F59E0B','Not Started':'#EF4444','N/A':'#64748B'}[s]
              return <div key={s} style={{ textAlign:'center' }}><div style={{ fontSize:22, fontWeight:700, color:c }}>{n}</div><div style={{ fontSize:11, color:'#64748B' }}>{s}</div></div>
            })}
          </div>
          <div style={{ display:'flex', gap:8, flexDirection:'column', alignItems:'flex-end' }}>
            <button style={S.btn} onClick={() => exportCSV(controls, framework, `${framework}-controls.csv`)}>⬇ Export CSV</button>
            <button style={S.btn} onClick={exportBoardReport}>📄 Board Report</button>
            {exportMsg && <div style={{ color:'#22C55E', fontSize:12 }}>{exportMsg}</div>}
          </div>
        </div>

        {cats.map(cat => (
          <div key={cat} style={{ marginBottom:24 }}>
            <div style={S.label}>{cat}</div>
            {controls.filter(c => c.cat === cat).map(ctrl => {
              const status = getStatus(ctrl.id, framework)
              const note   = getNote(ctrl.id)
              const isOpen = openCard === ctrl.id
              return (
                <div key={ctrl.id} style={{ ...S.card, padding:0, overflow:'hidden', marginBottom:10 }}>
                  <div style={{ padding:'14px 18px', display:'flex', alignItems:'center', gap:12, cursor:'pointer' }} onClick={() => setOpenCard(isOpen ? null : ctrl.id)}>
                    <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{ctrl.name}</span>
                    {note && <span style={{ fontSize:11, color:'#64748B' }} title={note}>📝</span>}
                    <span style={S.tag('#64748B')}>{ctrl.ref}</span>
                    <span style={S.badge(status)}>{status}</span>
                    <span style={{ color:'#64748B', fontSize:12 }}>{isOpen ? '▲' : '▼'}</span>
                  </div>
                  {isOpen && (
                    <div style={{ padding:'0 18px 16px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ fontSize:13, color:'#94A3B8', margin:'12px 0' }}>{ctrl.desc}</p>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                        {STATUS_OPTIONS.map(s => (
                          <button key={s} style={{ ...S.btnSm, ...(status===s ? { background:'rgba(139,92,246,0.12)', color:'var(--accent)', borderColor:'var(--accent)' } : {}) }}
                            onClick={() => setStatus(ctrl.id, s, framework)}>{s}</button>
                        ))}
                      </div>
                      <div style={{ marginBottom:12 }}>
                        <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Evidence / Notes</div>
                        <textarea
                          style={S.textarea}
                          placeholder="Add evidence, document references, or notes…"
                          value={note}
                          onChange={e => setNote(ctrl.id, e.target.value)}
                        />
                      </div>
                      <button style={S.btn} onClick={() => getSuggestion(ctrl, framework)}>
                        {loadingAI[ctrl.id] ? '⏳ Loading…' : suggestions[ctrl.id] ? '✕ Hide AI Advice' : '🤖 Get AI Advice'}
                      </button>
                      {suggestions[ctrl.id] && <div style={S.aiBox}>{suggestions[ctrl.id]}</div>}
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

  // ─── RISK REGISTER ───────────────────────────────────────────────────────────
  function renderRiskRegister() {
    const critCount = risks.filter(r => r.rating === 'Critical').length
    const highCount = risks.filter(r => r.rating === 'High').length
    const medCount  = risks.filter(r => r.rating === 'Medium').length
    const lowCount  = risks.filter(r => r.rating === 'Low').length

    const rating = riskRating(newRisk.likelihood, newRisk.impact)
    const rc = RISK_COLORS[rating] || RISK_COLORS.Low

    function saveRisk() {
      const entry = { ...newRisk, rating, createdAt: new Date().toISOString(), id: Date.now() }
      if (editRiskIdx !== null) {
        setRisks(p => p.map((r, i) => i === editRiskIdx ? entry : r))
        setEditRiskIdx(null)
      } else {
        setRisks(p => [...p, entry])
      }
      setNewRisk({ title:'', category:'Data Protection', description:'', likelihood:'Possible', impact:'Moderate', owner:'', treatment:'' })
      setShowRiskForm(false)
    }

    function startEdit(idx) {
      const r = risks[idx]
      setNewRisk({ title:r.title, category:r.category, description:r.description||'', likelihood:r.likelihood, impact:r.impact, owner:r.owner||'', treatment:r.treatment||'' })
      setEditRiskIdx(idx)
      setShowRiskForm(true)
    }

    function exportRisksCSV() {
      const csv = [['Title','Category','Likelihood','Impact','Rating','Owner','Treatment','Created'],
        ...risks.map(r=>[r.title,r.category,r.likelihood,r.impact,r.rating,r.owner||'',r.treatment||'',r.createdAt?.slice(0,10)||''])
      ].map(row=>row.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n')
      const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='risk-register.csv'; a.click()
    }

    return (
      <>
        <div style={{ ...S.card, background:'rgba(239,68,68,0.04)', border:'1px solid rgba(239,68,68,0.15)', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>⚠️ Risk Register</div>
              <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>Track and manage compliance and security risks. Assess likelihood and impact to calculate risk ratings automatically.</p>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              {risks.length > 0 && <button style={S.btn} onClick={exportRisksCSV}>⬇ Export CSV</button>}
              <button style={{ ...S.btn, background:'rgba(139,92,246,0.15)', borderColor:'var(--accent)' }} onClick={() => { setShowRiskForm(!showRiskForm); setEditRiskIdx(null); setNewRisk({ title:'', category:'Data Protection', description:'', likelihood:'Possible', impact:'Moderate', owner:'', treatment:'' }) }}>
                {showRiskForm ? '✕ Cancel' : '+ Add Risk'}
              </button>
            </div>
          </div>

          {risks.length > 0 && (
            <div style={{ display:'flex', gap:16, marginTop:16, flexWrap:'wrap' }}>
              {[['Critical', critCount, '#DC2626'], ['High', highCount, '#EF4444'], ['Medium', medCount, '#F59E0B'], ['Low', lowCount, '#22C55E']].map(([l,n,c]) => (
                <div key={l} style={{ textAlign:'center', minWidth:60 }}>
                  <div style={{ fontSize:22, fontWeight:700, color:c }}>{n}</div>
                  <div style={{ fontSize:11, color:'#64748B' }}>{l}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showRiskForm && (
          <div style={{ ...S.card, border:'1px solid rgba(139,92,246,0.3)', marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>{editRiskIdx !== null ? 'Edit Risk' : 'Add New Risk'}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Risk Title *</div>
                <input style={S.input} placeholder="e.g. Unauthorised access to customer data" value={newRisk.title} onChange={e => setNewRisk(p=>({...p,title:e.target.value}))} />
              </div>
              <div>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Category</div>
                <select style={S.select} value={newRisk.category} onChange={e => setNewRisk(p=>({...p,category:e.target.value}))}>
                  {RISK_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Likelihood</div>
                <select style={S.select} value={newRisk.likelihood} onChange={e => setNewRisk(p=>({...p,likelihood:e.target.value}))}>
                  {RISK_LIKELIHOOD.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Impact</div>
                <select style={S.select} value={newRisk.impact} onChange={e => setNewRisk(p=>({...p,impact:e.target.value}))}>
                  {RISK_IMPACT.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Risk Owner</div>
                <input style={S.input} placeholder="e.g. CTO, DPO, Pinki Gaud" value={newRisk.owner} onChange={e => setNewRisk(p=>({...p,owner:e.target.value}))} />
              </div>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div>
                  <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Auto-calculated Rating</div>
                  <div style={{ display:'inline-block', padding:'6px 16px', borderRadius:8, fontSize:14, fontWeight:700, background:rc.bg, color:rc.text, border:`1px solid ${rc.border}` }}>{rating}</div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Description (optional)</div>
              <textarea style={S.textarea} placeholder="Describe the risk scenario…" value={newRisk.description} onChange={e => setNewRisk(p=>({...p,description:e.target.value}))} />
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>Treatment / Mitigation</div>
              <textarea style={S.textarea} placeholder="How will this risk be treated? (Accept / Mitigate / Transfer / Avoid)" value={newRisk.treatment} onChange={e => setNewRisk(p=>({...p,treatment:e.target.value}))} />
            </div>
            <button style={{ ...S.btn, padding:'8px 20px', fontSize:13 }} onClick={saveRisk} disabled={!newRisk.title.trim()}>
              {editRiskIdx !== null ? '✓ Update Risk' : '✓ Save Risk'}
            </button>
          </div>
        )}

        {risks.length === 0 && !showRiskForm && (
          <div style={{ ...S.card, textAlign:'center', padding:40, color:'#64748B' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:8 }}>No risks recorded yet</div>
            <div style={{ fontSize:13 }}>Add your first risk to start tracking. Ratings are calculated automatically from likelihood × impact.</div>
          </div>
        )}

        {risks.map((r, idx) => {
          const rc2 = RISK_COLORS[r.rating] || RISK_COLORS.Low
          return (
            <div key={r.id || idx} style={{ ...S.card, borderColor:rc2.border, marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12, flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:14, fontWeight:600 }}>{r.title}</span>
                    <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:12, fontSize:11, fontWeight:700, background:rc2.bg, color:rc2.text, border:`1px solid ${rc2.border}` }}>{r.rating}</span>
                    <span style={S.tag('#64748B')}>{r.category}</span>
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:12, color:'#64748B', flexWrap:'wrap', marginBottom:r.description||r.treatment||r.owner?8:0 }}>
                    <span>Likelihood: <b style={{color:'var(--ink)'}}>{r.likelihood}</b></span>
                    <span>Impact: <b style={{color:'var(--ink)'}}>{r.impact}</b></span>
                    {r.owner && <span>Owner: <b style={{color:'var(--ink)'}}>{r.owner}</b></span>}
                    {r.createdAt && <span>Added: {r.createdAt.slice(0,10)}</span>}
                  </div>
                  {r.description && <p style={{ fontSize:12, color:'#94A3B8', margin:'4px 0' }}>{r.description}</p>}
                  {r.treatment   && <div style={{ fontSize:12, color:'#94A3B8', fontStyle:'italic' }}>Treatment: {r.treatment}</div>}
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button style={S.btnSm} onClick={() => startEdit(idx)}>Edit</button>
                  <button style={S.btnDanger} onClick={() => setRisks(p => p.filter((_,i) => i !== idx))}>Delete</button>
                </div>
              </div>
            </div>
          )
        })}
      </>
    )
  }

  // ─── COMPLAINTS ──────────────────────────────────────────────────────────────
  function renderComplaints() {
    return (
      <>
        <div style={{ ...S.card, background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', marginBottom:24 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>🏛️ UK Government Regulatory Complaints Library</div>
          <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>Click any regulator to view complaint types, time limits, audit tools, and registration requirements.</p>
        </div>
        <div style={S.grid2}>
          {UK_GOV_COMPLAINTS.map(body => {
            const isOpen = openBody === body.id
            return (
              <div key={body.id} style={{ ...S.card, cursor:'pointer', borderColor:isOpen ? body.color+'66' : 'rgba(255,255,255,0.07)' }}>
                <div onClick={() => setOpenBody(isOpen ? null : body.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <span style={{ fontSize:24 }}>{body.icon}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600 }}>{body.body}</div>
                      <div style={{ fontSize:11, color:'#64748B' }}>{body.scope}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <span style={S.tag(body.color)}>{body.complaintTypes.length} complaint types</span>
                    {body.applications.length > 0 && <span style={S.tag('#F59E0B')}>{body.applications.length} registration{body.applications.length>1?'s':''}</span>}
                    {body.audits.length > 0 && <span style={S.tag('#8B5CF6')}>{body.audits.length} audit tool{body.audits.length>1?'s':''}</span>}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop:16, borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:14 }}>
                    {body.complaintTypes.length > 0 && <>
                      <div style={S.label}>Complaint Types</div>
                      {body.complaintTypes.map((ct,i) => (
                        <div key={i} style={{ marginBottom:12, background:'rgba(15,23,42,0.03)', borderRadius:8, padding:12 }}>
                          <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{ct.type}</div>
                          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:6 }}>{ct.desc}</div>
                          <div style={{ fontSize:11, color:'#64748B', marginBottom:6 }}>⏱ Time limit: {ct.timeLimit}</div>
                          <div style={{ fontSize:11, color:'#64748B', marginBottom:8 }}>📝 {ct.form}</div>
                          <a href={ct.url} target="_blank" rel="noopener" style={S.link}>Make complaint →</a>
                        </div>
                      ))}
                    </>}
                    {body.audits.length > 0 && <>
                      <div style={{ ...S.label, marginTop:14 }}>Audit & Assessment Tools</div>
                      {body.audits.map((a,i) => (
                        <div key={i} style={{ marginBottom:10, display:'flex', alignItems:'flex-start', gap:8 }}>
                          <span style={{ color:'#8B5CF6', marginTop:1 }}>📊</span>
                          <div><a href={a.url} target="_blank" rel="noopener" style={S.link}>{a.name}</a><div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{a.desc}</div></div>
                        </div>
                      ))}
                    </>}
                    {body.applications.length > 0 && <>
                      <div style={{ ...S.label, marginTop:14 }}>Registration & Applications</div>
                      {body.applications.map((a,i) => (
                        <div key={i} style={{ marginBottom:10, background:'rgba(245,158,11,0.06)', borderRadius:8, padding:10 }}>
                          <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>{a.name}</div>
                          <div style={{ fontSize:12, color:'#94A3B8', marginBottom:4 }}>{a.desc}</div>
                          {a.deadline && <div style={{ fontSize:11, color:'#F59E0B', marginBottom:6 }}>📅 {a.deadline}</div>}
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

  // ─── AUDIT TEMPLATES ─────────────────────────────────────────────────────────
  function renderAudit() {
    return (
      <>
        <div style={{ ...S.card, background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', marginBottom:24 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>📊 Interactive Audit & Report Templates</div>
          <p style={{ fontSize:13, color:'#94A3B8', margin:0 }}>Tick off items as you complete them. Progress is saved automatically. Use during annual reviews, certification prep, or board reporting.</p>
        </div>
        {AUDIT_TEMPLATES.map(tmpl => {
          const checked = auditChecked[tmpl.id] || {}
          const done    = tmpl.items.filter((_,i) => checked[i]).length
          const pct     = Math.round(done / tmpl.items.length * 100)
          const isOpen  = openAudit === tmpl.id
          return (
            <div key={tmpl.id} style={S.card}>
              <div style={{ display:'flex', alignItems:'center', gap:12, cursor:'pointer', marginBottom:isOpen?12:0 }} onClick={() => setOpenAudit(isOpen ? null : tmpl.id)}>
                <span style={{ fontSize:24 }}>{tmpl.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:600 }}>{tmpl.name}</div>
                  <div style={{ fontSize:12, color:'#94A3B8' }}>{tmpl.desc}</div>
                  <div style={S.progWrap}><div style={S.progBar(pct)}/></div>
                </div>
                <div style={{ textAlign:'center', minWidth:60 }}>
                  <div style={{ fontSize:20, fontWeight:700, color:pct===100?'#22C55E':'var(--accent)' }}>{done}/{tmpl.items.length}</div>
                  <div style={{ fontSize:11, color:'#64748B' }}>done</div>
                </div>
                <span style={{ color:'#64748B' }}>{isOpen ? '▲' : '▼'}</span>
              </div>
              {isOpen && (
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:14 }}>
                  {tmpl.items.map((item,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(15,23,42,0.05)', cursor:'pointer' }}
                      onClick={() => setAuditChecked(p => ({ ...p, [tmpl.id]: { ...(p[tmpl.id]||{}), [i]: !(p[tmpl.id]||{})[i] } }))}>
                      <div style={{ width:18, height:18, borderRadius:4, border:`2px solid ${checked[i]?'var(--accent)':'rgba(255,255,255,0.09)'}`, background:checked[i]?'var(--accent)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                        {checked[i] && <span style={{ color:'#000', fontSize:11, fontWeight:700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:13, color:checked[i]?'#64748B':'var(--ink)', textDecoration:checked[i]?'line-through':'none' }}>{item}</span>
                    </div>
                  ))}
                  {pct === 100 && <div style={{ marginTop:12, padding:12, borderRadius:8, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', color:'#22C55E', fontSize:13, fontWeight:600 }}>✅ All items complete! This audit is ready for sign-off.</div>}
                </div>
              )}
            </div>
          )
        })}
      </>
    )
  }

  // ─── SCORES SUMMARY BAR ──────────────────────────────────────────────────────
  const gdprScore  = scoreOf(GDPR_CONTROLS,  'gdpr')
  const cyberScore = scoreOf(CYBER_CONTROLS, 'cyber')
  const isoScore   = scoreOf(ISO_CONTROLS,   'iso')
  const overall    = Math.round((gdprScore + cyberScore + isoScore) / 3)

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div style={S.heroInner}>
          <h1 style={{ fontSize:28, fontWeight:700, margin:'0 0 4px', color:'var(--ink)' }}>🏛️ GRC Platform</h1>
          <p style={{ fontSize:14, color:'#94A3B8', margin:'0 0 16px' }}>UK GDPR · Cyber Essentials · ISO 27001 · NCSC · ICO · NHS DSPT · Risk Register</p>

          {/* Score summary strip */}
          <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
            {[['Overall', overall, '#9B7BFA'], ['GDPR', gdprScore, scoreColor(gdprScore)], ['Cyber', cyberScore, scoreColor(cyberScore)], ['ISO 27001', isoScore, scoreColor(isoScore)]].map(([l,s,c]) => (
              <div key={l} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'8px 16px', minWidth:90 }}>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:20, fontWeight:700, color:c }}>{s}%</div>
              </div>
            ))}
            {risks.filter(r => r.rating === 'Critical' || r.rating === 'High').length > 0 && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'8px 16px' }}>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:2 }}>High/Critical Risks</div>
                <div style={{ fontSize:20, fontWeight:700, color:'#EF4444' }}>{risks.filter(r => r.rating === 'Critical' || r.rating === 'High').length}</div>
              </div>
            )}
          </div>

          <div style={S.tabBar}>
            {TABS.map(t => <button key={t.id} style={S.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>{t.icon} {t.label}</button>)}
          </div>
        </div>
      </div>

      <div style={S.body}>
        {activeTab === 'gdpr'       && <ControlList controls={GDPR_CONTROLS}  framework="gdpr" />}
        {activeTab === 'cyber'      && <ControlList controls={CYBER_CONTROLS} framework="cyber" />}
        {activeTab === 'iso27001'   && <ControlList controls={ISO_CONTROLS}   framework="iso" />}
        {activeTab === 'risk'       && renderRiskRegister()}
        {activeTab === 'complaints' && renderComplaints()}
        {activeTab === 'audit'      && renderAudit()}
      </div>
    </div>
  )
}
