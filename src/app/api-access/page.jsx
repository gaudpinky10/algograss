'use client'
import { useState, useEffect } from 'react'

const S = {
  page: { minHeight: '100vh', background: '#FFFFFF', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" },
  wrap: { maxWidth: 860, margin: '0 auto' },
  h1: { fontSize: 34, fontWeight: 800, color: '#0F172A', margin: '0 0 8px', letterSpacing: -0.5 },
  sub: { color: '#94A3B8', fontSize: 15, margin: '0 0 36px' },
  card: { background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 16, padding: '28px 32px', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 18 },
  btn: { background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#FFFFFF', fontWeight: 700, fontSize: 14, padding: '10px 22px', borderRadius: 10, border: 'none', cursor: 'pointer' },
  btnDanger: { background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 600, fontSize: 13, padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer' },
  code: { background: '#FFFFFF', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 10, padding: '18px 20px', fontFamily: 'monospace', fontSize: 13, color: '#0EA5E9', overflow: 'auto', whiteSpace: 'pre', lineHeight: 1.7 },
  tab: { padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'transparent' },
  input: { background: '#FFFFFF', border: '1.5px solid rgba(15,23,42,0.1)', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none' },
}

const CODE_EXAMPLES = {
  JavaScript: `// Install: no dependencies needed — uses native fetch
const response = await fetch('https://algograss.com/api/scan', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: 'https://example.com' }),
});

const result = await response.json();
console.log(\`Score: \${result.score}/100\`);
console.log(\`Issues: \${result.issues.length}\`);`,

  Python: `import requests

response = requests.post(
    'https://algograss.com/api/scan',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
    },
    json={'url': 'https://example.com'}
)

result = response.json()
print(f"Score: {result['score']}/100")
print(f"Issues: {len(result['issues'])}")`,

  cURL: `curl -X POST https://algograss.com/api/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`,
}

export default function ApiAccessPage() {
  const [keys, setKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [newKeyName, setNewKeyName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState(null)
  const [codeTab, setCodeTab] = useState('JavaScript')
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadKeys() }, [])

  const loadKeys = async () => {
    setLoading(true)
    const res = await fetch('/api/apikeys')
    const data = await res.json()
    setKeys(data.keys || [])
    setLoading(false)
  }

  const createKey = async () => {
    setCreating(true)
    const res = await fetch('/api/apikeys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newKeyName || undefined }) })
    const data = await res.json()
    setCreating(false)
    if (data.error) return alert(data.error)
    setNewKey(data.key)
    setNewKeyName('')
    loadKeys()
  }

  const deleteKey = async (id) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return
    await fetch('/api/apikeys', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keyId: id }) })
    loadKeys()
  }

  const copy = text => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#7C9EFF', letterSpacing: 1, textTransform: 'uppercase', background: 'rgba(124,158,255,0.1)', border: '1px solid rgba(124,158,255,0.2)', borderRadius: 20, padding: '4px 14px', display: 'inline-block', marginBottom: 14 }}>🔌 Developer</div>
        <h1 style={S.h1}>API Access</h1>
        <p style={S.sub}>Integrate AlgoGrass GDPR scanning into your own applications and workflows</p>

        {/* New Key Banner */}
        {newKey && (
          <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
            <p style={{ color: '#0EA5E9', fontWeight: 700, fontSize: 14, margin: '0 0 8px' }}>✅ New API key generated — copy it now, it won't be shown again</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <code style={{ ...S.code, flex: 1, padding: '10px 14px', margin: 0, wordBreak: 'break-all', whiteSpace: 'normal' }}>{newKey}</code>
              <button style={S.btn} onClick={() => copy(newKey)}>{copied ? '✓ Copied!' : '📋 Copy'}</button>
            </div>
            <button onClick={() => setNewKey(null)} style={{ marginTop: 10, background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12 }}>Dismiss</button>
          </div>
        )}

        {/* API Keys */}
        <div style={S.card}>
          <div style={S.cardTitle}>🔑 Your API Keys</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <input style={{ ...S.input, flex: 1, minWidth: 180 }} placeholder="Key name (optional)" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} />
            <button style={S.btn} onClick={createKey} disabled={creating}>{creating ? 'Generating...' : '+ Generate New Key'}</button>
          </div>
          {loading ? <p style={{ color: '#475569', fontSize: 14 }}>Loading keys...</p> : keys.length === 0 ? (
            <p style={{ color: '#475569', fontSize: 14 }}>No API keys yet. Generate your first key above.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name','Key (masked)','Created','Usage',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#0EA5E9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(15,23,42,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map(k => (
                  <tr key={k._id}>
                    <td style={{ padding: '12px 12px', fontSize: 14, color: '#0F172A', borderBottom: '1px solid rgba(30,45,69,0.5)' }}>{k.keyName}</td>
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#94A3B8', fontFamily: 'monospace', borderBottom: '1px solid rgba(30,45,69,0.5)' }}>{k.preview}</td>
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#94A3B8', borderBottom: '1px solid rgba(30,45,69,0.5)' }}>{new Date(k.createdAt).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '12px 12px', fontSize: 13, color: '#94A3B8', borderBottom: '1px solid rgba(30,45,69,0.5)' }}>{k.usageCount || 0} calls</td>
                    <td style={{ padding: '12px 12px', borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
                      <button style={S.btnDanger} onClick={() => deleteKey(k._id)}>Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Rate Limits */}
        <div style={S.card}>
          <div style={S.cardTitle}>⚡ Rate Limits</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Plan','Scans/day','Keys allowed','Support'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, color: '#0EA5E9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, borderBottom: '1px solid rgba(15,23,42,0.1)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[['Free','10 scans','1 key','Community'],['Starter','100 scans','3 keys','Email'],['Pro','1,000 scans','10 keys','Priority']].map(([plan, scans, keys, support]) => (
                <tr key={plan}>
                  {[plan, scans, keys, support].map((v, i) => (
                    <td key={i} style={{ padding: '12px 12px', fontSize: 13, color: i === 0 ? '#0F172A' : '#94A3B8', fontWeight: i === 0 ? 600 : 400, borderBottom: '1px solid rgba(30,45,69,0.5)' }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Endpoint Docs */}
        <div style={S.card}>
          <div style={S.cardTitle}>📖 API Reference</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(14,165,233,0.12)', color: '#0EA5E9', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 6 }}>POST</span>
              <code style={{ color: '#0F172A', fontSize: 14 }}>https://algograss.com/api/scan</code>
            </div>
            <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 14px' }}>Scan any website for GDPR compliance and get a score with detailed issues.</p>
            <p style={{ color: '#0F172A', fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>Request headers:</p>
            <pre style={S.code}>{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}</pre>
            <p style={{ color: '#0F172A', fontSize: 13, fontWeight: 600, margin: '16px 0 8px' }}>Request body:</p>
            <pre style={S.code}>{`{ "url": "https://example.com" }`}</pre>
            <p style={{ color: '#0F172A', fontSize: 13, fontWeight: 600, margin: '16px 0 8px' }}>Response:</p>
            <pre style={S.code}>{`{
  "score": 74,
  "url": "https://example.com",
  "scannedAt": "2026-06-25T09:00:00.000Z",
  "issues": [
    { "title": "No cookie consent banner", "sev": "High", "desc": "...", "reg": "PECR" }
  ],
  "checks": {
    "https": true,
    "privacyPolicy": true,
    "cookieBanner": false,
    "cookieReject": false,
    "termsOfService": true,
    "lawfulBasis": false,
    "dataRights": true,
    "trackersDisclosed": false,
    "retentionPolicy": true,
    "dsarContact": true
  },
  "trackers": ["Google Analytics", "Meta Pixel"]
}`}</pre>
          </div>
        </div>

        {/* Code Examples */}
        <div style={S.card}>
          <div style={S.cardTitle}>💻 Code Examples</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {Object.keys(CODE_EXAMPLES).map(lang => (
              <button key={lang} style={{ ...S.tab, background: codeTab === lang ? 'rgba(14,165,233,0.12)' : 'transparent', color: codeTab === lang ? '#0EA5E9' : '#94A3B8', border: codeTab === lang ? '1px solid rgba(14,165,233,0.25)' : '1px solid transparent' }} onClick={() => setCodeTab(lang)}>{lang}</button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <pre style={S.code}>{CODE_EXAMPLES[codeTab]}</pre>
            <button onClick={() => copy(CODE_EXAMPLES[codeTab])} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', color: '#0EA5E9', fontSize: 12, padding: '4px 12px', borderRadius: 6, cursor: 'pointer' }}>
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
