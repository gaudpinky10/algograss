'use client'
import { useState } from 'react'

const CATEGORY_COLORS = {
  'Subject Access Request': '#3B82F6', 'Erasure Request': '#EF4444', 'Marketing Consent': '#F59E0B',
  'Data Breach': '#DC2626', 'Cookie Complaint': '#8B5CF6', 'Data Portability': '#06B6D4',
  'Rectification Request': '#10B981', 'Restriction Request': '#F97316', 'Objection to Processing': '#EC4899',
  'Employee/HR Data': '#6366F1', 'Vendor Compliance': '#84CC16', 'General Privacy': '#64748B', 'Not GDPR Related': '#9CA3AF'
}

export default function ComplaintPage() {
  const [complaint, setComplaint] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function analyse() {
    if (!complaint.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint, businessName }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResult(data.result)
    } catch { setError('Analysis failed. Please try again.') }
    setLoading(false)
  }

  const urgencyColors = { High: '#FEF2F2', Medium: '#FFFBEB', Low: '#F0FDF4' }
  const urgencyText = { High: '#DC2626', Medium: '#D97706', Low: '#16A34A' }

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      <section style={{ background: 'var(--ink)', padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,217,106,.15)', border: '1px solid rgba(184,217,106,.3)', padding: '5px 13px', borderRadius: 100, marginBottom: 20, fontSize: 11, fontWeight: 600, color: 'var(--lime)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            NEW FEATURE
          </div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 12, lineHeight: 1.1 }}>AI Complaint Classifier</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, maxWidth: 560 }}>Paste any customer complaint or message. Our AI instantly classifies it, identifies the GDPR category, urgency level, response deadline, and gives you a draft response.</p>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 800 }}>
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24 }}>
            <div>
              <div className="card" style={{ padding: 28, marginBottom: 0 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Paste the complaint</h2>
                <div className="field-wrap">
                  <label className="field-label">Your business name (optional)</label>
                  <input className="field-input" placeholder="e.g. Acme Ltd" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="field-label">Complaint / message text *</label>
                  <textarea value={complaint} onChange={e => setComplaint(e.target.value)}
                    placeholder={`Example:\n"I unsubscribed from your emails 3 months ago but keep receiving marketing. You are still storing my personal data without my consent. I want all my data deleted immediately."`}
                    style={{ width: '100%', minHeight: 180, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
                </div>
                {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
                <button onClick={analyse} disabled={loading || !complaint.trim()} className="btn btn-primary btn-full">
                  {loading ? '🤖 Analysing complaint...' : 'Classify complaint →'}
                </button>

                <div style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <p style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 12, fontWeight: 600 }}>Try these examples:</p>
                  {[
                    'Why are you still storing my email address? I deleted my account 6 months ago.',
                    'I never gave consent for you to share my data with third parties.',
                    'I want to know what personal data you hold about me.',
                  ].map(ex => (
                    <button key={ex} onClick={() => setComplaint(ex)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--cream)', color: 'var(--ink2)', cursor: 'pointer', marginBottom: 6, lineHeight: 1.4 }}>
                      "{ex}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: result.isGdprComplaint ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${result.isGdprComplaint ? 'var(--green-m)' : '#F5B7B1'}`, borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{result.isGdprComplaint ? '⚖️' : 'ℹ️'}</span>
                    <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: result.isGdprComplaint ? 'var(--green)' : 'var(--red-text)' }}>
                      {result.isGdprComplaint ? 'GDPR Complaint Detected' : 'Not a GDPR complaint'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{result.summary}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, color: 'var(--ink2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Category</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: CATEGORY_COLORS[result.category] || 'var(--ink)' }}>{result.category}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 3 }}>{result.regulationRef}</div>
                  </div>
                  <div style={{ background: urgencyColors[result.urgency] || 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, color: 'var(--ink2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Urgency</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: urgencyText[result.urgency] }}>{result.urgency}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 3 }}>Respond within {result.responseDays} days</div>
                  </div>
                </div>

                <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>✅ Recommended Action</div>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{result.recommendedAction}</p>
                </div>

                <div style={{ background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', marginBottom: 8 }}>📧 Draft Acknowledgement Email</div>
                  <pre style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'transparent', margin: 0 }}>{result.templateResponse}</pre>
                  <button onClick={() => navigator.clipboard.writeText(result.templateResponse)}
                    style={{ marginTop: 10, fontSize: 11, padding: '6px 12px', borderRadius: 6, border: '1px solid var(--green-m)', background: 'var(--white)', color: 'var(--green)', cursor: 'pointer' }}>
                    Copy email
                  </button>
                </div>

                <div style={{ background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: 'var(--ink2)' }}>
                  <strong style={{ color: 'var(--green)' }}>Disclaimer:</strong> This is AI-generated guidance only. Not legal advice. Consult a qualified solicitor for complex complaints.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
