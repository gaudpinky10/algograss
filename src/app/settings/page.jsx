'use client'
import { useState, useEffect } from 'react'

const S = {
  page: { minHeight: '100vh', background: '#06060F', padding: '40px 20px', fontFamily: "'Segoe UI', sans-serif" },
  wrap: { maxWidth: 720, margin: '0 auto' },
  h1: { fontSize: 30, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', letterSpacing: -0.5 },
  sub: { color: '#94A3B8', fontSize: 14, margin: '0 0 32px' },
  card: { background: '#0D0D1E', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '28px 32px', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 600, color: '#CBD5E1', display: 'block', marginBottom: 6 },
  input: { width: '100%', background: '#06060F', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: '10px 14px', color: '#0F172A', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  row: { marginBottom: 18 },
  btn: { background: 'linear-gradient(135deg,#9B7BFA,#7C3AED)', color: '#06060F', fontWeight: 700, fontSize: 14, padding: '11px 26px', borderRadius: 10, border: 'none', cursor: 'pointer' },
  btnDanger: { background: 'rgba(239,68,68,0.08)', color: '#EF4444', fontWeight: 600, fontSize: 13, padding: '9px 20px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' },
}

const TABS = ['Profile', 'White Label', 'Notifications', 'Security']

export default function SettingsPage() {
  const [tab, setTab] = useState('Profile')
  const [settings, setSettings] = useState({})
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [form, setForm] = useState({ name: '', website: '', brandName: '', brandLogo: '', brandColor: '#9B7BFA', removeBranding: false })
  const [notif, setNotif] = useState({ weeklyReport: true, regulatoryDigest: true, trialWarning: true, scoreDrop: true })
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' })

  useEffect(() => {
    try {
      const c = document.cookie.split(';').find(x => x.trim().startsWith('algograss_user='))
      if (c) { const u = JSON.parse(atob(c.split('=')[1].trim())); setUser(u); setForm(f => ({ ...f, name: u.name || '', website: u.website || '' })) }
    } catch {}
    fetch('/api/user/settings').then(r => r.json()).then(d => {
      if (d.settings) {
        const s = d.settings
        setSettings(s)
        setForm(f => ({ ...f, name: s.name || f.name, website: s.website || f.website, brandName: s.brandName || '', brandLogo: s.brandLogo || '', brandColor: s.brandColor || '#9B7BFA', removeBranding: s.removeBranding || false }))
        if (s.notifications) setNotif(n => ({ ...n, ...s.notifications }))
      }
    })
  }, [])

  const save = async (payload) => {
    setSaving(true); setMsg(''); setErr('')
    const res = await fetch('/api/user/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const d = await res.json()
    setSaving(false)
    if (d.error) setErr(d.error)
    else setMsg('Saved successfully!')
  }

  const changePass = async () => {
    if (pass.next !== pass.confirm) return setErr('Passwords do not match')
    await save({ action: 'change-password', currentPassword: pass.current, newPassword: pass.next })
    setPass({ current: '', next: '', confirm: '' })
  }

  const isPro = user?.plan === 'pro'

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <h1 style={S.h1}>Settings</h1>
        <p style={S.sub}>Manage your account, branding, and preferences</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#0D0D1E', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: 4 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setMsg(''); setErr('') }} style={{ flex: 1, padding: '9px 12px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: tab === t ? 'rgba(139,92,246,0.12)' : 'transparent', color: tab === t ? '#9B7BFA' : '#94A3B8' }}>{t}</button>
          ))}
        </div>

        {msg && <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#9B7BFA', fontSize: 14 }}>✅ {msg}</div>}
        {err && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#EF4444', fontSize: 14 }}>❌ {err}</div>}

        {/* Profile */}
        {tab === 'Profile' && (
          <div style={S.card}>
            <h3 style={{ color: '#0F172A', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Profile Details</h3>
            <div style={S.row}><label style={S.label}>Full name</label><input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={S.row}><label style={S.label}>Email address</label><input style={{ ...S.input, opacity: 0.5 }} value={user?.email || ''} readOnly /></div>
            <div style={S.row}><label style={S.label}>Website</label><input style={S.input} value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yourbusiness.com" /></div>
            <div style={S.row}><label style={S.label}>Plan</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ background: isPro ? 'rgba(139,92,246,0.12)' : 'rgba(124,158,255,0.12)', color: isPro ? '#9B7BFA' : '#C084FC', fontWeight: 700, fontSize: 13, padding: '4px 14px', borderRadius: 20 }}>{(user?.plan || 'free').toUpperCase()}</span>
                {!isPro && <a href="/pricing" style={{ color: '#9B7BFA', fontSize: 13, fontWeight: 600 }}>Upgrade to Pro →</a>}
              </div>
            </div>
            <button style={S.btn} onClick={() => save({ name: form.name, website: form.website })} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        )}

        {/* White Label */}
        {tab === 'White Label' && (
          <div style={S.card}>
            {!isPro && (
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
                <p style={{ color: '#F59E0B', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>⭐ Pro feature</p>
                <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 12px' }}>White-label branding is available on the Pro plan.</p>
                <a href="/pricing" style={{ color: '#9B7BFA', fontSize: 13, fontWeight: 600 }}>Upgrade to Pro →</a>
              </div>
            )}
            <h3 style={{ color: '#0F172A', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>White Label Branding</h3>
            <div style={S.row}><label style={S.label}>Company name (used on generated documents)</label><input style={S.input} value={form.brandName} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} placeholder="Your Company Ltd" disabled={!isPro} /></div>
            <div style={S.row}><label style={S.label}>Company logo URL</label><input style={S.input} value={form.brandLogo} onChange={e => setForm(f => ({ ...f, brandLogo: e.target.value }))} placeholder="https://yourcompany.com/logo.png" disabled={!isPro} /></div>
            {form.brandLogo && <div style={{ ...S.row, background: '#06060F', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, padding: 16, marginBottom: 18 }}><img src={form.brandLogo} alt="Logo preview" style={{ maxHeight: 60, maxWidth: 200 }} onError={e => e.target.style.display='none'} /></div>}
            <div style={S.row}><label style={S.label}>Brand colour</label>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="color" value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} style={{ width: 44, height: 44, border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, cursor: 'pointer', background: 'none', padding: 2 }} disabled={!isPro} />
                <input style={{ ...S.input, width: 120 }} value={form.brandColor} onChange={e => setForm(f => ({ ...f, brandColor: e.target.value }))} disabled={!isPro} />
              </div>
            </div>
            <div style={{ ...S.row, display: 'flex', alignItems: 'center', gap: 12 }}>
              <input type="checkbox" id="removeBrand" checked={form.removeBranding} onChange={e => setForm(f => ({ ...f, removeBranding: e.target.checked }))} disabled={!isPro} style={{ width: 18, height: 18, cursor: isPro ? 'pointer' : 'default' }} />
              <label htmlFor="removeBrand" style={{ ...S.label, display: 'inline', margin: 0, opacity: isPro ? 1 : 0.5 }}>Remove "Powered by AlgoGrass" from generated documents</label>
            </div>
            <button style={{ ...S.btn, opacity: isPro ? 1 : 0.5 }} onClick={() => isPro && save({ brandName: form.brandName, brandLogo: form.brandLogo, brandColor: form.brandColor, removeBranding: form.removeBranding })} disabled={saving || !isPro}>{saving ? 'Saving...' : 'Save White Label Settings'}</button>
          </div>
        )}

        {/* Notifications */}
        {tab === 'Notifications' && (
          <div style={S.card}>
            <h3 style={{ color: '#0F172A', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Email Notifications</h3>
            {[
              ['weeklyReport', 'Weekly scan reports', 'Automated compliance scan results every Monday'],
              ['regulatoryDigest', 'Regulatory update digest', 'New ICO, EDPB, and UK GDPR updates every Friday'],
              ['trialWarning', 'Trial expiry warnings', 'Reminder 3 days before your trial ends'],
              ['scoreDrop', 'Score drop alerts', 'Email when your compliance score drops 5+ points'],
            ].map(([key, label, desc]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(30,45,69,0.5)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>{desc}</div>
                </div>
                <div onClick={() => setNotif(n => ({ ...n, [key]: !n[key] }))} style={{ width: 44, height: 24, borderRadius: 12, background: notif[key] ? '#9B7BFA' : 'rgba(255,255,255,0.09)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: notif[key] ? 22 : 2, width: 20, height: 20, borderRadius: 10, background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <button style={S.btn} onClick={() => save({ notifications: notif })} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</button>
            </div>
          </div>
        )}

        {/* Security */}
        {tab === 'Security' && (
          <>
            <div style={S.card}>
              <h3 style={{ color: '#0F172A', fontWeight: 700, fontSize: 16, margin: '0 0 20px' }}>Change Password</h3>
              <div style={S.row}><label style={S.label}>Current password</label><input type="password" style={S.input} value={pass.current} onChange={e => setPass(p => ({ ...p, current: e.target.value }))} /></div>
              <div style={S.row}><label style={S.label}>New password</label><input type="password" style={S.input} value={pass.next} onChange={e => setPass(p => ({ ...p, next: e.target.value }))} /></div>
              <div style={S.row}><label style={S.label}>Confirm new password</label><input type="password" style={S.input} value={pass.confirm} onChange={e => setPass(p => ({ ...p, confirm: e.target.value }))} /></div>
              <button style={S.btn} onClick={changePass} disabled={saving || !pass.current || !pass.next}>{saving ? 'Updating...' : 'Update Password'}</button>
            </div>
            <div style={S.card}>
              <h3 style={{ color: '#EF4444', fontWeight: 700, fontSize: 16, margin: '0 0 10px' }}>Danger Zone</h3>
              <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 16px' }}>Permanently delete your account and all associated data. This cannot be undone.</p>
              <button style={S.btnDanger} onClick={() => confirm('Are you absolutely sure? All your data will be deleted.') && alert('Please contact hello@algograss.co.uk to delete your account.')}>Delete My Account</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
