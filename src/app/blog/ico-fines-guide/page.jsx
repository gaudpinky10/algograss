'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children})=><h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>{children}</h2>
const H3=({children})=><h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,color:'var(--ink)',marginBottom:10,marginTop:28}}>{children}</h3>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(0,212,170,0.07)',border:'rgba(0,212,170,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'var(--amber-text)'},danger:{bg:'rgba(239,68,68,0.08)',border:'rgba(239,68,68,0.3)',text:'var(--red-text)'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
const FineCard=({company,fine,reason,year})=><div style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:12,padding:'16px 20px',marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}><span style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:600,color:'var(--ink)'}}>{company}</span><span style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:700,color:'var(--red-text)'}}>{fine}</span></div><p style={{fontSize:13,color:'var(--ink2)',margin:0,lineHeight:1.6}}>{reason} <span style={{color:'var(--ink2)',opacity:0.5}}>· {year}</span></p></div>
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(0,212,170,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(0,212,170,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function IcoFinesGuide(){
  return(
    <Layout meta={{cat:'Compliance',date:'12 Feb 2025',read:'7 min',title:'Understanding ICO Fines: What Gets UK Businesses Fined?'}}>
      <P>The Information Commissioner's Office has fined organisations hundreds of millions of pounds since UK GDPR took effect. While headlines focus on household names, the ICO regularly investigates and fines small and medium businesses. Understanding what triggers an investigation — and how fines are calculated — is essential for any UK business handling personal data.</P>
      <Callout type="danger">The ICO can fine organisations up to £17.5 million or 4% of global annual turnover (whichever is higher) for serious violations. For less serious breaches, fines can reach £8.7 million or 2% of turnover.</Callout>

      <H2>The Two Tiers of ICO Fines</H2>
      <P>UK GDPR establishes two tiers of financial penalties, mirroring the EU GDPR structure:</P>
      <H3>Tier 1 — Up to £8.7 million (or 2% of global turnover)</H3>
      <Ul items={['Failure to implement appropriate technical and organisational security measures','Not having a Data Processing Agreement with subprocessors','Failing to notify the ICO of a data breach within 72 hours','Not maintaining required records of processing activities','Processing children\'s data without age-appropriate safeguards']}/>
      <H3>Tier 2 — Up to £17.5 million (or 4% of global turnover)</H3>
      <Ul items={['Processing data without a lawful basis','Violating the fundamental principles of GDPR (lawfulness, fairness, transparency)','Failing to respect data subject rights (ignoring access requests, refusing erasure)','Transferring data to a third country without adequate safeguards','Processing special category data without meeting the additional conditions']}/>

      <H2>Real ICO Enforcement Cases: What Actually Gets Fined</H2>
      <FineCard company="British Airways" fine="£20 million" reason="Failure to implement appropriate technical security measures, resulting in a breach affecting 400,000 customers. Payment data was scraped by attackers over several months." year="2020"/>
      <FineCard company="Marriott International" fine="£18.4 million" reason="Inadequate security measures following acquisition of Starwood Hotels, where attackers had been in the system for four years before discovery." year="2020"/>
      <FineCard company="Clearview AI" fine="£7.5 million (disputed)" reason="ICO fined Clearview for scraping biometric data of UK residents without lawful basis. The fine was initially overturned by the First-tier Tribunal in 2023, but the Upper Tribunal upheld the ICO's appeal in October 2025. Case ongoing." year="2022–2025"/>
      <FineCard company="TikTok" fine="£12.7 million" reason="Processing personal data of children under 13 without parental consent, failing to use children's data transparently." year="2023"/>
      <FineCard company="Advanced Computer Software" fine="£3.07 million" reason="Ransomware attack that disrupted NHS services. Insufficient security controls including MFA not applied consistently." year="2024"/>

      <H2>What the ICO Investigates Most Often</H2>
      <P>The ICO publishes its enforcement priorities and case outcomes. The most common triggers for investigation include:</P>
      <H3>1. Data Breaches — the 72-Hour Rule</H3>
      <P>Any personal data breach that is likely to result in a risk to individuals must be reported to the ICO within 72 hours of you becoming aware of it (Article 33). Breaches that pose a high risk to individuals must also be communicated directly to those affected (Article 34). Late reporting significantly increases the severity of any sanction.</P>
      <H3>2. Marketing Violations</H3>
      <P>Sending unsolicited marketing emails or texts is one of the most common complaints the ICO receives. Under PECR, you must have specific prior consent for electronic marketing. The ICO regularly fines companies for buying email lists, continuing to market to people who have unsubscribed, and sending marketing without a lawful basis.</P>
      <H3>3. Cookie Consent Failures</H3>
      <P>The ICO's ongoing cookie sweep programme actively checks UK websites. Setting analytics or advertising cookies before obtaining consent is a routine enforcement action. Unlike major breaches, cookie violations are often resolved through formal notices and fines without requiring a data breach.</P>
      <H3>4. Ignoring Data Subject Requests</H3>
      <P>Failing to respond to a Subject Access Request within one month, refusing a legitimate erasure request, or failing to provide data in a portable format are all enforceable violations. Many ICO complaints come directly from individuals whose requests were ignored.</P>

      <H2>How the ICO Decides the Fine Amount</H2>
      <P>The ICO considers multiple factors when setting a fine. These include:</P>
      <Ul items={['The nature, gravity, and duration of the infringement','Whether the breach was intentional or negligent','Actions taken to mitigate the damage','The degree of responsibility — were reasonable measures in place?','How cooperative the organisation was during the investigation','The categories of personal data affected (health, financial, children\'s data = higher)','The number of people affected','Whether the organisation had previous violations','The financial position of the organisation — ability to pay']}/>
      <Callout>Small businesses can expect lower fines than large corporations for the same violation — the ICO explicitly considers proportionality and ability to pay. However, "we are a small business" is not a defence against enforcement.</Callout>

      <H2>How to Reduce Your Risk of ICO Enforcement</H2>
      <Ul items={['Conduct a data audit — know exactly what personal data you hold, why, and for how long','Have a lawful basis for every processing activity — document it in writing','Implement appropriate security: encryption, access controls, MFA, regular backups','Have a documented breach response plan — know your 72-hour duty before a breach happens','Respond to data subject requests within one month — have a process in place','Only send marketing to people who have clearly opted in','Have Data Processing Agreements with every third-party processor','Train staff who handle personal data','Register with the ICO — most organisations must pay the data protection fee (£40-£2,900/year)']}/>

      <H2>Must You Register with the ICO?</H2>
      <P>Most organisations that process personal data must pay a data protection fee to the ICO annually. Failure to do so is itself an offence. The fee ranges from £40 (micro-organisations) to £2,900 (large organisations). Check ico.org.uk/registration to see if your organisation is exempt.</P>

      <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:16,padding:'28px 32px',marginTop:48,textAlign:'center'}}>
        <p style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:600,color:'var(--ink)',marginBottom:10}}>Find out if your business is at risk</p>
        <p style={{fontSize:14,color:'var(--ink2)',marginBottom:20}}>AlgoGrass identifies the exact GDPR issues that lead to ICO enforcement and shows you how to fix them.</p>
        <a href="/scan" className="btn btn-primary">Check my compliance risk →</a>
      </div>
    </Layout>
  )
}
