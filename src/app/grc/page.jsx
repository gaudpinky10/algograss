'use client'
import { useState, useEffect } from 'react'

const CONTROLS = [
  { id:'C1',  domain:'Governance', name:'Data protection policy',          desc:'Formal DPP signed off by senior management, reviewed annually' },
  { id:'C2',  domain:'Governance', name:'DPO / privacy lead appointed',    desc:'Designated individual responsible for GDPR compliance' },
  { id:'C3',  domain:'Governance', name:'Records of processing (Art.30)',  desc:'Up-to-date ROPA covering all processing activities' },
  { id:'C4',  domain:'Governance', name:'Lawful basis documented',         desc:'Each processing purpose has a documented lawful basis' },
  { id:'C5',  domain:'Risk',       name:'DPIA process in place',           desc:'High-risk processing assessed before go-live' },
  { id:'C6',  domain:'Risk',       name:'Annual risk review',              desc:'Privacy risks reviewed and risk register updated yearly' },
  { id:'C7',  domain:'Risk',       name:'Vendor risk reviews',             desc:'Third-party processors assessed for data security' },
  { id:'C8',  domain:'Risk',       name:'Breach response plan',            desc:'Documented plan for 72-hour ICO notification' },
  { id:'C9',  domain:'Technical',  name:'Data encryption at rest',         desc:'Personal data encrypted in databases and storage' },
  { id:'C10', domain:'Technical',  name:'Encryption in transit (TLS)',     desc:'All personal data transmitted over HTTPS/TLS' },
  { id:'C11', domain:'Technical',  name:'MFA enforced',                    desc:'Multi-factor authentication on all systems with personal data' },
  { id:'C12', domain:'Technical',  name:'Access controls / least privilege',desc:'Role-based access; staff only access data they need' },
  { id:'C13', domain:'Technical',  name:'Audit logging',                   desc:'Access and modification of personal data is logged' },
  { id:'C14', domain:'Compliance', name:'Privacy notice (Art.13/14)',       desc:'Compliant privacy notice published and linked from all forms' },
  { id:'C15', domain:'Compliance', name:'Cookie consent mechanism',        desc:'Consent collected before non-essential cookies are set' },
  { id:'C16', domain:'Compliance', name:'DSAR process',                    desc:'Documented process to respond to subject access requests in 1 month' },
  { id:'C17', domain:'Compliance', name:'Erasure / right to be forgotten', desc:'Process to delete personal data on valid request' },
  { id:'C18', domain:'Compliance', name:'ICO registration / fee paid',     desc:'Organisation registered and annual fee paid (if required)' },
  { id:'C19', domain:'People',     name:'Staff privacy training',          desc:'All staff who handle personal data trained on GDPR' },
  { id:'C20', domain:'People',     name:'Acceptable use policy',           desc:'Policy covering how staff may use personal data' },
]

const STATUSES = ['Not started','In progress','Implemented','N/A']
const STATUS_COLOR = { 'Not started':'#EF4444','In progress':'#F59E0B','Implemented':'var(--accent)','N/A':'var(--ink2)' }
const DOMAINS = [...new Set(CONTROLS.map(c=>c.domain))]

const defaultState = () => Object.fromEntries(CONTROLS.map(c=>[c.id,{status:'Not started',notes:'',owner:'',dueDate:''}]))

function loadState() {
  if (typeof window==='undefined') return defaultState()
  try { return JSON.parse(localStorage.getItem('grc_controls') || 'null') || defaultState() } catch { return defaultState() }
}
function saveState(s) {
  try { localStorage.setItem('grc_controls', JSON.stringify(s)) } catch {}
}

