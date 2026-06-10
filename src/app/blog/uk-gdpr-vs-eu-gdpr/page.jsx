'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children})=><h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>{children}</h2>
const H3=({children})=><h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,color:'var(--ink)',marginBottom:10,marginTop:28}}>{children}</h3>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(0,212,170,0.07)',border:'rgba(0,212,170,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'#F59E0B'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
const CompareTable=({rows})=>(
  <div style={{overflowX:'auto',marginBottom:32}}>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
      <thead>
        <tr>
          {['Area','UK GDPR','EU GDPR'].map(h=><th key={h} style={{textAlign:'left',padding:'10px 14px',background:'var(--bg2)',color:'var(--ink)',fontFamily:'Syne,sans-serif',fontWeight:600,borderBottom:'2px solid var(--border)'}}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i)=>(
          <tr key={i} style={{background:i%2===0?'rgba(255,255,255,0.01)':'transparent'}}>
            <td style={{padding:'10px 14px',color:'var(--ink)',fontWeight:500,borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>{r[0]}</td>
            <td style={{padding:'10px 14px',color:'var(--ink2)',borderBottom:'1px solid var(--border)'}}>{r[1]}</td>
            <td style={{padding:'10px 14px',color:'var(--ink2)',borderBottom:'1px solid var(--border)'}}>{r[2]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(0,212,170,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(0,212,170,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function UkGdprVsEuGdpr(){
  return(
    <Layout meta={{cat:'UK Law',date:'12 Mar 2025',read:'9 min',title:'UK GDPR vs EU GDPR: Key Differences for UK Businesses'}}>
      <P>Since Brexit, UK data protection law has diverged from its EU equivalent. For most businesses operating solely within the UK, UK GDPR works almost identically to EU GDPR. But if you collect data from EU residents, transfer data internationally, or work with EU partners, the differences matter. This guide explains what changed, what stayed the same, and what UK businesses need to do.</P>

      <H2>Background: How the Laws Relate</H2>
      <P>UK GDPR is the domesticated version of EU GDPR, brought into UK law by the Data Protection Act 2018 and retained under the European Union (Withdrawal) Act 2018. At the point of Brexit (31 December 2020), the UK copied the EU GDPR text wholesale into UK law and gave the ICO (Information Commissioner's Office) the role previously held by EU supervisory authorities.</P>
      <P>The two regimes are therefore closely aligned — the same definitions, the same legal bases, the same data subject rights, and the same general structure. But they are now separate legal instruments that can diverge over time.</P>
      <Callout>The UK retained an adequacy decision from the EU in June 2021, meaning UK organisations can continue to receive personal data from the EU/EEA without needing additional safeguards — for now. This decision is subject to review.</Callout>

      <H2>Quick Comparison Table</H2>
      <CompareTable rows={[
        ['Governing law','UK GDPR + DPA 2018','EU GDPR (Regulation 2016/679)'],
        ['Supervisory authority','ICO (UK)','Lead SA in member state; EDPB for cross-border'],
        ['EU adequacy status','Adequate (since June 2021, under review)','N/A — governs EU transfers out'],
        ['Data transfer mechanism (to third countries)','IDTAs / SCCs (UK version)','SCCs (EU version) / BCRs / adequacy decisions'],
        ['Representative requirement','EU Rep required if targeting EU residents','UK Rep required if targeting UK residents'],
        ['Maximum fines','£17.5m or 4% global turnover','€20m or 4% global turnover'],
        ['Cookie rules','PECR (UK) — applies alongside UK GDPR','ePrivacy Directive — applies alongside EU GDPR'],
        ['Lawful basis for processing','Same 6 bases as EU GDPR','Same 6 bases'],
        ['DPA / ROPA requirements','Identical to EU GDPR','Identical to UK GDPR'],
        ['Data subject rights','Identical — access, erasure, portability, etc.','Identical'],
      ]}/>

      <H2>Key Differences in Detail</H2>

      <H3>1. Data Transfers: IDTAs Replace SCCs</H3>
      <P>Under EU GDPR, organisations use Standard Contractual Clauses (SCCs) for transferring personal data to third countries without adequacy decisions. These are approved by the European Commission. After Brexit, the EU's SCCs no longer work for transfers under UK GDPR.</P>
      <P>The UK introduced its own equivalent: International Data Transfer Agreements (IDTAs) and an International Data Transfer Addendum (Addendum) that can be bolted onto EU SCCs. If you transfer data from the UK to the US, India, or any country without a UK adequacy decision, you need an IDTA (or Addendum) rather than EU SCCs.</P>
      <Callout type="warn">UK organisations that relied solely on EU SCCs for international transfers must switch to the UK IDTA or the UK Addendum. EU SCCs do not satisfy UK GDPR requirements for UK-originating transfers.</Callout>

      <H3>2. EU Representative Requirement</H3>
      <P>If your UK business offers goods or services to EU residents, or monitors their behaviour (through analytics, cookies, etc.), you fall within the territorial scope of EU GDPR — not just UK GDPR. In that case, you are also required to appoint an EU Representative: a person or company established in an EU member state who can act as your contact point for EU data subjects and supervisory authorities.</P>
      <P>Similarly, EU businesses without a UK establishment that target UK residents must appoint a UK Representative under UK GDPR.</P>
      <Ul items={[
        'EU Representative required if you process EU residents\' data and have no EU establishment',
        'Exemption: businesses whose processing is occasional, low-risk, and does not involve sensitive data',
        'Failure to appoint a Rep is itself an infringement of Art. 27 — the ICO and EU SAs have fined organisations for this alone',
      ]}/>

      <H3>3. Supervisory Authority and Enforcement</H3>
      <P>Under EU GDPR, a business established in one EU member state benefits from the one-stop-shop mechanism: a single lead supervisory authority handles cross-border processing cases. UK businesses are no longer in this system. If you have a UK establishment and process data across the EU, you may face multiple EU supervisory authorities — whichever is competent in the member states where you process data.</P>
      <P>For UK-only processing, the ICO remains your single regulator. The ICO's fine maxima are set in GBP: up to £17.5 million or 4% of global annual turnover for the most serious violations.</P>

      <H3>4. Cookie Consent: PECR vs ePrivacy Directive</H3>
      <P>In the EU, cookie consent sits under the ePrivacy Directive (soon to be replaced by the ePrivacy Regulation). In the UK, it sits under PECR — the Privacy and Electronic Communications Regulations 2003, which predates GDPR and has been retained and updated. The practical obligations are very similar: you need freely given, informed, unambiguous consent before setting non-essential cookies. However, PECR is UK-specific and the ICO is the enforcing authority.</P>
      <P>One practical difference: the UK is currently reviewing PECR, and future reforms may move the UK's cookie rules away from the EU's direction. UK businesses should monitor ICO guidance rather than assuming EU cookie rulings directly apply.</P>

      <H3>5. UK GDPR Reform: Data (Use and Access) Act 2025</H3>
      <P>The Data (Use and Access) Act 2025 received Royal Assent on 19 June 2025, with key data protection provisions coming into force on 5 February 2026. This further distinguishes UK data protection law from EU GDPR. Key changes include:</P>
      <Ul items={[
        'Recognised Legitimate Interests (RLI) — a new category allowing processing for specified purposes (e.g. national security, crime prevention, direct marketing) without a balancing test',
        'Subject Access Requests — searches need only be "reasonable and proportionate"; organisations can pause the clock to request clarification',
        'A new framework for automated decision-making',
        'Cookie consent — low-risk cookies (e.g. analytics) may be permitted without explicit consent provided users can opt out',
        'Children'''s data — new requirements for online services likely accessed by children, requiring higher data protection standards',
      ]}/>
      <Callout type="warn">The Data (Use and Access) Act 2025 changes are significant. UK businesses should review their SAR processes, cookie consent approach, and legitimate interests documentation. The EU has signalled these changes could affect the UK adequacy decision.</Callout>

      <H2>What UK Businesses with EU Customers Must Do</H2>
      <Ul items={[
        'Appoint an EU Representative if you collect data from EU residents and have no EU office',
        'Ensure your privacy notice covers both UK GDPR and EU GDPR obligations — the requirements are nearly identical so one notice usually suffices',
        'Use UK IDTAs (not EU SCCs) for transfers from the UK to third countries',
        'Use EU SCCs for any data flows from the EU to third countries (this is the EU entity\'s responsibility, but your contracts must reflect it)',
        'Register with ICO as required under UK GDPR',
        'Be aware that EU supervisory authorities can investigate you directly for EU GDPR breaches',
      ]}/>

      <H2>What Stays the Same</H2>
      <P>The overwhelming majority of day-to-day compliance is identical between UK GDPR and EU GDPR:</P>
      <Ul items={[
        'All six lawful bases for processing (consent, contract, legal obligation, vital interests, public task, legitimate interests)',
        'All eight data subject rights (access, rectification, erasure, restriction, portability, objection, automated decisions, information)',
        'Data processing agreements (Article 28)',
        'Records of processing activities (Article 30)',
        'Privacy by design and default (Article 25)',
        'Data breach notification — 72-hour rule to ICO / relevant SA',
        'Data Protection Impact Assessments (DPIAs)',
        'Rules on sensitive/special category data',
        'Children\'s data protections',
        'Principles of lawfulness, fairness, transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity and confidentiality',
      ]}/>

      <H2>Summary: Dual Compliance for UK–EU Businesses</H2>
      <P>UK businesses that process data from EU residents effectively need to comply with both UK GDPR and EU GDPR. In practice, this means a compliant UK GDPR programme satisfies approximately 95% of EU GDPR requirements. The gaps are mainly around appointing an EU Representative, using the correct transfer mechanisms (IDTAs for UK-origin transfers, EU SCCs for EU-origin transfers), and monitoring EU supervisory authority guidance alongside ICO guidance.</P>
      <P>The adequacy decision gives UK organisations a significant advantage — they can receive data from EU organisations without additional safeguards. But this is not guaranteed to last indefinitely, particularly in light of the Data (Use and Access) Act 2025 reforms.</P>

      <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:16,padding:'28px 32px',marginTop:48,textAlign:'center'}}>
        <p style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:600,color:'var(--ink)',marginBottom:10}}>Check your UK and EU GDPR compliance in one scan</p>
        <p style={{fontSize:14,color:'var(--ink2)',marginBottom:20}}>AlgoGrass analyses your website, identifies gaps across both regimes, and generates the documents and policies you need.</p>
        <a href="/scan" className="btn btn-primary">Scan my website →</a>
      </div>
    </Layout>
  )
}
