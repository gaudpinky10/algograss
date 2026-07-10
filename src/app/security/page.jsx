'use client'
import AnimateOnScroll from '@/components/AnimateOnScroll'
import TiltCard from '@/components/TiltCard'

const S = ({ children }) => (
  <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
    <div className="wrap" style={{ maxWidth: 900 }}>{children}</div>
  </section>
)
const H2 = ({ children, icon }) => (
  <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ fontSize: 26 }}>{icon}</span>{children}
  </h2>
)
const P = ({ children }) => (
  <p style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.85, marginBottom: 16 }}>{children}</p>
)
const Row = ({ label, value, note }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', minWidth: 220, flexShrink: 0 }}>{label}</span>
    <div style={{ flex: 1 }}>
      <span style={{ fontSize: 13, color: 'var(--ink2)' }}>{value}</span>
      {note && <span style={{ display: 'block', fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{note}</span>}
    </div>
  </div>
)
const Badge = ({ children, color = '#9B7BFA' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color, background: `${color}14`, border: `1px solid ${color}40`, borderRadius: 100, padding: '4px 12px', margin: '4px' }}>
    <span style={{ width: 6, height: 6, background: color, borderRadius: '50%' }} />
    {children}
  </span>
)

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section style={{ padding: '96px 0 64px', background: 'var(--bg2)', borderBottom: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-teal" style={{ width: 600, height: 400, top: '-20%', right: '-10%', opacity: 0.5 }} />
        <div className="orb orb-purple" style={{ width: 400, height: 400, bottom: '-30%', left: '-5%', opacity: 0.4 }} />
        <div className="wrap" style={{ position: 'relative', zIndex: 1, maxWidth: 900 }}>
          <AnimateOnScroll>
            <span className="eyebrow">Security & Privacy</span>
            <h1 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20, color: 'var(--ink)' }}>
              How AlgoGrass protects<br />
              <span className="animate-gradient-text">your data</span>
            </h1>
            <p className="subtext" style={{ maxWidth: 580, marginBottom: 36 }}>
              We're a GDPR compliance product — which means we hold ourselves to the same standards we help you meet. Here's exactly how we handle your data, where it's stored, and what security measures are in place.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Badge>🔒 TLS 1.3 in transit</Badge>
              <Badge>🛡️ AES-256 at rest</Badge>
              <Badge color="#C084FC">🇬🇧 UK GDPR compliant</Badge>
              <Badge color="#C084FC">🇪🇺 EU data residency</Badge>
              <Badge color="#F59E0B">🚫 No data selling</Badge>
              <Badge color="#F59E0B">🧹 30-day scan retention</Badge>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Data processing */}
      <S>
        <AnimateOnScroll>
          <H2 icon="🌍">Where your data is processed</H2>
          <P>AlgoGrass is hosted on infrastructure that keeps your data within the UK and European Economic Area (EEA). We do not transfer personal data to countries outside the UK/EEA without appropriate safeguards.</P>
          <div style={{ marginTop: 24 }}>
            <Row label="Application hosting" value="Vercel (EU region — Frankfurt, Germany)" note="Vercel operates under the EU–US Data Privacy Framework and provides a Data Processing Addendum." />
            <Row label="Database" value="MongoDB Atlas (EU West — Ireland, eu-west-1)" note="All data stored and replicated within EU data centres. At-rest encryption enabled by default." />
            <Row label="Transactional email" value="Resend (EU region)" note="Used for account notifications, password resets, and compliance alerts only." />
            <Row label="Payments" value="Stripe (UK & EU regulated)" note="Stripe processes payment card data. AlgoGrass never stores card numbers. Stripe is PCI DSS Level 1 certified." />
            <Row label="AI processing" value="Google Gemini API (EU data residency where available)" note="Scan descriptions and prompts sent for AI analysis do not include raw personal data from your users." />
          </div>
        </AnimateOnScroll>
      </S>

      {/* Encryption */}
      <S>
        <AnimateOnScroll>
          <H2 icon="🔐">Encryption</H2>
          <P>All data transmitted between your browser and AlgoGrass uses TLS 1.3. Our HTTPS certificate is managed by Vercel and auto-renewed. HTTP connections are automatically redirected to HTTPS.</P>
          <P>Data stored in MongoDB Atlas is encrypted at rest using AES-256, managed by MongoDB's Encrypted Storage Engine. Backup data is also encrypted at rest.</P>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 24 }}>
            {[
              { icon: '🔒', title: 'In transit', desc: 'TLS 1.3 — all connections between your browser, our servers, and our databases are encrypted.' },
              { icon: '💾', title: 'At rest', desc: 'AES-256 encryption on all MongoDB Atlas storage. Backups encrypted with the same standard.' },
              { icon: '🔑', title: 'Secrets management', desc: 'API keys and credentials are stored as Vercel environment variables — never in code or version control.' },
              { icon: '🍪', title: 'Session tokens', desc: 'Auth cookies are HttpOnly, Secure, and SameSite=Strict. Session data is not stored server-side.' },
            ].map(({ icon, title, desc }) => (
              <TiltCard key={title} intensity={6}>
                <div style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 14, padding: '22px 20px' }}>
                  <div style={{ fontSize: 26, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.65 }}>{desc}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </AnimateOnScroll>
      </S>

      {/* Data retention */}
      <S>
        <AnimateOnScroll>
          <H2 icon="🗓️">Data retention</H2>
          <P>We keep your data only as long as necessary. Here is exactly what we store and for how long:</P>
          <div style={{ marginTop: 24 }}>
            <Row label="Scan results" value="Retained for 30 days, then automatically deleted" note="You can download your report at any time. Re-scanning creates a fresh record." />
            <Row label="Account data" value="Retained while your account is active" note="Deletion request: email privacy@algograss.co.uk — we'll delete your account and all associated data within 30 days." />
            <Row label="Compliance documents" value="Retained in your account until you delete them" note="Documents you generate (privacy policy, DPA, etc.) are stored linked to your account." />
            <Row label="Audit logs" value="Retained for 90 days for security and debugging" note="Logs contain request metadata (IP, timestamp, endpoint). Logs are not used for marketing." />
            <Row label="Payment data" value="Retained as required by UK financial regulations (7 years)" note="Stripe retains full payment records. We store only subscription status and amount." />
            <Row label="Email addresses (waitlist)" value="Retained until you unsubscribe or request deletion" note="One-click unsubscribe is included in every email." />
          </div>
        </AnimateOnScroll>
      </S>

      {/* What data we collect */}
      <S>
        <AnimateOnScroll>
          <H2 icon="📋">What data we collect and why</H2>
          <P>We collect only what is necessary to provide the service. We do not sell, rent, or share your data with third parties for advertising purposes.</P>
          <div style={{ marginTop: 24 }}>
            <Row label="Email address" value="Account creation, login, and transactional notifications" />
            <Row label="Password (bcrypt hashed)" value="Authentication. We never store plaintext passwords." />
            <Row label="Website URL you scan" value="To perform the GDPR compliance scan of your website" note="The URL is sent to our scanner. The resulting report is stored in your account." />
            <Row label="Compliance documents you generate" value="Stored in your account so you can access them later" />
            <Row label="Usage data" value="Which tools you use, when you log in — for product improvement" note="Not shared with third parties. Used only to improve the product." />
            <Row label="Payment information" value="Processed directly by Stripe — we never see or store card numbers" />
            <Row label="Visitor analytics" value="Page views, device type, country — for understanding traffic" note="First-party only. No third-party tracking scripts (no Google Analytics, no Meta Pixel)." />
          </div>
        </AnimateOnScroll>
      </S>

      {/* Security headers */}
      <S>
        <AnimateOnScroll>
          <H2 icon="🛡️">Security headers & controls</H2>
          <P>AlgoGrass is built with security headers configured at the Vercel edge. These protect against common web attacks including cross-site scripting (XSS), clickjacking, and content injection.</P>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px', marginTop: 24, fontFamily: 'monospace', fontSize: 12, lineHeight: 2, color: 'var(--ink2)', overflowX: 'auto' }}>
            {[
              ['Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."],
              ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
              ['X-Frame-Options', 'SAMEORIGIN'],
              ['X-Content-Type-Options', 'nosniff'],
              ['Referrer-Policy', 'strict-origin-when-cross-origin'],
              ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()'],
            ].map(([h, v]) => (
              <div key={h} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 4 }}>
                <span style={{ color: '#9B7BFA', minWidth: 280, flexShrink: 0 }}>{h}:</span>
                <span style={{ color: '#64748B', fontSize: 11 }}>{v}</span>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </S>

      {/* Sub-processors */}
      <S>
        <AnimateOnScroll>
          <H2 icon="🔗">Sub-processors</H2>
          <P>We use the following sub-processors to deliver the AlgoGrass service. Each has a Data Processing Agreement in place, and all operate within the UK/EEA or under appropriate transfer mechanisms.</P>
          <div style={{ marginTop: 24 }}>
            {[
              { name: 'Vercel Inc.', role: 'Application hosting & edge network', location: 'EU (Frankfurt)', link: 'https://vercel.com/legal/privacy-policy' },
              { name: 'MongoDB Atlas (MongoDB Inc.)', role: 'Database (primary data store)', location: 'EU West (Ireland)', link: 'https://www.mongodb.com/legal/privacy-policy' },
              { name: 'Resend Inc.', role: 'Transactional email delivery', location: 'EU region', link: 'https://resend.com/privacy' },
              { name: 'Stripe Inc.', role: 'Payment processing (PCI DSS Level 1)', location: 'UK / EEA', link: 'https://stripe.com/gb/privacy' },
              { name: 'Google LLC (Gemini API)', role: 'AI language model inference', location: 'EU data residency where applicable', link: 'https://policies.google.com/privacy' },
            ].map(({ name, role, location, link }) => (
              <div key={name} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid rgba(15,23,42,0.05)' }}>
                <div style={{ minWidth: 220, flexShrink: 0 }}>
                  <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>{name}</a>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: 'var(--ink2)' }}>{role}</span>
                  <span style={{ display: 'block', fontSize: 11, color: '#94A3B8', marginTop: 3 }}>📍 {location}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </S>

      {/* Your rights */}
      <S>
        <AnimateOnScroll>
          <H2 icon="⚖️">Your data rights</H2>
          <P>Under UK GDPR, you have the following rights regarding your personal data held by AlgoGrass:</P>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 14, marginTop: 24 }}>
            {[
              { right: 'Right of access (Art. 15)', desc: 'Request a copy of all data we hold about you.' },
              { right: 'Right to rectification (Art. 16)', desc: 'Correct inaccurate or incomplete data.' },
              { right: 'Right to erasure (Art. 17)', desc: 'Request deletion of your account and all associated data.' },
              { right: 'Right to restriction (Art. 18)', desc: 'Restrict how we process your data while a dispute is resolved.' },
              { right: 'Right to portability (Art. 20)', desc: 'Receive your data in a machine-readable format.' },
              { right: 'Right to object (Art. 21)', desc: 'Object to processing based on legitimate interests.' },
            ].map(({ right, desc }) => (
              <div key={right} style={{ background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 16px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>{right}</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, padding: '18px 22px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--ink2)', margin: 0, lineHeight: 1.75 }}>
              To exercise any of these rights, email <a href="mailto:privacy@algograss.co.uk" style={{ color: 'var(--accent)' }}>privacy@algograss.co.uk</a>. We'll respond within 30 days as required by UK GDPR Article 12. If you're not satisfied with our response, you can lodge a complaint with the <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Information Commissioner's Office (ICO)</a>.
            </p>
          </div>
        </AnimateOnScroll>
      </S>

      {/* Contact */}
      <section style={{ padding: '72px 0', background: 'rgba(255,255,255,0.9)', borderTop: '1px solid rgba(15,23,42,0.05)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="orb orb-teal" style={{ width: 600, height: 300, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.35 }} />
        <div className="wrap" style={{ maxWidth: 560, position: 'relative', zIndex: 1 }}>
          <AnimateOnScroll direction="scale">
            <h2 style={{ fontFamily: 'var(--f-head)', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Security questions or concerns?</h2>
            <p style={{ fontSize: 15, color: '#64748B', marginBottom: 28, lineHeight: 1.7 }}>Contact our data protection team. We take every report seriously.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="mailto:privacy@algograss.co.uk" className="btn btn-primary">Email privacy@algograss.co.uk →</a>
              <a href="/privacy-policy" className="btn btn-secondary">Privacy Policy</a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  )
}
