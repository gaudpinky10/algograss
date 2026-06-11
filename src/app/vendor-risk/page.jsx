'use client'
import { useState, useEffect } from 'react'

const DATA_CATEGORIES = ['Names','Contact details','Financial/payment','Health/medical','Children\'s data','Biometric','Criminal records','Location','Special category','Business data']
const VENDOR_TYPES    = ['Cloud hosting','Email/marketing','CRM','Analytics','HR/payroll','Accounting','Customer support','Payment processing','Security','Legal','Other']

const RiskBadge = ({ level }) => {
  const c = level==='High'?{bg:'rgba(239,68,68,0.12)',color:'#EF4444'}:level==='Medium'?{bg:'rgba(245,158,11,0.12)',color:'#F59E0B'}:{bg:'rgba(0,212,170,0.12)',color:'var(--accent)'}
  return <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:c.bg,color:c.color}}>{level}</span>
}

const DpaBadge = ({ status }) => {
  const ok = status==='Yes'
  return <span style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20,background:ok?'rgba(0,212,170,0.1)':'rgba(239,68,68,0.1)',color:ok?'var(--accent)':'#EF4444'}}>{ok?'✓ DPA signed':'✗ No DPA'}</span>
}

const EMPTY = { name:'',type:'Cloud hosting',website:'',dataCategories:[],transfersOutsideUK:'No',dpaSigned:'No',dpaSignedDate:'',lastAudit:'',isoOrSoc2:'Neither',notes:'' }

