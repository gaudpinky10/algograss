'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const scoreColor = s => s >= 70 ? '#0EA5E9' : s >= 40 ? '#F59E0B' : '#EF4444'
const scoreLabel = s => s >= 70 ? 'Good' : s >= 40 ? 'Needs Work' : 'At Risk'

export default function SharePage() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch(`/api/share?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(() => setError('Failed to load report'))
  }, [token])

  const copy = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  const page = { minHeight: '100vh', background: '#FFFFFF', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" }
  const wrap = { maxWidth: 720, margin: '0 auto' }
  const card = { background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 16, padding: '28px 32px', marginBottom: 20 }

  if (error) return (
    <div style={page}>
      <div style={{ ...wrap, textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h2 style={{ color: '#0F172A', fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Report not found</h2>
        <p style={{ color: '#94A3B8' }}>This report link has expired or doesn't exist.</p>
        <a href="/scan" style={{ display: 'inline-block', marginTop: 20, background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#FFFFFF', fontWeight: 700, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>Run a free scan →</a>
      </div>
    </div>
  )

  if (!data) return (
    <div style={page}>
      <div style={{ ...wrap, textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: '#94A3B8' }}>Loading report...</p>
      </div>
    </div>
  )

  const { scanResult } = data
  const sc = scanResult?.score ?? 0
  const col = scoreColor(sc)
  const label = scoreLabel(sc)
  const high = (scanResult?.issues || []).filter(i => i.sev === 'High')
  const med = (scanResult?.issues || []).filter(i => i.sev === 'Medium')
  const low = (scanResult?.issues || []).filter(i => i.sev === 'Low')

  const sevColor = s => s === 'High' ? '#EF4444' : s === 'Medium' ? '#F59E0B' : '#818CF8'
  const sevBg = s => s === 'High' ? 'rgba(239,68,68,0.12)' : s === 'Medium' ? 'rgba(245,158,11,0.12)' : 'rgba(129,140,248,0.12)'

  return (
    <div style={page}>
      <div style={wrap}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#0EA5E9,#7C9EFF)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#FFFFFF' }}>AG</div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#0EA5E9' }}>AlgoGrass</span>
            <span style={{ color: 'rgba(15,23,42,0.1)', fontSize: 16 }}>|</span>
            <span style={{ color: '#94A3B8', fontSize: 14 }}>Compliance Report</span>
          </div>
          <button onClick={copy} style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: '#0EA5E9', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
            {copied ? '✓ Copied!' : '🔗 Share this report'}
          </button>
        </div>

        {/* Score */}
        <div style={{ ...card, textAlign: 'center', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)' }}>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 8px' }}>{scanResult?.url || 'Website'}</p>
          <p style={{ color: '#475569', fontSize: 12, margin: '0 0 24px' }}>Scanned {scanResult?.scannedAt ? new Date(scanResult.scannedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
          <div style={{ fontSize: 72, fontWeight: 800, color: col, lineHeight: 1, marginBottom: 12 }}>{sc}</div>
          <div style={{ display: 'inline-block', background: `${col}20`, color: col, fontWeight: 700, fontSize: 14, padding: '5px 18px', borderRadius: 20, marginBottom: 16 }}>{label}</div>
          <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>{(scanResult?.issues || []).length} compliance issue{(scanResult?.issues || []).length !== 1 ? 's' : ''} found</p>
        </div>

        {/* Issues */}
        {(scanResult?.issues || []).length > 0 && (
          <div style={card}>
            <h3 style={{ color: '#0F172A', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Compliance Issues</h3>
            {[...high, ...med, ...low].map((issue, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < (scanResult?.issues || []).length - 1 ? '1px solid rgba(30,45,69,0.5)' : 'none' }}>
                <span style={{ background: sevBg(issue.sev), color: sevColor(issue.sev), fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{issue.sev}</span>
                <div>
                  <div style={{ color: '#0F172A', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{issue.title}</div>
                  <div style={{ color: '#94A3B8', fontSize: 12, lineHeight: 1.5, marginBottom: 4 }}>{issue.desc}</div>
                  <span style={{ background: 'rgba(14,165,233,0.08)', color: '#0EA5E9', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>{issue.reg}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Checks */}
        {scanResult?.checks && (
          <div style={card}>
            <h3 style={{ color: '#0F172A', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>What We Checked</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries({ 'HTTPS encryption': scanResult.checks.https, 'Privacy policy': scanResult.checks.privacyPolicy, 'Cookie consent': scanResult.checks.cookieBanner, 'Reject All option': scanResult.checks.cookieReject, 'Terms of service': scanResult.checks.termsOfService, 'Lawful basis': scanResult.checks.lawfulBasis, 'Data subject rights': scanResult.checks.dataRights, 'Trackers disclosed': scanResult.checks.trackersDisclosed, 'Retention period': scanResult.checks.retentionPolicy, 'DSAR contact': scanResult.checks.dsarContact }).map(([label, passed]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: passed ? 'rgba(14,165,233,0.05)' : 'rgba(239,68,68,0.05)', borderRadius: 8, border: `1px solid ${passed ? 'rgba(14,165,233,0.15)' : 'rgba(239,68,68,0.1)'}` }}>
                  <span style={{ fontSize: 15 }}>{passed ? '✅' : '❌'}</span>
                  <span style={{ fontSize: 12, color: '#CBD5E1' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ ...card, textAlign: 'center', background: 'linear-gradient(135deg,rgba(14,165,233,0.06),rgba(124,158,255,0.06))' }}>
          <h3 style={{ color: '#0F172A', fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>Fix your compliance issues</h3>
          <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 20px' }}>AlgoGrass helps you generate privacy policies, respond to DSARs, and stay GDPR compliant — automatically.</p>
          <a href="https://algograss.com/signup" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#0EA5E9,#0284C7)', color: '#FFFFFF', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 10, textDecoration: 'none' }}>Get your free account →</a>
          <p style={{ color: '#475569', fontSize: 11, margin: '14px 0 0' }}>Powered by AlgoGrass · algograss.com</p>
        </div>
      </div>
    </div>
  )
}
