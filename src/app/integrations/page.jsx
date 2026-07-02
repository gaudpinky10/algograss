'use client'
import { useState, useEffect } from 'react'

const S = {
  page: { minHeight: '100vh', background: '#060B14', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" },
  wrap: { maxWidth: 860, margin: '0 auto' },
  h1: { fontSize: 34, fontWeight: 800, color: '#E8F0FE', margin: '0 0 8px', letterSpacing: -0.5 },
  sub: { color: '#94A3B8', fontSize: 15, margin: '0 0 36px' },
  card: { background: '#0D1525', border: '1px solid #1e2d45', borderRadius: 16, padding: '24px 28px', marginBottom: 16 },
  btn: { background: 'linear-gradient(135deg,#00D4AA,#00A882)', color: '#06111E', fontWeight: 700, fontSize: 13, padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer' },
  btnOutline: { background: 'transparent', color: '#00D4AA', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(0,212,170,0.3)', cursor: 'pointer' },
  input: { background: '#060B14', border: '1.5px solid #1e2d45', borderRadius: 10, padding: '10px 14px', color: '#E8F0FE', fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
}

const INTEGRATIONS = [
  { id: 'slack', name: 'Slack', icon: '💬', status: 'active', desc: 'Get compliance alerts and weekly scan reports delivered to a Slack channel.', color: '#4A154B', setup: true },
  { id: 'zapier', name: 'Zapier', icon: '⚡', status: 'available', desc: 'Connect AlgoGrass to 5,000+ apps. Trigger Zaps when compliance scores drop or new issues are found.', color: '#FF4A00', setup: false, webhook: true },
  { id: 'teams', name: 'Microsoft Teams', icon: '🔷', status: 'coming', desc: 'Receive compliance alerts and weekly reports directly in your Teams channels.' },
  { id: 'google', name: 'Google Workspace', icon: '🔵', status: 'coming', desc: 'Share compliance reports to Google Drive and send alerts via Gmail.' },
  { id: 'notion', name: 'Notion', icon: '◾', status: 'coming', desc: 'Sync your GRC register and compliance data to a Notion database automatically.' },
  { id: 'hubspot', name: 'HubSpot', icon: '🟠', status: 'coming', desc: 'Add GDPR compliance status to CRM contacts and companies in HubSpot.' },
]

function SlackSetup() {
  const [url, setUrl] = useState('')
  const [open, setOpen] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/integrations/slack').then(r => r.json()).then(d => { if (d.configured) { setConfigured(true); setUrl(d.webhookUrl || '') } })
  }, [])

  const save = async () => {
    setSaving(true); setErr(''); setMsg('')
    const res = await fetch('/api/integrations/slack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ webhookUrl: url }) })
    const d = await res.json()
    setSaving(false)
    if (d.error) setErr(d.error); else { setMsg('Integration saved!'); setConfigured(true); setOpen(false) }
  }

  const test = async () => {
    setTesting(true); setErr(''); setMsg('')
    const res = await fetch('/api/integrations/slack', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ webhookUrl: url, test: true }) })
    const d = await res.json()
    setTesting(false)
    if (d.error) setErr(d.error); else setMsg(d.message)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={S.btn}>{configured ? '✓ Configured — Edit' : 'Connect Slack'}</button>
  )

  return (
    <div style={{ marginTop: 16, padding: 16, background: '#060B14', border: '1px solid #1e2d45', borderRadius: 10 }}>
      <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }}>
        1. Go to <a href="https://api.slack.com/messaging/webhooks" target="_blank" rel="noopener noreferrer" style={{ color: '#00D4AA' }}>api.slack.com/messaging/webhooks</a><br/>
        2. Create a new app → Enable Incoming Webhooks → Add to workspace<br/>
        3. Copy your Webhook URL and paste it below
      </p>
      <input style={{ ...S.input, marginBottom: 10 }} placeholder="https://hooks.slack.com/services/..." value={url} onChange={e => setUrl(e.target.value)} />
      {err && <p style={{ color: '#EF4444', fontSize: 12, marginBottom: 8 }}>{err}</p>}
      {msg && <p style={{ color: '#00D4AA', fontSize: 12, marginBottom: 8 }}>{msg}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={S.btn} onClick={save} disabled={saving || !url}>{saving ? 'Saving...' : 'Save'}</button>
        <button style={S.btnOutline} onClick={test} disabled={testing || !url}>{testing ? 'Sending...' : 'Send test message'}</button>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  const [copied, setCopied] = useState(false)
  const zapierUrl = 'https://algograss.com/api/webhooks/zapier'

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#7C9EFF', letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(124,158,255,0.1)', border: '1px solid rgba(124,158,255,0.2)', borderRadius: 20, padding: '4px 14px', display: 'inline-block', marginBottom: 14 }}>🔗 Integrations</div>
        <h1 style={S.h1}>Connect Your Tools</h1>
        <p style={S.sub}>Connect AlgoGrass to your existing workflows and get compliance alerts where your team already works</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: 16 }}>
          {INTEGRATIONS.map(integration => (
            <div key={integration.id} style={{ ...S.card, opacity: integration.status === 'coming' ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{integration.icon}</span>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#E8F0FE' }}>{integration.name}</div>
                    <div style={{ marginTop: 4 }}>
                      {integration.status === 'active' && <span style={{ background: 'rgba(0,212,170,0.1)', color: '#00D4AA', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>Available</span>}
                      {integration.status === 'available' && <span style={{ background: 'rgba(124,158,255,0.1)', color: '#7C9EFF', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>Available</span>}
                      {integration.status === 'coming' && <span style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>Coming Soon</span>}
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>{integration.desc}</p>

              {integration.id === 'slack' && <SlackSetup />}

              {integration.id === 'zapier' && (
                <div>
                  <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 8px' }}>Your AlgoGrass Zapier webhook URL:</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <code style={{ background: '#060B14', border: '1px solid #1e2d45', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#00D4AA', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{zapierUrl}</code>
                    <button onClick={() => { navigator.clipboard.writeText(zapierUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }} style={S.btnOutline}>{copied ? '✓' : 'Copy'}</button>
                  </div>
                  <p style={{ color: '#475569', fontSize: 11, margin: '8px 0 0' }}>Use this URL as a Webhook trigger in your Zap. It accepts POST requests with complaint/scan data.</p>
                </div>
              )}

              {integration.status === 'coming' && (
                <button style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e2d45', color: '#475569', fontSize: 13, fontWeight: 600, padding: '9px 20px', borderRadius: 9, cursor: 'default' }}>Coming Soon</button>
              )}
            </div>
          ))}
        </div>

        <div style={{ ...S.card, marginTop: 8, background: 'linear-gradient(135deg,rgba(0,212,170,0.06),rgba(124,158,255,0.06))', textAlign: 'center' }}>
          <p style={{ color: '#E8F0FE', fontWeight: 600, fontSize: 15, margin: '0 0 6px' }}>Need a custom integration?</p>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 16px' }}>Use our Developer API to build any integration you need. Full scan results available via REST API.</p>
          <a href="/api-access" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#00D4AA,#00A882)', color: '#06111E', fontWeight: 700, fontSize: 13, padding: '10px 22px', borderRadius: 10, textDecoration: 'none' }}>View API docs →</a>
        </div>
      </div>
    </div>
  )
}
