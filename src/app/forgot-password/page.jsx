'use client'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setSent(true)
    } catch {
      setError('Connection error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <section style={{ minHeight:'88vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <a href="/" style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:22, color:'var(--green)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, marginBottom:24 }}>
            <svg width="22" height="25" viewBox="0 0 32 36" fill="none"><path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52"/><path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            AlgoGrass
          </a>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:700, color:'var(--ink)', marginBottom:6 }}>Reset your password</h1>
          <p style={{ fontSize:13, color:'var(--ink2)' }}>Enter your email and we'll send you a reset link</p>
        </div>

        <div className="card" style={{ padding:'32px 28px' }}>
          {sent ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📧</div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'var(--ink)', marginBottom:8 }}>Check your email</h2>
              <p style={{ fontSize:13, color:'var(--ink2)', marginBottom:20, lineHeight:1.6 }}>
                We've sent a password reset link to <strong style={{ color:'var(--ink)' }}>{email}</strong>.<br/>
                The link expires in 1 hour.
              </p>
              <p style={{ fontSize:12, color:'var(--ink2)' }}>Didn't receive it? Check your spam folder, or <button onClick={()=>{setSent(false);setError('')}} style={{ background:'none', border:'none', color:'var(--green)', cursor:'pointer', fontSize:12, fontWeight:600, padding:0 }}>try again</button>.</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="field-wrap">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus />
              </div>
              {error && <p style={{ fontSize:13, color:'var(--red-text)', marginBottom:12 }}>{error}</p>}
              <button type="submit" className="btn btn-primary btn-full" disabled={loading || !email}>
                {loading ? 'Sending…' : 'Send reset link →'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:'var(--ink2)', marginTop:16 }}>
          Remember it? <a href="/login" style={{ color:'var(--green)', fontWeight:500 }}>Back to login</a>
        </p>
      </div>
    </section>
  )
}
