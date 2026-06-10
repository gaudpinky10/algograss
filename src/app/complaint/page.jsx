'use client'
import { useState } from 'react'

const CHANNELS = [
  { id: 'email', icon: '📧', label: 'Email', placeholder: 'Paste the email you received...' },
  { id: 'whatsapp', icon: '💬', label: 'WhatsApp / Chat', placeholder: 'Paste the WhatsApp or chat message...' },
  { id: 'form', icon: '📝', label: 'Website Form', placeholder: 'Paste the contact form submission...' },
  { id: 'social', icon: '📱', label: 'Social Media', placeholder: 'Paste the social media message or comment...' },
  { id: 'phone', icon: '📞', label: 'Phone / Verbal', placeholder: 'Describe what was said in the call or meeting...' },
  { id: 'letter', icon: '✉️', label: 'Letter / Post', placeholder: 'Type or paste the letter content...' },
]

const CATEGORY_COLORS = {
  'Subject Access Request': '#3B82F6',
  'Erasure Request': '#EF4444',
  'Marketing Consent': '#F59E0B',
  'Data Breach': '#DC2626',
  'Cookie Complaint': '#8B5CF6',
  'Data Portability': '#06B6D4',
  'Rectification Request': '#10B981',
  'Restriction Request': '#F97316',
  'Objection to Processing': '#EC4899',
  'Employee/HR Data': '#6366F1',
  'Vendor Compliance': '#84CC16',
  'General Privacy': '#64748B',
  'Not GDPR Related': '#9CA3AF',
}

