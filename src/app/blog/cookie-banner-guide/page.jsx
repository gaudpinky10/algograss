'use client'
import Link from 'next/link'

function Layout({meta,children}){
  return(
    <>
      <section style={{padding:'56px 0 32px',background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap" style={{maxWidth:740}}>
          <Link href="/blog" style={{fontSize:13,color:'var(--accent)',display:'inline-flex',alignItems:'center',gap:6,marginBottom:24}}>← Back to blog</Link>
          <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:16}}>
            <span style={{fontSize:10,fontWeight:700,background:'rgba(0,212,170,0.12)',color:'var(--accent)',padding:'3px 10px',borderRadius:100,textTransform:'uppercase',letterSpacing:'.07em',border:'1px solid rgba(0,212,170,0.2)'}}>{meta.cat}</span>
            <span style={{fontSize:12,color:'var(--ink2)'}}>{meta.date} · {meta.read} read</span>
          </div>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,42px)',fontWeight:700,color:'var(--ink)',lineHeight:1.2}}>{meta.title}</h1>
        </div>
      </section>
      <section style={{padding:'48px 0 88px',background:'var(--bg)'}}>
        <div className="wrap" style={{maxWidth:740}}>{children}</div>
      </section>
    </>
  )
}

const P = ({children,mb=24})=><p style={{fontSize:15,lineHeight:1.85,color:'var(--ink2)',marginBottom:mb}}>{children}</p>
const H2 = ({children})=><h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,color:'var(--ink)',marginBottom:14,marginTop:48,paddingBottom:10,borderBottom:'1px solid var(--border)'}}>{children}</h2>
const H3 = ({children})=><h3 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,color:'var(--ink)',marginBottom:10,marginTop:28}}>{children}</h3>
const Ul = ({items})=><ul style={{marginBottom:24,paddingLeft:0,listStyle:'none'}}>{items.map((t,i)=><li key={i} style={{fontSize:14,color:'var(--ink2)',lineHeight:1.75,padding:'6px 0 6px 22px',position:'relative',borderBottom:'1px solid rgba(255,255,255,0.04)'}}><span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{t}</li>)}</ul>
const Callout = ({children,type='info'})=>{
  const styles={info:{bg:'rgba(0,212,170,0.07)',border:'rgba(0,212,170,0.25)',text:'var(--accent)'},warn:{bg:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.3)',text:'var(--amber-text)'},danger:{bg:'rgba(239,68,68,0.08)',border:'rgba(239,68,68,0.3)',text:'var(--red-text)'}}
  const s=styles[type]
  return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:12,padding:'16px 20px',marginBottom:24}}><p style={{fontSize:14,lineHeight:1.75,color:s.text,margin:0}}>{children}</p></div>
}

