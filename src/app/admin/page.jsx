'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

function getUser() {
  try {
    const c = document.cookie.split(';').map(x => x.trim()).find(x => x.startsWith('algograss_user='))
    return c ? JSON.parse(atob(c.split('=')[1])) : null
  } catch { return null }
}

const TABS = [
  { id:'overview',   label:'Overview',   icon:'📊' },
  { id:'activities', label:'Activities', icon:'📋' },
  { id:'users',      label:'Users',      icon:'👥' },
  { id:'scans',      label:'Scans',      icon:'🔍' },
  { id:'complaints', label:'Complaints', icon:'📨' },
  { id:'dsars',      label:'DSARs',      icon:'📁' },
  { id:'dpias',      label:'DPIAs',      icon:'📊' },
  { id:'vendors',    label:'Vendors',    icon:'🏢' },
]
const TOOL_COLOR = { scan:'#00D4AA',auth:'#818CF8',complaint:'#F59E0B',dsar:'#EC4899',dpia:'#3B82F6','vendor-risk':'#10B981',grc:'#8B5CF6','ai-governance':'#F97316' }

function Badge({ text, color }) {
  return <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:color+'18',color,border:`1px solid ${color}40`}}>{text}</span>
}
function StatCard({ label, value, sub, color='var(--accent)' }) {
  return (
    <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
      <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color,marginBottom:4}}>{value}</div>
      <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:2}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:'var(--ink2)'}}>{sub}</div>}
    </div>
  )
}
function Table({ cols, rows, empty='No data yet' }) {
  if (!rows.length) return <div style={{textAlign:'center',padding:'40px 0',color:'var(--ink2)',fontSize:13}}>{empty}</div>
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr>{cols.map(c=><th key={c.key} style={{padding:'10px 14px',textAlign:'left',fontSize:10,fontWeight:700,color:'var(--ink2)',textTransform:'uppercase',letterSpacing:'.06em',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>{c.label}</th>)}</tr></thead>
        <tbody>{rows.map((row,i)=><tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>{cols.map(c=><td key={c.key} style={{padding:'10px 14px',color:'var(--ink2)',verticalAlign:'top',maxWidth:c.maxWidth||'none'}}>{c.render?c.render(row):String(row[c.key]??'—')}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}
function fmt(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) } catch { return '—' }
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser]       = useState(null)
  const [tab, setTab]         = useState('overview')
  const [data, setData]       = useState({})
  const [totals, setTotals]   = useState({})
  const [loading, setLoading] = useState(false)
  const [noDb, setNoDb]       = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u || !u.isAdmin) { router.push('/login'); return }
    setUser(u)
  }, [])

  const load = useCallback(async (resource) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin?resource=${resource}&limit=200`)
      const json = await res.json()
      if (json.noDb) setNoDb(true)
      setData(prev  => ({ ...prev,   [resource]: json.data  || [] }))
      setTotals(prev => ({ ...prev,  [resource]: json.total || 0  }))
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user) return
    ;['activities','users','scans','complaints','dsars','dpias','vendors'].forEach(r => load(r))
  }, [user])

  useEffect(() => {
    if (user && tab !== 'overview' && !data[tab]) load(tab)
  }, [tab, user])

  const activities = data.activities || []
  const users      = data.users      || []
  const scans      = data.scans      || []
  const complaints = data.complaints || []
  const dsars      = data.dsars      || []
  const dpias      = data.dpias      || []
  const vendors    = data.vendors    || []

  const today    = new Date(); today.setHours(0,0,0,0)
  const todayActs = activities.filter(a => new Date(a.createdAt) >= today).length
  const toolCounts = activities.reduce((acc,a) => { acc[a.tool]=(acc[a.tool]||0)+1; return acc }, {})
  const avgScore   = scans.length ? Math.round(scans.reduce((s,sc)=>s+(sc.score||0),0)/scans.length) : 0
  const highRisk   = vendors.filter(v=>v.level==='High').length
  const noDpa      = vendors.filter(v=>v.dpaSigned!=='Yes').length

  if (!user) return <div style={{padding:80,textAlign:'center',color:'var(--ink2)'}}>Checking access…</div>

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <section style={{background:'var(--bg2)',padding:'32px 0 24px',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div>
              <span style={{fontSize:11,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.08em'}}>Admin</span>
              <h1 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,color:'var(--ink)',marginTop:4}}>AlgoGrass Dashboard</h1>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              {noDb&&<span style={{fontSize:11,background:'rgba(239,68,68,0.1)',color:'#EF4444',padding:'5px 12px',borderRadius:20,border:'1px solid rgba(239,68,68,0.3)'}}>⚠ MongoDB not connected</span>}
              <span style={{fontSize:12,color:'var(--ink2)'}}>{user.email}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:4,marginTop:20,flexWrap:'wrap'}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{fontSize:12,fontWeight:600,padding:'7px 14px',borderRadius:8,border:'none',background:tab===t.id?'rgba(0,212,170,0.15)':'transparent',color:tab===t.id?'var(--accent)':'var(--ink2)',cursor:'pointer'}}>
                {t.icon} {t.label}{totals[t.id]?' ('+totals[t.id]+')':''}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'28px 0 80px'}}>
        <div className="wrap">
          {noDb&&(
            <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:12,padding:'16px 20px',marginBottom:24}}>
              <p style={{fontWeight:700,color:'#EF4444',marginBottom:6,fontSize:14}}>⚠ MongoDB not connected — data is not being saved</p>
              <p style={{color:'var(--ink2)',fontSize:13,margin:0}}>Add <strong>MONGODB_URI</strong> to Vercel → Settings → Environment Variables → Redeploy. Get the URI from MongoDB Atlas → Connect → Drivers.</p>
            </div>
          )}

          {tab==='overview'&&(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
                <StatCard label="Total users"      value={totals.users||0}      color="#818CF8"/>
                <StatCard label="Website scans"    value={totals.scans||0}      color="var(--accent)" sub={`Avg score: ${avgScore}/100`}/>
                <StatCard label="Activities today" value={todayActs}            color="#F59E0B"/>
                <StatCard label="Total activities" value={totals.activities||0} color="var(--ink)"/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28}}>
                <StatCard label="Complaints"      value={totals.complaints||0} color="#F59E0B"/>
                <StatCard label="DSARs"           value={totals.dsars||0}      color="#EC4899"/>
                <StatCard label="DPIAs"           value={totals.dpias||0}      color="#3B82F6"/>
                <StatCard label="Vendors tracked" value={totals.vendors||0}    color="#10B981" sub={`${highRisk} high risk · ${noDpa} missing DPA`}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Tool Usage</h3>
                  {Object.entries(toolCounts).sort((a,b)=>b[1]-a[1]).map(([tool,count])=>(
                    <div key={tool} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                      <span style={{fontSize:12,color:'var(--ink)',minWidth:110}}>{tool}</span>
                      <div style={{flex:1,height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${Math.round(count/activities.length*100)}%`,background:TOOL_COLOR[tool]||'var(--accent)',borderRadius:3}}/>
                      </div>
                      <span style={{fontSize:11,color:'var(--ink2)',minWidth:24,textAlign:'right'}}>{count}</span>
                    </div>
                  ))}
                  {!activities.length&&<p style={{fontSize:13,color:'var(--ink2)'}}>No activity yet</p>}
                </div>
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Recent Activity</h3>
                  {activities.slice(0,8).map((a,i)=>(
                    <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:10}}>
                      <div style={{width:28,height:28,borderRadius:7,background:(TOOL_COLOR[a.tool]||'#888')+'18',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>
                        {a.tool==='scan'?'🔍':a.tool==='auth'?'🔑':a.tool==='dsar'?'📁':a.tool==='complaint'?'📨':a.tool==='dpia'?'📊':a.tool==='vendor-risk'?'🏢':'⚡'}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,color:'var(--ink)',fontWeight:500}}>{a.action.replace(/_/g,' ')}</div>
                        <div style={{fontSize:11,color:'var(--ink2)'}}>{a.userEmail} · {fmt(a.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                  {!activities.length&&<p style={{fontSize:13,color:'var(--ink2)'}}>No activity yet</p>}
                </div>
              </div>
            </>
          )}

          {tab==='activities'&&<Table cols={[
            {key:'userEmail', label:'User',   render:r=><span style={{color:'var(--accent)',fontSize:11}}>{r.userEmail}</span>},
            {key:'tool',      label:'Tool',   render:r=><Badge text={r.tool} color={TOOL_COLOR[r.tool]||'#888'}/>},
            {key:'action',    label:'Action', render:r=><span style={{color:'var(--ink)'}}>{r.action.replace(/_/g,' ')}</span>},
            {key:'detail',    label:'Detail', maxWidth:'240px', render:r=><span style={{wordBreak:'break-all',fontSize:11}}>{r.detail||'—'}</span>},
            {key:'createdAt', label:'Time',   render:r=>fmt(r.createdAt)},
          ]} rows={activities} empty="No activities yet. Activities are logged when users use tools."/>}

          {tab==='users'&&<Table cols={[
            {key:'name',      label:'Name',    render:r=><span style={{color:'var(--ink)',fontWeight:600}}>{r.name}</span>},
            {key:'email',     label:'Email',   render:r=><span style={{color:'var(--accent)',fontSize:11}}>{r.email}</span>},
            {key:'plan',      label:'Plan',    render:r=><Badge text={r.plan||'free'} color={r.plan==='agency'?'#F59E0B':r.plan==='growth'?'#818CF8':'#888'}/>},
            {key:'website',   label:'Website', render:r=>r.website?<a href={r.website} target="_blank" rel="noreferrer" style={{color:'var(--accent)',fontSize:11}}>{r.website}</a>:'—'},
            {key:'isAdmin',   label:'Admin',   render:r=>r.isAdmin?'✅':'—'},
            {key:'createdAt', label:'Joined',  render:r=>fmt(r.createdAt)},
          ]} rows={users} empty="No users yet."/>}

          {tab==='scans'&&<Table cols={[
            {key:'userEmail', label:'User',     render:r=><span style={{color:'var(--accent)',fontSize:11}}>{r.userEmail}</span>},
            {key:'url',       label:'URL',      maxWidth:'220px', render:r=><span style={{fontSize:11,wordBreak:'break-all'}}>{r.url}</span>},
            {key:'score',     label:'Score',    render:r=>{const c=r.score>=70?'var(--accent)':r.score>=40?'#F59E0B':'#EF4444';return <span style={{fontWeight:700,color:c}}>{r.score}/100</span>}},
            {key:'issues',    label:'Issues',   render:r=>{const h=(r.issues||[]).filter(i=>i.sev==='High').length;const m=(r.issues||[]).filter(i=>i.sev==='Medium').length;return <span style={{fontSize:11}}>{h>0&&<span style={{color:'#EF4444',marginRight:6}}>⬤ {h} High</span>}{m>0&&<span style={{color:'#F59E0B'}}>⬤ {m} Med</span>}</span>}},
            {key:'trackers',  label:'Trackers', render:r=><span style={{fontSize:11}}>{(r.trackers||[]).join(', ')||'—'}</span>},
            {key:'scannedAt', label:'Date',     render:r=>fmt(r.scannedAt||r.createdAt)},
          ]} rows={scans} empty="No scans yet."/>}

          {tab==='complaints'&&<Table cols={[
            {key:'userEmail', label:'User',     render:r=><span style={{color:'var(--accent)',fontSize:11}}>{r.userEmail}</span>},
            {key:'category',  label:'Category', render:r=><Badge text={r.category||'Unknown'} color="#F59E0B"/>},
            {key:'urgency',   label:'Urgency',  render:r=><Badge text={r.urgency||'—'} color={r.urgency==='High'?'#EF4444':r.urgency==='Medium'?'#F59E0B':'var(--accent)'}/>},
            {key:'channel',   label:'Channel',  render:r=>r.channel||'—'},
            {key:'summary',   label:'Summary',  maxWidth:'200px', render:r=><span style={{fontSize:11}}>{r.summary||'—'}</span>},
            {key:'createdAt', label:'Date',     render:r=>fmt(r.createdAt)},
          ]} rows={complaints} empty="No complaints yet."/>}

          {tab==='dsars'&&<Table cols={[
            {key:'userEmail',      label:'User',      render:r=><span style={{color:'var(--accent)',fontSize:11}}>{r.userEmail}</span>},
            {key:'requesterName',  label:'Requester', render:r=><span style={{color:'var(--ink)'}}>{r.requesterName||'—'}</span>},
            {key:'requestType',    label:'Type',      render:r=><Badge text={r.requestType||'SAR'} color="#EC4899"/>},
            {key:'requesterEmail', label:'Email',     render:r=><span style={{fontSize:11}}>{r.requesterEmail||'—'}</span>},
            {key:'deadline',       label:'Deadline',  render:r=>{const d=r.deadline?new Date(r.deadline):null;const ov=d&&d<new Date();return <span style={{color:ov?'#EF4444':'var(--ink2)'}}>{d?d.toLocaleDateString('en-GB'):'—'}</span>}},
            {key:'createdAt',      label:'Received',  render:r=>fmt(r.createdAt)},
          ]} rows={dsars} empty="No DSARs yet."/>}

          {tab==='dpias'&&<Table cols={[
            {key:'userEmail',    label:'User',       render:r=><span style={{color:'var(--accent)',fontSize:11}}>{r.userEmail}</span>},
            {key:'businessName', label:'Business',   render:r=><span style={{color:'var(--ink)'}}>{r.businessName||'—'}</span>},
            {key:'project',      label:'Project',    maxWidth:'180px', render:r=><span style={{fontSize:11}}>{r.project||'—'}</span>},
            {key:'legalBasis',   label:'Legal Basis',render:r=><Badge text={r.legalBasis||'—'} color="#3B82F6"/>},
            {key:'status',       label:'Status',     render:r=><Badge text={r.status||'submitted'} color="var(--accent)"/>},
            {key:'createdAt',    label:'Date',       render:r=>fmt(r.createdAt)},
          ]} rows={dpias} empty="No DPIAs yet."/>}

          {tab==='vendors'&&<Table cols={[
            {key:'userEmail', label:'User',   render:r=><span style={{color:'var(--accent)',fontSize:11}}>{r.userEmail}</span>},
            {key:'name',      label:'Vendor', render:r=><span style={{color:'var(--ink)',fontWeight:600}}>{r.name}</span>},
            {key:'type',      label:'Type',   render:r=>r.type||'—'},
            {key:'level',     label:'Risk',   render:r=><Badge text={r.level||'—'} color={r.level==='High'?'#EF4444':r.level==='Medium'?'#F59E0B':'var(--accent)'}/>},
            {key:'dpaSigned', label:'DPA',    render:r=><span style={{color:r.dpaSigned==='Yes'?'var(--accent)':'#EF4444'}}>{r.dpaSigned==='Yes'?'✓ Signed':'✗ Missing'}</span>},
            {key:'createdAt', label:'Added',  render:r=>fmt(r.createdAt)},
          ]} rows={vendors} empty="No vendors yet."/>}

          {loading&&<div style={{textAlign:'center',padding:'40px 0',color:'var(--ink2)',fontSize:13}}>Loading…</div>}
        </div>
      </section>
    </div>
  )
}
