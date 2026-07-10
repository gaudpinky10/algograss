export const metadata = { title: 'Cookie Policy — AlgoGrass', description: 'How AlgoGrass uses cookies and how you can control them.' }

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>{title}</h2>
    <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.9 }}>{children}</div>
  </div>
)
const P = ({ children }) => <p style={{ marginBottom: 12 }}>{children}</p>

export default function CookiePolicyPage() {
  return (
    <section style={{ padding: '60px 0 100px' }}>
      <div className="wrap" style={{ maxWidth: 780 }}>

        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Legal</span>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--ink)', margin: '8px 0 12px' }}>Cookie Policy</h1>
          <p style={{ fontSize: 13, color: 'var(--ink2)' }}>Last updated: 19 June 2026</p>
          <div style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: 10, padding: '14px 18px', marginTop: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#0EA5E9' }}>This policy explains what cookies AlgoGrass uses, why, and how you can control them — in compliance with the Privacy and Electronic Communications Regulations (PECR) and UK GDPR.</p>
          </div>
        </div>

        <Section title="1. What are cookies?">
          <P>Cookies are small text files stored on your device when you visit a website. They help websites remember you, keep you logged in, and understand how visitors use the site. AlgoGrass uses cookies responsibly and minimally.</P>
        </Section>

        <Section title="2. Cookies we use">
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 2fr', gap: 12, padding: '12px 16px', background: 'rgba(14,165,233,0.06)', fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              <span>Cookie name</span><span>Type</span><span>Duration</span><span>Purpose</span>
            </div>
            {[
              ['algograss_user', 'Essential', '30 days', 'Keeps you logged in to your account'],
              ['algograss_cookie_consent', 'Essential', '1 year', 'Remembers your cookie preferences'],
              ['__vercel_live_token', 'Essential', 'Session', 'Vercel deployment infrastructure'],
              ['_ga / _gid', 'Analytics', '2 years / 24h', 'Google Analytics — only with your consent'],
            ].map(([name, type, duration, purpose], i) => (
              <div key={name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 2fr', gap: 12, padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 12 }}>
                <span style={{ color: 'var(--ink)', fontFamily: 'monospace', fontSize: 11 }}>{name}</span>
                <span style={{
                  color: type === 'Essential' ? '#0EA5E9' : '#818CF8',
                  fontWeight: 600,
                }}>{type}</span>
                <span style={{ color: 'var(--ink2)' }}>{duration}</span>
                <span style={{ color: 'var(--ink2)' }}>{purpose}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="3. Essential cookies (no consent required)">
          <P>Essential cookies are necessary for the platform to function. They handle login sessions and security. Under PECR, essential cookies do not require consent as they are strictly necessary to provide the service you have requested.</P>
          <P>These cookies do not track you across other websites and contain no personal identifiers beyond a session reference.</P>
        </Section>

        <Section title="4. Analytics cookies (consent required)">
          <P>We would like to use Google Analytics to understand how visitors use AlgoGrass — which pages are popular, where users drop off, and how we can improve. These cookies are only set if you click "Accept All" or enable Analytics in "Manage Preferences".</P>
          <P>If you click "Reject All", no analytics cookies are set and no data is shared with Google.</P>
        </Section>

        <Section title="5. What we do NOT do">
          {[
            'We do not use advertising or marketing cookies by default',
            'We do not sell your data to advertisers',
            'We do not set any cookies before you have given consent (except essential)',
            'We do not use fingerprinting or cross-site tracking',
          ].map(item => (
            <div key={item} style={{ paddingLeft: 14, borderLeft: '2px solid rgba(14,165,233,0.3)', marginBottom: 10, fontSize: 13 }}>✅ {item}</div>
          ))}
        </Section>

        <Section title="6. Managing your cookie preferences">
          <P>You can change your cookie preferences at any time by clicking the cookie settings link in our website footer, or by clearing your browser cookies (which will reset your preferences).</P>
          <P>You can also control cookies through your browser settings:</P>
          {[
            ['Chrome', 'Settings → Privacy and security → Cookies'],
            ['Firefox', 'Settings → Privacy & Security → Cookies'],
            ['Safari', 'Preferences → Privacy → Manage Website Data'],
            ['Edge', 'Settings → Cookies and site permissions'],
          ].map(([browser, path]) => (
            <div key={browser} style={{ marginBottom: 8, fontSize: 13 }}>
              <strong style={{ color: 'var(--ink)' }}>{browser}:</strong> <span style={{ color: 'var(--ink2)' }}>{path}</span>
            </div>
          ))}
          <P style={{ marginTop: 12 }}>Note: blocking essential cookies will prevent you from logging in to your AlgoGrass account.</P>
        </Section>

        <Section title="7. Third-party cookies">
          <P>We use Stripe for payment processing. Stripe may set its own cookies during the checkout process to prevent fraud. These are governed by <a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>Stripe's Privacy Policy</a>.</P>
        </Section>

        <Section title="8. Contact us">
          <P>Questions about our use of cookies? Email <a href="mailto:privacy@algograss.co.uk" style={{ color: 'var(--green)' }}>privacy@algograss.co.uk</a>.</P>
          <P>For complaints about cookies, you can also contact the ICO at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>ico.org.uk</a>.</P>
        </Section>

      </div>
    </section>
  )
}
