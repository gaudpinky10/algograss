'use client'
import { useState, useEffect } from 'react'

const REMINDERS_KEY = 'algograss_reminders'
const AUTO_EMAIL_KEY = 'algograss_auto_reminder_email'
const LAST_SENT_KEY = 'algograss_reminder_last_sent'
const TYPES = ['Policy Review', 'DPIA Review', 'AI Register Review', 'Vendor Contract Review', 'Staff Training', 'Privacy Notice Update', 'Data Retention Review', 'Security Audit', 'ICO Registration Renewal', 'Custom']

function getData(key) { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function saveData(key, data) { try { localStorage.setItem(key, JSON.stringify(data)) } catch {} }

function getDaysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
}

function getStatusStyle(days) {
  if (days < 0) return { bg: '#FEF2F2', text: '#DC2626', border: '#F5B7B1', label: 'OVERDUE' }
  if (days === 0) return { bg: '#FEF2F2', text: '#DC2626', border: '#F5B7B1', label: 'DUE TODAY' }
  if (days <= 7) return { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D', label: `${days}d` }
  if (days <= 30) return { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D', label: `${days}d` }
  return { bg: '#F0FDF4', text: '#16A34A', border: 'var(--green-m)', label: `${days}d` }
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', type: 'Policy Review', date: '', owner: '', notes: '' })

  // Manual email send
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  // Auto-reminder state
  const [autoEmail, setAutoEmail] = useState('')
  const [autoEnabled, setAutoEnabled] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [autoStatus, setAutoStatus] = useState('') // '', 'sent', 'no-due'

  const [filter, setFilter] = useState('all')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    const saved = getData(REMINDERS_KEY)
    setReminders(saved)

    // Restore auto-reminder settings
    const savedAutoEmail = localStorage.getItem(AUTO_EMAIL_KEY) || ''
    if (savedAutoEmail) {
      setAutoEmail(savedAutoEmail)
      setAutoEnabled(true)

      // Check if already sent today
      const lastSent = localStorage.getItem(LAST_SENT_KEY) || ''
      const today = new Date().toDateString()
      if (lastSent === today) {
        setAutoStatus('sent')
        return
      }

      // Auto-send if any reminders are due within 30 days
      const dueSoon = saved.filter(r => getDaysUntil(r.date) <= 30)
      if (dueSoon.length > 0) {
        fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: savedAutoEmail, reminders: saved }),
        })
          .then(r => r.json())
          .then(data => {
            if (data.success) {
              localStorage.setItem(LAST_SENT_KEY, today)
              setAutoStatus('sent')
            }
          })
          .catch(() => {})
      } else {
        setAutoStatus('no-due')
      }
    }
  }, [])

  function addReminder() {
    if (!form.title || !form.date) return
    const updated = [{ id: Date.now(), ...form, createdAt: new Date().toISOString() }, ...reminders]
    setReminders(updated); saveData(REMINDERS_KEY, updated)
    setShowForm(false); setForm({ title: '', type: 'Policy Review', date: '', owner: '', notes: '' })
  }

  function deleteReminder(id) {
    const updated = reminders.filter(r => r.id !== id)
    setReminders(updated); saveData(REMINDERS_KEY, updated)
  }

  async function sendEmailReminders() {
    if (!email || !reminders.length) return
    setEmailLoading(true)
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reminders }),
      })
      const data = await res.json()
      if (data.success) setEmailSent(true)
      else alert('Could not send email. Please try again.')
    } catch { alert('Failed to send email.') }
    setEmailLoading(false)
  }

  async function saveAutoReminder() {
    if (!autoEmail) return
    setAutoSaving(true)
    localStorage.setItem(AUTO_EMAIL_KEY, autoEmail)
    setAutoEnabled(true)
    // Send immediately on first subscribe
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: autoEmail, reminders }),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem(LAST_SENT_KEY, new Date().toDateString())
        setAutoStatus('sent')
      }
    } catch {}
    setAutoSaving(false)
  }

  function disableAutoReminder() {
    localStorage.removeItem(AUTO_EMAIL_KEY)
    localStorage.removeItem(LAST_SENT_KEY)
    setAutoEnabled(false)
    setAutoEmail('')
    setAutoStatus('')
  }

  const sorted = [...reminders].sort((a, b) => new Date(a.date) - new Date(b.date))
  const overdue = sorted.filter(r => getDaysUntil(r.date) < 0)
  const thisWeek = sorted.filter(r => { const d = getDaysUntil(r.date); return d >= 0 && d <= 7 })
  const thisMonth = sorted.filter(r => { const d = getDaysUntil(r.date); return d > 7 && d <= 30 })
  const filtered = filter === 'overdue' ? overdue : filter === 'week' ? thisWeek : filter === 'month' ? thisMonth : sorted

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      <section style={{ background: 'var(--green)', padding: '48px 0' }}>
        <div className="wrap">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.15)', padding: '5px 13px', borderRadius: 100, marginBottom: 16, fontSize: 11, fontWeight: 600, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>Compliance Reminders</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,3vw,42px)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>Review & Reminder Tracker</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.75)', maxWidth: 540, lineHeight: 1.7 }}>Never miss a compliance deadline. Track policy reviews, DPIA renewals, staff training, and vendor contract reviews — with automatic daily email digests.</p>
        </div>
      </section>

      {/* Stats filter bar */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '14px 0' }}>
        <div className="wrap" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['all', `All (${reminders.length})`], ['overdue', `⚠️ Overdue (${overdue.length})`], ['week', `🔴 This week (${thisWeek.length})`], ['month', `🟡 This month (${thisMonth.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)}
              style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${filter === id ? 'var(--green)' : 'var(--border)'}`, background: filter === id ? 'var(--green-p)' : 'var(--white)', color: filter === id ? 'var(--green)' : 'var(--ink2)', cursor: 'pointer', fontWeight: filter === id ? 600 : 400 }}>
              {label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">+ Add Reminder</button>
        </div>
      </div>

      <div className="wrap" style={{ padding: '32px 48px' }}>

        {/* ── Auto-reminder subscription ─────────────────────────────── */}
        <div style={{ background: 'var(--white)', border: `1.5px solid ${autoEnabled ? 'var(--green)' : 'var(--border)'}`, borderRadius: 14, padding: '18px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: autoEnabled ? 0 : 10 }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Automatic daily digest</span>
              {autoEnabled && autoStatus === 'sent' && (
                <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>✅ Sent today to {autoEmail}</span>
              )}
              {autoEnabled && autoStatus === 'no-due' && (
                <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--ink2)' }}>No reminders due within 30 days — will send when one is.</span>
              )}
            </div>
            {autoEnabled && (
              <button onClick={disableAutoReminder} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--cream)', color: 'var(--ink2)', cursor: 'pointer' }}>Disable</button>
            )}
          </div>
          {!autoEnabled && (
            <>
              <p style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 12, lineHeight: 1.6 }}>
                Subscribe to receive an automatic email digest each time you visit — sent once per day whenever reminders are due within 30 days.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input type="email" placeholder="your@email.com" value={autoEmail} onChange={e => setAutoEmail(e.target.value)}
                  style={{ flex: 1, minWidth: 200, border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
                <button onClick={saveAutoReminder} disabled={autoSaving || !autoEmail} className="btn btn-primary btn-sm">
                  {autoSaving ? 'Subscribing...' : 'Enable auto-reminders →'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Manual one-off email send ─────────────────────────────── */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '13px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 16 }}>📧</span>
          <span style={{ fontSize: 13, color: 'var(--ink2)' }}>Send all reminders now:</span>
          {emailSent ? (
            <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 500 }}>✅ Sent to {email}!</span>
          ) : (
            <>
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                style={{ flex: 1, minWidth: 180, border: '1px solid var(--border)', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none' }} />
              <button onClick={sendEmailReminders} disabled={emailLoading || !email || !reminders.length} className="btn btn-secondary btn-sm">
                {emailLoading ? 'Sending...' : 'Send now →'}
              </button>
            </>
          )}
        </div>

        {/* Add form */}
        {showForm && (
          <div className="card" style={{ padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Add Compliance Reminder</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div><label className="field-label">Title *</label><input className="field-input" placeholder="e.g. Annual Privacy Policy Review" value={form.title} onChange={set('title')} /></div>
              <div><label className="field-label">Type</label>
                <select className="field-input" value={form.type} onChange={set('type')} style={{ cursor: 'pointer' }}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="field-label">Due date *</label><input className="field-input" type="date" value={form.date} onChange={set('date')} /></div>
              <div><label className="field-label">Owner / Responsible person</label><input className="field-input" placeholder="e.g. Jane Smith, DPO" value={form.owner} onChange={set('owner')} /></div>
              <div style={{ gridColumn: '1/-1' }}><label className="field-label">Notes</label><input className="field-input" placeholder="Any additional notes..." value={form.notes} onChange={set('notes')} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={addReminder} disabled={!form.title || !form.date} className="btn btn-primary btn-sm">Save Reminder</button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          </div>
        )}

        {/* Reminders list */}
        {reminders.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No reminders yet</h3>
            <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>Add compliance deadlines and never miss a deadline.</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">+ Add first reminder</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--ink2)' }}>No reminders in this category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(reminder => {
              const days = getDaysUntil(reminder.date)
              const style = getStatusStyle(days)
              return (
                <div key={reminder.id} style={{ background: style.bg, border: `1px solid ${style.border}`, borderRadius: 13, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 16, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: style.text, lineHeight: 1 }}>{style.label}</div>
                    <div style={{ fontSize: 10, color: style.text, opacity: .7, marginTop: 2 }}>{days < 0 ? 'overdue' : days === 0 ? '' : 'remaining'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{reminder.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,.6)', color: 'var(--ink2)' }}>{reminder.type}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,.6)', color: 'var(--ink2)' }}>📅 {new Date(reminder.date).toLocaleDateString('en-GB')}</span>
                      {reminder.owner && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,.6)', color: 'var(--ink2)' }}>👤 {reminder.owner}</span>}
                      {reminder.notes && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,.6)', color: 'var(--ink2)' }}>💬 {reminder.notes}</span>}
                    </div>
                  </div>
                  <a href={reminder.type.includes('Policy') ? '/grc' : reminder.type.includes('DPIA') ? '/ai-governance' : '/grc'}
                    style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.4)', color: 'var(--ink)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Take action →
                  </a>
                  <button onClick={() => deleteReminder(reminder.id)} style={{ fontSize: 11, padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: 'rgba(255,255,255,.4)', color: 'var(--ink2)', cursor: 'pointer' }}>✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick-add common reminders */}
        {reminders.length === 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Common compliance reminders to add:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { title: 'Annual Privacy Policy Review', type: 'Policy Review', months: 12 },
                { title: 'Cookie Policy Review', type: 'Policy Review', months: 12 },
                { title: 'DPIA Review', type: 'DPIA Review', months: 12 },
                { title: 'Staff GDPR Training', type: 'Staff Training', months: 12 },
                { title: 'Vendor Contract Review', type: 'Vendor Contract Review', months: 6 },
                { title: 'AI Register Review', type: 'AI Register Review', months: 6 },
              ].map(item => (
                <button key={item.title} onClick={() => {
                  const d = new Date(); d.setMonth(d.getMonth() + item.months)
                  const r = { id: Date.now(), ...item, date: d.toISOString().split('T')[0], owner: '', notes: '', createdAt: new Date().toISOString() }
                  const updated = [r, ...reminders]; setReminders(updated); saveData(REMINDERS_KEY, updated)
                }} style={{ padding: '14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--white)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--green)' }}>+ Add (due in {item.months} months)</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
