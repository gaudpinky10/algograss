'use client'
import { useState } from 'react'

const AREAS = [
  { id: 'crm', icon: '🗂️', title: 'CRM & Customer Data', desc: 'Salesforce, HubSpot, spreadsheets, contact databases' },
  { id: 'hr', icon: '👥', title: 'HR & Employee Records', desc: 'Payroll, recruitment, performance, health records' },
  { id: 'email', icon: '📧', title: 'Email Marketing', desc: 'Mailchimp, Klaviyo, marketing lists, consent records' },
  { id: 'vendor', icon: '🤝', title: 'Vendor & Supplier Contracts', desc: 'Third-party processors, DPAs, cloud services' },
]

const QUESTIONS = {
  crm: [
    { key: 'system', q: 'What CRM system do you use?', type: 'text', placeholder: 'e.g. Salesforce, HubSpot, spreadsheet' },
    { key: 'retention', q: 'How long do you keep customer records?', type: 'select', options: ['Less than 1 year', '1-3 years', '3-6 years', '7+ years', "We don't have a policy"] },
    { key: 'lawfulBasis', q: 'What is your lawful basis for storing customer data?', type: 'select', options: ['Contract', 'Legitimate interests', 'Consent', 'Legal obligation', 'Not sure'] },
    { key: 'dpa', q: 'Do you have a Data Processing Agreement with your CRM provider?', type: 'select', options: ['Yes', 'No', 'Not sure'] },
    { key: 'access', q: 'Can customers request to see/delete their data?', type: 'select', options: ['Yes, we have a process', 'Yes, but no formal process', 'No', 'Not sure'] },
    { key: 'transfers', q: 'Is your CRM data stored outside the UK/EU?', type: 'select', options: ['No — UK/EU only', 'Yes — US servers', 'Yes — other country', 'Not sure'] },
    { key: 'oldData', q: 'Do you regularly delete old/inactive customer records?', type: 'select', options: ['Yes, automated', 'Yes, manually', 'Rarely', 'Never'] },
  ],
  hr: [
    { key: 'system', q: 'What HR system do you use?', type: 'text', placeholder: 'e.g. BambooHR, Workday, spreadsheets' },
    { key: 'retention', q: 'How long do you keep employee records after they leave?', type: 'select', options: ['Less than 1 year', '1-3 years', '6 years', '7+ years', 'Forever', 'No policy'] },
    { key: 'specialCategory', q: 'Do you store any special category data?', type: 'select', options: ['Health/medical data', 'Biometric data', 'Union membership', 'None', 'Multiple types'] },
    { key: 'recruitment', q: 'How long do you keep unsuccessful job applicant data?', type: 'select', options: ['Delete immediately', '3-6 months', '6-12 months', '1+ years', 'We keep it all'] },
    { key: 'access', q: 'Can employees access their own HR records?', type: 'select', options: ['Yes, self-service', 'Yes, on request', 'Not currently', 'Not sure'] },
    { key: 'sharing', q: 'Do you share employee data with third parties?', type: 'select', options: ['Payroll provider only', 'Multiple providers', 'No sharing', "Not sure what's shared"] },
    { key: 'training', q: 'Have staff handling HR data received GDPR training?', type: 'select', options: ['Yes, all staff', 'Some staff', 'No', 'Planning to'] },
  ],
  email: [
    { key: 'platform', q: 'Which email marketing platform do you use?', type: 'text', placeholder: 'e.g. Mailchimp, Klaviyo, Hubspot' },
    { key: 'consentMethod', q: 'How did you obtain marketing consent from your list?', type: 'select', options: ['Double opt-in form', 'Single opt-in form', 'Purchase/customer relationship', 'Bought/rented list', 'Mixed sources', 'Not sure'] },
    { key: 'listSize', q: 'Approximately how many contacts are on your list?', type: 'select', options: ['Under 500', '500-5,000', '5,000-50,000', '50,000+'] },
    { key: 'unsubscribe', q: 'How easy is it to unsubscribe from your emails?', type: 'select', options: ['One-click unsubscribe link in every email', 'Link in every email, multiple steps', 'Hard to find', 'Not included'] },
    { key: 'suppression', q: 'Do you maintain a suppression/unsubscribe list?', type: 'select', options: ['Yes, always honoured', 'Yes, but not always up to date', 'No', 'Not sure'] },
    { key: 'dpa', q: 'Do you have a DPA with your email provider?', type: 'select', options: ['Yes', 'No', 'Not sure'] },
    { key: 'reEngagement', q: 'What happens to inactive subscribers?', type: 'select', options: ['Deleted after 12 months', 'Re-engagement campaign then delete', 'Kept indefinitely', 'No policy'] },
  ],
  vendor: [
    { key: 'cloudServices', q: 'Which cloud services process your customer data?', type: 'text', placeholder: 'e.g. AWS, Google Workspace, Dropbox, Zoom' },
    { key: 'dpaStatus', q: 'Do you have Data Processing Agreements with your key vendors?', type: 'select', options: ['Yes, all major vendors', 'Some vendors', 'Very few', 'None'] },
    { key: 'internationalTransfers', q: 'Do any vendors store/process data outside UK/EU?', type: 'select', options: ['No', 'Yes, with SCCs/safeguards', 'Yes, without safeguards', 'Not sure'] },
    { key: 'vendorReview', q: 'When did you last review your vendor list for GDPR compliance?', type: 'select', options: ['Within last 6 months', 'Within last year', '1-3 years ago', 'Never', 'Not sure'] },
    { key: 'subprocessors', q: "Are your vendors' subprocessors listed in your privacy policy?", type: 'select', options: ['Yes', 'Partially', 'No', 'Not sure'] },
    { key: 'contractReview', q: 'Do your vendor contracts include data protection clauses?', type: 'select', options: ['Yes, all contracts', 'Some contracts', 'No', 'Not sure'] },
    { key: 'incidentNotif', q: 'Do your vendors notify you within 72 hours of a data breach?', type: 'select', options: ['Yes, contractually required', 'We hope so', 'Not specified', 'Not sure'] },
  ],
}

