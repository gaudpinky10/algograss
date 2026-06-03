'use client'
import { useState } from 'react'

export default function DsarPage() {
  const [form, setForm] = useState({ requestText: '', businessName: '', dataTypes: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handle() {
    if (!form.requestText.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dsar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResult(data.response)
    } catch { setError('Failed. Please try again.') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      <section style={{ background: 'var(--green)', padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.15)', padding: '5px 13px', borderRadius: 100, marginBottom: 20, fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>GDPR Tool</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>DSAR Response Assistant</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 560 }}>Received a Subject Access Request? Paste it here and get a complete response guide — deadline, what to provide, identity verification, and a draft response.</p>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.4fr' : '1fr', gap: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Enter SAR details</h2>
              <div className="field-wrap"><label className="field-label">Your business name</label><input className="field-input" placeholder="e.g. Acme Ltd" value={form.businessName} onChange={set('businessName')} /></div>
              <div className="field-wrap">
                <label className="field-label">Types of data you hold about customers</label>
                <input className="field-input" placeholder="e.g. name, email, purchase history, IP address" value={form.dataTypes} onChange={set('dataTypes')} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">The SAR request text *</label>
                <textarea value={form.requestText} onChange={set('requestText')}
                  placeholder={`Example:\n"I am writing to request all personal data you hold about me under Article 15 of GDPR. Please provide copies of all data, who you share it with, and how long you keep it. My name is John Smith and my email is john@email.com"`}
                  style={{ width: '100%', minHeight: 160, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
              </div>
              {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
              <button onClick={handle} disabled={loading || !form.requestText.trim()} className="btn btn-primary btn-full">
                {loading ? '🤖 Generating response guide...' : 'Generate SAR response guide →'}
              </button>

              <div style={{ marginTop: 24, background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', marginBottom: 6 }}>What this tool provides:</p>
                {['Response deadline (calendar date)', 'List of data you must provide', 'Identity verification checklist', 'Draft acknowledgement email', 'Draft response template', 'Applicable exemptions', 'Step-by-step completion checklist'].map(item => (
                  <div key={item} style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 4, display: 'flex', gap: 6 }}>
                    <span style={{ color: 'var(--green)' }}>✓</span>{item}
                  </div>
                ))}
              </div>
            </div>

            {result && (
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 600 }}>SAR Response Guide</h2>
                  <button onClick={() => { const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([result], { type: 'text/plain' })); el.download = 'sar-response-guide.txt'; el.click() }}
                    style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer' }}>
                    ⬇ Download
                  </button>
                </div>
                <pre style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 600, overflowY: 'auto' }}>{result}</pre>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
