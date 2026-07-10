'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getUser() {
  try { const c=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('algograss_user=')); return c?JSON.parse(atob(c.split('=')[1])):null } catch { return null }
}
function fmt(d){if(!d)return'—';try{return new Date(d).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}catch{return'—'}}

const PLAN_COLOR={free:'#888',growth:'#818CF8',agency:'#F59E0B',enterprise:'#9B7BFA'}
const TOOL_COLOR={scan:'#9B7BFA',auth:'#818CF8',complaint:'#F59E0B',dsar:'#EC4899',dpia:'#3B82F6','vendor-risk':'#10B981',grc:'#8B5CF6','ai-governance':'#F97316'}
const TOOL_ICON={scan:'🔍',auth:'🔑',complaint:'📨',dsar:'📁',dpia:'📊','vendor-risk':'🏢',grc:'🏛','ai-governance':'🤖',reminders:'🔔','data-audit':'🗂'}

export default function CoFounderPage() {
  const router=useRouter()
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [tab,setTab]=useState('overview')

  useEffect(()=>{
    const u=getUser()
    if(!u||u.email!=='gaudpinky10@gmail.com'){router.push('/login');return}
    // Reuse founder API — same data, same access level
    fetch('/api/admin/founder').then(r=>r.json()).then(d=>{setData(d);setLoading(false)}).catch(()=>setLoading(false))
  },[])

  if(loading) return <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--ink2)'}}>Loading business data…</div>
  if(!data||data.error) return <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',color:'#EF4444'}}>{data?.error||'Failed to load'}</div>

  const {overview,signupsByDay,toolUsage,planBreakdown,topUsers,actsByDay,recentUsers}=data
  const totalToolUses=Object.values(toolUsage||{}).reduce((a,b)=>a+b,0)

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      <section style={{background:'var(--bg2)',padding:'28px 0 0',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
            <div>
              <span style={{fontSize:11,fontWeight:700,color:'#818CF8',textTransform:'uppercase',letterSpacing:'.08em'}}>Co-Founder Dashboard</span>
              <h1 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,color:'var(--ink)',marginTop:4}}>Business Overview</h1>
            </div>
            <div style={{display:'flex',gap:8}}>
              <a href="/admin" style={{fontSize:12,color:'var(--ink2)',padding:'6px 14px',border:'1px solid var(--border)',borderRadius:8,textDecoration:'none'}}>← Back</a>
              <a href="/admin/founder" style={{fontSize:12,color:'var(--ink2)',padding:'6px 14px',border:'1px solid var(--border)',borderRadius:8,textDecoration:'none'}}>Founder view</a>
              <a href="/admin/developer" style={{fontSize:12,color:'var(--ink2)',padding:'6px 14px',border:'1px solid var(--border)',borderRadius:8,textDecoration:'none'}}>Dev view</a>
            </div>
          </div>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {['overview','users','tools','activity'].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{fontSize:12,fontWeight:600,padding:'7px 16px',borderRadius:'8px 8px 0 0',border:'none',background:tab===t?'var(--bg)':'transparent',color:tab===t?'#818CF8':'var(--ink2)',cursor:'pointer',borderBottom:tab===t?'2px solid #818CF8':'2px solid transparent'}}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'28px 0 80px'}}>
        <div className="wrap">

          {tab==='overview'&&(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
                {[
                  {label:'Total users',    val:overview.totalUsers,      sub:`+${overview.usersMonth} this month`,  color:'#818CF8'},
                  {label:'New today',      val:overview.usersToday,      sub:`+${overview.usersWeek} this week`,    color:'var(--accent)'},
                  {label:'Total scans',    val:overview.totalScans,      sub:`Avg score: ${overview.avgScore}/100`, color:'#9B7BFA'},
                  {label:'Tool uses today',val:overview.activitiesToday, sub:`${overview.totalActivities} total`,   color:'#F59E0B'},
                ].map(k=>(
                  <div key={k.label} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                    <div style={{fontFamily:'Syne,sans-serif',fontSize:32,fontWeight:800,color:k.color,marginBottom:4}}>{k.val}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:2}}>{k.label}</div>
                    <div style={{fontSize:11,color:'var(--ink2)'}}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28}}>
                {[
                  {label:'Complaints',val:overview.totalComplaints,color:'#F59E0B'},
                  {label:'DSARs',     val:overview.totalDsars,     color:'#EC4899'},
                  {label:'DPIAs',     val:overview.totalDpias,     color:'#3B82F6'},
                  {label:'Vendors',   val:overview.totalVendors,   color:'#10B981'},
                ].map(k=>(
                  <div key={k.label} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 20px'}}>
                    <div style={{fontFamily:'Syne,sans-serif',fontSize:26,fontWeight:800,color:k.color,marginBottom:4}}>{k.val}</div>
                    <div style={{fontSize:12,color:'var(--ink2)'}}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Signups last 30 days</h3>
                  {Object.keys(signupsByDay||{}).length===0?<p style={{color:'var(--ink2)',fontSize:13}}>No signups yet</p>:(
                    <div style={{display:'flex',alignItems:'flex-end',gap:4,height:80}}>
                      {Object.entries(signupsByDay||{}).slice(-20).map(([d,c])=>{
                        const max=Math.max(...Object.values(signupsByDay||{1:1}))
                        return(
                          <div key={d} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                            <div title={`${d}: ${c} signups`} style={{width:'100%',background:'#818CF8',borderRadius:'2px 2px 0 0',height:`${Math.round(c/max*64)+4}px`,minHeight:4}}/>
                            <span style={{fontSize:8,color:'var(--ink2)',writingMode:'vertical-rl',transform:'rotate(180deg)'}}>{d.split(' ')[0]}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
                  <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Plan breakdown</h3>
                  {Object.entries(planBreakdown||{}).map(([plan,count])=>(
                    <div key={plan} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                      <span style={{fontSize:12,color:'var(--ink)',minWidth:80,textTransform:'capitalize'}}>{plan}</span>
                      <div style={{flex:1,height:8,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden'}}>
                        <div style={{height:'100%',width:`${Math.round(count/overview.totalUsers*100)||0}%`,background:PLAN_COLOR[plan]||'#888',borderRadius:4}}/>
                      </div>
                      <span style={{fontSize:12,color:'var(--ink2)',minWidth:30,textAlign:'right'}}>{count}</span>
                    </div>
                  ))}
                  {!Object.keys(planBreakdown||{}).length&&<p style={{color:'var(--ink2)',fontSize:13}}>No users yet</p>}
                </div>
              </div>
            </>
          )}

          {tab==='users'&&(
            <>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Top users by activity</h3>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:28}}>
                {(topUsers||[]).map((u,i)=>(
                  <div key={u.email} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 18px',display:'flex',alignItems:'center',gap:14}}>
                    <span style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:800,color:'#818CF8',minWidth:32}}>#{i+1}</span>
                    <span style={{flex:1,fontSize:13,color:'var(--ink)'}}>{u.email}</span>
                    <span style={{fontSize:12,color:'var(--ink2)'}}>{u.count} actions</span>
                  </div>
                ))}
                {!topUsers?.length&&<p style={{color:'var(--ink2)',fontSize:13}}>No activity data yet</p>}
              </div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Recent signups</h3>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {(recentUsers||[]).map(u=>(
                  <div key={u.email} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 18px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                    <div style={{width:34,height:34,borderRadius:8,background:'rgba(129,140,248,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Syne,sans-serif',fontWeight:700,fontSize:14,color:'#818CF8'}}>{(u.name||u.email||'?')[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'var(--ink)'}}>{u.name||'Unknown'}</div>
                      <div style={{fontSize:11,color:'var(--ink2)'}}>{u.email}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,padding:'2px 10px',borderRadius:20,background:(PLAN_COLOR[u.plan||'free']||'#888')+'18',color:PLAN_COLOR[u.plan||'free']||'#888'}}>{u.plan||'free'}</span>
                    <span style={{fontSize:11,color:'var(--ink2)'}}>{fmt(u.createdAt)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab==='tools'&&(
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Tool usage (all time)</h3>
              {Object.entries(toolUsage||{}).sort((a,b)=>b[1]-a[1]).map(([tool,count])=>(
                <div key={tool} style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <span style={{fontSize:16}}>{TOOL_ICON[tool]||'⚡'}</span>
                  <span style={{fontSize:12,color:'var(--ink)',minWidth:120}}>{tool}</span>
                  <div style={{flex:1,height:8,background:'rgba(255,255,255,0.07)',borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${totalToolUses?Math.round(count/totalToolUses*100):0}%`,background:TOOL_COLOR[tool]||'#818CF8',borderRadius:4}}/>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,color:TOOL_COLOR[tool]||'#818CF8',minWidth:40,textAlign:'right'}}>{count}</span>
                </div>
              ))}
              {!Object.keys(toolUsage||{}).length&&<p style={{color:'var(--ink2)',fontSize:13}}>No tool usage yet</p>}
            </div>
          )}

          {tab==='activity'&&(
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'20px 22px'}}>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:16,textTransform:'uppercase',letterSpacing:'.06em'}}>Activity last 30 days</h3>
              {Object.keys(actsByDay||{}).length===0?<p style={{color:'var(--ink2)',fontSize:13}}>No activity yet</p>:(
                <div style={{display:'flex',alignItems:'flex-end',gap:3,height:100,marginBottom:8}}>
                  {Object.entries(actsByDay||{}).slice(-30).map(([d,c])=>{
                    const max=Math.max(...Object.values(actsByDay||{1:1}))
                    return(
                      <div key={d} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
                        <div title={`${d}: ${c} actions`} style={{width:'100%',background:'#818CF8',borderRadius:'2px 2px 0 0',height:`${Math.round(c/max*80)+4}px`,minHeight:4,opacity:.8}}/>
                        <span style={{fontSize:7,color:'var(--ink2)',writingMode:'vertical-rl',transform:'rotate(180deg)'}}>{d.split(' ')[0]}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