const LOG_KEY = 'algograss_complaint_log'
function getData(key) { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
function saveData(key, d) { try { localStorage.setItem(key, JSON.stringify(d)) } catch {} }

export default function ComplaintPage() {
  const [channel, setChannel] = useState('email')
  const [complaint, setComplaint] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('classify')
  const [log, setLog] = useState(getData(LOG_KEY))

  async function analyse() {
    if (!complaint.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/complaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complaint: `[Received via: ${channel.toUpperCase()}]\n\n${complaint}`, businessName }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResult(data.result)
      // Save to log
      const entry = { id: Date.now(), channel, complaint: complaint.slice(0, 120) + (complaint.length > 120 ? '...' : ''), result: data.result, businessName, loggedAt: new Date().toISOString() }
      const updated = [entry, ...getData(LOG_KEY)].slice(0, 50)
      saveData(LOG_KEY, updated); setLog(updated)
    } catch { setError('Classification failed. Please try again.') }
    setLoading(false)
  }

  const urgencyColors = { High: '#FEF2F2', Medium: '#FFFBEB', Low: '#F0FDF4' }
  const urgencyText = { High: '#DC2626', Medium: '#D97706', Low: '#16A34A' }
  const selectedChannel = CHANNELS.find(c => c.id === channel)

  return (
    <div style={{ minHeight: '90vh', background: 'var(--cream)' }}>
      <section style={{ background: 'var(--bg2)', padding: '48px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(184,217,106,.15)', border: '1px solid rgba(184,217,106,.3)', padding: '5px 13px', borderRadius: 100, marginBottom: 16, fontSize: 11, fontWeight: 600, color: 'var(--lime)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Multi-Channel · AI Powered</div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 'clamp(26px,3vw,44px)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>Complaint Intake & Classifier</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', maxWidth: 580, lineHeight: 1.7 }}>Receive complaints via email, WhatsApp, social media, or any channel. Paste them here — AlgoGrass AI instantly classifies the complaint, identifies urgency, and generates your response.</p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="wrap" style={{ display: 'flex' }}>
          {[['classify', '🔍 Classify Complaint'], ['log', `📋 Complaint Log${log.length > 0 ? ` (${log.length})` : ''}`], ['integrations', '⚡ Auto-Intake Setup']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`tab ${tab === id ? 'on' : ''}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ padding: '40px 48px' }}>

        {tab === 'classify' && (
          <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 28, maxWidth: result ? '100%' : 800 }}>
            <div>
              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Step 1 — Select the channel</h2>
              <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 20 }}>Where did this complaint come from?</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
                {CHANNELS.map(c => (
                  <button key={c.id} onClick={() => setChannel(c.id)}
                    style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${channel === c.id ? 'var(--green)' : 'var(--border)'}`, background: channel === c.id ? 'var(--green-p)' : 'var(--white)', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: channel === c.id ? 'var(--green)' : 'var(--ink2)' }}>{c.label}</div>
                  </button>
                ))}
              </div>

              <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Step 2 — Paste the complaint</h2>
              <div className="card" style={{ padding: 24 }}>
                <div className="field-wrap">
                  <label className="field-label">Your business name (optional)</label>
                  <input className="field-input" placeholder="e.g. Acme Ltd" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">{selectedChannel?.icon} {selectedChannel?.label} content *</label>
                  <textarea value={complaint} onChange={e => setComplaint(e.target.value)}
                    placeholder={selectedChannel?.placeholder}
                    style={{ width: '100%', minHeight: 160, border: '1.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' }} />
                </div>
                {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
                <button onClick={analyse} disabled={loading || !complaint.trim()} className="btn btn-primary btn-full" style={{ fontSize: 15, padding: 14 }}>
                  {loading ? '🤖 Classifying complaint...' : 'Classify & generate response →'}
                </button>

                <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <p style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 10, fontWeight: 600 }}>Try example complaints:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      ['📧 Email', 'I unsubscribed from your emails 3 months ago but keep receiving marketing. I demand you delete all my data immediately under GDPR.'],
                      ['💬 WhatsApp', 'hi why are you still storing my email? i deleted my account. you need to remove all my info'],
                      ['📱 Social', '@yourcompany you shared my data without consent! I never agreed to this. Reporting to ICO.'],
                    ].map(([label, text]) => (
                      <button key={label} onClick={() => setComplaint(text)}
                        style={{ textAlign: 'left', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--cream)', color: 'var(--ink2)', cursor: 'pointer', lineHeight: 1.4 }}>
                        <strong>{label}:</strong> "{text.slice(0, 80)}..."
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 2 }}>Classification Result</h2>
                <div style={{ background: result.isGdprComplaint ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${result.isGdprComplaint ? 'var(--green-m)' : '#F5B7B1'}`, borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 28 }}>{result.isGdprComplaint ? '⚖️' : 'ℹ️'}</span>
                    <div>
                      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 16, fontWeight: 700, color: result.isGdprComplaint ? 'var(--green)' : 'var(--red-text)' }}>
                        {result.isGdprComplaint ? 'GDPR Complaint' : 'Not GDPR Related'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>Received via {selectedChannel?.label}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{result.summary}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, color: 'var(--ink2)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Category</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: CATEGORY_COLORS[result.category] || 'var(--ink)' }}>{result.category}</div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green)' }}>📧 Draft Response Email</div>
                    <button onClick={() => navigator.clipboard?.writeText(result.templateResponse)}
                      style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--green-m)', background: 'var(--white)', color: 'var(--green)', cursor: 'pointer' }}>Copy</button>
                  </div>
                  <pre style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'transparent', margin: 0 }}>{result.templateResponse}</pre>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setResult(null); setComplaint('') }} className="btn btn-secondary btn-sm">Classify another →</button>
                  <a href="/dsar" style={{ fontSize: 13, padding: '9px 16px', borderRadius: 8, border: 'none', background: result.category === 'Subject Access Request' ? 'var(--green)' : 'var(--green-p)', color: result.category === 'Subject Access Request' ? '#fff' : 'var(--green)', textDecoration: 'none', fontWeight: 500 }}>
                    {result.category === 'Subject Access Request' ? 'Handle this SAR →' : 'DSAR Handler →'}
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'log' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 3 }}>Complaint Log</h2>
                <p style={{ fontSize: 12, color: 'var(--ink2)' }}>All complaints classified this session — {log.length} total</p>
              </div>
              {log.length > 0 && <button onClick={() => { saveData(LOG_KEY, []); setLog([]) }} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--white)', color: 'var(--ink2)', cursor: 'pointer' }}>Clear log</button>}
            </div>
            {log.length === 0 ? (
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <p style={{ fontSize: 14, color: 'var(--ink2)' }}>No complaints classified yet. They will appear here automatically.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {log.map(entry => {
                  const ch = CHANNELS.find(c => c.id === entry.channel)
                  const urgCol = { High: '#DC2626', Medium: '#D97706', Low: '#16A34A' }
                  return (
                    <div key={entry.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 13, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{ch?.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{entry.result?.category || 'Unknown'}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{ch?.label} · {new Date(entry.loggedAt).toLocaleString('en-GB')}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {entry.result?.urgency && <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, fontWeight: 600, background: urgCol[entry.result.urgency] === '#DC2626' ? '#FEF2F2' : urgCol[entry.result.urgency] === '#D97706' ? '#FFFBEB' : '#F0FDF4', color: urgCol[entry.result.urgency] }}>{entry.result.urgency}</span>}
                          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: 'var(--green-p)', color: 'var(--green)', fontWeight: 600 }}>{entry.result?.responseDays}d to respond</span>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5, marginBottom: 8 }}>{entry.complaint}</p>
                      {entry.result?.recommendedAction && <p style={{ fontSize: 12, color: 'var(--ink)', background: 'var(--green-p)', padding: '8px 12px', borderRadius: 8 }}><strong>Action:</strong> {entry.result.recommendedAction}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'integrations' && (
          <div style={{ maxWidth: 820 }}>
            <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Auto-Intake Integrations</h2>
            <p style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 28, lineHeight: 1.7 }}>
              Connect your inbound channels so complaints are classified automatically the moment they arrive — no copy-pasting required. Each webhook calls the same AI classifier and emails you the result.
            </p>

            {/* Email */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 26px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>📧</span>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600 }}>Inbound Email (Mailgun / SendGrid / Postmark)</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Automatically classify complaints sent to a dedicated inbox</div>
                </div>
              </div>
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Webhook URL</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <code style={{ flex: 1, fontSize: 13, color: 'var(--green)', fontFamily: 'monospace', wordBreak: 'break-all' }}>https://www.algograss.co.uk/api/webhooks/email</code>
                  <button onClick={() => navigator.clipboard?.writeText('https://www.algograss.co.uk/api/webhooks/email')}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--green-m)', background: 'var(--white)', color: 'var(--green)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Copy</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { name: 'Mailgun', steps: 'Receiving → Routes → Add Route → Forward to webhook URL' },
                  { name: 'SendGrid', steps: 'Settings → Inbound Parse → Add Host & URL' },
                  { name: 'Postmark', steps: 'Servers → Inbound → Set webhook URL' },
                ].map(p => (
                  <div key={p.name} style={{ background: 'var(--green-p)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 6 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink2)', lineHeight: 1.6 }}>{p.steps}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 26px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>💬</span>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600 }}>WhatsApp Business API (Meta)</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Auto-classify inbound WhatsApp messages and send an acknowledgement reply</div>
                </div>
              </div>
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Webhook URL</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <code style={{ flex: 1, fontSize: 13, color: 'var(--green)', fontFamily: 'monospace', wordBreak: 'break-all' }}>https://www.algograss.co.uk/api/webhooks/whatsapp</code>
                  <button onClick={() => navigator.clipboard?.writeText('https://www.algograss.co.uk/api/webhooks/whatsapp')}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--green-m)', background: 'var(--white)', color: 'var(--green)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Copy</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--ink)' }}>Setup steps:</strong><br />
                1. Go to <strong>Meta Developer Console → WhatsApp → Configuration</strong><br />
                2. Set the webhook URL above and set <strong>Verify Token</strong> to match your <code style={{ background: 'var(--cream)', padding: '1px 5px', borderRadius: 4 }}>WHATSAPP_VERIFY_TOKEN</code> env var<br />
                3. Subscribe to the <strong>messages</strong> field<br />
                4. Add <code style={{ background: 'var(--cream)', padding: '1px 5px', borderRadius: 4 }}>WHATSAPP_TOKEN</code> to your Vercel env to enable auto-reply acknowledgements
              </div>
            </div>

            {/* Social media */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 26px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>📱</span>
                <div>
                  <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 600 }}>Social Media (Facebook, Instagram, Twitter/X, LinkedIn)</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Auto-classify mentions, DMs, and comments across all social channels</div>
                </div>
              </div>
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Webhook URL</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <code style={{ flex: 1, fontSize: 13, color: 'var(--green)', fontFamily: 'monospace', wordBreak: 'break-all' }}>https://www.algograss.co.uk/api/webhooks/social</code>
                  <button onClick={() => navigator.clipboard?.writeText('https://www.algograss.co.uk/api/webhooks/social')}
                    style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid var(--green-m)', background: 'var(--white)', color: 'var(--green)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Copy</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { name: '📘 Facebook / Instagram (Meta)', steps: 'Meta Developer Console → Webhooks → Subscribe to messages + feed + mention → set URL above. Set SOCIAL_VERIFY_TOKEN env var to match.' },
                  { name: '🐦 Twitter/X', steps: 'Use Zapier or Make: Trigger = New Mention or DM → Action = Webhook POST to URL above with {platform, from, text}.' },
                  { name: '💼 LinkedIn', steps: 'Use Zapier or Make: Trigger = New Comment on Post → Action = Webhook POST to URL above.' },
                  { name: '⚙️ Any other source', steps: 'POST JSON to the URL with: { platform, from, text } — the webhook accepts any social channel.' },
                ].map(p => (
                  <div key={p.name} style={{ background: 'var(--green-p)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green)', marginBottom: 6 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink2)', lineHeight: 1.6 }}>{p.steps}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Env vars needed */}
            <div style={{ background: 'var(--bg2)', borderRadius: 14, padding: '20px 24px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--lime)', marginBottom: 12 }}>Required Vercel environment variables</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['ANTHROPIC_API_KEY', 'Already set — powers complaint classification'],
                  ['FORMSPREE_ID', 'Already set — sends email notifications to you'],
                  ['WHATSAPP_VERIFY_TOKEN', 'Any random string — used to verify Meta webhook handshake'],
                  ['WHATSAPP_TOKEN', 'Your Meta WhatsApp access token — enables auto-reply acknowledgements'],
                  ['SOCIAL_VERIFY_TOKEN', 'Any random string — used to verify Facebook/Instagram webhook'],
                ].map(([key, desc]) => (
                  <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
                    <code style={{ fontSize: 12, color: 'var(--lime)', fontFamily: 'monospace', whiteSpace: 'nowrap', minWidth: 220 }}>{key}</code>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