export default function GrcPage() {
  const [controls, setControls] = useState(defaultState)
  const [domain, setDomain]     = useState('All')
  const [editing, setEditing]   = useState(null)
  const [editBuf, setEditBuf]   = useState({})
  const [loaded, setLoaded]     = useState(false)

  useEffect(()=>{ setControls(loadState()); setLoaded(true) },[])

  function update(id, field, val) {
    setControls(prev => {
      const next = { ...prev, [id]: { ...prev[id], [field]: val } }
      saveState(next); return next
    })
  }

  function openEdit(id) { setEditBuf({...controls[id]}); setEditing(id) }
  function saveEdit() { setControls(prev=>{ const next={...prev,[editing]:{...editBuf}}; saveState(next); return next }); setEditing(null) }

  const stats = {
    implemented: CONTROLS.filter(c=>controls[c.id]?.status==='Implemented').length,
    inProgress:  CONTROLS.filter(c=>controls[c.id]?.status==='In progress').length,
    notStarted:  CONTROLS.filter(c=>controls[c.id]?.status==='Not started').length,
    total:       CONTROLS.length,
    score:       Math.round(CONTROLS.filter(c=>controls[c.id]?.status==='Implemented'||controls[c.id]?.status==='N/A').length/CONTROLS.length*100)
  }

  const visible = CONTROLS.filter(c=>domain==='All'||c.domain===domain)

  return (
    <div style={{minHeight:'90vh',background:'var(--bg)'}}>
      <section style={{background:'var(--bg2)',padding:'48px 0 36px',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap">
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--accent)',display:'block',marginBottom:10}}>Full GRC Platform</span>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'var(--ink)',marginBottom:8}}>Governance, Risk & Compliance</h1>
          <p style={{fontSize:14,color:'var(--ink2)'}}>Track your 20 core GDPR controls across Governance, Risk, Technical, Compliance and People domains.</p>
        </div>
      </section>

      <section style={{padding:'32px 0 80px'}}>
        <div className="wrap">

          {/* Score cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:28}}>
            {[
              {label:'Overall score',    val:stats.score+'%',      color:'var(--accent)'},
              {label:'Implemented',      val:stats.implemented,    color:'var(--accent)'},
              {label:'In progress',      val:stats.inProgress,     color:'#F59E0B'},
              {label:'Not started',      val:stats.notStarted,     color:'#EF4444'},
              {label:'Total controls',   val:stats.total,          color:'var(--ink)'},
            ].map(s=>(
              <div key={s.label} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,color:s.color,marginBottom:4}}>{s.val}</div>
                <div style={{fontSize:11,color:'var(--ink2)'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 20px',marginBottom:24}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:12,color:'var(--ink)'}}>Compliance progress</span>
              <span style={{fontSize:12,fontWeight:700,color:'var(--accent)'}}>{stats.score}%</span>
            </div>
            <div style={{height:8,background:'rgba(255,255,255,0.06)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${stats.score}%`,background:'linear-gradient(90deg,#00D4AA,#00A884)',borderRadius:4,transition:'width .5s'}}/>
            </div>
          </div>

          {/* Domain filter */}
          <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
            {['All',...DOMAINS].map(d=>(
              <button key={d} onClick={()=>setDomain(d)} style={{fontSize:12,fontWeight:600,padding:'6px 14px',borderRadius:20,border:'1px solid',borderColor:domain===d?'var(--accent)':'var(--border)',background:domain===d?'rgba(0,212,170,0.1)':'transparent',color:domain===d?'var(--accent)':'var(--ink2)',cursor:'pointer'}}>{d}</button>
            ))}
          </div>

          {/* Controls */}
          {DOMAINS.filter(d=>domain==='All'||d===domain).map(dom=>(
            <div key={dom} style={{marginBottom:32}}>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:700,color:'var(--ink)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12,paddingBottom:8,borderBottom:'1px solid var(--border)'}}>{dom}</h3>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {visible.filter(c=>c.domain===dom).map(ctrl=>{
                  const st = controls[ctrl.id]?.status||'Not started'
                  return (
                    <div key={ctrl.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
                      <span style={{fontSize:11,fontWeight:700,color:'var(--ink2)',minWidth:32,flexShrink:0}}>{ctrl.id}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:2}}>{ctrl.name}</div>
                        <div style={{fontSize:11,color:'var(--ink2)'}}>{ctrl.desc}</div>
                        {controls[ctrl.id]?.owner&&<div style={{fontSize:11,color:'var(--accent)',marginTop:4}}>Owner: {controls[ctrl.id].owner}</div>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        <select value={st} onChange={e=>update(ctrl.id,'status',e.target.value)} style={{background:'var(--bg)',border:`1px solid ${STATUS_COLOR[st]||'var(--border)'}`,color:STATUS_COLOR[st]||'var(--ink)',borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:600,cursor:'pointer',outline:'none'}}>
                          {STATUSES.map(s=><option key={s}>{s}</option>)}
                        </select>
                        <button onClick={()=>openEdit(ctrl.id)} style={{background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',color:'var(--ink2)',borderRadius:7,padding:'5px 10px',fontSize:11,cursor:'pointer'}}>Notes</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Export summary */}
          <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:14,padding:'20px 24px',marginTop:12}}>
            <p style={{fontSize:14,fontWeight:600,color:'var(--ink)',marginBottom:6}}>📥 Export compliance report</p>
            <p style={{fontSize:13,color:'var(--ink2)',marginBottom:14}}>Download a summary of your GRC controls for audits, management reviews, or ICO enquiries.</p>
            <button onClick={()=>{
              const lines=['AlgoGrass GRC Report','Generated: '+new Date().toLocaleDateString('en-GB'),'','Domain,Control,Status,Owner,Notes']
              CONTROLS.forEach(c=>{const s=controls[c.id];lines.push(`"${c.domain}","${c.name}","${s?.status||'Not started'}","${s?.owner||''}","${s?.notes||''}"`)})
              const blob=new Blob([lines.join('\n')],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='grc-report.csv';a.click()
            }} className="btn btn-primary">Download CSV report</button>
          </div>
        </div>
      </section>

      {/* Edit modal */}
      {editing&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={e=>{if(e.target===e.currentTarget)setEditing(null)}}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:'24px 28px',width:'100%',maxWidth:460}}>
            <h3 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:16}}>{CONTROLS.find(c=>c.id===editing)?.name}</h3>
            {[['owner','Owner / responsible person'],['dueDate','Target date'],['notes','Notes']].map(([k,lbl])=>(
              <div key={k} style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>{lbl}</label>
                {k==='notes'
                  ? <textarea value={editBuf[k]||''} onChange={e=>setEditBuf(b=>({...b,[k]:e.target.value}))} rows={3} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',fontSize:13,color:'var(--ink)',outline:'none',resize:'vertical'}}/>
                  : <input value={editBuf[k]||''} onChange={e=>setEditBuf(b=>({...b,[k]:e.target.value}))} type={k==='dueDate'?'date':'text'} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',fontSize:13,color:'var(--ink)',outline:'none'}}/>
                }
              </div>
            ))}
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button onClick={()=>setEditing(null)} className="btn btn-secondary" style={{flex:1}}>Cancel</button>
              <button onClick={saveEdit} className="btn btn-primary" style={{flex:2}}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