export default function VendorRiskPage() {
  const [vendors, setVendors]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [filter, setFilter]     = useState('All')
  const [search, setSearch]     = useState('')

  useEffect(()=>{ load() }, [])

  async function load() {
    const res  = await fetch('/api/vendor-risk')
    const data = await res.json()
    setVendors(data.vendors || [])
  }

  async function save() {
    if (!form.name) return
    setSaving(true)
    await fetch('/api/vendor-risk', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'create', vendor:form }) })
    setSaving(false); setShowForm(false); setForm(EMPTY); load()
  }

  async function remove(id) {
    if (!confirm('Remove this vendor?')) return
    await fetch('/api/vendor-risk', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ action:'delete', vendorId:id }) })
    load()
  }

  const toggle = val => setForm(f=>({...f,dataCategories:f.dataCategories.includes(val)?f.dataCategories.filter(x=>x!==val):[...f.dataCategories,val]}))
  const set    = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const filtered = vendors.filter(v => (filter==='All'||v.level===filter) && (!search||v.name.toLowerCase().includes(search.toLowerCase())))
  const stats = { total:vendors.length, high:vendors.filter(v=>v.level==='High').length, noDpa:vendors.filter(v=>v.dpaSigned!=='Yes').length, med:vendors.filter(v=>v.level==='Medium').length }

  return (
    <div style={{minHeight:'90vh',background:'var(--bg)'}}>
      <section style={{background:'var(--bg2)',padding:'48px 0 36px',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16}}>
            <div>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--accent)',display:'block',marginBottom:10}}>GDPR Art. 28</span>
              <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'var(--ink)',marginBottom:8}}>Vendor Risk Reviews</h1>
              <p style={{fontSize:14,color:'var(--ink2)'}}>Track third-party processors, DPA status, and risk levels. GDPR requires a DPA with every data processor.</p>
            </div>
            <button onClick={()=>setShowForm(true)} className="btn btn-primary">+ Add vendor</button>
          </div>
        </div>
      </section>

      <section style={{padding:'32px 0 80px'}}>
        <div className="wrap">

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:28}}>
            {[
              {label:'Total vendors',  val:stats.total, color:'var(--accent)'},
              {label:'High risk',      val:stats.high,  color:'#EF4444'},
              {label:'Medium risk',    val:stats.med,   color:'#F59E0B'},
              {label:'Missing DPA',    val:stats.noDpa, color:'#EF4444'},
            ].map(s=>(
              <div key={s.label} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color:s.color,marginBottom:4}}>{s.val}</div>
                <div style={{fontSize:12,color:'var(--ink2)'}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors..." style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:9,padding:'8px 14px',fontSize:13,color:'var(--ink)',outline:'none',flex:1,minWidth:180}}/>
            {['All','High','Medium','Low'].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{fontSize:12,fontWeight:600,padding:'7px 16px',borderRadius:20,border:'1px solid',borderColor:filter===f?'var(--accent)':'var(--border)',background:filter===f?'rgba(0,212,170,0.1)':'transparent',color:filter===f?'var(--accent)':'var(--ink2)',cursor:'pointer'}}>{f}</button>
            ))}
          </div>

          {/* Vendor list */}
          {filtered.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'var(--ink2)'}}>
              <div style={{fontSize:40,marginBottom:14}}>🏢</div>
              <p style={{fontSize:15,fontWeight:500,color:'var(--ink)',marginBottom:8}}>{vendors.length===0?'No vendors added yet':'No vendors match your filter'}</p>
              <p style={{fontSize:13}}>Add your first third-party processor to start tracking compliance</p>
              {vendors.length===0&&<button onClick={()=>setShowForm(true)} className="btn btn-primary" style={{marginTop:18}}>+ Add your first vendor</button>}
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {filtered.map(v=>(
                <div key={v._id||v.name} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 22px',display:'grid',gridTemplateColumns:'1fr auto',gap:16,alignItems:'center'}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:16}}>
                    <div style={{width:42,height:42,borderRadius:10,background:'rgba(0,212,170,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🏢</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5,flexWrap:'wrap'}}>
                        <span style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,color:'var(--ink)'}}>{v.name}</span>
                        <RiskBadge level={v.level}/>
                        <DpaBadge status={v.dpaSigned}/>
                        <span style={{fontSize:11,color:'var(--ink2)',background:'rgba(255,255,255,0.04)',padding:'2px 8px',borderRadius:6}}>{v.type}</span>
                      </div>
                      <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                        <span style={{fontSize:12,color:'var(--ink2)'}}>Data: {(v.dataCategories||[]).slice(0,3).join(', ')}{(v.dataCategories||[]).length>3?` +${(v.dataCategories||[]).length-3} more`:''}</span>
                        {v.transfersOutsideUK==='Yes'&&<span style={{fontSize:12,color:'#F59E0B'}}>⚠ International transfers</span>}
                        {v.lastAudit&&<span style={{fontSize:12,color:'var(--ink2)'}}>Last audit: {v.lastAudit}</span>}
                        {v.isoOrSoc2&&v.isoOrSoc2!=='Neither'&&<span style={{fontSize:12,color:'var(--accent)'}}>✓ {v.isoOrSoc2}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    {v.website&&<a href={v.website.startsWith('http')?v.website:'https://'+v.website} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{fontSize:11}}>Visit</a>}
                    <button onClick={()=>remove(v._id)} style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#EF4444',borderRadius:8,padding:'6px 12px',fontSize:11,cursor:'pointer'}}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Missing DPA alert */}
          {stats.noDpa>0&&(
            <div style={{background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:12,padding:'14px 18px',marginTop:20}}>
              <p style={{fontSize:13,color:'#EF4444',margin:0,fontWeight:600}}>⚠ {stats.noDpa} vendor{stats.noDpa!==1?'s':''} missing a Data Processing Agreement</p>
              <p style={{fontSize:12,color:'var(--ink2)',marginTop:4,margin:0}}>GDPR Article 28 requires a signed DPA with every processor handling personal data on your behalf.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add vendor modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={e=>{if(e.target===e.currentTarget)setShowForm(false)}}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:18,padding:'28px 32px',width:'100%',maxWidth:600,maxHeight:'85vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'var(--ink)'}}>Add vendor / processor</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'var(--ink2)',fontSize:20,cursor:'pointer'}}>✕</button>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>Vendor name *</label>
              <input value={form.name} onChange={set('name')} placeholder="e.g. Mailchimp, Google Workspace, Xero" style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 14px',fontSize:14,color:'var(--ink)',outline:'none'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>Type</label>
                <select value={form.type} onChange={set('type')} style={{width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 14px',fontSize:13,color:'var(--ink)',outline:'none'}}>
                  {VENDOR_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>Website</label>
                <input value={form.website} onChange={set('website')} placeholder="vendor.com" style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 14px',fontSize:14,color:'var(--ink)',outline:'none'}}/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>Personal data categories processed</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {DATA_CATEGORIES.map(c=>(
                  <label key={c} style={{display:'flex',alignItems:'center',gap:7,padding:'6px 10px',background:form.dataCategories.includes(c)?'rgba(0,212,170,0.08)':'transparent',border:`1px solid ${form.dataCategories.includes(c)?'rgba(0,212,170,0.3)':'var(--border)'}`,borderRadius:7,cursor:'pointer'}}>
                    <input type="checkbox" checked={form.dataCategories.includes(c)} onChange={()=>toggle(c)} style={{accentColor:'var(--accent)'}}/>
                    <span style={{fontSize:12,color:'var(--ink)'}}>{c}</span>
                  </label>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:14}}>
              {[['DPA signed?','dpaSigned',['No','Yes','Pending']],['Transfers outside UK?','transfersOutsideUK',['No','Yes']],['ISO 27001 / SOC 2?','isoOrSoc2',['Neither','ISO 27001','SOC 2','Both']]].map(([lbl,key,opts])=>(
                <div key={key}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>{lbl}</label>
                  <select value={form[key]} onChange={set(key)} style={{width:'100%',background:'var(--bg)',border:'1px solid var(--border)',borderRadius:9,padding:'9px 12px',fontSize:12,color:'var(--ink)',outline:'none'}}>
                    {opts.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {form.dpaSigned==='Yes'&&(
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>DPA signed date</label>
                <input type="date" value={form.dpaSignedDate} onChange={set('dpaSignedDate')} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 14px',fontSize:14,color:'var(--ink)',outline:'none'}}/>
              </div>
            )}
            <div style={{marginBottom:20}}>
              <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>Last audit / review date</label>
              <input value={form.lastAudit} onChange={set('lastAudit')} placeholder="e.g. Jan 2025, Never" style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 14px',fontSize:14,color:'var(--ink)',outline:'none'}}/>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{setShowForm(false);setForm(EMPTY)}} className="btn btn-secondary" style={{flex:1}}>Cancel</button>
              <button onClick={save} disabled={saving||!form.name} className="btn btn-primary" style={{flex:2}}>{saving?'Saving…':'Add vendor & calculate risk'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
