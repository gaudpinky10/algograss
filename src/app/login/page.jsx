'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      router.push('/dashboard')
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section style={{ minHeight: '88vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <a href="/" style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--green)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 24 }}>
            <svg width="22" height="25" viewBox="0 0 32 36" fill="none"><path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52" /><path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            AlgoGrass
          </a>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'var(--ink2)' }}>Log in to your compliance dashboard</p>
        </div>
        <div className="card" style={{ padding: '32px 28px' }}>
          <form onSubmit={submit}>
            <div className="field-wrap"><label className="field-label">Email address</label><input className="field-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required /></div>
            <div style={{ marginBottom: 8 }}><label className="field-label">Password</label><input className="field-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required /></div>
            <div style={{ textAlign: 'right', marginBottom: 20 }}><a href="/forgot-password" style={{ fontSize: 12, color: 'var(--green)' }}>Forgot password?</a></div>
            {error && <p style={{ fontSize: 13, color: 'var(--red-text)', marginBottom: 12 }}>{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Logging in...' : 'Log in →'}</button>
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink2)', marginTop: 16 }}>No account yet? <a href="/signup" style={{ color: 'var(--green)', fontWeight: 500 }}>Sign up free</a></p>
      </div>
    </section>
  )
}
