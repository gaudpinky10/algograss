'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children,n})=><h2 style={{fontFamily:'var(--f-head)',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:13,fontWeight:800,color:'var(--accent)',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:8,padding:'2px 10px',fontFamily:'var(--f-head)'}}>{n}</span>{children}</h2>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(15,23,42,0.05)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(139,92,246,0.07)',border:'rgba(139,92,246,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'#F59E0B'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
const Req=({title,desc})=><div style={{background:'rgba(15,23,42,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'18px 20px',marginBottom:12}}><div style={{fontSize:13,fontWeight:700,color:'var(--accent)',marginBottom:8}}>{title}</div><p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7,margin:0}}>{desc}</p></div>
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(139,92,246,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(139,92,246,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'var(--f-head)',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function GdprForSaas(){
  return(
    <Layout meta={{cat:'GDPR',date:'25 Mar 2025',read:'12 min',title:'GDPR for SaaS Founders: Data Protection by Design'}}>
      <P>Building a SaaS product means building a data processing business — whether you intend to or not. Every signup, every user session, every piece of usage data is personal data under UK and EU GDPR. As a founder, getting data protection right from the start is significantly cheaper than retrofitting compliance after you scale, and increasingly expected by enterprise customers during due diligence.</P>
      <P>This guide is for SaaS founders in the UK and EU building products that process user data. It covers what you must do legally, what enterprise customers will ask about, and how to build with privacy by design rather than adding compliance as an afterthought.</P>
      <Callout>Privacy by design isn't just good practice — it's a legal requirement under GDPR Article 25. Controllers must implement data protection by design and by default, integrating privacy into technical and organisational measures from the beginning.</Callout>

      <H2 n="1">Your dual role as a SaaS founder</H2>
      <P>SaaS founders sit in an unusual position under GDPR. You are typically:</P>
      <Ul items={[
        'A data controller for your own user data (names, email addresses, billing info, usage analytics of your own customers)',
        'A data processor for your customers\' data (if your product processes data that belongs to your customers\' users)',
      ]}/>
      <P>This distinction matters enormously. If you build a CRM, HR tool, or any product where your customers upload or input their own users' data, you are processing that data on behalf of your customers — making you a data processor. This means you need a Data Processing Agreement (DPA) with each customer, and your security obligations are significantly heightened.</P>
      <P>Many early-stage SaaS founders overlook this dual role and focus only on their own customer data. Enterprise customers — and increasingly mid-market buyers — will check whether you have a proper DPA available before signing.</P>

      <H2 n="2">The minimum viable compliance stack for SaaS</H2>
      <P>Before you launch, these are the non-negotiable legal requirements:</P>
      <Req title="Privacy Policy (Art. 13/14 UK GDPR)" desc="Must disclose: your identity and contact details, what data you collect, the lawful basis for each processing activity, who you share data with (including subprocessors), how long you keep data, and users' rights. A generic template that doesn't reflect your actual product is not compliant." />
      <Req title="Cookie Banner and Policy" desc="If your product website uses any non-essential cookies (analytics, marketing, A/B testing tools), you need valid consent before setting them. No pre-ticked boxes, no 'by continuing to use this site' consent. The reject option must be as easy as accept." />
      <Req title="Data Processing Agreement template" desc="If you process data on behalf of customers (i.e. their end-users' data flows through your system), you need a DPA available. Enterprise sales will stall without one. You can create one from a template — just ensure it meets Article 28 requirements." />
      <Req title="Records of Processing Activities (ROPA)" desc="Required under Article 30 if you have 250+ employees, but best practice from day one. A simple spreadsheet listing: what data you process, for what purpose, on what legal basis, who you share it with, and how long you keep it." />
      <Req title="Security measures documentation" desc="Article 32 requires 'appropriate technical and organisational measures.' For SaaS founders this means: encryption in transit and at rest, access controls, incident response plan, vulnerability management, and documented security policies." />

      <H2 n="3">Choosing the right lawful basis</H2>
      <P>Every piece of data processing needs a lawful basis under GDPR Article 6. For SaaS, the most common are:</P>
      <Ul items={[
        'Contract (Art. 6(1)(b)): processing necessary to fulfil your contract with the user — account creation, billing, delivering the service. Most core SaaS functionality falls here.',
        'Legitimate interests (Art. 6(1)(f)): security monitoring, fraud prevention, product analytics, sending service-related emails to existing customers. Requires a Legitimate Interests Assessment (LIA) and must be balanced against user rights.',
        'Consent (Art. 6(1)(a)): marketing emails, optional analytics, personalisation. Consent must be freely given, specific, and withdrawable. Don\'t use consent for processing you couldn\'t run without it — use contract or legitimate interests instead.',
        'Legal obligation (Art. 6(1)(c)): retaining financial records for HMRC, responding to law enforcement requests.',
      ]}/>
      <Callout type="warn">Consent is the most fragile lawful basis — users can withdraw it at any time, and you must stop processing immediately. Many SaaS founders default to consent because it feels "safest" — but for core product functionality, contract or legitimate interests are more appropriate and more robust.</Callout>

      <H2 n="4">Data minimisation and retention from day one</H2>
      <P>GDPR's data minimisation principle (Article 5(1)(c)) requires you to collect only data that is adequate, relevant, and limited to what is necessary. For SaaS founders, this means resisting the temptation to collect everything "in case it's useful later."</P>
      <P>Practical implementation:</P>
      <Ul items={[
        'Audit every form field on signup, onboarding, and settings pages — justify each one or remove it',
        'Review every analytics event you fire — do you need full email addresses in analytics, or just user IDs?',
        'Set deletion schedules from day one: how long do you keep inactive accounts? Free trial users who didn\'t convert? Support ticket attachments?',
        'Build soft delete first, hard delete with a schedule — data that can\'t be deleted becomes a liability at scale',
        'Consider pseudonymisation for analytics: use internal user IDs rather than email addresses in analytics events',
      ]}/>

      <H2 n="5">What enterprise customers will ask about</H2>
      <P>As you grow upmarket, enterprise buyers run vendor security and privacy assessments before signing. Typically asked in the form of a questionnaire (often a CAIQ or similar), expect questions about:</P>
      <Ul items={[
        'Data processing location: where is customer data stored? EU/UK only? Any US transfers?',
        'Subprocessors: who does your infrastructure rely on? What are their security certifications?',
        'Security certifications: SOC 2 Type II is the gold standard. ISO 27001 is expected for enterprise. Neither is required day one, but have a roadmap.',
        'Penetration testing: have you commissioned an external pentest? When? What was remediated?',
        'Data Processing Agreement: do you have a standard DPA? Can you accept customer-provided DPAs?',
        'Incident response: do you have a documented breach notification procedure? Who is your DPO or data protection contact?',
        'Data deletion: can you delete all customer data on contract termination? Within what timeframe?',
      ]}/>
      <P>You don't need SOC 2 on day one, but you should be able to answer these questions honestly and have documented policies — even simple ones — for each area. Enterprise deals have been lost at the final stage over security questionnaire responses.</P>

      <H2 n="6">Handling user rights at scale</H2>
      <P>Under UK/EU GDPR, your users have rights — to access their data, correct it, delete it, restrict processing, and receive it in a portable format. Building a process to handle these from the beginning saves significant engineering work later.</P>
      <Ul items={[
        'Right to erasure: build account deletion that actually deletes — including backups, logs (or pseudonymises), and downstream systems. Define your deletion schedule.',
        'Data subject access requests: a user can ask for all data you hold on them. Build an export mechanism early — ideally user-initiated in settings.',
        'Right to portability: provide data in machine-readable format (JSON or CSV). A data export button in account settings satisfies this for most SaaS products.',
        'Consent withdrawal: if you use consent as a lawful basis for anything, you must be able to stop processing when consent is withdrawn and document when it was withdrawn.',
      ]}/>
      <Callout>AlgoGrass includes a DSAR Handler tool that helps you manage Subject Access Requests, track response deadlines, and produce compliant responses. <a href="/dsar" style={{color:'var(--accent)'}}>View the DSAR Handler →</a></Callout>

      <H2 n="7">Privacy by design in engineering practice</H2>
      <P>GDPR Article 25 requires data protection by design and by default — meaning privacy considerations must be part of technical decision-making, not added at the end. In practice for a SaaS engineering team:</P>
      <Ul items={[
        'Default settings should be privacy-protective: analytics off by default, optional sharing requires opt-in, data retention as short as practical by default',
        'Access controls: least-privilege principle — not everyone on the team needs access to production user data. Role-based access control from the beginning.',
        'Logging decisions: log what you need for security and debugging, but avoid logging full request bodies (which may contain personal data) unless essential. Set log retention periods.',
        'Third-party integrations: every new SDK or service you add may be a new processor. Evaluate it against GDPR before adding to your codebase.',
        'Database design: consider encryption for sensitive fields (health data, financial data, etc.) at the application layer, not just disk encryption.',
        'DPIA triggers: if you\'re about to build a feature involving systematic profiling, large-scale processing of sensitive data, or tracking of individuals in public spaces, you need a Data Protection Impact Assessment first.',
      ]}/>

      <div style={{marginTop:48,padding:'24px 28px',background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:16}}>
        <p style={{fontSize:14,color:'var(--ink)',fontWeight:600,marginBottom:8}}>Check your SaaS product's GDPR compliance</p>
        <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7,marginBottom:16}}>AlgoGrass scans your product website for GDPR compliance gaps and generates the privacy policy, DPA template, and cookie policy you need. Designed for UK and EU SaaS founders.</p>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <a href="/scan" className="btn btn-primary">Scan my website free →</a>
          <a href="/dpia" className="btn btn-secondary">DPIA Wizard →</a>
        </div>
      </div>
    </Layout>
  )
}