export default function CookieBannerGuide(){
  return(
    <Layout meta={{cat:'Cookies',date:'28 Jan 2025',read:'6 min',title:'How to Set Up a Legally Compliant Cookie Banner'}}>
      <P>Cookie banners are not optional. Under UK and EU law, any website that sets non-essential cookies — analytics, advertising, personalisation — must obtain freely given, specific, informed, and unambiguous consent before those cookies fire. Getting this wrong is one of the most common GDPR violations the ICO investigates.</P>
      <Callout type="warn">The ICO fined a UK company £200,000 for placing analytics cookies before obtaining consent. Cookie compliance is actively enforced — not a theoretical risk.</Callout>

      <H2>What the Law Actually Requires</H2>
      <P>Cookie consent in the UK is governed by the Privacy and Electronic Communications Regulations 2003 (PECR), read alongside UK GDPR. The key rules are:</P>
      <Ul items={[
        'Non-essential cookies must not fire before the user actively accepts them.',
        'The user must be able to refuse consent as easily as they can accept it — a reject button must be equally prominent.',
        'Pre-ticked boxes, consent walls, and "continued browsing implies consent" are all unlawful.',
        'You must clearly explain what each category of cookie does before the user chooses.',
        'Consent must be recorded with a timestamp and the version of your banner that was shown.',
        'Users must be able to withdraw consent at any time — a cookie settings link in your footer is required.',
      ]}/>

      <H2>Essential vs Non-Essential Cookies</H2>
      <P>Not all cookies need consent. Strictly necessary cookies are exempt — but the exemption is narrower than most businesses assume.</P>
      <H3>Strictly Necessary (No Consent Required)</H3>
      <Ul items={[
        'Session cookies that keep users logged in',
        'Shopping basket or checkout cookies',
        'Security and fraud-prevention cookies (e.g. CSRF tokens)',
        'Load-balancing cookies that keep a user on the same server',
        'User-interface customisation cookies that the user explicitly requested (e.g. language preference set by the user)',
      ]}/>
      <H3>Non-Essential (Consent Required)</H3>
      <Ul items={[
        'Analytics cookies (Google Analytics, Hotjar, Mixpanel)',
        'Advertising and retargeting cookies (Meta Pixel, Google Ads)',
        'Social media tracking pixels',
        'Personalisation cookies that profile users',
        'Third-party live chat cookies',
        'A/B testing tools that track individual users',
      ]}/>
      <Callout>Google Analytics requires consent. Even if you use IP anonymisation, GA sets cookies that identify returning users across sessions — this is non-essential processing under PECR.</Callout>

      <H2>What a Compliant Banner Must Contain</H2>
      <P>A legally compliant cookie banner must include all of the following:</P>
      <Ul items={[
        'A clear, plain-English explanation of what cookies you use and why',
        'Separate categories (e.g. Necessary, Analytics, Marketing) with toggle controls',
        'An "Accept All" and a "Reject All" button at the same level of prominence',
        'A "Manage Preferences" or "Customise" option',
        'A link to your full Cookie Policy',
        'No pre-ticked boxes for non-essential categories',
      ]}/>

      <H2>Common Mistakes That Lead to ICO Enforcement</H2>
      <H3>1. Hiding the Reject Button</H3>
      <P>Placing "Accept All" as a prominent green button and "Reject" as a small grey link in a corner is a dark pattern. The ICO has explicitly stated both options must be equally easy to use.</P>
      <H3>2. Firing Cookies Before Consent</H3>
      <P>Your analytics and marketing tools must be blocked until the user clicks Accept. This requires a consent management platform (CMP) that actually gates the scripts — not just displays a banner.</P>
      <H3>3. Not Recording Consent</H3>
      <P>If the ICO investigates, you must be able to demonstrate that a specific user gave consent on a specific date, saw a specific version of your banner, and consented to specific categories. Audit logs are required.</P>
      <H3>4. Using Consent for Legitimate Interests</H3>
      <P>Some businesses set analytics cookies under "legitimate interests" to avoid needing consent. This is unlawful under PECR — cookie consent is required regardless of your lawful basis under GDPR.</P>

      <H2>Setting Up Your Cookie Banner: A Practical Checklist</H2>
      <Ul items={[
        'Audit all cookies your site sets — use browser DevTools or a scanning tool',
        'Categorise each cookie: strictly necessary, analytics, or marketing',
        'Choose a CMP (Consent Management Platform) — Cookiebot, OneTrust, or CookieYes are common',
        'Configure the CMP to block all non-essential cookies until consent is given',
        'Ensure Accept All and Reject All buttons are visually equivalent',
        'Test on mobile — many banners are compliant on desktop but not on smaller screens',
        'Store consent records with timestamps',
        'Link to a full Cookie Policy that lists every cookie, its purpose, and retention period',
        'Add a "Cookie Settings" link to your footer so users can change their preferences',
        'Re-collect consent when you add new cookies or change cookie purposes',
      ]}/>

      <H2>What Happens If You Get It Wrong</H2>
      <P>The ICO can issue fines up to £17.5 million or 4% of global annual turnover under UK GDPR, and separate fines under PECR. While most enforcement to date has targeted large companies, the ICO has made clear that cookie compliance is a priority for all organisations.</P>
      <Callout type="danger">The ICO's cookie sweep programme actively checks websites for compliance. Any UK business with a website that sets analytics or advertising cookies is within scope.</Callout>

      <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:16,padding:'28px 32px',marginTop:48,textAlign:'center'}}>
        <p style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:600,color:'var(--ink)',marginBottom:10}}>Check your cookie compliance right now</p>
        <p style={{fontSize:14,color:'var(--ink2)',marginBottom:20}}>AlgoGrass scans your website for cookie consent issues and tells you exactly what to fix — free, no account needed.</p>
        <a href="/scan" className="btn btn-primary">Scan my website free →</a>
      </div>
    </Layout>
  )
}
