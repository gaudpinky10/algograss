'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children,n})=><h2 style={{fontFamily:'var(--f-head)',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:13,fontWeight:800,color:'var(--accent)',background:'rgba(0,212,170,0.1)',border:'1px solid rgba(0,212,170,0.25)',borderRadius:8,padding:'2px 10px',fontFamily:'var(--f-head)'}}>{n}</span>{children}</h2>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(0,212,170,0.07)',border:'rgba(0,212,170,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'#F59E0B'},danger:{bg:'rgba(248,113,113,0.08)',border:'rgba(248,113,113,0.3)',text:'#F87171'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
const Case=({org,fine,issue})=><div style={{background:'rgba(248,113,113,0.06)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:12,padding:'18px 20px',marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:8,marginBottom:10}}><span style={{fontSize:14,fontWeight:700,color:'var(--ink)'}}>{org}</span><span style={{fontSize:13,fontWeight:800,color:'#F87171',fontFamily:'var(--f-num)'}}>{fine}</span></div><p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7,margin:0}}>{issue}</p></div>
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(0,212,170,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(0,212,170,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'var(--f-head)',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function IcoEnforcement2025(){
  return(
    <Layout meta={{cat:'Compliance',date:'18 Mar 2025',read:'9 min',title:'ICO Enforcement in 2024–25: Key Lessons for UK SMEs'}}>
      <P>The Information Commissioner's Office (ICO) issued over £9 million in fines during 2024, with actions ranging from household-name corporations to small and mid-sized businesses. The consistent thread: failure to implement basic data protection principles, poor cookie consent, and inadequate security measures. Here's what UK small businesses can learn.</P>
      <Callout type="danger">The ICO has explicitly stated that size is not a defence. Sole traders and micro-businesses have received enforcement notices and fines. If you collect personal data, GDPR obligations apply to you regardless of company size.</Callout>

      <H2 n="1">Notable ICO enforcement actions 2024–25</H2>
      <P>These cases illustrate the patterns in ICO enforcement and the specific failures that trigger action:</P>
      <Case org="Software company (name withheld)" fine="£350,000" issue="Sent 107 million unsolicited marketing emails. The company had no valid consent from recipients and failed to provide an easy opt-out mechanism. Fine issued under PECR (Privacy and Electronic Communications Regulations)." />
      <Case org="NHS Trust" fine="£200,000" issue="Emailed sensitive personal data (patient medical information) to wrong recipients on multiple occasions. ICO cited failure to implement adequate technical measures — a basic access control issue." />
      <Case org="Law firm (SME)" fine="£60,000" issue="Cyber attack resulted in client data exposure. ICO investigation found the firm had not implemented multi-factor authentication, used outdated software, and had no documented incident response plan." />
      <Case org="Marketing company" fine="£140,000" issue="Purchased marketing lists without verifying that individuals had given valid consent. Relied on consent claimed by the list vendor without independently checking consent records." />
      <P>The SME law firm case is particularly instructive: the fine was not for the attack itself, but for failing to have reasonable security measures in place. The ICO's test is whether you took appropriate steps for the risk — not whether a breach happened.</P>

      <H2 n="2">What the ICO is actively targeting</H2>
      <P>Based on ICO enforcement notices, reprimands, and public guidance issued in 2024–25, these are the areas under active scrutiny:</P>
      <Ul items={[
        'Cookie consent: banners that pre-tick analytics and marketing cookies, hide reject options, or use dark patterns to nudge acceptance. The ICO sent formal notices to several major news publishers in 2024.',
        'Marketing emails without valid consent: purchasing lists, using "soft opt-in" without understanding the rules, sending to contacts who haven\'t consented to email marketing.',
        'Inadequate security: no MFA on admin accounts, unpatched software, no data encryption at rest, no security incident response plan.',
        'Failure to respond to DSARs (Subject Access Requests): missing the one-month deadline, providing incomplete responses, or charging fees where none are permitted.',
        'Unlawful retention: keeping customer data indefinitely with no deletion schedule or documented retention policy.',
        'Privacy notices: missing or inadequate notices that don\'t reflect actual data processing, or using generic templates without customisation.',
      ]}/>

      <H2 n="3">The ICO's approach to SMEs</H2>
      <P>The ICO has published guidance on its approach to smaller organisations. In practice, the Commissioner uses a range of tools beyond fines — reprimands, enforcement notices, and published case summaries — that damage reputation even without a financial penalty.</P>
      <P>The ICO typically investigates following a complaint from a data subject, a mandatory breach notification, or proactive sweeps (such as cookie compliance audits across specific sectors). You do not need to be the subject of a large breach for an investigation to begin — a single complaint about an unlawful marketing email is sufficient to trigger a case.</P>
      <Callout type="warn">The ICO publishes all enforcement actions on its website, including the name of the organisation and the specific breach. Reputational damage from being named in an ICO enforcement notice often exceeds the financial cost for smaller businesses. Customers, partners, and investors check the register.</Callout>

      <H2 n="4">The five most common SME compliance failures</H2>
      <Ul items={[
        '1. Cookie banners that don\'t actually block cookies before consent — analytics scripts load before the user clicks anything. Technically illegal, common, and increasingly enforced.',
        '2. Privacy policies copied from templates that don\'t reflect actual data processing. Your policy must accurately describe your specific tools, purposes, and lawful bases.',
        '3. No Data Processing Agreements with processors — if you use Mailchimp, HubSpot, Xero, or any SaaS tool, you need a DPA. Most providers offer one but you must accept it.',
        '4. DSAR requests ignored or delayed past 30 days. Any individual can ask for all data you hold on them — you must respond within one calendar month.',
        '5. No documented retention and deletion schedule. "We keep it forever" is not a lawful retention period. You need a documented schedule and you need to follow it.',
      ]}/>

      <H2 n="5">How to reduce your ICO risk</H2>
      <Ul items={[
        'Scan your website: use a real scanning tool that checks what scripts load before cookie consent is given. Browser developer tools alone won\'t catch everything.',
        'Review your cookie banner: ensure the reject option is as prominent as accept, and nothing loads before consent is given.',
        'Check your privacy policy covers your actual tools and processing — not just generic categories.',
        'Audit your processor list: every SaaS tool that touches personal data needs a DPA. Go through your subscriptions and check.',
        'Set up a DSAR process: know where data is held, designate someone to handle requests, set a calendar reminder to respond within 30 days.',
        'Implement basic security hygiene: MFA on all admin accounts, password manager, encrypted backups, basic incident response plan.',
        'Document everything: the ICO responds well to evidence of good faith efforts to comply. A documented compliance programme, even if imperfect, demonstrates accountability.',
      ]}/>
      <Callout>AlgoGrass performs a live scan of your website to identify the compliance gaps most likely to attract ICO attention — cookie consent failures, missing privacy notices, data form issues, and HTTPS problems. <a href="/scan" style={{color:'var(--accent)'}}>Run a free scan →</a></Callout>

      <H2 n="6">If you receive an ICO complaint or investigation</H2>
      <P>If the ICO contacts you, respond promptly and cooperatively. The ICO's enforcement guidance emphasises that voluntary cooperation and swift remediation are mitigating factors in penalty decisions. A fine that might be £200,000 in an egregious case may be reduced significantly where the organisation demonstrates genuine efforts to comply and remediate.</P>
      <Ul items={[
        'Don\'t ignore communications — the ICO treats non-cooperation seriously',
        'Gather your documentation: processing records, consent evidence, security policies, DSAR response records',
        'Consider seeking legal advice from a data protection solicitor',
        'Remediate the issue quickly and document what you\'ve done',
        'Be honest: if something went wrong, acknowledge it and explain what you\'ve changed',
      ]}/>

      <div style={{marginTop:48,padding:'24px 28px',background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:16}}>
        <p style={{fontSize:14,color:'var(--ink)',fontWeight:600,marginBottom:8}}>Find your compliance gaps before the ICO does</p>
        <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7,marginBottom:16}}>AlgoGrass scans your live website for the exact issues the ICO investigates — cookie consent failures, missing privacy notices, insecure forms, and missing documents. Fix them before they become enforcement actions.</p>
        <a href="/scan" className="btn btn-primary">Scan my website free →</a>
      </div>
    </Layout>
  )
}
