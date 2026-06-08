'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
export default function ScanPage() {
  const router=useRouter()
  const [url,setUrl]=useState('')
  const [status,setStatus]=useState('idle')
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  async function runScan(target){
    const u=target||url
    if(!u.trim())return
    setStatus('scanning');setError('');setResult(null)
    try{
      const res=await fetch('/api/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:u.trim()})})
      const data=await res.json()
      if(data.error){setError(data.error);setStatus('error');return}
      setResult(data);setStatus('done')
    }catch{setError('Could not connect to scanner. Please try again.');setStatus('error')}
  }
  const sc=result?.score
  const scCol=sc>=70?'var(--green)':sc>=40?'var(--amber-text)':'var(--red-text)'
  const scLabel=sc>=70?'Good':sc>=40?'Needs work':'At risk'
  return (
    <div style={{minHeight:'90vh'}}>
      <section style={{background:'var(--green)',padding:'56px 0 48px'}}>
        <div className="wrap" style={{maxWidth:700,textAlign:'center'}}>
          <span style={{fontSize:11,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--lime)',display:'block',marginBottom:12}}>Free compliance scanner</span>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,44px)',fontWeight:800,color:'#fff',marginBottom:12,lineHeight:1.1}}>Scan your website for GDPR risks</h1>
          <p style={{fontSize:16,color:'rgba(255,255,255,.75)',marginBottom:32,fontWeight:300,lineHeight:1.7}}>Enter your URL below. We check your site for the most common compliance issues in seconds — completely free, no account required.</p>
          <form onSubmit={e=>{e.preventDefault();runScan()}} style={{display:'flex',gap:8,background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.2)',borderRadius:12,padding:'6px 6px 6px 18px',maxWidth:560,margin:'0 auto'}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="yourwebsite.co.uk" disabled={status==='scanning'} style={{flex:1,border:'none',background:'transparent',fontSize:15,color:'#fff',outline:'none'}}/>
            <button type="submit" className="btn btn-lime" style={{padding:'11px 24px',borderRadius:9}} disabled={status==='scanning'}>{status==='scanning'?'Scanning...':'Scan now →'}</button>
          </form>
          <p style={{fontSize:11,color:'rgba(255,255,255,.5)',marginTop:12}}>Checks: HTTPS · Cookie consent · Privacy policy · Trackers · Forms · Data rights</p>
        </div>
      </section>
      {status==='scanning'&&(
        <section style={{padding:'64px 0',textAlign:'center'}}>
          <div className="wrap">
            <div style={{width:56,height:56,border:'4px solid var(--green-p)',borderTop:'4px solid var(--green)',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 20px'}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{fontSize:16,color:'var(--ink2)',fontWeight:300}}>Scanning <strong style={{color:'var(--ink)',fontWeight:500}}>{url}</strong>...</p>
          </div>
        </section>
      )}
      {status==='error'&&(
        <section style={{padding:'48px 0'}}>
          <div className="wrap" style={{maxWidth:600}}>
            <div style={{background:'var(--red-bg)',border:'1px solid #F5B7B1',borderRadius:14,padding:'24px 28px',textAlign:'center'}}>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:600,color:'var(--red-text)',marginBottom:8}}>Scan failed</h3>
              <p style={{fontSize:14,color:'var(--red-text)',marginBottom:16}}>{error}</p>
              <button onClick={()=>setStatus('idle')} className="btn btn-primary btn-sm">Try again</button>
            </div>
          </div>
        </section>
      )}
      {status==='done'&&result&&(
        <section style={{padding:'48px 0 80px'}}>
          <div className="wrap">
            <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:20,padding:'32px 36px',marginBottom:24,display:'grid',gridTemplateColumns:'auto 1fr auto',gap:28,alignItems:'center'}}>
              <div style={{width:96,height:96,borderRadius:'50%',background:`conic-gradient(${scCol} ${result.score*3.6}deg, var(--green-p) ${result.score*3.6}deg)`,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',flexShrink:0}}>
                <div style={{position:'absolute',width:72,height:72,background:'var(--white)',borderRadius:'50%'}}/>
                <span style={{position:'relative',fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:22,color:scCol,zIndex:1}}>{result.score}</span>
              </div>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                  <span style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)'}}>Compliance score</span>
                  <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:100,background:sc>=70?'var(--green-p)':sc>=40?'var(--amber-bg)':'var(--red-bg)',color:scCol}}>{scLabel}</span>
                </div>
                <p style={{fontSize:14,color:'var(--ink2)'}}>Scanned <strong>{result.url}</strong> · {result.issues.length} issue{result.issues.length!==1?'s':''} found{result.trackers.length>0?` · Trackers: ${result.trackers.join(', ')}`:''}</p>
              </div>
              <div style={{textAlign:'right'}}>
                <a href="/signup" className="btn btn-primary" style={{marginBottom:8,display:'block',textAlign:'center'}}>Fix all issues →</a>
                <button onClick={()=>setStatus('idle')} className="btn btn-secondary btn-sm" style={{width:'100%'}}>Scan another site</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:20}}>
              <div>
                <h2 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,marginBottom:14}}>{result.issues.length===0?'🎉 No issues found!':result.issues.length+' compliance issues found'}</h2>
                {result.issues.length===0?(
                  <div style={{background:'var(--green-p)',border:'1px solid var(--green-m)',borderRadius:14,padding:24,textAlign:'center'}}>
                    <p style={{fontSize:15,color:'var(--green)',fontWeight:500}}>This website passed all our compliance checks.</p>
                    <a href="/signup" className="btn btn-primary btn-sm" style={{marginTop:14,display:'inline-block'}}>Get full report</a>
                  </div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {result.issues.map((iss,i)=>(
                      <div key={i} style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:13,padding:'16px 20px',display:'grid',gridTemplateColumns:'74px 1fr',gap:12,alignItems:'start'}}>
                        <span className={`chip chip-${iss.sev.toLowerCase()}`} style={{textAlign:'center',display:'block',padding:'4px 0',borderRadius:6}}>{iss.sev}</span>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,color:'var(--ink)',marginBottom:4}}>{iss.title}</div>
                          <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.55,marginBottom:6}}>{iss.desc}</div>
                          <span style={{fontSize:10,background:'var(--green-p)',color:'var(--green)',padding:'2px 8px',borderRadius:4}}>{iss.reg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2 style={{fontFamily:'Syne,sans-serif',fontSize:17,fontWeight:600,marginBottom:14}}>What we checked</h2>
                <div style={{background:'var(--white)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:16}}>
                  {Object.entries({'HTTPS encryption':result.checks.https,'Privacy policy':result.checks.privacyPolicy,'Cookie banner':result.checks.cookieBanner,'Cookie reject option':result.checks.cookieReject,'Terms of service':result.checks.termsOfService,'Lawful basis stated':result.checks.lawfulBasis,'Data subject rights':result.checks.dataRights,'Trackers disclosed':result.checks.trackersDisclosed}).map(([label,passed])=>(
                    <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 16px',borderBottom:'1px solid var(--green-p)'}}>
                      <span style={{fontSize:13,color:'var(--ink)'}}>{label}</span>
                      <span style={{fontSize:15}}>{passed?'✅':'❌'}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:'var(--green)',borderRadius:14,padding:20}}>
                  <p style={{fontSize:14,color:'#fff',fontWeight:500,marginBottom:6}}>Get your full compliance report</p>
                  <p style={{fontSize:12,color:'rgba(255,255,255,.7)',marginBottom:14,lineHeight:1.6}}>Sign up free to get detailed reports, AI-generated documents, and ongoing monitoring.</p>
                  <a href="/signup" className="btn btn-lime btn-sm btn-full">Create free account →</a>
                </div>
              </div>
            </div>
            <div style={{background:'var(--green-p)',border:'1px solid var(--green-m)',borderRadius:12,padding:'14px 18px',marginTop:20,fontSize:12,color:'var(--ink2)',lineHeight:1.65}}>
              <strong style={{color:'var(--green)'}}>About this scan:</strong> AlgoGrass analyses your website against GDPR, UK DPA 2018, ePrivacy Regulations, and ICO guidance. Results reflect real compliance indicators identified on your live site.
            </div>
          </div>
        </section>
      )}
      {status==='idle'&&(
        <section style={{padding:'64px 0 80px'}}>
          <div className="wrap">
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:700,textAlign:'center',marginBottom:12,color:'var(--ink)'}}>What we check</h2>
            <p style={{textAlign:'center',fontSize:14,color:'var(--ink2)',marginBottom:40}}>Try these example sites to see real results:</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:48}}>
              {['bbc.co.uk','tesco.com','amazon.co.uk','gov.uk'].map(eg=>(
                <button key={eg} onClick={()=>{setUrl(eg);setTimeout(()=>runScan(eg),50)}} style={{fontSize:12,padding:'7px 14px',borderRadius:20,border:'1px solid var(--green-m)',background:'var(--white)',color:'var(--green)',cursor:'pointer'}}>Try {eg}</button>
              ))}
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
              {[{icon:'🔒',title:'HTTPS',desc:'Verifies secure HTTPS encryption as required by GDPR Art. 32.'},{icon:'🍪',title:'Cookie consent',desc:'Checks for a cookie banner with both accept and reject options.'},{icon:'📄',title:'Privacy policy',desc:'Confirms a privacy policy is linked and checks for GDPR Art. 13 requirements.'},{icon:'🔍',title:'Trackers',desc:'Detects Google Analytics, Facebook Pixel, Hotjar, LinkedIn and other scripts.'},{icon:'📝',title:'Contact forms',desc:'Identifies data collection forms and checks for privacy notices.'},{icon:'⚖️',title:'Lawful basis',desc:'Checks whether your privacy policy states the lawful basis for processing.'},{icon:'👤',title:'Data rights',desc:'Verifies your privacy policy explains users rights under GDPR Art. 15-22.'},{icon:'📋',title:'Terms of service',desc:'Checks for Terms of Service documentation.'}].map(({icon,title,desc})=>(
                <div key={title} className="card card-hover" style={{padding:'20px 18px'}}>
                  <div style={{fontSize:26,marginBottom:10}}>{icon}</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:600,color:'var(--ink)',marginBottom:6}}>{title}</div>
                  <p style={{fontSize:12,color:'var(--ink2)',lineHeight:1.6}}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
