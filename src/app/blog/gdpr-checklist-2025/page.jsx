'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children,n})=><h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:13,fontWeight:800,color:'var(--accent)',background:'rgba(0,212,170,0.1)',border:'1px solid rgba(0,212,170,0.25)',borderRadius:8,padding:'2px 10px',fontFamily:'Syne,sans-serif'}}>{n}</span>{children}</h2>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Check=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'8px 0 8px 28px',position:'relative',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{position:'absolute',left:0,color:'var(--accent)',fontSize:16}}>☐</span>{t}</li>)}</ul>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(0,212,170,0.07)',border:'rgba(0,212,170,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'#F59E0B'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(0,212,170,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(0,212,170,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function GdprChecklist(){
  return(
    <Layout meta={{cat:'GDPR',date:'15 Jan 2025',read:'8 min',title:'The 2025 GDPR Compliance Checklist for UK SMEs'}}>
      <P>If your website collects any personal data from UK or EU residents — an email address, a name, an IP address tracked by analytics — you are subject to UK GDPR. Non-compliance carries fines of up to £17.5 million or 4% of global turnover, and the ICO is increasingly active against SMEs. This checklist covers the 12 things every UK small business must have in place.</P>
      <Callout>This checklist covers UK GDPR under the Data Protection Act 2018. EU GDPR applies if you also process data from EU residents. The requirements are nearly identical — see our UK GDPR vs EU GDPR article for the differences.</Callout>

      <H2 n="1">Establish a lawful basis for every processing activity</H2>
      <P>Under UK GDPR Article 6, every processing activity must have a lawful basis. You cannot collect or use personal data just because it would be useful. The six bases are: consent, contract, legal obligation, vital interests, public task, and legitimate interests. Most SMEs use consent (for marketing), contract (for order fulfilment and customer accounts), and legitimate interests (for fraud prevention, security).</P>
      <P>Document your lawful bases in a Records of Processing Activities (ROPA) — even a simple spreadsheet counts. This is a legal requirement under Article 30 for organisations with 250 or more employees, and best practice for all.</P>
      <Check items={[
        'Identified and documented the lawful basis for each type of data processing',
        'Ensured consent is freely given, specific, informed, and unambiguous where used as the basis',
        'Created or updated Records of Processing Activities (ROPA)',
      ]}/>

      <H2 n="2">Publish a compliant privacy policy</H2>
      <P>A template privacy policy that doesn't reflect what your website actually does is not compliant. Your privacy notice must cover: who you are and contact details, what data you collect, the lawful basis for each use, who you share data with (including processors), how long you keep it, users' rights and how to exercise them, and your ICO registration number if applicable.</P>
      <Check items={[
        'Privacy policy published and linked from website footer',
        'Policy reflects actual data processing (not a generic template)',
        'ICO registration number included (if required to register)',
        'Policy updated when you change tools or processes',
      ]}/>

      <H2 n="3">Implement proper cookie consent</H2>
      <P>Under PECR (UK) and UK GDPR, you must get consent before setting non-essential cookies. This means no cookies loading before consent is given, no pre-ticked boxes, and a real reject option that is at least as easy to use as the accept button.</P>
      <P>Google Analytics, Meta Pixel, Hotjar, and most advertising tags are non-essential and require consent. Essential cookies (session, security, load-balancing) do not require consent but must be disclosed.</P>
      <Check items={[
        'Cookie banner present and blocks non-essential cookies before consent',
        'Reject option is equally prominent to Accept',
        'Users can change their preferences at any time',
        'No cookies set from third-party scripts before consent is given',
      ]}/>
      <Callout type="warn">The ICO\'s own cookie compliance tool found that over 80% of websites tested failed basic PECR requirements. Banners that hide reject options, use dark patterns, or load analytics before consent are a common enforcement target.</Callout>

      <H2 n="4">Add privacy notices to all data collection forms</H2>
      <P>Every form that collects personal data — contact forms, newsletter sign-ups, checkout forms, booking forms — must include a concise privacy notice at the point of collection. This doesn't need to be lengthy: a single sentence explaining how the data will be used, with a link to your full privacy policy, is typically sufficient.</P>
      <Check items={[
        'All contact and lead-capture forms include a privacy notice',
        'Marketing opt-in is separate and uses positive, unticked consent',
        'Checkout and account forms link to privacy policy',
      ]}/>

      <H2 n="5">Sign Data Processing Agreements with all processors</H2>
      <P>Any third-party service that processes personal data on your behalf is a data processor, and Article 28 UK GDPR requires a Data Processing Agreement (DPA) to be in place. This includes email marketing platforms, cloud hosting, CRM, analytics, customer support tools, payroll software, and accounting systems.</P>
      <P>Most major providers have a DPA available — often called a Data Processing Addendum. Many can be accepted within your account settings or by ticking a box during signup. Ensure you have actually signed or accepted these, not just noted that they exist.</P>
      <Check items={[
        'Listed all third-party tools that process personal data',
        'Confirmed DPA is in place for each processor',
        'Noted which tools are sub-processors of other tools (e.g. AWS used by your SaaS provider)',
      ]}/>

      <H2 n="6">Build a process for Data Subject Access Requests</H2>
      <P>Any individual can request a copy of all personal data you hold about them. Under UK GDPR, you must respond within one calendar month at no charge (unless requests are manifestly unfounded or excessive). You must also be able to respond to requests for erasure, rectification, portability, and restriction.</P>
      <Check items={[
        'Designated a contact point for data subject requests (email address or form)',
        'Documented how to locate all personal data across systems',
        'Process in place to respond within 30 days',
        'Privacy policy explains rights and how to exercise them',
      ]}/>

      <H2 n="7">Establish a data breach response procedure</H2>
      <P>If you suffer a personal data breach — a cyber attack, accidental disclosure, loss of a device containing personal data — you must notify the ICO within 72 hours if the breach is likely to result in a risk to individuals' rights and freedoms. If the risk is high, you must also notify affected individuals directly.</P>
      <Check items={[
        'Defined what constitutes a reportable breach',
        'Identified who is responsible for making the ICO notification',
        'ICO reporting portal bookmarked: ico.org.uk/make-a-complaint',
        'Staff trained to recognise and escalate potential breaches',
      ]}/>

      <H2 n="8">Apply data minimisation across all collection points</H2>
      <P>Article 5(1)(c) UK GDPR requires you to collect only data that is adequate, relevant, and limited to what is necessary for the stated purpose. Review every form on your website and ask: do you genuinely use each field?</P>
      <Check items={[
        'Audited all forms and removed fields not genuinely needed',
        'Not collecting date of birth, phone numbers, or address unless required for the service',
        'Analytics configured to anonymise IP addresses where possible',
      ]}/>

      <H2 n="9">Set and document data retention periods</H2>
      <P>You cannot keep personal data indefinitely. Article 5(1)(e) requires data to be kept in a form that identifies individuals for no longer than necessary. Common retention periods for UK SMEs: customer transaction data — 6 years (HMRC requirement); marketing lists — until consent withdrawn; job applications — 6 to 12 months; CCTV footage — 28 to 31 days.</P>
      <Check items={[
        'Retention periods documented in privacy policy and ROPA',
        'Process in place to delete data when retention periods expire',
        'Email lists cleaned periodically; unsubscribes processed promptly',
      ]}/>

      <H2 n="10">Implement appropriate technical security measures</H2>
      <P>Article 32 UK GDPR requires appropriate technical and organisational security measures relative to the risk. For most SMEs this means: HTTPS across the entire website (not just checkout), strong passwords and two-factor authentication on all systems holding personal data, encryption for sensitive data at rest, and limiting staff access to personal data on a need-to-know basis.</P>
      <Check items={[
        'HTTPS enabled across entire website',
        '2FA enabled on email, CRM, hosting, and any system containing personal data',
        'Staff access to personal data is role-limited',
        'Passwords are not reused across accounts; password manager in use',
      ]}/>

      <H2 n="11">Register with the ICO if required</H2>
      <P>Most UK businesses that process personal data are required to pay the ICO data protection fee and register. The fee is £40/year for most small businesses and £60/year for medium businesses. There are exemptions for certain processing activities (e.g. purely for staff administration) but these are narrow.</P>
      <Check items={[
        'Checked whether ICO registration is required using ico.org.uk self-assessment',
        'Registered and paying annual fee if required',
        'ICO registration number included in privacy policy',
      ]}/>

      <H2 n="12">Review compliance at least annually</H2>
      <P>GDPR compliance is not a one-time task. Your website, tools, and data practices change over time, and your compliance documentation must keep pace. Set a calendar reminder to review your privacy policy, ROPA, processor list, and consent mechanisms at least once per year — and whenever you make significant changes to how you collect or use data.</P>
      <Check items={[
        'Annual compliance review scheduled',
        'Process to update policies when new tools are adopted',
        'Staff briefed on data protection responsibilities',
      ]}/>

      <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:16,padding:'28px 32px',marginTop:48,textAlign:'center'}}>
        <p style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:600,color:'var(--ink)',marginBottom:10}}>See how many of these you already pass</p>
        <p style={{fontSize:14,color:'var(--ink2)',marginBottom:20}}>AlgoGrass scans your website and gives you a compliance score against this checklist in under 60 seconds — no sign-up required.</p>
        <a href="/scan" className="btn btn-primary">Scan my website →</a>
      </div>
    </Layout>
  )
}
