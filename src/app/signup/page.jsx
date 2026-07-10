'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// ── Validation helpers ────────────────────────────────────────────────────────
function validateName(v) {
  if (!v.trim()) return 'Full name is required.'
  if (v.trim().length < 2) return 'Name must be at least 2 characters.'
  if (!/^[a-zA-Z\s'\-]+$/.test(v.trim())) return 'Name can only contain letters, spaces, hyphens and apostrophes.'
  return ''
}
function validateEmail(v) {
  if (!v.trim()) return 'Email address is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Please enter a valid email address.'
  return ''
}
function validatePassword(v) {
  if (!v) return 'Password is required.'
  if (v.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(v)) return 'Password must include at least one uppercase letter.'
  if (!/[a-z]/.test(v)) return 'Password must include at least one lowercase letter.'
  if (!/[0-9]/.test(v)) return 'Password must include at least one number.'
  if (!/[^A-Za-z0-9]/.test(v)) return 'Password must include at least one special character (e.g. @, !, #).'
  return ''
}
function validateWebsite(v) {
  if (!v.trim()) return '' // optional
  const url = v.trim().toLowerCase().replace(/^https?:\/\//, '')
  if (!/^[a-z0-9]([a-z0-9\-\.]+[a-z0-9])?(\.[a-z]{2,})(\/.*)?$/.test(url)) {
    return 'Please enter a valid website URL (e.g. yoursite.co.uk).'
  }
  return ''
}

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(v) {
  if (!v) return { score: 0, label: '', color: '' }
  let score = 0
  if (v.length >= 8)          score++
  if (/[A-Z]/.test(v))        score++
  if (/[a-z]/.test(v))        score++
  if (/[0-9]/.test(v))        score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  if (score <= 2) return { score, label: 'Weak',   color: '#EF4444' }
  if (score === 3) return { score, label: 'Fair',   color: '#F59E0B' }
  if (score === 4) return { score, label: 'Good',   color: '#C084FC' }
  return                       { score, label: 'Strong', color: '#9B7BFA' }
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm]         = useState({ name: '', email: '', password: '', website: '' })
  const [errors, setErrors]     = useState({ name: '', email: '', password: '', website: '' })
  const [touched, setTouched]   = useState({ name: false, email: false, password: false, website: false })
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [serverError, setServerError] = useState('')
  const [exists, setExists]     = useState(false)

  const strength = getStrength(form.password)

  // Pre-fill email from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const email = params.get('email')
    if (email) setForm(f => ({ ...f, email }))
  }, [])

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    if (touched[k]) validate(k, v)
  }

  function validate(k, v) {
    const val = v ?? form[k]
    const errs = {
      name:     validateName(val),
      email:    validateEmail(val),
      password: validatePassword(val),
      website:  validateWebsite(val),
    }
    setErrors(e => ({ ...e, [k]: errs[k] }))
    return errs[k]
  }

  function blur(k) {
    setTouched(t => ({ ...t, [k]: true }))
    validate(k, form[k])
  }

  async function submit(e) {
    e.preventDefault()
    // Mark all touched & validate
    setTouched({ name: true, email: true, password: true, website: true })
    const nameErr    = validateName(form.name)
    const emailErr   = validateEmail(form.email)
    const pwdErr     = validatePassword(form.password)
    const siteErr    = validateWebsite(form.website)
    setErrors({ name: nameErr, email: emailErr, password: pwdErr, website: siteErr })
    if (nameErr || emailErr || pwdErr || siteErr) return

    setLoading(true); setServerError(''); setExists(false)
    try {
      const res  = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, plan: 'free' }),
      })
      const data = await res.json()
      if (data.error) {
        if (res.status === 409) setExists(true)
        else setServerError(data.error)
        setLoading(false); return
      }
      router.push('/dashboard')
    } catch {
      setServerError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06060F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', right: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,158,255,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 460, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <svg width="28" height="32" viewBox="0 0 32 36" fill="none">
              <defs><linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#9B7BFA"/><stop offset="100%" stopColor="#C084FC"/></linearGradient></defs>
              <path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="url(#lg2)" opacity="0.9"/>
              <path d="M10 18 L14 22 L22 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--f-head,Syne,sans-serif)', fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg,#9B7BFA,#C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AlgoGrass
            </span>
          </a>
          <h1 style={{ fontFamily: 'var(--f-head,Syne,sans-serif)', fontWeight: 800, fontSize: 26, color: '#0F172A', marginBottom: 8 }}>Start for free</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 100, padding: '6px 14px', marginBottom: 4 }}>
            <span style={{ fontSize: 13 }}>🚀</span>
            <span style={{ fontSize: 13, color: '#9B7BFA', fontWeight: 700 }}>60 days free Pro — no credit card needed</span>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>Full access to every feature. Upgrade or stay free after 60 days.</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(248,250,252,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 28px', backdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(255,255,255,0.09), 0 0 0 1px rgba(139,92,246,0.06)' }}>

          {/* Google OAuth */}
          <a href="/api/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '12px 20px', borderRadius: 12, background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#0F172A', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'all .2s', marginBottom: 20, boxSizing: 'border-box' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.566 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}>or sign up with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Already exists banner */}
          {exists && (
            <div style={{ background: 'rgba(124,158,255,0.08)', border: '1px solid rgba(124,158,255,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
              <p style={{ fontSize: 13, color: '#C084FC', margin: '0 0 8px', fontWeight: 600 }}>Account already exists for {form.email}</p>
              <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 10px' }}>Sign in to your existing account instead.</p>
              <a href="/login" style={{ display: 'inline-block', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#C084FC,#5B7FFF)', color: '#fff', textDecoration: 'none' }}>Sign in →</a>
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} noValidate>

            {/* Name + Email row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <Field label="Full name *" error={touched.name && errors.name}>
                <input
                  type="text" placeholder="Jane Smith" value={form.name} required
                  onChange={e => setField('name', e.target.value)}
                  onBlur={() => blur('name')}
                  style={iStyle(touched.name && errors.name)}
                />
              </Field>
              <Field label="Work email *" error={touched.email && errors.email}>
                <input
                  type="email" placeholder="jane@company.com" value={form.email} required
                  onChange={e => setField('email', e.target.value)}
                  onBlur={() => blur('email')}
                  style={iStyle(touched.email && errors.email)}
                />
              </Field>
            </div>

            {/* Password */}
            <Field label="Password *" error={touched.password && errors.password} mb={4}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Min 8 chars · uppercase · number · symbol"
                  value={form.password} required
                  onChange={e => setField('password', e.target.value)}
                  onBlur={() => blur('password')}
                  style={{ ...iStyle(touched.password && errors.password), paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4, display: 'flex', alignItems: 'center' }}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? (
                    // Eye-off
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    // Eye
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </Field>

            {/* Password strength bar */}
            {form.password && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)', transition: 'background .3s' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
                  <span style={{ fontSize: 10, color: '#94A3B8' }}>
                    {[
                      form.password.length >= 8 && '8+ chars',
                      /[A-Z]/.test(form.password) && 'Uppercase',
                      /[0-9]/.test(form.password) && 'Number',
                      /[^A-Za-z0-9]/.test(form.password) && 'Symbol',
                    ].filter(Boolean).join(' · ')}
                  </span>
                </div>
              </div>
            )}

            {/* Website */}
            <Field label={<>Your website <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional — we&apos;ll scan it for free)</span></>} error={touched.website && errors.website}>
              <input
                type="text" placeholder="yourwebsite.co.uk" value={form.website}
                onChange={e => setField('website', e.target.value)}
                onBlur={() => blur('website')}
                style={iStyle(touched.website && errors.website)}
              />
            </Field>

            {serverError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#F87171', margin: 0 }}>{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none', marginTop: 6,
              background: loading ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg,#9B7BFA,#00B896)',
              color: '#06060F', fontWeight: 700, fontSize: 15, cursor: loading ? 'default' : 'pointer',
              transition: 'all .2s', fontFamily: 'var(--f-head,Syne,sans-serif)',
              boxShadow: loading ? 'none' : '0 0 24px rgba(139,92,246,0.3)',
            }}>
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>

            <p style={{ fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
              By signing up you agree to our{' '}
              <a href="/terms" style={{ color: '#64748B', textDecoration: 'underline' }}>Terms</a> and{' '}
              <a href="/privacy-policy" style={{ color: '#64748B', textDecoration: 'underline' }}>Privacy Policy</a>
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#94A3B8', marginTop: 20 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#9B7BFA', fontWeight: 600, textDecoration: 'none' }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({ label, error, children, mb = 14 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 11, color: '#F87171', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#F87171"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          {error}
        </p>
      )}
    </div>
  )
}

function iStyle(hasError) {
  return {
    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
    background: 'rgba(15,23,42,0.05)',
    border: `1px solid ${hasError ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.08)'}`,
    color: '#0F172A', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s',
    fontFamily: 'var(--f-body,Lora,serif)',
  }
}
