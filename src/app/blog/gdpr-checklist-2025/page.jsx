import Link from 'next/link'
function Layout({meta,children}) {
  return (<><section style={{padding:'56px 0 32px',background:'var(--white)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--green)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'var(--green-p)',color:'var(--green)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)
}
const s={h2:{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',margin:'32px 0 10px'},p:{marginBottom:16,color:'#2C3830',fontSize:15,lineHeight:1.8}}
export default function Article() {
  return <Layout meta={{cat:'GDPR',date:'15 Jan 2025',read:'8 min',title:'The 2025 GDPR Compliance Checklist for UK SMEs'}}>
    <p style={s.p}>If you run a website that collects any personal data from UK or EU residents — an email address, a name, an IP address — you are subject to GDPR or UK GDPR. This checklist covers the 12 core things every SME must have in place.</p>
    <h2 style={s.h2}>1. Establish a lawful basis for every type of data processing</h2>
    <p style={s.p}>Under GDPR Article 6, you need a lawful basis for each processing activity. The six lawful bases are: consent, contract, legal obligation, vital interests, public task, and legitimate interests. Most SMEs rely on consent (for marketing) and contract (for order fulfilment).</p>
    <h2 style={s.h2}>2. Publish a compliant privacy policy</h2>
    <p style={s.p}>Your privacy policy must tell users: who you are, what data you collect, why you collect it, the lawful basis, who you share it with, how long you keep it, and their rights. A copy-pasted template is not enough — it must reflect what your website actually does.</p>
    <h2 style={s.h2}>3. Get proper cookie consent</h2>
    <p style={s.p}>Under the UK ePrivacy Regulations, you must get consent before setting any non-essential cookies. This means: no pre-ticked boxes, clear accept and reject options, and no cookies loading before consent is given.</p>
    <h2 style={s.h2}>4. Secure your contact and lead capture forms</h2>
    <p style={s.p}>Every form that collects personal data needs a privacy notice explaining how the data will be used. A short sentence with a link to your privacy policy is sufficient at the point of collection.</p>
    <h2 style={s.h2}>5. Sign Data Processing Agreements with all third-party processors</h2>
    <p style={s.p}>If you use tools like Mailchimp, Google Analytics, HubSpot, or Stripe — any service that processes personal data on your behalf — you need a Data Processing Agreement (DPA) in place under GDPR Article 28.</p>
    <h2 style={s.h2}>6. Create a process for Data Subject Access Requests</h2>
    <p style={s.p}>Any individual can request a copy of all personal data you hold about them. You have one calendar month to respond. Document your process before requests arrive.</p>
    <h2 style={s.h2}>7. Establish a data breach response plan</h2>
    <p style={s.p}>If you suffer a personal data breach, you must notify the ICO within 72 hours if it is likely to result in a risk to individuals. Have a plan in place before a breach happens.</p>
    <h2 style={s.h2}>8. Only collect data you actually need</h2>
    <p style={s.p}>Data minimisation under GDPR Article 5 requires you to only collect personal data that is adequate, relevant, and limited to what is necessary. Audit your forms and remove fields you do not genuinely need.</p>
    <h2 style={s.h2}>9. Define and document data retention periods</h2>
    <p style={s.p}>You cannot keep personal data indefinitely. Specify in your privacy policy how long you keep each category of data. Common periods: customer data 6 years (tax), marketing lists until consent withdrawn, job applications 6-12 months.</p>
    <h2 style={s.h2}>10. Secure personal data appropriately</h2>
    <p style={s.p}>GDPR requires appropriate technical and organisational measures. At minimum: use HTTPS, use strong passwords and two-factor authentication, encrypt sensitive data at rest, and limit who can access personal data.</p>
    <div style={{background:'var(--green-p)',border:'1px solid var(--green-m)',borderRadius:14,padding:'22px 24px',margin:'32px 0'}}>
      <strong style={{color:'var(--green)',display:'block',marginBottom:8}}>Check your compliance score in 60 seconds</strong>
      <p style={{fontSize:14,color:'var(--ink2)',marginBottom:14}}>AlgoGrass scans your website and checks it against these requirements automatically. Get your free compliance report now.</p>
      <a href="/scan" className="btn btn-primary btn-sm">Scan my website free →</a>
    </div>
    <p style={{fontSize:12,color:'var(--ink2)',fontStyle:'italic'}}>This article is for guidance only and does not constitute legal advice. Consult a qualified solicitor for advice specific to your situation.</p>
  </Layout>
}
