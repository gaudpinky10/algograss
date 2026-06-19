'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm]     = useState({ name: '', email: '', password: '', website: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [exists, setExists] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  // Pre-fill email if redirected from login "not found" banner
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    if (email) setForm(f => ({ ...f, email }))
  }, [])

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError(''); setExists(false)
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      setLoading(false); return
    }
    try {
      const res  = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: 'free' }),
      })
      const data = await res.json()
      if (data.error) {
        if (res.status === 409) { setExists(true) }
        else { setError(data.error) }
        setLoading(false); return
      }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#060B14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,158,255,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <svg width="28" height="32" viewBox="0 0 32 36" fill="none">
              <defs><linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00D4AA"/><stop offset="100%" stopColor="#7C9EFF"/></linearGradient></defs>
              <path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="url(#lg2)" opacity="0.9"/>
              <path d="M10 18 L14 22 L22 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-syne,"Syne"),sans-serif', fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#00D4AA,#7C9EFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AlgoGrass
            </span>
          </a>
          <h1 style={{ fontFamily: 'var(--font-syne,"Syne"),sans-serif', fontWeight: 800, fontSize: 28, color: '#E8F0FE', marginBottom: 8 }}>
            Start for free
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(232,240,254,0.45)' }}>
            No credit card required · Upgrade any time
          </p>
        </div>

        {/* Perks row */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          {['🔍 Website scanner', '🛡️ AI assistant', '📋 DSAR handler', '🏛️ GRC platform'].map(p => (
            <span key={p} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', color: '#00D4AA', fontWeight: 500 }}>{p}</span>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13,21,37,0.8)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '32px 28px', backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,212,170,0.06)',
        }}>

          {/* Google OAuth */}
          <a
            href="/api/auth/google"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '12px 20px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#E8F0FE', fontSize: 14, fontWeight: 500, textDecoration: 'none',
              transition: 'all .2s', marginBottom: 20,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.566 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </a>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(232,240,254,0.3)' }}>or sign up with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Already exists banner */}
          {exists && (
            <div style={{ background: 'rgba(124,158,255,0.08)', border: '1px solid rgba(124,158,255,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: '#7C9EFF', margin: '0 0 8px', fontWeight: 600 }}>
                Account already exists for {form.email}
              </p>
              <p style={{ fontSize: 12, color: 'rgba(232,240,254,0.5)', margin: '0 0 10px' }}>
                Sign in to your existing account instead.
              </p>
              <a href={`/login`} style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#7C9EFF,#5B7FFF)', color: '#fff', textDecoration: 'none' }}>
                Sign in →
              </a>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Full name *</label>
                <input type="text" placeholder="Jane Smith" value={form.name} onChange={set('name')} required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
              <div>
                <label style={labelStyle}>Work email *</label>
                <input type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password * <span style={{ color: 'rgba(232,240,254,0.3)', fontWeight: 400 }}>(min 8 characters)</span></label>
              <input type="password" placeholder="Create a strong password" value={form.password} onChange={set('password')} required minLength={8} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Your website <span style={{ color: 'rgba(232,240,254,0.3)', fontWeight: 400 }}>(optional — we'll scan it for free)</span></label>
              <input type="text" placeholder="yourwebsite.co.uk" value={form.website} onChange={set('website')} style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#F87171', margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: loading ? 'rgba(0,212,170,0.4)' : 'linear-gradient(135deg,#00D4AA,#00B896)',
              color: '#060B14', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
              transition: 'all .2s', fontFamily: 'var(--font-syne,"Syne"),sans-serif',
              boxShadow: loading ? 'none' : '0 0 24px rgba(0,212,170,0.3)',
            }}>
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>

            <p style={{ fontSize: 11, color: 'rgba(232,240,254,0.25)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
              By signing up you agree to our{' '}
              <a href="/terms" style={{ color: 'rgba(232,240,254,0.4)', textDecoration: 'underline' }}>Terms</a> and{' '}
              <a href="/privacy-policy" style={{ color: 'rgba(232,240,254,0.4)', textDecoration: 'underline' }}>Privacy Policy</a>
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(232,240,254,0.35)', marginTop: 20 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#00D4AA', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'rgba(232,240,254,0.6)', marginBottom: 6,
  letterSpacing: '.04em', textTransform: 'uppercase',
}
const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#E8F0FE', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
  fontFamily: 'var(--font-space-grotesk,"Space Grotesk"),sans-serif',
}
