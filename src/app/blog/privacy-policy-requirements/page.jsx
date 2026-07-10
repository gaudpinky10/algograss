'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children})=><h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>{children}</h2>
const H3=({children})=><h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,color:'var(--ink)',marginBottom:10,marginTop:28}}>{children}</h3>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(15,23,42,0.05)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Reg=({art,children})=><span style={{display:'inline-block',fontSize:11,fontWeight:600,background:'rgba(124,58,237,0.12)',color:'#A78BFA',padding:'2px 8px',borderRadius:6,marginLeft:6,border:'1px solid rgba(124,58,237,0.2)'}}>{art}</span>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(139,92,246,0.07)',border:'rgba(139,92,246,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'var(--amber-text)'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(139,92,246,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(139,92,246,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function PrivacyPolicyRequirements(){
  return(
    <Layout meta={{cat:'GDPR',date:'5 Feb 2025',read:'10 min',title:'What Must Be in Your Privacy Policy Under GDPR'}}>
      <P>A privacy policy is not a formality — it is a legal requirement under GDPR Articles 13 and 14, and it must contain specific information written in plain, clear language. A vague or boilerplate document does not satisfy the law. This guide covers every element your privacy policy must include, with plain-English explanations of why each is required.</P>
      <Callout>GDPR requires your privacy notice to be provided at the time personal data is collected — not buried in a link nobody clicks. Both Articles 13 and 14 apply: Art. 13 covers data collected directly from individuals; Art. 14 covers data obtained indirectly.</Callout>

      <H2>1. Who You Are — Controller Identity <Reg art="Art. 13(1)(a)"/></H2>
      <P>Your privacy policy must clearly state the name and contact details of the data controller — the organisation responsible for deciding how personal data is used. If you have appointed a Data Protection Officer, their contact details must be included separately.</P>
      <Ul items={['Full legal name of your company or organisation','Registered address','Email address or contact form URL','DPO contact details, if you have appointed one (required for public authorities and some businesses)','If you are outside the UK/EU but process data of UK/EU residents, you must name your UK/EU representative']}/>

      <H2>2. What Data You Collect and Why — Purposes <Reg art="Art. 13(1)(c)"/></H2>
      <P>You must explain every purpose for which you process personal data. Generic statements like "to improve our services" are not sufficient. Each purpose must be specific enough that the person reading it can understand exactly what you are doing with their data.</P>
      <H3>Examples of acceptable purpose descriptions:</H3>
      <Ul items={['To process and fulfil orders placed on our website, including sending order confirmations and shipping updates','To send marketing emails to customers who have opted in, using Mailchimp as our email service provider','To analyse website traffic using Google Analytics to understand which pages are most visited — no personal profiles are built','To detect and prevent fraud on our payment systems','To comply with our legal obligation to retain financial records for six years under the Companies Act']}/>

      <H2>3. Your Legal Basis for Processing <Reg art="Art. 13(1)(c)"/></H2>
      <P>For every processing activity, you must state which of the six lawful bases under Article 6 you are relying on. This is one of the most commonly missing elements in UK SME privacy policies.</P>
      <Ul items={['Consent — the individual has given clear, specific, freely given consent. Must be withdrawable at any time.','Contract — processing is necessary to perform a contract with the individual, or to take pre-contractual steps at their request.','Legal obligation — you are required by law to process the data (e.g. HMRC payroll records, right-to-work checks).','Vital interests — to protect someone\'s life in an emergency. Rarely applicable for most businesses.','Public task — for public authorities or organisations exercising official functions.','Legitimate interests — you have a genuine, proportionate reason that is not overridden by the individual\'s rights. Requires a Legitimate Interests Assessment (LIA).']}/>
      <Callout type="warn">If you process special category data (health, ethnicity, religion, sexual orientation, biometrics), you need a lawful basis under Article 6 AND an additional condition under Article 9. State both in your privacy policy.</Callout>

      <H2>4. Who You Share Data With <Reg art="Art. 13(1)(e)"/></H2>
      <P>You must disclose every category of recipient that receives personal data. You do not need to name every individual subprocessor, but you must be specific enough to be meaningful. "Third parties" is not acceptable on its own.</P>
      <Ul items={['Payment processors (e.g. Stripe, PayPal) — for processing transactions','Email marketing platforms (e.g. Mailchimp, HubSpot) — for sending newsletters','Analytics providers (e.g. Google Analytics) — for website analytics','Cloud hosting providers (e.g. AWS, Vercel) — for storing data','Accountants or payroll providers — for financial compliance','Legal advisers — when necessary to obtain legal advice','Law enforcement or regulators — when required by law']}/>

      <H2>5. Retention Periods — How Long You Keep Data <Reg art="Art. 13(2)(a)"/></H2>
      <P>You must state how long you retain each category of personal data, or the criteria used to determine retention. "As long as necessary" without further detail is not sufficient.</P>
      <Ul items={['Customer transaction records — 7 years (Companies Act / HMRC requirement)','Marketing email list — until unsubscribe, then deleted within 30 days','Enquiry form submissions — 12 months from last contact, then deleted','Employee records — 7 years after employment ends','CCTV footage — 30 days, then overwritten automatically','Website analytics data — 26 months (Google Analytics default)']}/>

      <H2>6. Your Rights — Eight Rights Under UK GDPR <Reg art="Art. 13(2)(b)"/></H2>
      <P>Your privacy policy must inform individuals of all their rights. You must also explain how to exercise them — typically by contacting your DPO or privacy email address.</P>
      <Ul items={['Right of access (Article 15) — to request a copy of their data within 1 month','Right to rectification (Article 16) — to correct inaccurate or incomplete data','Right to erasure / right to be forgotten (Article 17) — to request deletion (subject to exemptions)','Right to restrict processing (Article 18) — to pause processing while a dispute is resolved','Right to data portability (Article 20) — to receive their data in a structured, machine-readable format','Right to object (Article 21) — to object to processing based on legitimate interests or direct marketing','Rights related to automated decision-making (Article 22) — not to be subject to solely automated decisions with significant effects','Right to withdraw consent (Article 7(3)) — at any time, without affecting the lawfulness of prior processing']}/>

      <H2>7. International Transfers <Reg art="Art. 13(1)(f)"/></H2>
      <P>If you transfer personal data outside the UK or EU — including using US-based SaaS tools like Mailchimp, Salesforce, or Google Workspace — you must disclose this and explain the safeguards in place.</P>
      <Ul items={['UK adequacy decisions — transfers to countries the ICO has deemed adequate (e.g. EU, EEA)','Standard Contractual Clauses (SCCs) — contractual safeguards between the exporter and importer','Binding Corporate Rules (BCRs) — for intra-group transfers within multinational companies','Data Privacy Framework — US-based transfers where the recipient is certified under the UK-US DPF']}/>

      <H2>8. Right to Complain to the ICO <Reg art="Art. 13(2)(d)"/></H2>
      <P>You must explicitly tell people they have the right to lodge a complaint with the Information Commissioner's Office (ICO). Include the ICO's contact details or website address.</P>
      <Callout>ICO contact: ico.org.uk · Helpline: 0303 123 1113. This information must appear in your privacy policy as a right, not hidden in small print.</Callout>

      <H2>9. Automated Decision-Making <Reg art="Art. 13(2)(f)"/></H2>
      <P>If you use any automated processes to make decisions about individuals — including profiling for credit scoring, pricing, or marketing segmentation — you must describe this, explain the logic involved, and state the significance and consequences for the individual.</P>

      <H2>10. Writing Your Privacy Policy: Practical Tips</H2>
      <Ul items={['Use plain English — the ICO explicitly requires it. Avoid legal jargon.','Use a layered approach — a short summary with expandable detail for each section','Keep it up to date — review whenever you add a new processing activity or third-party tool','Version-control your policy — keep dated copies so you can prove what version was live on any given date','Make it easy to find — link from your footer, your sign-up forms, and your cookie banner']}/>

      <div style={{background:'rgba(139,92,246,0.07)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:16,padding:'28px 32px',marginTop:48,textAlign:'center'}}>
        <p style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:600,color:'var(--ink)',marginBottom:10}}>Generate a compliant privacy policy for your website</p>
        <p style={{fontSize:14,color:'var(--ink2)',marginBottom:20}}>AlgoGrass scans your site and generates a tailored privacy policy based on what it finds — in minutes, not hours.</p>
        <a href="/scan" className="btn btn-primary">Get my privacy policy →</a>
      </div>
    </Layout>
  )
}