const PRIORITY_COLORS = {
  'Immediate': { bg: '#FEF2F2', text: '#DC2626', border: '#F5B7B1' },
  'Within 30 days': { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D' },
  'Within 90 days': { bg: '#F0FDF4', text: '#16A34A', border: 'var(--green-m)' },
}

export default function DataAuditPage() {
  const [selectedArea, setSelectedArea] = useState(null)
  const [answers, setAnswers] = useState({})
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState('select')

  async function runAudit() {
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/data-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: selectedArea, answers, businessName }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResult(data.result)
      setStep('result')
    } catch { setError('Assessment failed. Please try again.') }
    setLoading(false)
  }

  const questions = QUESTIONS[selectedArea] || []
  const answered = questions.filter(q => answers[q.key]).length
  const progress = questions.length ? Math.round((answered / questions.length) * 100) : 0
  const sc = result?.score
  const scCol = sc >= 70 ? 'var(--green)' : sc >= 40 ? 'var(--amber-text)' : 'var(--red-text)'

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      <section style={{ background: 'var(--ink)', padding: '48px 0' }}>
        <div className="wrap">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,217,106,.15)', border: '1px solid rgba(184,217,106,.3)', padding: '5px 13px', borderRadius: 100, marginBottom: 16, fontSize: 11, fontWeight: 600, color: 'var(--lime)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Data Compliance Audit</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,3vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Beyond the Website — Full Data Audit</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 600, lineHeight: 1.7 }}>GDPR covers more than your website. Audit your CRM, HR records, email marketing, and vendor contracts — get a scored compliance report with specific action steps.</p>
        </div>
      </section>

      <section style={{ padding: '48px 0 80px' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>

          {step === 'select' && (
            <>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Select an area to audit</h2>
              <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 28 }}>Answer a few questions and get an AI-powered compliance score, issues list, and prioritised action plan.</p>
              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Your business name</label>
                <input className="field-input" style={{ maxWidth: 340 }} placeholder="e.g. Acme Ltd" value={businessName} onChange={e => setBusinessName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 28 }}>
                {AREAS.map(area => (
                  <button key={area.id} onClick={() => { setSelectedArea(area.id); setAnswers({}); setStep('questions') }}
                    style={{ padding: '24px', borderRadius: 16, border: '2px solid var(--border)', background: 'var(--white)', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.background = 'var(--green-p)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{area.icon}</div>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{area.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.5 }}>{area.desc}</div>
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>{QUESTIONS[area.id].length} questions → scored report →</div>
                  </button>
                ))}
              </div>
              <div style={{ background: 'var(--green)', borderRadius: 14, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Run all 4 audits for a complete compliance picture</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Each takes 3 minutes. Together they cover your full GDPR obligations.</p>
                </div>
                <span style={{ fontSize: 28, marginLeft: 16 }}>🔍</span>
              </div>
            </>
          )}

          {step === 'questions' && selectedArea && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setStep('select')} style={{ fontSize: 13, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>← Back</button>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600 }}>{AREAS.find(a => a.id === selectedArea)?.title}</h2>
                </div>
                <div style={{ background: 'var(--white)', borderRadius: 8, height: 6, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--green)', width: `${progress}%`, transition: 'width .3s', borderRadius: 8 }} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 24 }}>{answered} of {questions.length} answered</p>
                <div className="card" style={{ padding: 24 }}>
                  {questions.map(q => (
                    <div key={q.key} style={{ marginBottom: 20 }}>
                      <label className="field-label">{q.q}</label>
                      {q.type === 'text' ? (
                        <input className="field-input" placeholder={q.placeholder} value={answers[q.key] || ''} onChange={e => setAnswers(prev => ({ ...prev, [q.key]: e.target.value }))} />
                      ) : (
                        <select className="field-input" value={answers[q.key] || ''} onChange={e => setAnswers(prev => ({ ...prev, [q.key]: e.target.value }))} style={{ cursor: 'pointer' }}>
                          <option value="">Select answer...</option>
                          {q.options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                  {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
                  <button onClick={runAudit} disabled={loading || answered < 3} className="btn btn-primary btn-full">
                    {loading ? '🤖 Analysing compliance...' : `Run ${AREAS.find(a => a.id === selectedArea)?.title} Audit →`}
                  </button>
                  {answered < 3 && <p style={{ fontSize: 12, color: 'var(--ink2)', textAlign: 'center', marginTop: 8 }}>Answer at least 3 questions to run the audit</p>}
                </div>
              </div>

              <div style={{ background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 14, padding: 24, height: 'fit-content' }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>What this audit covers</h3>
                {selectedArea === 'crm' && ['Data retention compliance (GDPR Art. 5)', 'Lawful basis for processing', 'Third-party processor DPAs', 'Data subject rights implementation', 'International transfer safeguards', 'Inactive data management'].map(item => <div key={item} style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 8, display: 'flex', gap: 8 }}><span style={{ color: 'var(--green)' }}>✓</span>{item}</div>)}
                {selectedArea === 'hr' && ['Employee record retention periods', 'Special category data (health, biometric)', 'Recruitment data compliance', 'Employee data subject rights', 'HR system processor agreements', 'Staff GDPR training assessment'].map(item => <div key={item} style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 8, display: 'flex', gap: 8 }}><span style={{ color: 'var(--green)' }}>✓</span>{item}</div>)}
                {selectedArea === 'email' && ['Consent mechanism (PECR + GDPR)', 'Unsubscribe compliance', 'Suppression list management', 'Email provider DPA status', 'Marketing list provenance', 'Re-engagement compliance'].map(item => <div key={item} style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 8, display: 'flex', gap: 8 }}><span style={{ color: 'var(--green)' }}>✓</span>{item}</div>)}
                {selectedArea === 'vendor' && ['DPA status for all vendors', 'International transfer safeguards', 'Subprocessor chain compliance', 'Contract data protection clauses', 'Vendor breach notification rights', 'Annual vendor review process'].map(item => <div key={item} style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 8, display: 'flex', gap: 8 }}><span style={{ color: 'var(--green)' }}>✓</span>{item}</div>)}
              </div>
            </div>
          )}

          {step === 'result' && result && (
            <div>
              {/* Score header */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
                <div style={{ width: 88, height: 88, borderRadius: '50%', background: `conic-gradient(${scCol} ${result.score * 3.6}deg, var(--green-p) ${result.score * 3.6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', width: 66, height: 66, background: 'var(--white)', borderRadius: '50%' }} />
                  <span style={{ position: 'relative', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, color: scCol, zIndex: 1 }}>{result.score}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700 }}>{AREAS.find(a => a.id === selectedArea)?.title}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: sc >= 70 ? 'var(--green-p)' : sc >= 40 ? 'var(--amber-bg)' : 'var(--red-bg)', color: scCol }}>{result.rating}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.65 }}>{result.summary}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 6 }}>{businessName || 'Your business'} · {new Date().toLocaleDateString('en-GB')}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => {
                    const lines = [
                      `${AREAS.find(a => a.id === selectedArea)?.title} Compliance Audit — ${businessName || 'Report'}`,
                      `Score: ${result.score}/100 (${result.rating})`, '',
                      result.summary, '',
                      '--- ISSUES ---',
                      ...result.issues.map(i => `[${i.sev}] ${i.title}\n${i.desc}\nRef: ${i.reg}`), '',
                      '--- ACTION PLAN ---',
                      ...result.actions.map(a => `[${a.priority}] ${a.action}\n${a.detail}`),
                    ]
                    const el = document.createElement('a')
                    el.href = URL.createObjectURL(new Blob([lines.join('\n\n')], { type: 'text/plain' }))
                    el.download = `${selectedArea}-audit-${(businessName || 'report').toLowerCase().replace(/\s+/g, '-')}.txt`
                    el.click()
                  }} style={{ fontSize: 12, padding: '9px 16px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>⬇ Download report</button>
                  <button onClick={() => { setStep('select'); setResult(null); setAnswers({}) }} className="btn btn-primary btn-sm">Audit another →</button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20, marginBottom: 20 }}>
                {/* Issues */}
                <div>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 14 }}>
                    {result.issues.length === 0 ? '🎉 No issues found' : `${result.issues.length} compliance issue${result.issues.length !== 1 ? 's' : ''} found`}
                  </h2>
                  {result.issues.length === 0 ? (
                    <div style={{ background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
                      <p style={{ fontSize: 14, color: 'var(--green)', fontWeight: 500 }}>This area passed all compliance checks.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {result.issues.map((iss, i) => (
                        <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 13, padding: '16px 20px', display: 'grid', gridTemplateColumns: '74px 1fr', gap: 12, alignItems: 'start' }}>
                          <span className={`chip chip-${iss.sev.toLowerCase()}`} style={{ textAlign: 'center', display: 'block', padding: '4px 0', borderRadius: 6 }}>{iss.sev}</span>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{iss.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.55, marginBottom: 6 }}>{iss.desc}</div>
                            <span style={{ fontSize: 10, background: 'var(--green-p)', color: 'var(--green)', padding: '2px 8px', borderRadius: 4 }}>{iss.reg}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {result.positives?.length > 0 && (
                    <div style={{ background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 10 }}>✅ What you're doing well</div>
                      {result.positives.map((p, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 6, display: 'flex', gap: 7 }}><span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{p}</div>
                      ))}
                    </div>
                  )}
                  {result.privacyPolicyAdditions?.length > 0 && (
                    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 10 }}>📄 Add to your privacy policy</div>
                      {result.privacyPolicyAdditions.map((p, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 6, display: 'flex', gap: 7 }}><span style={{ color: 'var(--amber-text)', flexShrink: 0 }}>+</span>{p}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action plan */}
              {result.actions?.length > 0 && (
                <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>📋 Action plan</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.actions.map((action, i) => {
                      const pc = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS['Within 90 days']
                      return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, background: pc.bg, border: `1px solid ${pc.border}`, borderRadius: 10, padding: '14px 16px', alignItems: 'start' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: pc.text, lineHeight: 1.3 }}>{action.priority}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{action.action}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5 }}>{action.detail}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Audit other areas */}
              <div style={{ marginTop: 8 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--ink2)' }}>Audit another area:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {AREAS.filter(a => a.id !== selectedArea).map(area => (
                    <button key={area.id} onClick={() => { setSelectedArea(area.id); setAnswers({}); setStep('questions') }}
                      style={{ padding: '16px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ fontSize: 20, marginBottom: 8 }}>{area.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{area.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--green)' }}>Run audit →</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
