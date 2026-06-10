'use client'
import { useState, useEffect } from 'react'

const AI_SUBMISSIONS_KEY = 'algograss_ai_submissions'
const AI_TOOLS = ['ChatGPT / OpenAI', 'Microsoft Copilot', 'Google Gemini', 'Claude (Anthropic)', 'GitHub Copilot', 'Midjourney', 'Grammarly AI', 'HubSpot AI', 'Salesforce Einstein', 'Notion AI', 'Jasper', 'Other']
const LEGAL_BASES = ['Legitimate interests', 'Contract performance', 'Legal obligation', 'Consent', 'Vital interests', 'Public task']
const DATA_TYPES = ['Names & contact details', 'Employee records', 'Customer data', 'Financial data', 'Health/medical data', 'Biometric data', 'Location data', 'IP addresses', 'Behavioural data', 'No personal data']

function getData(key) { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function saveData(key, data) { try { localStorage.setItem(key, JSON.stringify(data)) } catch {} }

function getUser() {
  try {
    const c = document.cookie.split(';').map(x => x.trim()).find(x => x.startsWith('algograss_user='))
    return c ? JSON.parse(atob(c.split('=')[1])) : null
  } catch { return null }
}

export default function AiGovernancePage() {
  const [tab, setTab] = useState('submit')
  const [form, setForm] = useState({ toolName: '', purpose: '', dataTypes: [], legalBasis: '', hasPersonalData: false, sharesWithThirdParty: false, businessName: '', department: '', owner: '' })
  const [loading, setLoading] = useState(false)
  const [assessment, setAssessment] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [mySubmissions, setMySubmissions] = useState([])
  const [dpiaForm, setDpiaForm] = useState({ project: '', purpose: '', dataTypes: '', legalBasis: '', recipients: '', retention: '', risks: '', businessName: '' })
  const [dpiaResult, setDpiaResult] = useState(null)
  const [dpiaLoading, setDpiaLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setDpia = k => e => setDpiaForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    setUser(getUser())
    setMySubmissions(getData(AI_SUBMISSIONS_KEY))
  }, [])

  function toggleDataType(type) {
    setForm(f => ({ ...f, dataTypes: f.dataTypes.includes(type) ? f.dataTypes.filter(t => t !== type) : [...f.dataTypes, type] }))
  }

  async function submitForApproval() {
    if (!form.toolName || !form.purpose || !form.legalBasis) { setError('Please fill in all required fields.'); return }
    setLoading(true); setError(''); setAssessment(null)

    let aiAssessment = null
    try {
      const res = await fetch('/api/ai-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dataTypes: form.dataTypes.join(', ') }),
      })
      const data = await res.json()
      if (data.assessment) aiAssessment = data.assessment
    } catch {}

    const submission = {
      id: Date.now(),
      ...form,
      dataTypes: form.dataTypes.join(', '),
      submittedBy: user?.email || 'Anonymous',
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      assessment: aiAssessment,
    }

    const all = getData(AI_SUBMISSIONS_KEY)
    all.unshift(submission)
    saveData(AI_SUBMISSIONS_KEY, all)
    setMySubmissions(all)
    setAssessment(aiAssessment)
    setSubmitted(true)
    setLoading(false)
  }

  async function generateDpia() {
    if (!dpiaForm.project || !dpiaForm.purpose) return
    setDpiaLoading(true); setDpiaResult(null)
    try {
      const res = await fetch('/api/dpia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dpiaForm),
      })
      const data = await res.json()
      if (data.error) { alert('Error: ' + data.error); setDpiaLoading(false); return }
      setDpiaResult(data.dpia)
    } catch { alert('Failed. Please try again.') }
    setDpiaLoading(false)
  }

  const myPending = mySubmissions.filter(s => s.status === 'Pending').length
  const myApproved = mySubmissions.filter(s => s.status === 'Approved').length

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg2)', padding: '40px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,217,106,.15)', border: '1px solid rgba(184,217,106,.3)', padding: '5px 13px', borderRadius: 100, marginBottom: 16, fontSize: 11, fontWeight: 600, color: 'var(--lime)', letterSpacing: '.06em', textTransform: 'uppercase' }}>AI Governance</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,3vw,42px)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>AI Governance Platform</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 580, lineHeight: 1.7 }}>Submit AI tool use cases for approval, manage your AI register, generate DPIAs, and ensure your AI usage is GDPR compliant.</p>
          {user?.isAdmin && (
            <a href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 12, color: 'var(--lime)', textDecoration: 'none', fontWeight: 600 }}>
              🔑 Go to Admin Dashboard →
            </a>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'var(--green)', padding: '16px 0' }}>
        <div className="wrap" style={{ display: 'flex', gap: 40 }}>
          {[['My Submissions', mySubmissions.length], ['Pending Approval', myPending], ['Approved Tools', myApproved]].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#fff' }}>{val}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap" style={{ display: 'flex' }}>
          {[['submit', '📝 Submit AI Use Case'], ['register', `📋 My AI Register${mySubmissions.length > 0 ? ` (${mySubmissions.length})` : ''}`], ['dpia', '🔒 DPIA Generator'], ['checker', '🤖 Quick Checker']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`tab ${tab === id ? 'on' : ''}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ padding: '40px 48px' }}>

        {/* SUBMIT USE CASE */}
        {tab === 'submit' && (
          <div style={{ maxWidth: 800 }}>
            {submitted && assessment ? (
              <div>
                <div style={{ background: assessment.approvalRecommendation === 'Approve' ? '#F0FDF4' : assessment.approvalRecommendation === 'Reject' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${assessment.approvalRecommendation === 'Approve' ? 'var(--green-m)' : assessment.approvalRecommendation === 'Reject' ? '#F5B7B1' : '#FCD34D'}`, borderRadius: 16, padding: '24px 28px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                    <span style={{ fontSize: 36 }}>{assessment.approvalRecommendation === 'Approve' ? '✅' : assessment.approvalRecommendation === 'Reject' ? '❌' : '⚠️'}</span>
                    <div>
                      <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Submitted for approval!</h2>
                      <p style={{ fontSize: 14, color: 'var(--ink2)' }}>AI recommendation: <strong style={{ color: assessment.approvalRecommendation === 'Approve' ? 'var(--green)' : 'var(--red-text)' }}>{assessment.approvalRecommendation}</strong> · Risk score: {assessment.riskScore}/10</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                    {[['Legal Basis Valid', assessment.legalBasisValid ? '✅ Yes' : '❌ No', assessment.legalBasisValid ? 'var(--green)' : 'var(--red-text)'], ['DPIA Required', assessment.dpiaRequired ? '⚠️ Yes' : '✅ No', assessment.dpiaRequired ? 'var(--amber-text)' : 'var(--green)'], ['Review Date', assessment.reviewDate || 'TBC', 'var(--ink)']].map(([label, val, col]) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,.6)', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 10, color: 'var(--ink2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: col }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {assessment.conditions?.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Conditions for approval:</p>
                      {assessment.conditions.map((c, i) => <div key={i} style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 4 }}>• {c}</div>)}
                    </div>
                  )}
                  {assessment.privacyPolicyUpdate && (
                    <div style={{ background: 'rgba(255,255,255,.6)', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Privacy Policy Update Needed</div>
                      <div style={{ fontSize: 13, color: 'var(--ink2)' }}>{assessment.privacyPolicyUpdate}</div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => { setSubmitted(false); setAssessment(null); setForm({ toolName: '', purpose: '', dataTypes: [], legalBasis: '', hasPersonalData: false, sharesWithThirdParty: false, businessName: '', department: '', owner: '' }) }} className="btn btn-primary btn-sm">Submit another →</button>
                  <button onClick={() => setTab('register')} className="btn btn-secondary btn-sm">View my register →</button>
                  {assessment.dpiaRequired && <button onClick={() => setTab('dpia')} style={{ fontSize: 13, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--amber-text)', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>Generate DPIA →</button>}
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Submit AI Use Case for Approval</h2>
                <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 28, lineHeight: 1.6 }}>Before using any AI tool with personal or business data, submit it for approval. Our AI will assess the risk and your admin will review it.</p>

                <div className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label className="field-label">AI Tool *</label>
                      <select className="field-input" value={form.toolName} onChange={set('toolName')} style={{ cursor: 'pointer' }}>
                        <option value="">Select AI tool...</option>
                        {AI_TOOLS.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><label className="field-label">Department</label><input className="field-input" placeholder="e.g. Marketing, HR, Legal" value={form.department} onChange={set('department')} /></div>
                    <div><label className="field-label">Business / Organisation</label><input className="field-input" placeholder="e.g. Acme Ltd" value={form.businessName} onChange={set('businessName')} /></div>
                    <div><label className="field-label">Use case owner</label><input className="field-input" placeholder="e.g. Jane Smith" value={form.owner} onChange={set('owner')} /></div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label className="field-label">Purpose / How will it be used? *</label>
                      <textarea value={form.purpose} onChange={set('purpose')} placeholder="Describe exactly what you will use this AI tool for and what data will be entered into it..." style={{ width: '100%', minHeight: 90, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ marginTop: 20, marginBottom: 20 }}>
                    <label className="field-label">Types of data that will be entered (select all that apply)</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {DATA_TYPES.map(type => (
                        <button key={type} onClick={() => toggleDataType(type)} type="button"
                          style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${form.dataTypes.includes(type) ? 'var(--green)' : 'var(--border)'}`, background: form.dataTypes.includes(type) ? 'var(--green-p)' : 'var(--white)', color: form.dataTypes.includes(type) ? 'var(--green)' : 'var(--ink2)', cursor: 'pointer', fontWeight: form.dataTypes.includes(type) ? 600 : 400, transition: 'all .15s' }}>
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label className="field-label">Legal basis for processing *</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {LEGAL_BASES.map(basis => (
                        <button key={basis} onClick={() => setForm(f => ({ ...f, legalBasis: basis }))} type="button"
                          style={{ fontSize: 12, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${form.legalBasis === basis ? 'var(--green)' : 'var(--border)'}`, background: form.legalBasis === basis ? 'var(--green-p)' : 'var(--white)', color: form.legalBasis === basis ? 'var(--green)' : 'var(--ink2)', cursor: 'pointer', fontWeight: form.legalBasis === basis ? 600 : 400, transition: 'all .15s' }}>
                          {basis}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {[['hasPersonalData', 'This tool will process personal data (names, emails, IDs, etc.)'],
                      ['sharesWithThirdParty', 'Data will be stored on / sent to the AI provider\'s servers']].map(([key, label]) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--ink)', background: form[key] ? 'var(--green-p)' : 'var(--cream)', padding: '10px 14px', borderRadius: 8, border: `1px solid ${form[key] ? 'var(--green-m)' : 'var(--border)'}` }}>
                        <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                        {label}
                      </label>
                    ))}
                  </div>

                  {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
                  <button onClick={submitForApproval} disabled={loading || !form.toolName || !form.purpose || !form.legalBasis} className="btn btn-primary btn-full" style={{ fontSize: 15, padding: '14px' }}>
                    {loading ? '🤖 Running AI assessment & submitting...' : 'Submit for approval →'}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--ink2)', textAlign: 'center', marginTop: 10 }}>Your admin will be notified and can approve or reject this request.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY REGISTER */}
        {tab === 'register' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>My AI Register</h2>
                <p style={{ fontSize: 13, color: 'var(--ink2)' }}>Track all AI tools you have submitted and their approval status</p>
              </div>
              <button onClick={() => setTab('submit')} className="btn btn-primary btn-sm">+ Submit new tool</button>
            </div>

            {mySubmissions.length === 0 ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No AI tools submitted yet</h3>
                <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 20 }}>Submit your first AI tool for approval to start building your register.</p>
                <button onClick={() => setTab('submit')} className="btn btn-primary btn-sm">Submit first tool →</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {mySubmissions.map(s => {
                  const statusColors = { Pending: { bg: '#FFFBEB', text: 'var(--amber-text)', border: '#FCD34D' }, Approved: { bg: '#F0FDF4', text: 'var(--green)', border: 'var(--green-m)' }, Rejected: { bg: '#FEF2F2', text: 'var(--red-text)', border: '#F5B7B1' } }
                  const sc = statusColors[s.status] || statusColors.Pending
                  return (
                    <div key={s.id} style={{ background: 'var(--white)', border: `1px solid ${sc.border}`, borderRadius: 14, padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{s.toolName}</h3>
                            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 700, background: sc.bg, color: sc.text }}>{s.status}</span>
                            {s.assessment?.riskLevel && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, fontWeight: 600, background: 'var(--green-p)', color: 'var(--green)' }}>Risk: {s.assessment.riskLevel}</span>}
                          </div>
                          <p style={{ fontSize: 13, color: 'var(--ink2)' }}>{s.purpose}</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--ink2)' }}>
                          <div>Submitted: {new Date(s.submittedAt).toLocaleDateString('en-GB')}</div>
                          {s.assessment?.reviewDate && <div style={{ marginTop: 2 }}>Review: {s.assessment.reviewDate}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--cream)', color: 'var(--ink2)' }}>📊 {s.dataTypes || 'No personal data'}</span>
                        <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--cream)', color: 'var(--ink2)' }}>⚖️ {s.legalBasis}</span>
                        {s.assessment?.dpiaRequired && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--amber-bg)', color: 'var(--amber-text)', fontWeight: 600 }}>⚠️ DPIA Required</span>}
                        {s.status === 'Rejected' && s.reviewNote && <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--red-bg)', color: 'var(--red-text)' }}>Note: {s.reviewNote}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* DPIA GENERATOR */}
        {tab === 'dpia' && (
          <div>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>DPIA Generator</h2>
            <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 28 }}>Generate a complete Data Protection Impact Assessment under GDPR Article 35.</p>

            <div style={{ display: 'grid', gridTemplateColumns: dpiaResult ? '1fr 1fr' : '1fr', gap: 24 }}>
              <div className="card" style={{ padding: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div><label className="field-label">Business name</label><input className="field-input" placeholder="e.g. Acme Ltd" value={dpiaForm.businessName} onChange={setDpia('businessName')} /></div>
                  <div><label className="field-label">Project / System name *</label><input className="field-input" placeholder="e.g. AI Customer Support Bot" value={dpiaForm.project} onChange={setDpia('project')} /></div>
                  <div style={{ gridColumn: '1/-1' }}><label className="field-label">Purpose *</label><textarea value={dpiaForm.purpose} onChange={setDpia('purpose')} placeholder="What is the purpose of this system?" style={{ width: '100%', minHeight: 70, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
                  <div><label className="field-label">Types of personal data</label><input className="field-input" placeholder="e.g. names, emails, health data" value={dpiaForm.dataTypes} onChange={setDpia('dataTypes')} /></div>
                  <div><label className="field-label">Legal basis</label><input className="field-input" placeholder="e.g. Legitimate interests" value={dpiaForm.legalBasis} onChange={setDpia('legalBasis')} /></div>
                  <div><label className="field-label">Data recipients / processors</label><input className="field-input" placeholder="e.g. OpenAI, AWS, Salesforce" value={dpiaForm.recipients} onChange={setDpia('recipients')} /></div>
                  <div><label className="field-label">Retention period</label><input className="field-input" placeholder="e.g. 12 months" value={dpiaForm.retention} onChange={setDpia('retention')} /></div>
                  <div style={{ gridColumn: '1/-1' }}><label className="field-label">Known risks</label><textarea value={dpiaForm.risks} onChange={setDpia('risks')} placeholder="Any risks you've already identified..." style={{ width: '100%', minHeight: 70, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} /></div>
                </div>
                <button onClick={generateDpia} disabled={dpiaLoading || !dpiaForm.project || !dpiaForm.purpose} className="btn btn-primary btn-full" style={{ marginTop: 16 }}>
                  {dpiaLoading ? '⏳ Generating DPIA...' : 'Generate Full DPIA →'}
                </button>
              </div>

              {dpiaResult && (
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600 }}>DPIA Document</h3>
                    <button onClick={() => { const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([dpiaResult], { type: 'text/plain' })); el.download = `dpia-${dpiaForm.project.replace(/\s+/g, '-')}.txt`; el.click() }}
                      style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', cursor: 'pointer' }}>⬇ Download DPIA</button>
                  </div>
                  <pre style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 550, overflowY: 'auto' }}>{dpiaResult}</pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QUICK CHECKER */}
        {tab === 'checker' && (
          <div style={{ maxWidth: 700 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Quick AI Compliance Checker</h2>
            <p style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 28 }}>Not sure if your AI usage is GDPR compliant? Answer these questions for an instant assessment.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              {[
                { q: 'Does the AI tool process personal data?', risk: 'If yes, you need a legal basis and privacy policy update.', icon: '👤' },
                { q: 'Is a Data Processing Agreement in place?', risk: 'Required under GDPR Art. 28 if a third party processes data.', icon: '📋' },
                { q: 'Is there a lawful basis documented?', risk: 'GDPR Art. 6 requires a valid legal basis for all processing.', icon: '⚖️' },
                { q: 'Are users informed in the privacy policy?', risk: 'GDPR Art. 13 requires disclosure of all processing activities.', icon: '📄' },
                { q: 'Has a DPIA been completed?', risk: 'Required for high-risk processing under GDPR Art. 35.', icon: '🔒' },
                { q: 'Are staff trained on AI data risks?', risk: 'UK ICO guidance recommends staff awareness training.', icon: '🎓' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{item.q}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5, marginBottom: 12 }}>{item.risk}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid var(--green-m)', background: 'var(--green-p)', color: 'var(--green)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✅ Yes</button>
                    <button style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid #F5B7B1', background: 'var(--red-bg)', color: 'var(--red-text)', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>❌ No</button>
                    <button style={{ flex: 1, padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--cream)', color: 'var(--ink2)', fontSize: 12, cursor: 'pointer' }}>Not sure</button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--green)', borderRadius: 14, padding: '22px 26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Want a full AI governance assessment?</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.75)' }}>Submit your AI tool for a complete AI risk assessment and approval workflow.</p>
              </div>
              <button onClick={() => setTab('submit')} style={{ padding: '11px 22px', borderRadius: 9, border: 'none', background: 'var(--lime)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 20 }}>Submit use case →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
