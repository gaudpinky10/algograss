'use client'
import { useState, useEffect } from 'react'

const S = {
  bg: '#060B14', surface: '#0D1525', border: '#1e2d45',
  teal: '#00D4AA', blue: '#7C9EFF', text: '#E8F0FE',
  muted: '#94A3B8', dim: '#475569', red: '#EF4444', amber: '#F59E0B',
}

export default function ReferralPage() {
  const [user, setUser]         = useState(null)
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [copied, setCopied]     = useState(false)
  const [topRefs, setTopRefs]   = useState([])

  useEffect(() => {
    try {
      const c = document.cookie.split(';').find(x => x.trim().startsWith('algograss_user='))
      if (c) {
        const u = JSON.parse(atob(c.split('=')[1]))
        setUser(u)
        loadStats(u.email)
      } else setLoading(false)
    } catch { setLoading(false) }
  }, [])

  async function loadStats(email) {
    setLoading(true)
    try {
      const r = await fetch('/api/referral?email=' + encodeURIComponent(email))
      const d = await r.json()
      setStats(d)
    } catch {}
    setLoading(false)
  }

  const referralLink = user ? `${typeof window !== 'undefined' ? window.location.origin : 'https://algograss.co.uk'}/signup?ref=${btoa(user.email).replace(/=/g,'')}` : ''

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!user) return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>🔗</div>
        <h2 style={{color:S.text,marginBottom:8}}>Sign in to access referrals</h2>
        <a href="/login" style={{color:S.teal,textDecoration:'none'}}>Log in →</a>
      </div>
    </div>
  )

  return (
    <div style={{background:S.bg,minHeight:'100vh',paddingBottom:80}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(135deg,${S.bg},#0a1628)`,borderBottom:`1px solid ${S.border}`,padding:'52px 48px'}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <div style={{fontSize:13,color:S.teal,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:12}}>Referral Programme</div>
          <h1 style={{fontSize:40,fontWeight:800,color:S.text,margin:'0 0 12px',letterSpacing:-1}}>Earn free Pro for referring friends</h1>
          <p style={{color:S.muted,fontSize:16,maxWidth:520,marginBottom:32}}>Share AlgoGrass with a colleague. When they sign up, they get 30 days free Pro — and so do you. No limit on how many people you can refer.</p>

          {/* Stats */}
          <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:36}}>
            {[
              { label: 'Your Referrals', value: loading ? '…' : (stats?.referralCount ?? 0), color: S.teal },
              { label: 'Free Months Earned', value: loading ? '…' : (stats?.freeMonths ?? 0), color: S.blue },
              { label: 'Your Rank', value: loading ? '…' : `#${stats?.rank ?? '—'}`, color: S.amber },
            ].map(s => (
              <div key={s.label} style={{background:'rgba(255,255,255,0.04)',border:`1px solid ${S.border}`,borderRadius:14,padding:'18px 24px',minWidth:140}}>
                <div style={{fontSize:30,fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
                <div style={{fontSize:12,color:S.muted,marginTop:6}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Link box */}
          <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:16,padding:'20px 24px'}}>
            <div style={{fontSize:12,color:S.dim,textTransform:'uppercase',letterSpacing:'1px',marginBottom:10,fontWeight:700}}>Your referral link</div>
            <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <div style={{flex:1,background:S.bg,border:`1px solid ${S.border}`,borderRadius:10,padding:'10px 14px',fontFamily:'monospace',fontSize:13,color:S.muted,wordBreak:'break-all',minWidth:0}}>
                {referralLink}
              </div>
              <button onClick={copyLink} style={{
                padding:'10px 20px',background:copied?'rgba(0,212,170,0.15)':'linear-gradient(135deg,#00D4AA,#00A882)',
                color:copied?S.teal:'#06111E',border:copied?`1px solid ${S.teal}`:'none',
                borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:14,transition:'all .2s',flexShrink:0
              }}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:800,margin:'0 auto',padding:'40px 48px 0'}}>

        {/* How it works */}
        <h2 style={{fontSize:20,fontWeight:800,color:S.text,marginBottom:20}}>How it works</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:48}}>
          {[
            { step:'1', icon:'🔗', title:'Share your link', desc:'Send your unique referral link to any business that needs GDPR compliance tools.' },
            { step:'2', icon:'✍️', title:'They sign up', desc:'When they create an AlgoGrass account using your link, you\'re automatically credited.' },
            { step:'3', icon:'🎁', title:'Both get free Pro', desc:'They get 30 days free Pro. You get 30 days free Pro added to your account. No limit.' },
          ].map(s => (
            <div key={s.step} style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:'24px 20px',textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:12}}>{s.icon}</div>
              <div style={{fontSize:13,fontWeight:800,color:S.text,marginBottom:6}}>{s.title}</div>
              <div style={{fontSize:12,color:S.muted,lineHeight:1.6}}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Recent referrals */}
        <h2 style={{fontSize:20,fontWeight:800,color:S.text,marginBottom:16}}>Your referral history</h2>
        {loading ? (
          <div style={{color:S.muted,padding:'32px 0',textAlign:'center'}}>Loading…</div>
        ) : (stats?.referrals?.length ?? 0) === 0 ? (
          <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:'32px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>📭</div>
            <div style={{color:S.text,fontWeight:700,marginBottom:6}}>No referrals yet</div>
            <div style={{color:S.muted,fontSize:13,marginBottom:20}}>Share your link with business owners who have a website. When they sign up, they'll appear here.</div>
            <button onClick={copyLink} style={{
              padding:'10px 24px',background:'linear-gradient(135deg,#00D4AA,#00A882)',
              color:'#06111E',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:14
            }}>
              Copy your referral link
            </button>
          </div>
        ) : (
          <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,overflow:'hidden'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',padding:'12px 20px',borderBottom:`1px solid ${S.border}`,fontSize:11,color:S.dim,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px'}}>
              <span>User</span><span>Signed up</span><span>Reward</span>
            </div>
            {stats.referrals.map((r,i) => (
              <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',padding:'14px 20px',borderBottom:i<stats.referrals.length-1?`1px solid ${S.border}`:'none',alignItems:'center'}}>
                <span style={{fontSize:13,color:S.text,fontWeight:600}}>{r.email.split('@')[0].slice(0,3) + '***@' + r.email.split('@')[1]}</span>
                <span style={{fontSize:12,color:S.muted}}>{new Date(r.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                <span style={{fontSize:12,background:'rgba(0,212,170,0.1)',color:S.teal,padding:'3px 10px',borderRadius:20,fontWeight:700}}>+30 days</span>
              </div>
            ))}
          </div>
        )}

        {/* Share buttons */}
        <div style={{marginTop:40,background:S.surface,border:`1px solid ${S.border}`,borderRadius:16,padding:'24px 28px'}}>
          <div style={{fontSize:14,fontWeight:700,color:S.text,marginBottom:14}}>Share via</div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {[
              { label:'LinkedIn', color:'#0A66C2', icon:'in', href:`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}` },
              { label:'Twitter / X', color:'#1DA1F2', icon:'𝕏', href:`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check your website\'s GDPR compliance for free with AlgoGrass — instant AI-powered scan:')}&url=${encodeURIComponent(referralLink)}` },
              { label:'WhatsApp', color:'#25D366', icon:'💬', href:`https://wa.me/?text=${encodeURIComponent('Quick check — is your website GDPR compliant? Try AlgoGrass for free: ' + referralLink)}` },
              { label:'Email', color:S.muted, icon:'✉️', href:`mailto:?subject=Free GDPR compliance check for your website&body=Hi, I've been using AlgoGrass to check my website's GDPR compliance and thought you might find it useful. You can scan your site for free here: ${referralLink}` },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{
                display:'inline-flex',alignItems:'center',gap:8,padding:'9px 18px',
                background:'rgba(255,255,255,0.04)',border:`1px solid ${S.border}`,
                borderRadius:10,textDecoration:'none',color:S.text,fontSize:13,fontWeight:600,
                transition:'all .15s'
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color;e.currentTarget.style.color=s.color}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=S.border;e.currentTarget.style.color=S.text}}>
                <span style={{fontSize:15}}>{s.icon}</span> {s.label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
