'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getUser() {
  try { const c=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('algograss_user=')); return c?JSON.parse(atob(c.split('=')[1])):null } catch { return null }
}
function fmt(d){if(!d)return'—';try{return new Date(d).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch{return'—'}}

const TOOL_COLOR={scan:'#00D4AA',auth:'#818CF8',complaint:'#F59E0B',dsar:'#EC4899',dpia:'#3B82F6','vendor-risk':'#10B981',grc:'#8B5CF6','ai-governance':'#F97316'}

export default function DeveloperPage() {
  const router=useRouter()
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [tab,setTab]=useState('overview')
  const [refresh,setRefresh]=useState(0)

  useEffect(()=>{
    const u=getUser()
    if(!u||u.email!=='gaudpinky10@gmail.com'){router.push('/login');return}
    setLoading(true)
    fetch('/api/admin/developer').then(r=>r.json()).then(d=>{setData(d);setLoading(false)}).catch(()=>setLoading(false))
  },[refresh])

  if(loading) return <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink2)'}}>Loading system data…</div>

  const {dbConnected,collections,errors,recent,envStatus,byHour,serverTime}=data||{}

  const Dot=({ok})=><span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:ok?'#22C55E':'#EF4444',marginRight:6}}/>

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <section style={{background:'var(--bg2)',padding:'28px 0 0',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
            <div>
              <span style={{fontSize:11,fontWeight:700,color:'#818CF8',textTransform:'uppercase',letterSpacing:'.08em'}}>Developer Dashboard</span>
              <h1 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,color:'var(--ink)',marginTop:4}}>System Health</h1>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:11,color:'var(--ink2)'}}>Server: {serverTime?new Date(serverTime).toLocaleTimeString('en-GB'):'-'}</span>
              <button onClick={()=>setRefresh(r=>r+1)} style={{fontSize:12,color:'var(--accent)',padding:'6px 14px',border:'1px solid rgba(0,212,170,0.3)',borderRadius:8,background:'transparent',cursor:'pointer'}}>↻ Refresh</button>
              <a href="/admin" style={{fontSize:12,color:'var(--ink2)',padding:'6px 14px',border:'1px solid var(--border)',borderRadius:8,textDecoration:'none'}}>← Back</a>
            </div>
          </div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {['overview','logs','errors','collections'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{fontSize:12,fontWeight:600,padding:'7px 16px',borderRadius:'8px 8px 0 0',border:'none',background:tab===t?'var(--bg)':'transparent',color:tab===t?'#818CF8':'var(--ink2)',cursor:'pointer',borderBottom:tab===t?'2px solid #818CF8':'2px solid transparent'}}>
                {t.charAt(0).toUpperCase()+t.slice(1)} {t==='errors'&&errors?.length?<span style={{background:'rgba(239,68,68,0.2)',color:'#EF4444',borderRadius:10,padding:'0 6px',fontSize:10,marginLeft:4}}>{errors.length}</span>:null}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'28px 0 80px'}}>
        <div className="wrap">

          {tab==='overview'&&(
            <>
              {/* Status cards */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
                <div style={{background:'var(--bg2)',border:`1px solid ${dbConnected?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`,borderRadius:14,padding:'20px 22px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:10}}>Database</div>
                  <div style={{display:'flex',alignItems:'center',fontSize:14,fontWeight:600,color:dbConnected?'#22C55E':'#EF4444'}}>
                    <Dot ok={dbConnected}/>{dbConnected?'MongoDB Connected':'MongoDB Disconnected'}
                  </div>
                  {!dbConnected&&<p style={{fontSize:11,color:'#EF4444',marginTop:6}}>Add MONGODB_URI to Vercel env vars</p>}
                </div>

                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:10}}>Recent errors (24h)</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color:errors?.length?'#EF4444':'#22C55E'}}>{errors?.length||0}</div>
                  <div style={{fontSize:11,color:'var(--ink2)'}}>{errors?.length?'Check Errors tab':'No errors detected'}</div>
                </div>

                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:10}}>API calls (24h)</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color:'var(--accent)'}}>{Object.values(byHour||{}).reduce((a,b)=>a+b,0)}</div>
                  <div style={{fontSize:11,color:'var(--ink2)'}}>Across all endpoints</div>
                </div>
              </div>

              {/* Env vars */}
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px',marginBottom:20}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:14,textTransform:'uppercase',letterSpacing:'.06em'}}>Environment Variables</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                  {Object.entries(envStatus||{}).map(([key,val])=>(
                    <div key={key} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'rgba(255,255,255,0.03)',borderRadius:8,border:'1px solid var(--border)'}}>
                      {key==='NODE_ENV'?<span style={{fontSize:11,color:'var(--accent)',fontWeight:600}}>{key}</span>:<><Dot ok={!!val}/><span style={{fontSize:12,color:'var(--ink)',fontWeight:500}}>{key}</span></>}
                      <span style={{marginLeft:'auto',fontSize:11,color:key==='NODE_ENV'?'#818CF8':val?'#22C55E':'#EF4444',fontWeight:600}}>{key==='NODE_ENV'?val:val?'✓ Set':'✗ Missing'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* API calls per hour chart */}
              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:14,textTransform:'uppercase',letterSpacing:'.06em'}}>API activity by hour (last 24h)</h3>
                <div style={{display:'flex',alignItems:'flex-end',gap:3,height:70}}>
                  {Array.from({length:24},(_,i)=>{
                    const count=byHour?.[i]||0
                    const max=Math.max(...Object.values(byHour||{0:1}),1)
                    return(
                      <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
                        <div title={`${i}:00 — ${count} calls`} style={{width:'100%',background:'#818CF8',borderRadius:'2px 2px 0 0',height:`${Math.round(count/max*56)+2}px`,minHeight:2,opacity:count?0.85:0.15}}/>
                        <span style={{fontSize:8,color:'var(--ink2)'}}>{i}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {tab==='logs'&&(
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:14,textTransform:'uppercase',letterSpacing:'.06em'}}>Recent API calls (last 100)</h3>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'monospace'}}>
                  <thead><tr>{['Time','User','Tool','Action','Detail'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:10,fontWeight:700,color:'var(--ink2)',textTransform:'uppercase',borderBottom:'1px solid var(--border)'}}>{h}</th>)}</tr></thead>
                  <tbody>{(recent||[]).map((a,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
                      <td style={{padding:'7px 12px',color:'var(--ink2)',whiteSpace:'nowrap',fontSize:11}}>{fmt(a.createdAt)}</td>
                      <td style={{padding:'7px 12px',color:'var(--accent)',fontSize:11}}>{a.userEmail}</td>
                      <td style={{padding:'7px 12px'}}><span style={{fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:20,background:(TOOL_COLOR[a.tool]||'#888')+'18',color:TOOL_COLOR[a.tool]||'#888'}}>{a.tool}</span></td>
                      <td style={{padding:'7px 12px',color:'var(--ink)',fontSize:11}}>{a.action?.replace(/_/g,' ')}</td>
                      <td style={{padding:'7px 12px',color:'var(--ink2)',fontSize:10,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.detail||'—'}</td>
                    </tr>
                  ))}
                  {!recent?.length&&<tr><td colSpan={5} style={{padding:'30px',textAlign:'center',color:'var(--ink2)'}}>No logs yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab==='errors'&&(
            <div>
              {!errors?.length?(
                <div style={{textAlign:'center',padding:'60px 0',color:'var(--ink2)'}}>
                  <div style={{fontSize:40,marginBottom:12}}>✅</div>
                  <p style={{fontSize:15,color:'var(--ink)',fontWeight:600}}>No errors in the last 24 hours</p>
                </div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {errors.map((e,i)=>(
                    <div key={i} style={{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:10,padding:'14px 18px'}}>
                      <div style={{display:'flex',gap:12,alignItems:'flex-start',flexWrap:'wrap'}}>
                        <span style={{fontSize:11,color:'#EF4444',fontWeight:700,whiteSpace:'nowrap'}}>{fmt(e.createdAt)}</span>
                        <span style={{fontSize:12,color:'var(--ink)',fontWeight:600,flex:1}}>{e.action?.replace(/_/g,' ')} — {e.detail||e.userEmail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab==='collections'&&(
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {(collections||[]).map(c=>(
                <div key={c.name} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'18px 20px'}}>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:800,color:'var(--accent)',marginBottom:6}}>{c.count}</div>
                  <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:2}}>{c.name}</div>
                  <div style={{fontSize:11,color:'var(--ink2)'}}>documents</div>
                </div>
              ))}
              {!collections?.length&&<div style={{gridColumn:'1/-1',textAlign:'center',padding:'40px',color:'var(--ink2)'}}>{dbConnected?'No collections yet':'MongoDB not connected'}</div>}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
