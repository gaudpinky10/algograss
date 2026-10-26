'use client'
import Link from 'next/link'
const P=({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2=({children,n})=><h2 style={{fontFamily:'var(--f-head)',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:12}}><span style={{fontSize:13,fontWeight:800,color:'var(--accent)',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:8,padding:'2px 10px',fontFamily:'var(--f-head)'}}>{n}</span>{children}</h2>
const Ul=({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(15,23,42,0.05)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Callout=({children,type='info'})=>{const s={info:{bg:'rgba(139,92,246,0.07)',border:'rgba(139,92,246,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'#F59E0B'}}[type];return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>}
function Layout({meta,children}){return(<><section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}><div className="wrap" style={{maxWidth:740}}><Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link><div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}><span style={{fontSize:10,fontWeight:700,background:'rgba(139,92,246,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(139,92,246,0.2)'}}>{meta.cat}</span><span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span></div><h1 style={{fontFamily:'var(--f-head)',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1></div></section><section style={{padding:'48px 0 88px',background:'var(--bg)'}}><div className="wrap" style={{maxWidth:740}}>{children}</div></section></>)}

export default function EuAiActGuide(){
  return(
    <Layout meta={{cat:'AI Act',date:'2 Jul 2026',read:'11 min',title:'EU AI Act: What UK Businesses Need to Know in 2026'}}>
      <P>The EU AI Act is now in force — the world's first comprehensive AI regulation. For UK businesses, it's more relevant than it may first appear: if you deploy AI-powered tools to EU customers, serve EU residents, or use AI systems that interact with EU data, the Act likely applies to you. And with the UK developing its own AI framework, understanding the EU's approach is essential groundwork.</P>
      <Callout>The EU AI Act entered into force on 1 August 2024 and applies in stages: banned practices and AI literacy from 2 February 2025, general-purpose AI model rules from 2 August 2025, transparency duties from 2 August 2026. The EU's Digital Omnibus amendment (in force 27 July 2026) moved the high-risk rules to 2 December 2027 (Annex III, e.g. recruitment and credit scoring) and 2 August 2028 (AI in regulated products).</Callout>

      <H2 n="1">What the EU AI Act actually requires</H2>
      <P>The Act takes a risk-based approach, classifying AI systems into four tiers:</P>
      <Ul items={[
        'Unacceptable risk — banned outright (social scoring, harmful manipulation, AI that exploits vulnerable groups, emotion recognition at work or in education, and, with narrow exceptions, real-time biometric identification in public for law enforcement)',
        'High risk — permitted but subject to strict conformity assessments (AI in recruitment, credit scoring, education, critical infrastructure, law enforcement)',
        'Limited risk — transparency obligations only (chatbots must disclose they\'re AI; deepfakes must be labelled)',
        'Minimal/no risk — no mandatory requirements (most AI applications, including GDPR compliance tools, recommendation engines, spam filters)',
      ]}/>
      <P>For most UK SMEs, AI tools they use or deploy will fall into the "limited risk" or "minimal risk" category. However, if you use AI in HR processes (CV screening, performance assessment), credit decisions, or certain customer-facing interactions, high-risk provisions may apply.</P>

      <H2 n="2">Does the EU AI Act apply to UK businesses?</H2>
      <P>The EU AI Act has explicit extra-territorial reach, similar to GDPR. It applies to you if:</P>
      <Ul items={[
        'You deploy an AI system (or output of an AI system) to users located in the EU — even if your company is in the UK',
        'You are an EU-based user of an AI system deployed by a UK provider',
        'The outputs of your AI system are used in the EU (e.g. AI-generated content distributed to EU audiences)',
      ]}/>
      <P>If your SaaS product, marketing automation, or customer-facing AI tool is used by EU customers, the Act reaches you.</P>
      <Callout type="warn">Post-Brexit, the UK is not subject to the EU AI Act domestically — but UK businesses targeting EU markets must comply with it for those markets, just as with EU GDPR. Many UK companies operating across both markets will need to align with both frameworks.</Callout>

      <H2 n="3">Key obligations by role</H2>
      <P>The Act distinguishes between providers (who develop or place AI systems on the market) and deployers (who use AI systems in their business). Most UK SMEs are deployers — using AI tools built by others.</P>
      <Ul items={[
        'Providers: conformity assessment, CE marking, registration in the EU AI database, post-market monitoring, incident reporting',
        'Deployers of high-risk AI: use it as instructed, assign human oversight, keep logs, and tell employees when AI is used to evaluate them; public bodies and some others (e.g. credit scoring and insurance pricing) must also carry out a fundamental rights impact assessment',
        'Deployers of limited risk: disclose to users when they\'re interacting with AI (chatbot transparency)',
        'All organisations: AI literacy obligation — ensure staff have sufficient understanding of AI to use it responsibly',
      ]}/>

      <H2 n="4">The AI literacy obligation</H2>
      <P>Article 4 of the EU AI Act requires all providers and deployers to ensure a sufficient level of AI literacy among staff. This applies from 2 February 2025 — one of the earliest provisions to take effect.</P>
      <P>For practical purposes, this means organisations need to provide AI awareness training to staff who use, build, or make decisions based on AI tools. The requirement is proportionate to context and size, but it is a mandatory baseline, not a recommendation.</P>
      <Callout>AlgoGrass's AI Governance tool helps you list the AI tools you use, check their risk category and track what to do. <a href="/ai-governance" style={{color:'var(--accent)'}}>Open AI Governance →</a></Callout>

      <H2 n="5">AI Act and GDPR: the overlap</H2>
      <P>Most AI systems process personal data, which means GDPR applies alongside the AI Act. The two frameworks reinforce each other but have distinct requirements:</P>
      <Ul items={[
        'GDPR requires a lawful basis for processing personal data used to train or run AI — legitimate interests or consent are common bases, but require careful assessment',
        'GDPR Articles 13–14 require transparency about automated decision-making — if AI makes or significantly influences decisions affecting individuals, this must be disclosed',
        'Solely automated decisions with legal or similarly significant effects come with safeguards: in the UK, UK GDPR Articles 22A–22D (since February 2026) require telling people and letting them challenge the decision and get human review; in the EU, GDPR Article 22 applies',
        'AI Act fundamental rights impact assessments overlap with GDPR DPIAs — in many cases a combined assessment is practical',
      ]}/>

      <H2 n="6">What UK businesses should do now</H2>
      <Ul items={[
        'Inventory all AI tools your business uses — including third-party tools like AI recruitment software, AI customer service, AI analytics',
        'Classify each: is it high-risk, limited-risk, or minimal-risk under the EU AI Act?',
        'For any high-risk AI: start documenting your oversight processes now, ahead of the December 2027 deadline',
        'Implement AI literacy training for staff (required since February 2025 if you serve EU users)',
        'Review your privacy notice and DPIA for AI tools that process personal data — GDPR transparency requirements apply',
        'Remember the UK has no AI Act: the ICO and other regulators apply existing law, so UK GDPR is the main rule for AI that uses personal data',
      ]}/>
      <Callout>Run a GDPR compliance scan to check whether your AI-related data processing disclosures are in order before the EU AI Act's transparency obligations bite further. <a href="/scan" style={{color:'var(--accent)'}}>Free scan →</a></Callout>

      <H2 n="7">Penalties</H2>
      <P>Fines under the EU AI Act are substantial — up to €35 million or 7% of global annual turnover for deploying prohibited AI systems; up to €15 million or 3% for other violations. EU member states are establishing national enforcement authorities. The European AI Office (established February 2024) oversees general-purpose AI models.</P>
      <P>For UK businesses operating in EU markets, the risk is real — particularly for those in regulated sectors where AI is used in consequential decisions.</P>

      <div style={{marginTop:48,padding:'24px 28px',background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.2)',borderRadius:16}}>
        <p style={{fontSize:14,color:'var(--ink)',fontWeight:600,marginBottom:8}}>Check your GDPR and AI compliance position</p>
        <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.7,marginBottom:16}}>AlgoGrass scans your website for GDPR risks and generates the documentation you need — including for AI Act-related transparency obligations. Start with a free scan.</p>
        <a href="/scan" className="btn btn-primary">Scan my website free →</a>
      </div>
    </Layout>
  )
}
