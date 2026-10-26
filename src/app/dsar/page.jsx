'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(decodeURIComponent(cookie.slice(cookie.indexOf('=')+1).trim())))
  } catch { return null }
}
export default function DsarPage() {
  const [form, setForm] = useState({ requestText: '', businessName: '', dataTypes: '', requesterName: '', requesterEmail: '', requestType: 'SAR', dateReceived: new Date().toISOString().slice(0, 10) })
  const [dates, setDates] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
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
      setDates({ received: data.received, deadline: data.deadline, extendedDeadline: data.extendedDeadline })
    } catch { setError('Failed. Please try again.') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      <section style={{ background: 'var(--green)', padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 700 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.15)', padding: '5px 13px', borderRadius: 100, marginBottom: 20, fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>GDPR Tool</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>DSAR Response Assistant</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 560 }}>Received a subject access request, or another data rights request? Paste it here for your exact deadline, what to provide, identity checks and a draft reply.</p>
        </div>
      </section>

      <section style={{ padding: '48px 0' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1.4fr' : '1fr', gap: 24 }}>
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Enter SAR details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><label className="field-label">Date the request arrived *</label><input type="date" className="field-input" value={form.dateReceived} onChange={set('dateReceived')} style={{ color: '#0D0D1E', background: '#fff' }} /></div>
                <div className="field-wrap"><label className="field-label">Type of request</label>
                  <select className="field-input" value={form.requestType} onChange={set('requestType')} style={{ color: '#0D0D1E', background: '#fff' }}>
                    <option value="SAR">Access (copy of their data)</option>
                    <option value="Erasure">Erasure (delete their data)</option>
                    <option value="Rectification">Rectification (correct their data)</option>
                    <option value="Objection">Objection (stop using their data)</option>
                    <option value="Restriction">Restriction (pause use)</option>
                    <option value="Portability">Portability (send their data)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field-wrap"><label className="field-label">Requester's name</label><input className="field-input" placeholder="e.g. John Smith" value={form.requesterName} onChange={set('requesterName')} style={{ color: '#0D0D1E', background: '#fff' }} /></div>
                <div className="field-wrap"><label className="field-label">Requester's email</label><input className="field-input" placeholder="e.g. john@email.com" value={form.requesterEmail} onChange={set('requesterEmail')} style={{ color: '#0D0D1E', background: '#fff' }} /></div>
              </div>
              <div className="field-wrap"><label className="field-label">Your business name</label><input className="field-input" placeholder="e.g. Acme Ltd" value={form.businessName} onChange={set('businessName')} style={{ color: '#0D0D1E', background: '#fff' }} /></div>
              <div className="field-wrap">
                <label className="field-label">Types of data you hold about customers</label>
                <input className="field-input" placeholder="e.g. name, email, purchase history, IP address" value={form.dataTypes} onChange={set('dataTypes')} style={{ color: '#0D0D1E', background: '#fff' }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="field-label">The SAR request text *</label>
                <textarea value={form.requestText} onChange={set('requestText')}
                  placeholder={`Example:\n"I am writing to request all personal data you hold about me under Article 15 of GDPR. Please provide copies of all data, who you share it with, and how long you keep it. My name is John Smith and my email is john@email.com"`}
                  style={{ width: '100%', minHeight: 160, border: '1.5px solid #d1d5db', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#0D0D1E', background: '#ffffff', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
              </div>
              {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
              <button onClick={handle} disabled={loading || !form.requestText.trim()} className="btn btn-primary btn-full">
                {loading ? '🤖 Generating response guide...' : 'Generate SAR response guide →'}
              </button>

              <div style={{ marginTop: 24, background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)', marginBottom: 6 }}>What this tool provides:</p>
                {['Your deadline: one calendar month from the day it arrived (worked out for you, including weekends and bank holidays)', 'What you must provide', 'Proportionate identity checks', 'Draft acknowledgement email', 'Draft response template', 'Exemptions that may apply', 'Step-by-step checklist'].map(item => (
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
                {dates && (
                  <div style={{ background: 'var(--green-p)', border: '1px solid var(--green-m)', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Received {dates.received}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', margin: '4px 0' }}>Respond by {dates.deadline}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>If complex or one of several requests, you can extend to {dates.extendedDeadline}, but you must tell them within the first month.</div>
                  </div>
                )}
                <pre style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 600, overflowY: 'auto' }}>{result}</pre>
                <p style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 10 }}>AI-generated guidance, not legal advice. Check it before you send anything, and take advice before refusing a request or relying on an exemption.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
