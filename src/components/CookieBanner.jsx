'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible,  setVisible]  = useState(false)
  const [managing, setManaging] = useState(false)
  const [prefs,    setPrefs]    = useState({ analytics: false, marketing: false })

  useEffect(() => {
    const consent = localStorage.getItem('algograss_cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function save(type, customPrefs) {
    const data = {
      type,
      essential:  true,
      analytics:  type === 'all' || (customPrefs?.analytics ?? false),
      marketing:  type === 'all' || (customPrefs?.marketing ?? false),
      savedAt:    new Date().toISOString(),
    }
    localStorage.setItem('algograss_cookie_consent', JSON.stringify(data))
    setVisible(false)
    setManaging(false)
  }

  if (!visible) return null

  const btn = (label, onClick, primary) => (
    <button onClick={onClick} style={{
      padding: '10px 20px', borderRadius: 8, border: primary ? 'none' : '1px solid rgba(255,255,255,0.15)',
      background: primary ? '#00D4AA' : 'transparent',
      color: primary ? '#060B14' : '#94A3B8',
      fontSize: 13, fontWeight: primary ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99999,
      background: 'rgba(6,11,20,0.97)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(0,212,170,0.2)', padding: '20px 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {!managing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>
                <span style={{ color: '#E8F0FE', fontWeight: 600 }}>🍪 We use cookies</span> — essential cookies keep the site working. We'd also like to use analytics cookies to understand how you use AlgoGrass.
                {' '}<a href="/cookie-policy" style={{ color: '#00D4AA', textDecoration: 'none' }}>Cookie Policy</a>
                {' '}·{' '}<a href="/privacy-policy" style={{ color: '#00D4AA', textDecoration: 'none' }}>Privacy Policy</a>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              {btn('Reject All',          () => save('essential'), false)}
              {btn('Manage Preferences', () => setManaging(true),  false)}
              {btn('Accept All',         () => save('all'),        true)}
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#E8F0FE' }}>Manage cookie preferences</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {[
                { key: 'essential', label: 'Essential cookies', desc: 'Required for login, security, and core platform functions. Cannot be disabled.', locked: true },
                { key: 'analytics', label: 'Analytics cookies', desc: 'Help us understand how visitors use AlgoGrass so we can improve the platform.', locked: false },
                { key: 'marketing', label: 'Marketing cookies', desc: 'Used to show relevant content and measure campaign effectiveness.', locked: false },
              ].map(({ key, label, desc, locked }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <div
                      onClick={() => !locked && setPrefs(p => ({ ...p, [key]: !p[key] }))}
                      style={{
                        width: 40, height: 22, borderRadius: 11, cursor: locked ? 'default' : 'pointer',
                        background: (locked || prefs[key]) ? '#00D4AA' : 'rgba(255,255,255,0.15)',
                        position: 'relative', transition: 'background .2s',
                      }}>
                      <div style={{
                        position: 'absolute', top: 3, left: (locked || prefs[key]) ? 21 : 3,
                        width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s',
                      }}/>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E8F0FE', marginBottom: 2 }}>
                      {label} {locked && <span style={{ fontSize: 10, color: '#00D4AA', background: 'rgba(0,212,170,0.1)', padding: '1px 6px', borderRadius: 4, marginLeft: 4 }}>Always on</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {btn('Reject All',      () => save('essential'),        false)}
              {btn('Save my choices', () => save('custom', prefs),    false)}
              {btn('Accept All',      () => save('all'),              true)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
