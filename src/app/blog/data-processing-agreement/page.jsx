'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children})=><h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>{children}</h2>
const H3=({children})=><h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,color:'var(--ink)',marginBottom:10,marginTop:28}}>{children}</h3>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(0,212,170,0.07)',border:'rgba(0,212,170,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'var(--amber-text)'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(0,212,170,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(0,212,170,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function DataProcessingAgreement(){
  return(
    <Layout meta={{cat:'GDPR',date:'20 Feb 2025',read:'5 min',title:'When Does Your Business Need a Data Processing Agreement?'}}>
      <P>If you use any third-party tool that processes personal data on your behalf — a cloud hosting provider, an email marketing platform, a payroll system, a CRM — you almost certainly need a Data Processing Agreement (DPA) in place. This is a legal requirement under Article 28 of UK GDPR, and the absence of a DPA is routinely cited in ICO enforcement actions.</P>
      <Callout type="warn">Using Google Workspace, Mailchimp, HubSpot, AWS, Xero, or any SaaS tool that stores or processes your customers' or employees' data without a DPA in place is a GDPR violation — regardless of the size of your business.</Callout>

      <H2>Controllers vs Processors: The Key Distinction</H2>
      <P>Before understanding DPAs, you need to understand the two key roles under UK GDPR:</P>
      <H3>Data Controller</H3>
      <P>A controller decides the purposes and means of processing personal data. As a business, you are typically the controller for your customers' and employees' data. You decide what data to collect, why you collect it, and how long to keep it.</P>
      <H3>Data Processor</H3>
      <P>A processor processes personal data on behalf of a controller, strictly following the controller's instructions. Your email marketing provider, cloud hosting company, and payroll provider are processors — they access personal data you collected, but they process it on your instructions and for your purposes.</P>
      <Callout>A DPA is required whenever a controller engages a processor. It is not required between two controllers (e.g. you and a business partner who independently decides what to do with data you share), though data sharing agreements may be appropriate there instead.</Callout>

      <H2>What a DPA Must Contain</H2>
      <P>Article 28(3) UK GDPR specifies the mandatory content of a Data Processing Agreement. It must set out:</P>
      <Ul items={[
        'The subject matter and duration of the processing',
        'The nature and purpose of the processing',
        'The type of personal data involved',
        'The categories of data subjects (e.g. customers, employees, website visitors)',
        'The obligations and rights of the controller',
        'That the processor only processes data on documented instructions from the controller',
        'That persons authorised to process data are under confidentiality obligations',
        'That the processor implements appropriate security measures under Article 32',
        'That the processor does not engage sub-processors without prior written consent from the controller',
        'That the processor assists the controller in responding to data subject requests',
        'That the processor deletes or returns all personal data at the end of the contract',
        'That the processor makes available all information necessary to demonstrate compliance, and allows audits',
      ]}/>

      <H2>Which Third-Party Tools Require a DPA</H2>
      <H3>Always Requires a DPA</H3>
      <Ul items={[
        'Cloud hosting providers (AWS, Google Cloud, Azure, Vercel, Heroku)',
        'Email marketing platforms (Mailchimp, Campaign Monitor, Klaviyo)',
        'CRM systems (HubSpot, Salesforce, Zoho)',
        'Payroll and HR software (Xero, Sage, BambooHR)',
        'Analytics platforms that process personal data (Hotjar, Mixpanel)',
        'Customer support tools (Zendesk, Intercom)',
        'Accounting software that holds customer data (QuickBooks, FreeAgent)',
        'Form builders (Typeform, Jotform)',
        'Live chat tools (Drift, Tidio)',
      ]}/>
      <H3>Usually Does Not Require a DPA (But Check)</H3>
      <Ul items={[
        'Professional advisers (lawyers, accountants) — they are typically controllers in their own right',
        'Banks and payment processors — they process data for their own regulatory purposes, making them independent controllers',
        'Couriers and delivery companies — though a DPA may be appropriate if you share customer address data regularly',
      ]}/>

      <H2>How to Get a DPA in Practice</H2>
      <P>Most reputable SaaS providers have a standard DPA available. You do not always need to negotiate a bespoke document:</P>
      <Ul items={[
        'Google (Workspace, Analytics) — DPA available in your Google Admin console and via their Terms of Service',
        'Mailchimp — GDPR DPA available at mailchimp.com/legal/data-processing-addendum',
        'AWS — DPA incorporated into their Customer Agreement; sign via the AWS console',
        'HubSpot — Data Processing Addendum available in account settings',
        'Stripe — DPA incorporated into their Services Agreement',
      ]}/>
      <Callout>If a provider refuses to sign a DPA or cannot produce one, you should reconsider using that service for processing personal data of UK or EU residents. The absence of a DPA shifts liability to you.</Callout>

      <H2>Sub-Processors: The Chain of Responsibility</H2>
      <P>When your processor engages another company to help process your data (a sub-processor), they must have your consent to do so, either specific approval or a general authorisation with notification rights. As controller, you remain responsible for ensuring sub-processors also meet GDPR standards.</P>
      <P>In practice, this means checking your providers' sub-processor lists periodically, particularly for sensitive data categories.</P>

      <H2>What Happens Without a DPA</H2>
      <P>Operating without a DPA where one is required is itself a violation of Article 28 UK GDPR — separate from any underlying data breach. The ICO can issue fines, enforcement notices, and corrective orders. In practice, missing DPAs are often discovered during breach investigations, compounding the original violation.</P>

      <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:16,padding:'28px 32px',marginTop:48,textAlign:'center'}}>
        <p style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:600,color:'var(--ink)',marginBottom:10}}>Generate a Data Processing Agreement for your business</p>
        <p style={{fontSize:14,color:'var(--ink2)',marginBottom:20}}>AlgoGrass scans your website and identifies which third-party tools need DPAs — then generates the documents you need.</p>
        <a href="/scan" className="btn btn-primary">Scan my website →</a>
      </div>
    </Layout>
  )
}
