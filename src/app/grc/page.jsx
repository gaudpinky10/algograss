'use client'
import { useState, useEffect } from 'react'

const RISK_KEY = 'algograss_risks'
const POLICY_KEY = 'algograss_policies'
const INCIDENT_KEY = 'algograss_incidents'

function getData(key) { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function saveData(key, data) { try { localStorage.setItem(key, JSON.stringify(data)) } catch {} }

const RISK_AREAS = ['Data Protection', 'Cybersecurity', 'HR & People', 'Financial', 'Operational', 'Legal & Regulatory', 'Third Party / Vendor', 'AI & Technology']
const POLICY_TYPES = ['Privacy Policy', 'Cookie Policy', 'Data Retention Policy', 'Information Security Policy', 'Acceptable Use Policy', 'BYOD Policy', 'Remote Working Policy', 'Incident Response Plan', 'Business Continuity Plan', 'AI Usage Policy']

export default function GrcPage() {
  const [tab, setTab] = useState('overview')
  const [risks, setRisks] = useState([])
  const [policies, setPolicies] = useState([])
  const [incidents, setIncidents] = useState([])
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showForm, setShowForm] = useState(null)
  const [form, setForm] = useState({})
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    setRisks(getData(RISK_KEY))
    setPolicies(getData(POLICY_KEY))
    setIncidents(getData(INCIDENT_KEY))
  }, [])

  async function runAi(type, data) {
    setAiLoading(true); setAiResult(null)
    try {
      const res = await fetch('/api/grc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      })
      const result = await res.json()
      if (result.error) { alert('Error: ' + result.error); setAiLoading(false); return }
      setAiResult(result.result)
    } catch { alert('AI assessment failed. Please try again.') }
    setAiLoading(false)
  }

  function addRisk() {
    const newRisk = { id: Date.now(), title: form.riskTitle, desc: form.riskDesc || '', area: form.area || 'Data Protection', rating: form.rating || 'Medium', status: 'Open', createdAt: new Date().toISOString() }
    const updated = [newRisk, ...risks]
    setRisks(updated); saveData(RISK_KEY, updated); setShowForm(null); setForm({})
  }

  function addPolicy() {
    const newPolicy = { id: Date.now(), name: form.policyName, type: form.policyType || 'Privacy Policy', status: form.policyStatus || 'Draft', reviewDate: form.reviewDate || '', owner: form.owner || '', createdAt: new Date().toISOString() }
    const updated = [newPolicy, ...policies]
    setPolicies(updated); saveData(POLICY_KEY, updated); setShowForm(null); setForm({})
  }

  function addIncident() {
    const newIncident = { id: Date.now(), title: form.incidentTitle, desc: form.incidentDesc || '', severity: form.severity || 'Medium', status: 'Open', reportedAt: new Date().toISOString() }
    const updated = [newIncident, ...incidents]
    setIncidents(updated); saveData(INCIDENT_KEY, updated); setShowForm(null); setForm({})
  }

  function deleteItem(key, id, setter) {
    const current = getData(key)
    const updated = current.filter(i => i.id !== id)
    saveData(key, updated); setter(updated)
  }

  const highRisks = risks.filter(r => r.rating === 'High').length
  const overdueReviews = policies.filter(p => p.reviewDate && new Date(p.reviewDate) < new Date()).length
  const openIncidents = incidents.filter(i => i.status === 'Open').length

  const sevColors = { Critical: '#DC2626', High: '#D97706', Medium: '#2563EB', Low: '#16A34A', Draft: '#6B7280', Active: '#16A34A', 'Under Review': '#D97706', Archived: '#9CA3AF', Open: '#D97706', Closed: '#16A34A', 'In Progress': '#2563EB' }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F0' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', padding: '32px 0' }}>
        <div className="wrap">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,217,106,.15)', border: '1px solid rgba(184,217,106,.3)', padding: '5px 13px', borderRadius: 100, marginBottom: 16, fontSize: 11, fontWeight: 600, color: 'var(--lime)', letterSpacing: '.06em', textTransform: 'uppercase' }}>GRC Platform</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,3vw,40px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>Governance, Risk & Compliance</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 560 }}>Manage your risk register, policy library, data incidents, and get AI-powered assessments — all in one place.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap" style={{ display: 'flex' }}>
          {[['overview', '📊 Overview'], ['risks', `⚠️ Risk Register${risks.length > 0 ? ` (${risks.length})` : ''}`], ['policies', `📄 Policy Library${policies.length > 0 ? ` (${policies.length})` : ''}`], ['incidents', `🚨 Incidents${incidents.length > 0 ? ` (${incidents.length})` : ''}`], ['ai', '🤖 AI Assessments']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`tab ${tab === id ? 'on' : ''}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ padding: '32px 48px' }}>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
              {[
                ['Total Risks', risks.length, risks.length > 0 ? 'var(--amber-text)' : 'var(--green)', '⚠️'],
                ['High Risks', highRisks, highRisks > 0 ? 'var(--red-text)' : 'var(--green)', '🔴'],
                ['Policies Tracked', policies.length, 'var(--green)', '📄'],
                ['Open Incidents', openIncidents, openIncidents > 0 ? 'var(--red-text)' : 'var(--green)', '🚨'],
              ].map(([label, val, col, icon]) => (
                <div key={label} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 18px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: col, lineHeight: 1, marginBottom: 6 }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>
              {[
                { title: '🏛️ Governance', desc: 'Set policies, assign owners, track review dates, and maintain your compliance documentation library.', action: 'Manage policies →', tab: 'policies' },
                { title: '⚠️ Risk Management', desc: 'Log, assess and track business risks. Rate likelihood and impact, assign mitigation actions, and monitor status.', action: 'View risk register →', tab: 'risks' },
                { title: '✅ Compliance', desc: 'Track regulatory requirements, log incidents, manage GDPR obligations, and get AI guidance for compliance tasks.', action: 'View incidents →', tab: 'incidents' },
              ].map(card => (
                <div key={card.title} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 10 }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.65, marginBottom: 16 }}>{card.desc}</p>
                  <button onClick={() => setTab(card.tab)} style={{ fontSize: 13, color: 'var(--green)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: 0 }}>{card.action}</button>
                </div>
              ))}
            </div>

            {overdueReviews > 0 && (
              <div style={{ background: '#FEF2F2', border: '1px solid #F5B7B1', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--red-text)' }}>{overdueReviews} policy review{overdueReviews > 1 ? 's are' : ' is'} overdue. </span>
                  <button onClick={() => setTab('policies')} style={{ fontSize: 13, color: 'var(--red-text)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Review now →</button>
                </div>
              </div>
            )}

            <div style={{ background: 'var(--green)', borderRadius: 16, padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Get started with GRC</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.6 }}>Add your first risk, log your policies, and use AI to assess incidents and risks automatically.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button onClick={() => { setTab('risks'); setShowForm('risk') }} style={{ padding: '10px 18px', borderRadius: 9, border: '1px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>+ Add Risk</button>
                <button onClick={() => { setTab('ai') }} style={{ padding: '10px 18px', borderRadius: 9, border: 'none', background: 'var(--lime)', color: 'var(--ink)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>AI Assessment →</button>
              </div>
            </div>
          </>
        )}

        {/* RISK REGISTER */}
        {tab === 'risks' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div><h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 3 }}>Risk Register</h2><p style={{ fontSize: 12, color: 'var(--ink2)' }}>Log and track your business risks</p></div>
              <button onClick={() => setShowForm(showForm === 'risk' ? null : 'risk')} className="btn btn-primary btn-sm">+ Add Risk</button>
            </div>

            {showForm === 'risk' && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>New Risk</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label className="field-label">Risk title *</label><input className="field-input" placeholder="e.g. Unauthorised data access" value={form.riskTitle || ''} onChange={set('riskTitle')} /></div>
                  <div><label className="field-label">Business area</label>
                    <select className="field-input" value={form.area || ''} onChange={set('area')} style={{ cursor: 'pointer' }}>
                      {RISK_AREAS.map(a => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  <div><label className="field-label">Risk description</label><input className="field-input" placeholder="Describe the risk..." value={form.riskDesc || ''} onChange={set('riskDesc')} /></div>
                  <div><label className="field-label">Initial rating</label>
                    <select className="field-input" value={form.rating || 'Medium'} onChange={set('rating')} style={{ cursor: 'pointer' }}>
                      {['High', 'Medium', 'Low'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={addRisk} disabled={!form.riskTitle} className="btn btn-primary btn-sm">Save Risk</button>
                  {form.riskTitle && <button onClick={() => runAi('riskAssessment', { riskTitle: form.riskTitle, riskDesc: form.riskDesc, area: form.area })} disabled={aiLoading} style={{ fontSize: 12, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer' }}>🤖 {aiLoading ? 'Assessing...' : 'AI Assessment'}</button>}
                  <button onClick={() => setShowForm(null)} className="btn btn-secondary btn-sm">Cancel</button>
                </div>
                {aiResult && <div style={{ marginTop: 16, background: 'var(--cream)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}><pre style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{aiResult}</pre></div>}
              </div>
            )}

            {risks.length === 0 ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No risks logged yet</h3>
                <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 16 }}>Start building your risk register by adding your first risk.</p>
                <button onClick={() => setShowForm('risk')} className="btn btn-primary btn-sm">+ Add first risk</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {risks.map(risk => (
                  <div key={risk.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 13, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 16, alignItems: 'center' }}>
                    <div style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: risk.rating === 'High' ? '#FEF2F2' : risk.rating === 'Medium' ? '#FFFBEB' : '#F0FDF4', color: sevColors[risk.rating] || 'var(--ink)' }}>{risk.rating}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{risk.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{risk.area} · {risk.desc || 'No description'}</div>
                    </div>
                    <button onClick={() => runAi('riskAssessment', { riskTitle: risk.title, riskDesc: risk.desc, area: risk.area })} disabled={aiLoading}
                      style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      🤖 Assess
                    </button>
                    <button onClick={() => deleteItem(RISK_KEY, risk.id, setRisks)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink2)', cursor: 'pointer' }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
            {aiResult && tab === 'risks' && !showForm && (
              <div style={{ marginTop: 20, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 14 }}>🤖 AI Risk Assessment</h3>
                <pre style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{aiResult}</pre>
              </div>
            )}
          </div>
        )}

        {/* POLICY LIBRARY */}
        {tab === 'policies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div><h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 3 }}>Policy Library</h2><p style={{ fontSize: 12, color: 'var(--ink2)' }}>Track your compliance policies and review dates</p></div>
              <button onClick={() => setShowForm(showForm === 'policy' ? null : 'policy')} className="btn btn-primary btn-sm">+ Add Policy</button>
            </div>

            {showForm === 'policy' && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Add Policy</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label className="field-label">Policy name *</label><input className="field-input" placeholder="e.g. Data Retention Policy" value={form.policyName || ''} onChange={set('policyName')} /></div>
                  <div><label className="field-label">Policy type</label>
                    <select className="field-input" value={form.policyType || ''} onChange={set('policyType')} style={{ cursor: 'pointer' }}>
                      {POLICY_TYPES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div><label className="field-label">Status</label>
                    <select className="field-input" value={form.policyStatus || 'Draft'} onChange={set('policyStatus')} style={{ cursor: 'pointer' }}>
                      {['Draft', 'Active', 'Under Review', 'Archived'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="field-label">Next review date</label><input className="field-input" type="date" value={form.reviewDate || ''} onChange={set('reviewDate')} /></div>
                  <div><label className="field-label">Policy owner</label><input className="field-input" placeholder="e.g. Jane Smith, DPO" value={form.owner || ''} onChange={set('owner')} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={addPolicy} disabled={!form.policyName} className="btn btn-primary btn-sm">Save Policy</button>
                  <button onClick={() => setShowForm(null)} className="btn btn-secondary btn-sm">Cancel</button>
                </div>
              </div>
            )}

            {policies.length === 0 ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No policies tracked yet</h3>
                <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 16 }}>Add your compliance policies to track review dates and ownership.</p>
                <button onClick={() => setShowForm('policy')} className="btn btn-primary btn-sm">+ Add first policy</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {policies.map(policy => {
                  const overdue = policy.reviewDate && new Date(policy.reviewDate) < new Date()
                  return (
                    <div key={policy.id} style={{ background: overdue ? '#FEF2F2' : 'var(--white)', border: `1px solid ${overdue ? '#F5B7B1' : 'var(--border)'}`, borderRadius: 13, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 16, alignItems: 'center' }}>
                      <div style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: policy.status === 'Active' ? '#F0FDF4' : '#F8FAFC', color: sevColors[policy.status] || 'var(--ink2)' }}>{policy.status}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{policy.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink2)' }}>
                          {policy.policyType} · Owner: {policy.owner || 'Unassigned'}
                          {policy.reviewDate && <span style={{ color: overdue ? 'var(--red-text)' : 'var(--ink2)', marginLeft: 8 }}>· Review: {new Date(policy.reviewDate).toLocaleDateString('en-GB')}{overdue ? ' ⚠️ OVERDUE' : ''}</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteItem(POLICY_KEY, policy.id, setPolicies)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink2)', cursor: 'pointer' }}>Delete</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* INCIDENTS */}
        {tab === 'incidents' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div><h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 3 }}>Incident Log</h2><p style={{ fontSize: 12, color: 'var(--ink2)' }}>Log data incidents and get AI breach assessment</p></div>
              <button onClick={() => setShowForm(showForm === 'incident' ? null : 'incident')} className="btn btn-primary btn-sm">+ Log Incident</button>
            </div>

            {showForm === 'incident' && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Log Data Incident</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label className="field-label">Incident title *</label><input className="field-input" placeholder="e.g. Customer data exposed" value={form.incidentTitle || ''} onChange={set('incidentTitle')} /></div>
                  <div><label className="field-label">Severity</label>
                    <select className="field-input" value={form.severity || 'Medium'} onChange={set('severity')} style={{ cursor: 'pointer' }}>
                      {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="field-label">What data was affected?</label><input className="field-input" placeholder="e.g. customer emails, payment data" value={form.dataAffected || ''} onChange={set('dataAffected')} /></div>
                  <div><label className="field-label">Number of people affected</label><input className="field-input" placeholder="e.g. 150" value={form.affected || ''} onChange={set('affected')} /></div>
                  <div style={{ gridColumn: '1 / -1' }}><label className="field-label">Incident description</label><textarea value={form.incidentDesc || ''} onChange={set('incidentDesc')} placeholder="Describe what happened..." style={{ width: '100%', minHeight: 80, border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={addIncident} disabled={!form.incidentTitle} className="btn btn-primary btn-sm">Log Incident</button>
                  {form.incidentTitle && <button onClick={() => runAi('incidentAssessment', { incident: form.incidentTitle + ': ' + (form.incidentDesc || ''), dataAffected: form.dataAffected, affected: form.affected })} disabled={aiLoading} style={{ fontSize: 12, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer' }}>🤖 {aiLoading ? 'Assessing...' : 'AI Breach Assessment'}</button>}
                  <button onClick={() => setShowForm(null)} className="btn btn-secondary btn-sm">Cancel</button>
                </div>
                {aiResult && <div style={{ marginTop: 16, background: 'var(--cream)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}><pre style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{aiResult}</pre></div>}
              </div>
            )}

            {incidents.length === 0 ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🚨</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No incidents logged</h3>
                <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 16 }}>Log any data incidents or near-misses to maintain your audit trail.</p>
                <button onClick={() => setShowForm('incident')} className="btn btn-primary btn-sm">+ Log first incident</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {incidents.map(inc => (
                  <div key={inc.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 13, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 16, alignItems: 'center' }}>
                    <div style={{ padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: inc.severity === 'Critical' || inc.severity === 'High' ? '#FEF2F2' : '#FFFBEB', color: sevColors[inc.severity] || 'var(--ink)' }}>{inc.severity}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{inc.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{inc.desc || 'No description'} · Reported: {new Date(inc.reportedAt).toLocaleDateString('en-GB')}</div>
                    </div>
                    <button onClick={() => runAi('incidentAssessment', { incident: inc.title + ': ' + inc.desc, dataAffected: 'Unknown', affected: 'Unknown' })} disabled={aiLoading}
                      style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer', whiteSpace: 'nowrap' }}>🤖 Assess</button>
                    <button onClick={() => deleteItem(INCIDENT_KEY, inc.id, setIncidents)} style={{ fontSize: 11, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink2)', cursor: 'pointer' }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI ASSESSMENTS */}
        {tab === 'ai' && (
          <div style={{ maxWidth: 700 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>AI GRC Assessments</h2>
            <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 24 }}>Get instant AI-powered assessments for risks, policies, and incidents.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { type: 'riskAssessment', icon: '⚠️', title: 'Risk Assessment', desc: 'Rate a risk, get mitigation actions and residual risk score' },
                { type: 'policyReview', icon: '📄', title: 'Policy Review', desc: 'Identify gaps in your compliance policies' },
                { type: 'incidentAssessment', icon: '🚨', title: 'Breach Assessment', desc: 'Check if ICO notification is required within 72 hours' },
              ].map(item => (
                <button key={item.type} onClick={() => setForm({ ...form, aiType: item.type })}
                  style={{ padding: '20px 16px', borderRadius: 14, border: `2px solid ${form.aiType === item.type ? 'var(--green)' : 'var(--border)'}`, background: form.aiType === item.type ? 'var(--green-p)' : 'var(--white)', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5 }}>{item.desc}</div>
                </button>
              ))}
            </div>

            {form.aiType === 'riskAssessment' && (
              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Risk Assessment</h3>
                <div className="field-wrap"><label className="field-label">Risk title *</label><input className="field-input" placeholder="e.g. Employees using ChatGPT with customer data" value={form.riskTitle || ''} onChange={set('riskTitle')} /></div>
                <div className="field-wrap"><label className="field-label">Description</label><input className="field-input" placeholder="More details about the risk..." value={form.riskDesc || ''} onChange={set('riskDesc')} /></div>
                <div className="field-wrap"><label className="field-label">Business area</label><select className="field-input" value={form.area || 'Data Protection'} onChange={set('area')} style={{ cursor: 'pointer' }}>{RISK_AREAS.map(a => <option key={a}>{a}</option>)}</select></div>
                <button onClick={() => runAi('riskAssessment', form)} disabled={aiLoading || !form.riskTitle} className="btn btn-primary btn-sm">{aiLoading ? 'Assessing...' : 'Run AI Assessment →'}</button>
              </div>
            )}

            {form.aiType === 'policyReview' && (
              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Policy Review</h3>
                <div className="field-wrap"><label className="field-label">Policy name *</label><input className="field-input" placeholder="e.g. Privacy Policy" value={form.policyName || ''} onChange={set('policyName')} /></div>
                <div style={{ marginBottom: 20 }}><label className="field-label">Policy content or summary *</label><textarea value={form.policyContent || ''} onChange={set('policyContent')} placeholder="Paste your policy text or describe what it currently covers..." style={{ width: '100%', minHeight: 120, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
                <button onClick={() => runAi('policyReview', form)} disabled={aiLoading || !form.policyName || !form.policyContent} className="btn btn-primary btn-sm">{aiLoading ? 'Reviewing...' : 'Review Policy →'}</button>
              </div>
            )}

            {form.aiType === 'incidentAssessment' && (
              <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Data Breach Assessment</h3>
                <div className="field-wrap"><label className="field-label">What happened? *</label><textarea value={form.incident || ''} onChange={set('incident')} placeholder="Describe the incident..." style={{ width: '100%', minHeight: 100, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
                <div className="field-wrap"><label className="field-label">Data affected</label><input className="field-input" placeholder="e.g. names, emails, payment data" value={form.dataAffected || ''} onChange={set('dataAffected')} /></div>
                <div className="field-wrap"><label className="field-label">Approx. number of people affected</label><input className="field-input" placeholder="e.g. 250" value={form.affected || ''} onChange={set('affected')} /></div>
                <button onClick={() => runAi('incidentAssessment', form)} disabled={aiLoading || !form.incident} className="btn btn-primary btn-sm">{aiLoading ? 'Assessing...' : 'Run Breach Assessment →'}</button>
              </div>
            )}

            {aiResult && (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600 }}>AI Assessment Result</h3>
                  <button onClick={() => { const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([aiResult], { type: 'text/plain' })); el.download = 'grc-assessment.txt'; el.click() }}
                    style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer' }}>⬇ Download</button>
                </div>
                <pre style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{aiResult}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
