'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const S = {
  bg:'#06060F', surface:'#0D0D1E', border:'rgba(255,255,255,0.09)',
  teal:'#9B7BFA', blue:'#C084FC', text:'#0F172A',
  muted:'#94A3B8', dim:'#475569',
}

const FLAG = c => c ? `https://flagcdn.com/16x12/${c.toLowerCase()}.png` : null


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(cookie.split('=')[1]))
  } catch { return null }
}
export default function VisitorsDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [filter,  setFilter]  = useState({ device:'', country:'', page:'' })
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
    if (!u.isAdmin && u.role !== 'founder' && u.role !== 'developer') { router.push('/dashboard'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const PER = 50

  useEffect(() => { load() }, [page, filter])

  async function load() {
    setLoading(true)
    const q = new URLSearchParams({ page, ...filter }).toString()
    const r = await fetch('/api/admin/visitors?' + q)
    const d = await r.json()
    setData(d)
    setLoading(false)
  }

  if (!data && loading) return (
    <div style={{minHeight:'80vh',display:'flex',alignItems:'center',justifyContent:'center',background:S.bg}}>
      <div style={{textAlign:'center',color:S.muted}}>Loading visitor data…</div>
    </div>
  )

  const v = data || {}

  return (
    <div style={{background:S.bg,minHeight:'100vh',paddingBottom:80,fontFamily:'var(--f-head,sans-serif)'}}>

      {/* Header */}
      <div style={{background:S.surface,borderBottom:`1px solid ${S.border}`,padding:'28px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
        <div>
          <div style={{fontSize:11,color:S.teal,fontWeight:700,textTransform:'uppercase',letterSpacing:'1.5px',marginBottom:4}}>Admin · Analytics</div>
          <h1 style={{fontSize:28,fontWeight:800,color:S.text,margin:0}}>Visitor Intelligence</h1>
          <p style={{color:S.muted,fontSize:13,margin:'4px 0 0'}}>Every visitor, every page, every device — in real time</p>
        </div>
        <button onClick={load} style={{padding:'10px 20px',background:'rgba(139,92,246,0.1)',border:`1px solid ${S.teal}`,borderRadius:10,color:S.teal,fontWeight:700,cursor:'pointer',fontSize:13}}>
          ↻ Refresh
        </button>
      </div>

      <div style={{maxWidth:1200,margin:'0 auto',padding:'32px 48px 0'}}>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:14,marginBottom:28}}>
          {[
            { label:'Total Visits',      value: v.totalVisits ?? 0,    color: S.teal },
            { label:'Unique Visitors',   value: v.uniqueVisitors ?? 0, color: S.blue },
            { label:'Today',             value: v.today ?? 0,          color:'#F59E0B' },
            { label:'This Week',         value: v.thisWeek ?? 0,       color:'#A78BFA' },
            { label:'Top Page',          value: v.topPage ?? '—',      color: S.teal, small:true },
          ].map(s => (
            <div key={s.label} style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:'18px 20px'}}>
              <div style={{fontSize: s.small ? 14 : 28, fontWeight:800, color:s.color, fontFamily: s.small ? 'inherit' : 'var(--f-num,sans-serif)', lineHeight:1.2, marginBottom:6, wordBreak:'break-all'}}>{s.value}</div>
              <div style={{fontSize:11,color:S.muted,textTransform:'uppercase',letterSpacing:'1px',fontWeight:600}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top breakdown row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14,marginBottom:28}}>

          {/* Top pages */}
          <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:'20px'}}>
            <div style={{fontSize:12,fontWeight:700,color:S.text,marginBottom:14,textTransform:'uppercase',letterSpacing:'1px'}}>Top Pages</div>
            {(v.topPages || []).map((p,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{fontSize:11,color:S.dim,width:16,textAlign:'right',flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,background:'#06060F',borderRadius:6,overflow:'hidden',height:6}}>
                  <div style={{height:6,borderRadius:6,background:`linear-gradient(90deg,${S.teal},${S.blue})`,width:`${(p.count/(v.topPages[0]?.count||1)*100)}%`,transition:'width .4s'}}/>
                </div>
                <div style={{fontSize:12,color:S.muted,width:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'right'}} title={p._id}>{p._id}</div>
                <div style={{fontSize:12,color:S.teal,fontWeight:700,width:32,textAlign:'right',fontFamily:'var(--f-num)'}}>{p.count}</div>
              </div>
            ))}
          </div>

          {/* Countries */}
          <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:'20px'}}>
            <div style={{fontSize:12,fontWeight:700,color:S.text,marginBottom:14,textTransform:'uppercase',letterSpacing:'1px'}}>Countries</div>
            {(v.countries || []).map((c,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                {FLAG(c._id) && <img src={FLAG(c._id)} alt={c._id} width={16} height={12} style={{borderRadius:2}}/>}
                <div style={{flex:1,fontSize:12,color:S.muted}}>{c._id || 'Unknown'}</div>
                <div style={{fontSize:12,color:S.teal,fontWeight:700,fontFamily:'var(--f-num)'}}>{c.count}</div>
              </div>
            ))}
          </div>

          {/* Devices + Browsers */}
          <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:'20px'}}>
            <div style={{fontSize:12,fontWeight:700,color:S.text,marginBottom:14,textTransform:'uppercase',letterSpacing:'1px'}}>Device / Browser</div>
            {(v.devices || []).map((d,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <span style={{fontSize:14}}>{d._id === 'mobile' ? '📱' : d._id === 'tablet' ? '💻' : '🖥️'}</span>
                <div style={{flex:1,fontSize:12,color:S.muted,textTransform:'capitalize'}}>{d._id}</div>
                <div style={{fontSize:12,color:S.blue,fontWeight:700,fontFamily:'var(--f-num)'}}>{d.count}</div>
              </div>
            ))}
            <div style={{height:1,background:S.border,margin:'12px 0'}}/>
            {(v.browsers || []).slice(0,4).map((b,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{flex:1,fontSize:12,color:S.muted}}>{b._id}</div>
                <div style={{fontSize:12,color:S.muted,fontWeight:700,fontFamily:'var(--f-num)'}}>{b.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
          <span style={{fontSize:12,color:S.dim,fontWeight:600}}>Filter:</span>
          {['device','country'].map(f => (
            <input key={f} placeholder={f.charAt(0).toUpperCase()+f.slice(1)} value={filter[f]}
              onChange={e => { setFilter(p=>({...p,[f]:e.target.value})); setPage(1) }}
              style={{background:'#06060F',border:`1px solid ${S.border}`,borderRadius:8,padding:'7px 12px',color:S.text,fontSize:12,outline:'none',width:130}} />
          ))}
          <input placeholder="Page path" value={filter.page}
            onChange={e => { setFilter(p=>({...p,page:e.target.value})); setPage(1) }}
            style={{background:'#06060F',border:`1px solid ${S.border}`,borderRadius:8,padding:'7px 12px',color:S.text,fontSize:12,outline:'none',width:160}} />
          {(filter.device||filter.country||filter.page) && (
            <button onClick={() => { setFilter({device:'',country:'',page:''}); setPage(1) }} style={{padding:'7px 14px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,color:'#EF4444',fontSize:12,cursor:'pointer',fontWeight:600}}>
              Clear ×
            </button>
          )}
          <span style={{marginLeft:'auto',fontSize:12,color:S.dim}}>{loading ? 'Loading…' : `${v.totalFiltered ?? v.totalVisits ?? 0} records`}</span>
        </div>

        {/* Visitors table */}
        <div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'140px 1fr 120px 80px 80px 100px 120px',padding:'10px 16px',borderBottom:`1px solid ${S.border}`,fontSize:10,color:S.dim,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',gap:8}}>
            <span>Time</span><span>Page</span><span>Referrer</span><span>Country</span><span>Device</span><span>Browser</span><span>Visitor ID</span>
          </div>
          {loading ? (
            <div style={{padding:'32px',textAlign:'center',color:S.muted,fontSize:13}}>Loading…</div>
          ) : (v.visits || []).length === 0 ? (
            <div style={{padding:'48px',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:12}}>👁️</div>
              <div style={{color:S.text,fontWeight:700,marginBottom:6}}>No visits yet</div>
              <div style={{color:S.muted,fontSize:13}}>Visitors will appear here as soon as someone lands on your site</div>
            </div>
          ) : (v.visits || []).map((v,i) => (
            <div key={i} style={{display:'grid',gridTemplateColumns:'140px 1fr 120px 80px 80px 100px 120px',padding:'10px 16px',borderBottom:i<(data?.visits?.length||0)-1?`1px solid rgba(30,45,69,0.5)`:'none',gap:8,alignItems:'center',fontSize:12,transition:'background .15s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(15,23,42,0.02)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{color:S.dim,fontSize:11}}>{new Date(v.ts).toLocaleString('en-GB',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
              <span style={{color:S.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={v.page}>{v.page}</span>
              <span style={{color:S.dim,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:11}} title={v.referrer}>{v.referrer ? new URL('http://x.com'+'/'+v.referrer.replace(/^https?:\/\//,'')).hostname.replace('www.','') : '—'}</span>
              <span style={{color:S.muted,fontSize:11,display:'flex',alignItems:'center',gap:4}}>
                {FLAG(v.country) && <img src={FLAG(v.country)} width={14} height={10} alt="" style={{borderRadius:1}}/>}
                {v.country || '—'}
              </span>
              <span style={{color:S.muted,fontSize:11}}>{v.device==='mobile'?'📱':v.device==='tablet'?'💻':'🖥️'} {v.device}</span>
              <span style={{color:S.muted,fontSize:11}}>{v.browser}</span>
              <span style={{color:S.dim,fontSize:10,fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={v.visitorId}>{(v.visitorId||'').slice(-8)}</span>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {(v.totalPages ?? 0) > 1 && (
          <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:20}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:'8px 16px',background:S.surface,border:`1px solid ${S.border}`,borderRadius:8,color:S.text,cursor:'pointer',fontSize:12,opacity:page===1?.4:1}}>← Prev</button>
            <span style={{padding:'8px 16px',color:S.muted,fontSize:12,display:'flex',alignItems:'center'}}>Page {page} of {v.totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(v.totalPages,p+1))} disabled={page===v.totalPages} style={{padding:'8px 16px',background:S.surface,border:`1px solid ${S.border}`,borderRadius:8,color:S.text,cursor:'pointer',fontSize:12,opacity:page===v.totalPages?.4:1}}>Next →</button>
          </div>
        )}

      </div>
    </div>
  )
}
