'use client'
import { useState } from 'react'

const AI_TOOLS = ['ChatGPT / OpenAI', 'Microsoft Copilot', 'Google Gemini', 'Claude (Anthropic)', 'GitHub Copilot', 'Midjourney', 'Grammarly', 'HubSpot AI', 'Salesforce Einstein', 'Other']

export default function AiGovernancePage() {
  const [form, setForm] = useState({ toolName: '', purpose: '', dataTypes: '', hasPersonalData: false, sharesWithThirdParty: false, businessName: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function assess() {
    if (!form.toolName || !form.purpose) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/ai-governance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResult(data.assessment)
    } catch { setError('Assessment failed. Please try again.') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      <section style={{ background: 'var(--ink)', padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,217,106,.15)', border: '1px solid rgba(184,217,106,.3)', padding: '5px 13px', borderRadius: 100, marginBottom: 20, fontSize: 11, fontWeight: 600, color: 'var(--lime)', letterSpacing: '.06em', textTransform: 'uppercase' }}>NEW · AI Governance</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>AI Tool GDPR Checker</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 580 }}>Is your team using ChatGPT, Copilot, or other AI tools with personal data? Check if your usage is GDPR compliant — get a risk assessment, required actions, and privacy policy wording in minutes.</p>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.4fr' : '1fr', gap: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Describe your AI usage</h2>

              <div className="field-wrap"><label className="field-label">Your business name</label><input className="field-input" placeholder="e.g. Acme Ltd" value={form.businessName} onChange={set('businessName')} /></div>

              <div className="field-wrap">
                <label className="field-label">AI tool being used *</label>
                <select className="field-input" value={form.toolName} onChange={set('toolName')} style={{ cursor: 'pointer' }}>
                  <option value="">Select a tool...</option>
                  {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="field-wrap">
                <label className="field-label">How are you using it? *</label>
                <textarea value={form.purpose} onChange={set('purpose')} placeholder="e.g. Drafting customer emails, summarising support tickets, generating marketing copy, analysing customer feedback..."
                  style={{ width: '100%', minHeight: 90, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
              </div>

              <div className="field-wrap">
                <label className="field-label">What data do you enter into the tool?</label>
                <input className="field-input" placeholder="e.g. customer names, emails, support messages, employee data" value={form.dataTypes} onChange={set('dataTypes')} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--ink)' }}>
                  <input type="checkbox" checked={form.hasPersonalData} onChange={e => setForm(f => ({ ...f, hasPersonalData: e.target.checked }))} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                  The data contains personal information (names, emails, IDs etc.)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--ink)' }}>
                  <input type="checkbox" checked={form.sharesWithThirdParty} onChange={e => setForm(f => ({ ...f, sharesWithThirdParty: e.target.checked }))} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                  Data is sent to / stored by the AI provider's servers
                </label>
              </div>

              {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
              <button onClick={assess} disabled={loading || !form.toolName || !form.purpose} className="btn btn-primary btn-full">
                {loading ? '🤖 Assessing AI usage...' : 'Run AI Governance Check →'}
              </button>

              <div style={{ marginTop: 20, background: '#FEF2F2', border: '1px solid #F5B7B1', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ fontSize: 12, color: '#DC2626', fontWeight: 600, marginBottom: 4 }}>⚠️ Why this matters</p>
                <p style={{ fontSize: 12, color: '#7F1D1D', lineHeight: 1.6 }}>Using AI tools with personal data without proper legal basis, DPA, or disclosure in your privacy policy may violate GDPR Art. 5, 6, 13 and 28.</p>
              </div>
            </div>

            {result && (
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 600 }}>AI Governance Assessment</h2>
                  <button onClick={() => { const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([result], { type: 'text/plain' })); el.download = 'ai-governance-assessment.txt'; el.click() }}
                    style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer' }}>
                    ⬇ Download
                  </button>
                </div>
                <pre style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 580, overflowY: 'auto' }}>{result}</pre>
                <div style={{ marginTop: 16, background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: 'var(--ink2)' }}>
                  <strong style={{ color: 'var(--green)' }}>Disclaimer:</strong> AI-generated assessment for guidance only. Not legal advice. Consult a qualified solicitor for complex cases.
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
