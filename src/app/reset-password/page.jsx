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
          <a href="/" style={{ textDecoration:'none', display:'inline-block', marginBottom:24 }}>
            <img src="/logo.png" alt="AlgoGrass" style={{ height:36, width:'auto' }} />
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
