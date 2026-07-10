'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const A = '#9B7BFA'
const P = '#818CF8'


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(cookie.split('=')[1]))
  } catch { return null }
}
export default function AdminDatabase() {
  const [health, setHealth]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [initing, setIniting] = useState(false)
  const [initResult, setInitResult] = useState(null)
  const [error, setError]     = useState('')
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
    if (!u.isAdmin && u.role !== 'founder' && u.role !== 'developer') { router.push('/dashboard'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadHealth() {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/db')
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Failed'); return }
      setHealth(d)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  async function runInit() {
    setIniting(true)
    setInitResult(null)
    try {
      const r = await fetch('/api/admin/db', { method: 'POST' })
      const d = await r.json()
      setInitResult(d)
      await loadHealth()
    } catch (e) { setError(e.message) }
    finally { setIniting(false) }
  }

  useEffect(() => { loadHealth() }, [])

  const totalDocs  = health?.totalDocuments ?? 0
  const colCount   = health?.collections?.length ?? 0
  const connected  = health?.connected

  return (
    <div style={{ minHeight: '100vh', background: '#06060F', color: '#0F172A', fontFamily: 'var(--font-space-grotesk,"Space Grotesk"),sans-serif', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <a href="/admin" style={{ color: '#64748B', fontSize: 13, textDecoration: 'none', display: 'block', marginBottom: 6 }}>← Back to Admin</a>
            <h1 style={{ fontFamily: 'var(--font-syne,"Syne"),sans-serif', fontWeight: 800, fontSize: 28, background: `linear-gradient(135deg,${A},${P})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🗄️ Database Manager
            </h1>
            <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>MongoDB Atlas · algograss database</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={loadHealth} style={{ padding: '10px 18px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#0F172A', fontSize: 13, cursor: 'pointer' }}>
              ↻ Refresh
            </button>
            <button onClick={runInit} disabled={initing} style={{ padding: '10px 20px', background: initing ? 'rgba(139,92,246,0.3)' : A, border: 'none', borderRadius: 8, color: '#06060F', fontSize: 13, fontWeight: 700, cursor: initing ? 'wait' : 'pointer' }}>
              {initing ? '⏳ Initializing…' : '⚡ Initialize DB'}
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Connection', value: loading ? '…' : connected ? '✅ Connected' : '❌ Disconnected', color: connected ? A : '#F87171' },
            { label: 'Database',   value: 'algograss',  color: A },
            { label: 'Collections', value: colCount, color: P },
            { label: 'Total Documents', value: totalDocs.toLocaleString(), color: '#FCD34D' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Init result */}
        {initResult && (
          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ color: A, fontWeight: 700, marginBottom: 8 }}>✅ Initialization complete — {initResult.collections} collections processed</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>{initResult.initializedAt}</div>
            {initResult.results && (
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {initResult.results.map(r => (
                  <span key={r.name} style={{ fontSize: 11, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 6, padding: '3px 8px', color: A }}>
                    {r.name} · {r.indexes.filter(i => i.status === 'ok').length} new, {r.indexes.filter(i => i.status === 'already_exists').length} existing
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, color: '#F87171', fontSize: 14 }}>
            ❌ {error}
          </div>
        )}

        {/* Collections table */}
        <div style={{ background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>All Collections</h2>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{health?.checkedAt ? `Checked ${new Date(health.checkedAt).toLocaleTimeString('en-GB')}` : ''}</span>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94A3B8' }}>Loading database health…</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {['Collection', 'Description', 'Documents', 'Indexes', 'Status'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94A3B8', letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(health?.collections || []).map((col, i) => (
                  <tr key={col.name} style={{ borderBottom: '1px solid rgba(15,23,42,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ padding: '14px 24px', fontWeight: 600, fontSize: 13, color: A, fontFamily: 'monospace' }}>{col.name}</td>
                    <td style={{ padding: '14px 24px', fontSize: 12, color: '#64748B', maxWidth: 280 }}>{col.description}</td>
                    <td style={{ padding: '14px 24px', fontSize: 14, fontWeight: 700, color: col.documents > 0 ? '#0F172A' : '#94A3B8' }}>
                      {col.documents.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: 13 }}>
                      <span style={{ background: col.indexes > 1 ? 'rgba(129,140,248,0.15)' : 'rgba(15,23,42,0.05)', color: col.indexes > 1 ? P : '#94A3B8', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
                        {col.indexes} {col.indexes === 1 ? 'index' : 'indexes'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      {col.error ? (
                        <span style={{ fontSize: 11, color: '#F87171' }}>⚠ Error</span>
                      ) : col.indexes <= 1 ? (
                        <span style={{ fontSize: 11, color: '#FCD34D' }}>⚠ No indexes</span>
                      ) : (
                        <span style={{ fontSize: 11, color: A }}>✓ Ready</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Schema reference */}
        <div style={{ marginTop: 32, background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '24px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: '#0F172A' }}>Schema Reference</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {[
              { name: 'users', fields: ['email (unique)', 'name', 'password (sha256+salt)', 'plan', 'website', 'isAdmin', 'stripeCustomerId', 'createdAt'] },
              { name: 'subscriptions', fields: ['userEmail', 'stripeCustomerId', 'stripeSubscriptionId', 'plan', 'status', 'trial', 'trialEndsAt', 'paymentMethodId', 'refundStatus', 'createdAt'] },
              { name: 'scans', fields: ['userEmail', 'url', 'score (0-100)', 'issues[]', 'trackers[]', 'checks{}', 'consentPlatform', 'scannedAt'] },
              { name: 'complaints', fields: ['userEmail', 'channel', 'complaintText', 'category', 'urgency', 'riskLevel', 'responseDays', 'regulationRef', 'summary', 'recommendedAction', 'status', 'createdAt'] },
              { name: 'dsars', fields: ['userEmail', 'requesterName', 'requesterEmail', 'requestType', 'requestDetails', 'aiGuide', 'deadline', 'status', 'createdAt'] },
              { name: 'vendors', fields: ['userEmail', 'name', 'type', 'dataCategories[]', 'transfersOutsideUK', 'dpaSigned', 'lastAudit', 'isoOrSoc2', 'score', 'level', 'createdAt'] },
              { name: 'dpias', fields: ['userEmail', 'projectName', 'dataTypes', 'purpose', 'riskLevel', 'mitigations', 'aiAnalysis', 'createdAt'] },
              { name: 'activities', fields: ['userEmail', 'tool', 'action', 'detail', 'meta{}', 'ip', 'createdAt'] },
              { name: 'waitlist', fields: ['email (unique)', 'name', 'source', 'website', 'createdAt', 'updatedAt'] },
              { name: 'billing_events', fields: ['stripeEventId (unique)', 'userEmail', 'event', 'plan', 'trial', 'amount', 'currency', 'createdAt'] },
              { name: 'reminders', fields: ['userEmail', 'title', 'description', 'dueDate', 'priority', 'category', 'completed', 'createdAt'] },
              { name: 'notifications', fields: ['userEmail', 'type', 'title', 'body', 'read', 'link', 'createdAt (90d TTL)'] },
            ].map(s => (
              <div key={s.name} style={{ background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontFamily: 'monospace', color: A, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{s.name}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {s.fields.map(f => (
                    <span key={f} style={{ fontSize: 11, color: '#64748B' }}>· {f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#CBD5E1' }}>
          AlgoGrass Database Manager · MongoDB Atlas · algograss db · Founder access only
        </p>
      </div>
    </div>
  )
}
