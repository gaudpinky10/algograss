'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AI_SUBMISSIONS_KEY = 'algograss_ai_submissions'
const AUDIT_LOG_KEY = 'algograss_audit_log'

function getUser() {
  try {
    const c = document.cookie.split(';').map(x => x.trim()).find(x => x.startsWith('algograss_user='))
    return c ? JSON.parse(atob(c.split('=')[1])) : null
  } catch { return null }
}

function getData(key) { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function saveData(key, data) { try { localStorage.setItem(key, JSON.stringify(data)) } catch {} }

function addAuditLog(action, detail, adminEmail) {
  const logs = getData(AUDIT_LOG_KEY)
  logs.unshift({ action, detail, by: adminEmail, at: new Date().toISOString() })
  saveData(AUDIT_LOG_KEY, logs.slice(0, 100))
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('overview')
  const [submissions, setSubmissions] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [note, setNote] = useState({})

  useEffect(() => {
    const u = getUser()
    if (!u || !u.isAdmin) { router.push('/login'); return }
    setUser(u)
    setSubmissions(getData(AI_SUBMISSIONS_KEY))
    setAuditLog(getData(AUDIT_LOG_KEY))
  }, [])

  function approve(id, approved) {
    const updated = submissions.map(s => s.id === id ? { ...s, status: approved ? 'Approved' : 'Rejected', reviewNote: note[id] || '', reviewedAt: new Date().toISOString(), reviewedBy: user?.email } : s)
    setSubmissions(updated)
    saveData(AI_SUBMISSIONS_KEY, updated)
    addAuditLog(approved ? 'APPROVED' : 'REJECTED', `AI use case: ${submissions.find(s => s.id === id)?.toolName}`, user?.email)
    setAuditLog(getData(AUDIT_LOG_KEY))
    setNote(prev => ({ ...prev, [id]: '' }))
  }

  if (!user) return <div style={{ padding: 48, textAlign: 'center' }}>Loading...</div>

  const pending = submissions.filter(s => s.status === 'Pending').length
  const approved = submissions.filter(s => s.status === 'Approved').length
  const rejected = submissions.filter(s => s.status === 'Rejected').length

  return (
    <div style={{ minHeight: '100vh', background: '#0F1712' }}>
      {/* Admin Header */}
      <div style={{ background: '#1a2e1f', borderBottom: '1px solid #2d4a35', padding: '18px 0' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: 'var(--lime)', color: 'var(--ink)', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '.08em' }}>ADMIN</div>
            <div>
              <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 2 }}>AlgoGrass Admin</h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Logged in as {user.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="/dashboard" style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', textDecoration: 'none', padding: '8px 14px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8 }}>User Dashboard</a>
            <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', textDecoration: 'none', padding: '8px 14px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8 }}>← Back to site</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#1a2e1f', borderBottom: '1px solid #2d4a35' }}>
        <div className="wrap" style={{ display: 'flex' }}>
          {[['overview','📊 Overview'], ['approvals',`✅ AI Approvals${pending > 0 ? ` (${pending})` : ''}`], ['register','📋 AI Register'], ['audit','🔍 Audit Trail']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: tab === id ? 600 : 400, color: tab === id ? 'var(--lime)' : 'rgba(255,255,255,.5)', borderBottom: tab === id ? '2px solid var(--lime)' : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ padding: '32px 48px' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
              {[
                ['AI Submissions', submissions.length, '#B8D96A', '🤖'],
                ['Pending Review', pending, pending > 0 ? '#FCD34D' : '#B8D96A', '⏳'],
                ['Approved', approved, '#B8D96A', '✅'],
                ['Rejected', rejected, '#F87171', '❌'],
              ].map(([label, val, col, icon]) => (
                <div key={label} style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, padding: '20px 18px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: col, lineHeight: 1, marginBottom: 6 }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

            {pending > 0 && (
              <div style={{ background: '#2d1f0a', border: '1px solid #78350f', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>⏳</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#FCD34D' }}>{pending} AI use case{pending > 1 ? 's' : ''} waiting for your approval.</span>
                </div>
                <button onClick={() => setTab('approvals')} style={{ fontSize: 12, padding: '8px 16px', borderRadius: 8, border: '1px solid #78350f', background: '#FCD34D', color: '#1c1917', cursor: 'pointer', fontWeight: 600 }}>Review now →</button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Recent AI Submissions</h3>
                {submissions.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>No submissions yet.</p>
                ) : submissions.slice(0, 5).map(s => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #2d4a35' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{s.toolName}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{s.submittedBy} · {new Date(s.submittedAt).toLocaleDateString('en-GB')}</div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: s.status === 'Approved' ? '#052e16' : s.status === 'Rejected' ? '#2d1515' : '#2d2505', color: s.status === 'Approved' ? '#86efac' : s.status === 'Rejected' ? '#f87171' : '#FCD34D' }}>{s.status}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Recent Audit Log</h3>
                {auditLog.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>No actions yet.</p>
                ) : auditLog.slice(0, 6).map((log, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #2d4a35' }}>
                    <div style={{ fontSize: 12, color: '#B8D96A', fontWeight: 600 }}>{log.action}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{log.detail} · {new Date(log.at).toLocaleString('en-GB')}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 20, background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, padding: 22 }}>
              <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Admin Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {[
                  ['Review Approvals', '✅', () => setTab('approvals')],
                  ['View AI Register', '📋', () => setTab('register')],
                  ['View Audit Trail', '🔍', () => setTab('audit')],
                  ['Go to Dashboard', '📊', () => router.push('/dashboard')],
                ].map(([label, icon, action]) => (
                  <button key={label} onClick={action}
                    style={{ padding: '16px', borderRadius: 12, border: '1px solid #2d4a35', background: 'rgba(184,217,106,.05)', color: '#fff', cursor: 'pointer', textAlign: 'center', fontSize: 13 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* APPROVALS */}
        {tab === 'approvals' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 3 }}>AI Use Case Approvals</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>Review and approve or reject AI tool submissions from your team</p>
            </div>

            {submissions.length === 0 ? (
              <div style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>No submissions yet. They will appear here when users submit AI use cases.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {submissions.map(s => (
                  <div key={s.id} style={{ background: '#1a2e1f', border: `1px solid ${s.status === 'Approved' ? '#2d4a35' : s.status === 'Rejected' ? '#4a1a1a' : '#4a3a00'}`, borderRadius: 14, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, color: '#fff' }}>{s.toolName}</h3>
                          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: s.status === 'Approved' ? '#052e16' : s.status === 'Rejected' ? '#2d1515' : '#2d2505', color: s.status === 'Approved' ? '#86efac' : s.status === 'Rejected' ? '#f87171' : '#FCD34D' }}>{s.status}</span>
                          {s.assessment?.riskLevel && (
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: s.assessment.riskLevel === 'High' ? '#2d1515' : s.assessment.riskLevel === 'Medium' ? '#2d2505' : '#052e16', color: s.assessment.riskLevel === 'High' ? '#f87171' : s.assessment.riskLevel === 'Medium' ? '#FCD34D' : '#86efac' }}>
                              Risk: {s.assessment.riskLevel}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 4 }}>Submitted by: {s.submittedBy} · {new Date(s.submittedAt).toLocaleString('en-GB')}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                      {[['Purpose', s.purpose], ['Data Types', s.dataTypes], ['Legal Basis', s.legalBasis]].map(([label, val]) => (
                        <div key={label} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)' }}>{val || 'Not specified'}</div>
                        </div>
                      ))}
                    </div>

                    {s.assessment && (
                      <div style={{ background: 'rgba(0,0,0,.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: '#B8D96A', fontWeight: 600, marginBottom: 8 }}>🤖 AI Assessment</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Risk Score: <strong style={{ color: '#fff' }}>{s.assessment.riskScore}/10</strong></div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>DPIA Required: <strong style={{ color: s.assessment.dpiaRequired ? '#f87171' : '#86efac' }}>{s.assessment.dpiaRequired ? 'Yes' : 'No'}</strong></div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Legal Basis Valid: <strong style={{ color: s.assessment.legalBasisValid ? '#86efac' : '#f87171' }}>{s.assessment.legalBasisValid ? 'Yes' : 'No'}</strong></div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Recommendation: <strong style={{ color: '#B8D96A' }}>{s.assessment.approvalRecommendation}</strong></div>
                        </div>
                        {s.assessment.conditions?.length > 0 && (
                          <div style={{ marginTop: 8 }}>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>Conditions:</div>
                            {s.assessment.conditions.map((c, i) => <div key={i} style={{ fontSize: 12, color: '#FCD34D' }}>• {c}</div>)}
                          </div>
                        )}
                      </div>
                    )}

                    {s.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <input placeholder="Add a review note (optional)..." value={note[s.id] || ''} onChange={e => setNote(prev => ({ ...prev, [s.id]: e.target.value }))}
                          style={{ flex: 1, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, padding: '9px 14px', fontSize: 13, color: '#fff', outline: 'none' }} />
                        <button onClick={() => approve(s.id, true)} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>✅ Approve</button>
                        <button onClick={() => approve(s.id, false)} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>❌ Reject</button>
                      </div>
                    )}

                    {s.status !== 'Pending' && s.reviewNote && (
                      <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
                        <strong style={{ color: 'rgba(255,255,255,.8)' }}>Review note:</strong> {s.reviewNote} · by {s.reviewedBy} on {new Date(s.reviewedAt).toLocaleDateString('en-GB')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI REGISTER */}
        {tab === 'register' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 3 }}>AI Register</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>All approved AI tools in use across your organisation</p>
            </div>
            {submissions.filter(s => s.status === 'Approved').length === 0 ? (
              <div style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)' }}>No approved AI tools yet. Approved submissions will appear here.</p>
              </div>
            ) : (
              <div style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(184,217,106,.08)' }}>
                      {['Tool', 'Purpose', 'Data Types', 'Legal Basis', 'Risk', 'DPIA', 'Review Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.filter(s => s.status === 'Approved').map((s, i) => (
                      <tr key={s.id} style={{ borderTop: '1px solid #2d4a35', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.02)' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: '#fff' }}>{s.toolName}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,.6)', maxWidth: 150 }}>{s.purpose}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{s.dataTypes}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{s.legalBasis}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: s.assessment?.riskLevel === 'High' ? '#2d1515' : s.assessment?.riskLevel === 'Medium' ? '#2d2505' : '#052e16', color: s.assessment?.riskLevel === 'High' ? '#f87171' : s.assessment?.riskLevel === 'Medium' ? '#FCD34D' : '#86efac', fontWeight: 600 }}>{s.assessment?.riskLevel || 'N/A'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: s.assessment?.dpiaRequired ? '#f87171' : '#86efac' }}>{s.assessment?.dpiaRequired ? 'Required' : 'Not needed'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{s.assessment?.reviewDate || 'N/A'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#052e16', color: '#86efac', fontWeight: 600 }}>Approved</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AUDIT TRAIL */}
        {tab === 'audit' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 3 }}>Audit Trail</h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>Complete log of all admin actions</p>
              </div>
              <button onClick={() => { saveData(AUDIT_LOG_KEY, []); setAuditLog([]) }} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid #2d4a35', background: 'transparent', color: 'rgba(255,255,255,.4)', cursor: 'pointer' }}>Clear log</button>
            </div>
            {auditLog.length === 0 ? (
              <div style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>No audit entries yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {auditLog.map((log, i) => (
                  <div key={i} style={{ background: '#1a2e1f', border: '1px solid #2d4a35', borderRadius: 10, padding: '14px 18px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, fontWeight: 700, background: log.action === 'APPROVED' ? '#052e16' : log.action === 'REJECTED' ? '#2d1515' : 'rgba(184,217,106,.1)', color: log.action === 'APPROVED' ? '#86efac' : log.action === 'REJECTED' ? '#f87171' : '#B8D96A' }}>{log.action}</span>
                    <div>
                      <div style={{ fontSize: 13, color: '#fff', marginBottom: 2 }}>{log.detail}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>by {log.by}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', textAlign: 'right' }}>{new Date(log.at).toLocaleString('en-GB')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
