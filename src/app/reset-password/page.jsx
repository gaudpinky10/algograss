'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const token        = searchParams.get('token')

  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (!token) setError('Invalid reset link. Please request a new one.')
  }, [token])

  async function submit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <section style={{ minHeight:'88vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <a href="/" style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'var(--green)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, marginBottom:24 }}>
            <svg width="22" height="25" viewBox="0 0 32 36" fill="none"><path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52"/><path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            AlgoGrass
          </a>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:700, color:'var(--ink)', marginBottom:6 }}>Set new password</h1>
          <p style={{ fontSize:13, color:'var(--ink2)' }}>Choose a strong password for your account</p>
        </div>

        <div className="card" style={{ padding:'32px 28px' }}>
          {done ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'var(--ink)', marginBottom:8 }}>Password updated!</h2>
              <p style={{ fontSize:13, color:'var(--ink2)' }}>Redirecting you to login…</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="field-wrap">
                <label className="field-label">New password</label>
                <input className="field-input" type="password" placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} required autoFocus />
              </div>
              <div className="field-wrap">
                <label className="field-label">Confirm new password</label>
                <input className="field-input" type="password" placeholder="Same as above" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
              </div>
              {error && <p style={{ fontSize:13, color:'var(--red-text)', marginBottom:12 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading || !password || !confirm || !token}>
                {loading ? 'Updating…' : 'Update password →'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--ink2)', marginTop:16 }}>
          <a href="/login" style={{ color:'var(--green)', fontWeight:500 }}>← Back to login</a>
        </p>
      </div>
    </section>
  )
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<div style={{ padding:48, color:'var(--ink2)' }}>Loading…</div>}><ResetForm /></Suspense>
}
