export const metadata = { title: 'Privacy Policy — AlgoGrass', description: 'How AlgoGrass collects, uses and protects your personal data under UK GDPR.' }

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 40 }}>
    <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>{title}</h2>
    <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.9 }}>{children}</div>
  </div>
)

const P = ({ children }) => <p style={{ marginBottom: 12 }}>{children}</p>

export default function PrivacyPolicyPage() {
  return (
    <section style={{ padding: '60px 0 100px' }}>
      <div className="wrap" style={{ maxWidth: 780 }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Legal</span>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--ink)', margin: '8px 0 12px' }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: 'var(--ink2)' }}>Last updated: 19 June 2026 · Effective: 19 June 2026</p>
          <div style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: 10, padding: '14px 18px', marginTop: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#00D4AA' }}>This policy explains how AlgoGrass Ltd collects, uses, and protects your personal data in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>
          </div>
        </div>

        <Section title="1. Who we are (Data Controller)">
          <P><strong style={{ color: 'var(--ink)' }}>Company name:</strong> AlgoGrass Ltd</P>
          <P><strong style={{ color: 'var(--ink)' }}>Registered in:</strong> England and Wales</P>
          <P><strong style={{ color: 'var(--ink)' }}>Registered address:</strong> 5 Jupp Road West, London, E15 2HS</P>
          <P><strong style={{ color: 'var(--ink)' }}>Email:</strong> <a href="mailto:privacy@algograss.co.uk" style={{ color: 'var(--green)' }}>privacy@algograss.co.uk</a></P>
          <P>AlgoGrass Ltd is the data controller for personal data collected through algograss.co.uk and the AlgoGrass compliance platform.</P>
        </Section>

        <Section title="2. What data we collect">
          <P><strong style={{ color: 'var(--ink)' }}>Account data:</strong> Name, email address, password (stored as a one-way hash), company name, website URL.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Billing data:</strong> Email address, billing name, billing address, and payment method details. Card data is processed and stored by Stripe — we never see or store your full card number.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Usage data:</strong> Pages visited, compliance scans run, documents generated, features used, and timestamps of activity.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Technical data:</strong> IP address, browser type, device type, operating system, referral source.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Scan data:</strong> The website URLs you submit for compliance scanning and the results generated.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Communications:</strong> Emails you send to us and any support requests.</P>
        </Section>

        <Section title="3. How we use your data">
          <P><strong style={{ color: 'var(--ink)' }}>To provide the service (Contract — Art. 6(1)(b)):</strong> Creating and managing your account, running compliance scans, generating compliance documents, processing payments, sending service emails (receipts, plan confirmations).</P>
          <P><strong style={{ color: 'var(--ink)' }}>Legitimate interests (Art. 6(1)(f)):</strong> Improving the platform, detecting and preventing fraud and abuse, monitoring platform performance and security, anonymised analytics to understand feature usage.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Legal obligation (Art. 6(1)(c)):</strong> Keeping billing records as required by HMRC, responding to lawful requests from authorities.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Consent (Art. 6(1)(a)):</strong> Marketing emails and non-essential analytics cookies — only where you have given explicit consent which you can withdraw at any time.</P>
        </Section>

        <Section title="4. How long we keep your data">
          <P><strong style={{ color: 'var(--ink)' }}>Account data:</strong> For the duration of your account plus 2 years after closure.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Billing records:</strong> 7 years as required by HMRC.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Scan results:</strong> 12 months from date of scan, then automatically deleted.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Usage/activity logs:</strong> 6 months.</P>
          <P><strong style={{ color: 'var(--ink)' }}>Email communications:</strong> 3 years.</P>
          <P>When your account is deleted, we remove your personal data within 30 days, except where legal retention obligations apply.</P>
        </Section>

        <Section title="5. Who we share data with">
          <P>We do not sell your personal data. We share it only with the following trusted processors who are contractually bound to protect it:</P>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
            {[
              ['MongoDB Atlas', 'Database hosting', 'EU/UK', 'Data storage'],
              ['Stripe Inc.', 'Payment processing', 'USA (SCCs)', 'Billing & subscriptions'],
              ['Resend', 'Transactional email', 'USA (SCCs)', 'Email delivery'],
              ['Vercel Inc.', 'Website hosting', 'USA (SCCs)', 'Platform hosting'],
              ['Anthropic PBC', 'AI processing', 'USA (SCCs)', 'AI compliance suggestions'],
            ].map(([name, category, location, purpose], i) => (
              <div key={name} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 2fr', gap: 12, padding: '12px 16px', borderBottom: i < 4 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{name}</span>
                <span style={{ color: 'var(--ink2)' }}>{category}</span>
                <span style={{ color: 'var(--ink2)' }}>{location}</span>
                <span style={{ color: 'var(--ink2)' }}>{purpose}</span>
              </div>
            ))}
          </div>
          <P>We may also disclose data to law enforcement or regulatory authorities where required by law.</P>
        </Section>

        <Section title="6. International transfers">
          <P>Some of our processors (Stripe, Vercel, Resend, Anthropic) are based in the USA. Transfers are protected by Standard Contractual Clauses (SCCs) approved by the UK Information Commissioner's Office, providing equivalent protection to UK GDPR.</P>
        </Section>

        <Section title="7. Your rights under UK GDPR">
          <P>You have the following rights over your personal data:</P>
          {[
            ['Right of access (Art. 15)', 'Request a copy of all personal data we hold about you.'],
            ['Right to rectification (Art. 16)', 'Ask us to correct inaccurate or incomplete data.'],
            ['Right to erasure (Art. 17)', 'Ask us to delete your data ("right to be forgotten").'],
            ['Right to restrict processing (Art. 18)', 'Ask us to pause processing your data.'],
            ['Right to data portability (Art. 20)', 'Receive your data in a machine-readable format.'],
            ['Right to object (Art. 21)', 'Object to processing based on legitimate interests.'],
            ['Right to withdraw consent', 'Withdraw consent at any time where consent is the basis.'],
            ['Right to lodge a complaint', 'Complain to the ICO at ico.org.uk or 0303 123 1113.'],
          ].map(([right, desc]) => (
            <div key={right} style={{ marginBottom: 10, paddingLeft: 14, borderLeft: '2px solid rgba(0,212,170,0.3)' }}>
              <span style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 13 }}>{right}</span>
              <span style={{ color: 'var(--ink2)', fontSize: 13 }}> — {desc}</span>
            </div>
          ))}
          <P style={{ marginTop: 16 }}>To exercise any right, email <a href="mailto:privacy@algograss.co.uk" style={{ color: 'var(--green)' }}>privacy@algograss.co.uk</a>. We respond within 30 days.</P>
        </Section>

        <Section title="8. Cookies">
          <P>We use essential cookies to keep you logged in and the platform secure. With your consent, we also use analytics cookies to improve the service. See our <a href="/cookie-policy" style={{ color: 'var(--green)' }}>Cookie Policy</a> for full details.</P>
        </Section>

        <Section title="9. Security">
          <P>We protect your data using HTTPS encryption, hashed passwords, secure HTTP headers (CSP, HSTS, X-Frame-Options), access controls, and regular security reviews. No system is 100% secure — if you believe your data has been compromised, contact us immediately at <a href="mailto:privacy@algograss.co.uk" style={{ color: 'var(--green)' }}>privacy@algograss.co.uk</a>.</P>
        </Section>

        <Section title="10. Children">
          <P>AlgoGrass is a business-to-business service intended for adults (18+). We do not knowingly collect data from children. If you believe a child has provided us with data, please contact us and we will delete it promptly.</P>
        </Section>

        <Section title="11. Changes to this policy">
          <P>We may update this policy from time to time. We will notify you by email and update the "Last updated" date above. Continued use of AlgoGrass after changes constitutes acceptance.</P>
        </Section>

        <Section title="12. Contact & complaints">
          <P>For any privacy questions or to exercise your rights: <a href="mailto:privacy@algograss.co.uk" style={{ color: 'var(--green)' }}>privacy@algograss.co.uk</a></P>
          <P>If you are not satisfied with our response, you have the right to lodge a complaint with the <strong style={{ color: 'var(--ink)' }}>Information Commissioner's Office (ICO)</strong>:</P>
          <P>🌐 <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green)' }}>ico.org.uk</a> · 📞 0303 123 1113 · Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</P>
        </Section>

      </div>
    </section>
  )
}
