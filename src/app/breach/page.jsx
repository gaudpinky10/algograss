'use client'
import { useState, useEffect, useRef } from 'react'

const S = {
  page: { minHeight: '100vh', background: '#FFFFFF', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" },
  wrap: { maxWidth: 800, margin: '0 auto' },
  header: { marginBottom: 36 },
  tag: { fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#EF4444', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 20, padding: '4px 14px', display: 'inline-block', marginBottom: 14 },
  h1: { fontSize: 34, fontWeight: 800, color: '#0F172A', margin: '0 0 10px', letterSpacing: -0.5 },
  sub: { color: '#94A3B8', fontSize: 15, margin: 0 },
  card: { background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 16, padding: '28px 32px', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 },
  label: { fontSize: 13, fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: 6 },
  input: { width: '100%', background: '#FFFFFF', border: '1.5px solid rgba(15,23,42,0.1)', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', background: '#FFFFFF', border: '1.5px solid rgba(15,23,42,0.1)', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 90, boxSizing: 'border-box', fontFamily: 'inherit' },
  row: { marginBottom: 18 },
  btn: { background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#FFFFFF', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%' },
  btnOutline: { background: 'transparent', color: '#0EA5E9', fontWeight: 600, fontSize: 13, padding: '10px 20px', borderRadius: 10, border: '1px solid #0EA5E9', cursor: 'pointer' },
  check: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  checkIcon: { fontSize: 16, flexShrink: 0, marginTop: 1 },
  checkText: { fontSize: 14, color: '#CBD5E1', lineHeight: 1.5 },
  letter: { background: '#FFFFFF', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 12, padding: 24, color: '#CBD5E1', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' },
}

const DATA_TYPES = ['Names','Email addresses','Financial data','Health data','Passwords','Location data','Phone numbers',"Children's data",'Biometric data','Criminal records']

function Countdown({ breachDateTime }) {
  const [remaining, setRemaining] = useState(null)
  useEffect(() => {
    if (!breachDateTime) return
    const update = () => {
      const discovery = new Date(breachDateTime)
      const deadline = new Date(discovery.getTime() + 72 * 60 * 60 * 1000)
      const diff = deadline - Date.now()
      setRemaining(diff)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [breachDateTime])

  if (!breachDateTime) return <p style={{ color: '#475569', fontSize: 14 }}>Enter breach discovery date/time above to start the countdown</p>
  if (remaining === null) return null

  if (remaining <= 0) {
    return (
      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ color: '#EF4444', fontWeight: 700, fontSize: 18, margin: '0 0 6px' }}>⚠️ 72-Hour Deadline Passed</p>
        <p style={{ color: '#94A3B8', fontSize: 13, margin: 0 }}>You must report to the ICO immediately. Late reporting should include an explanation for the delay.</p>
      </div>
    )
  }

  const hrs = Math.floor(remaining / (1000 * 60 * 60))
  const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((remaining % (1000 * 60)) / 1000)
  const pct = Math.max(0, (remaining / (72 * 60 * 60 * 1000)) * 100)
  const col = hrs > 24 ? '#0EA5E9' : hrs > 6 ? '#F59E0B' : '#EF4444'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
        {[[hrs,'Hours'],[mins,'Minutes'],[secs,'Seconds']].map(([v,l]) => (
          <div key={l} style={{ textAlign: 'center', background: '#FFFFFF', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 12, padding: '16px 20px', minWidth: 80 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: col, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2,'0')}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#FFFFFF', borderRadius: 8, height: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 8, transition: 'width 1s linear' }} />
      </div>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 8 }}>Time remaining to report to the ICO under Article 33 UK GDPR</p>
    </div>
  )
}

export default function BreachPage() {
  const [breachDate, setBreachDate] = useState('')
  const [form, setForm] = useState({ breachDescription: '', dataTypes: [], individualsAffected: '', consequences: '', measuresTaken: '', controllerName: '', dpoContact: '' })
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const letterRef = useRef(null)

  useEffect(() => {
    try {
      const c = document.cookie.split(';').find(x => x.trim().startsWith('algograss_user='))
      if (c) {
        const u = JSON.parse(atob(c.split('=')[1].trim()))
        setForm(f => ({ ...f, controllerName: u.name || '' }))
      }
    } catch {}
  }, [])

  const toggleType = t => setForm(f => ({ ...f, dataTypes: f.dataTypes.includes(t) ? f.dataTypes.filter(x => x !== t) : [...f.dataTypes, t] }))

  const generate = async () => {
    if (!form.breachDescription.trim()) return setError('Please describe the breach')
    setLoading(true); setError('')
    const res = await fetch('/api/breach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, breachDate }) })
    const data = await res.json()
    setLoading(false)
    if (data.error) return setError(data.error)
    setLetter(data.letter)
    setTimeout(() => letterRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const copy = () => { navigator.clipboard.writeText(letter); }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.header}>
          <div style={S.tag}>🚨 Data Breach Response</div>
          <h1 style={S.h1}>Breach Notification Tool</h1>
          <p style={S.sub}>ICO notification must be submitted within 72 hours of becoming aware of a breach — Article 33 UK GDPR</p>
        </div>

        {/* 72-Hour Countdown */}
        <div style={S.card}>
          <div style={S.cardTitle}>⏱️ 72-Hour Countdown</div>
          <div style={S.row}>
            <label style={S.label}>When did you discover the breach?</label>
            <input type="datetime-local" style={S.input} value={breachDate} onChange={e => setBreachDate(e.target.value)} />
          </div>
          <Countdown breachDateTime={breachDate} />
        </div>

        {/* Breach Details Form */}
        <div style={S.card}>
          <div style={S.cardTitle}>📋 Breach Details</div>

          <div style={S.row}>
            <label style={S.label}>Organisation / Controller name</label>
            <input style={S.input} value={form.controllerName} onChange={e => setForm(f => ({ ...f, controllerName: e.target.value }))} placeholder="Your company name" />
          </div>
          <div style={S.row}>
            <label style={S.label}>DPO or data protection contact</label>
            <input style={S.input} value={form.dpoContact} onChange={e => setForm(f => ({ ...f, dpoContact: e.target.value }))} placeholder="Name, email, phone" />
          </div>
          <div style={S.row}>
            <label style={S.label}>What happened? (describe the breach)</label>
            <textarea style={S.textarea} rows={4} value={form.breachDescription} onChange={e => setForm(f => ({ ...f, breachDescription: e.target.value }))} placeholder="e.g. Laptop containing customer records was stolen from a company vehicle..." />
          </div>
          <div style={S.row}>
            <label style={S.label}>Data types affected</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DATA_TYPES.map(t => (
                <button key={t} onClick={() => toggleType(t)} style={{ background: form.dataTypes.includes(t) ? 'rgba(14,165,233,0.15)' : 'rgba(15,23,42,0.03)', border: `1px solid ${form.dataTypes.includes(t) ? '#0EA5E9' : 'rgba(15,23,42,0.1)'}`, color: form.dataTypes.includes(t) ? '#0EA5E9' : '#94A3B8', borderRadius: 20, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={S.row}>
            <label style={S.label}>Approximate number of individuals affected</label>
            <input style={S.input} type="number" value={form.individualsAffected} onChange={e => setForm(f => ({ ...f, individualsAffected: e.target.value }))} placeholder="e.g. 250" />
          </div>
          <div style={S.row}>
            <label style={S.label}>Likely consequences of the breach</label>
            <textarea style={S.textarea} value={form.consequences} onChange={e => setForm(f => ({ ...f, consequences: e.target.value }))} placeholder="e.g. Risk of identity fraud, financial loss, distress to affected individuals..." />
          </div>
          <div style={S.row}>
            <label style={S.label}>Measures taken or proposed to address the breach</label>
            <textarea style={S.textarea} value={form.measuresTaken} onChange={e => setForm(f => ({ ...f, measuresTaken: e.target.value }))} placeholder="e.g. Device reported to police, affected individuals notified, password resets issued..." />
          </div>
          {error && <p style={{ color: '#EF4444', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button style={S.btn} onClick={generate} disabled={loading}>
            {loading ? 'Generating ICO Notification Letter...' : '📄 Generate ICO Notification Letter'}
          </button>
        </div>

        {/* What to do now — always visible */}
        <div style={S.card}>
          <div style={S.cardTitle}>✅ What To Do Right Now</div>
          {[
            ['🛑', 'Contain the breach immediately', 'Isolate affected systems, revoke compromised credentials, prevent further data loss.'],
            ['🔍', 'Assess the risk to individuals', 'Determine severity — could this breach cause harm, financial loss, or distress to the people affected?'],
            ['📋', 'Document the breach', 'Record everything: what happened, when, how, what data was involved. Required even if not reportable.'],
            ['📞', 'Report to the ICO within 72 hours', 'If the breach is likely to result in a risk to individuals, you must report to the ICO within 72 hours.'],
            ['📬', 'Notify affected individuals', 'If the breach poses a HIGH risk to individuals, notify them directly without undue delay.'],
            ['🔧', 'Review and improve security', 'Conduct a post-incident review and implement measures to prevent recurrence.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={S.check}>
              <span style={S.checkIcon}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 14, marginBottom: 2 }}>{title}</div>
                <div style={S.checkText}>{desc}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(15,23,42,0.1)' }}>
            <a href="https://ico.org.uk/for-organisations/report-a-breach/" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontWeight: 700, fontSize: 14, padding: '12px 24px', borderRadius: 10, textDecoration: 'none' }}>
              🏛️ Report directly to the ICO →
            </a>
          </div>
        </div>

        {/* Generated Letter */}
        {letter && (
          <div style={S.card} ref={letterRef}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={S.cardTitle}>📄 ICO Notification Letter</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={copy} style={S.btnOutline}>📋 Copy</button>
                <button onClick={() => window.print()} style={S.btnOutline}>🖨️ Print</button>
              </div>
            </div>
            <div style={S.letter}>{letter}</div>
            <p style={{ color: '#475569', fontSize: 12, marginTop: 12 }}>Review this letter carefully and have your DPO or legal advisor check it before submission. AlgoGrass generates this as a guide — it does not constitute legal advice.</p>
          </div>
        )}
      </div>
    </div>
  )
}
