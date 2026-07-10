'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ScanPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [url, setUrl]       = useState('')
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')
  const [email, setEmail]   = useState('')
  const [emailStatus, setEmailStatus] = useState('idle') // idle|sending|sent|error
  const [emailError, setEmailError]   = useState('')

  // Auto-populate and run scan if URL came from homepage or another page
  useEffect(() => {
    const param = searchParams.get('url')
    if (param && param.trim()) {
      setUrl(param.trim())
      runScan(param.trim())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runScan(target) {
    const u = target || url
    if (!u.trim()) return
    setStatus('scanning'); setError(''); setResult(null); setEmailStatus('idle')
    try {
      const res  = await fetch('/api/scan', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ url: u.trim() }) })
      const data = await res.json()
      if (data.error) { setError(data.error); setStatus('error'); return }
      setResult(data); setStatus('done')
    } catch { setError('Could not connect to scanner. Please try again.'); setStatus('error') }
  }

  async function sendEmail() {
    if (!email.trim()) return
    setEmailStatus('sending'); setEmailError('')
    try {
      const res  = await fetch('/api/email-report', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, result }) })
      const data = await res.json()
      if (data.error) { setEmailError(data.error); setEmailStatus('error'); return }
      setEmailStatus('sent')
    } catch { setEmailError('Could not send email. Please try again.'); setEmailStatus('error') }
  }

  function downloadPDF() {
    if (!result) return
    const sc = result.score
    const scoreColor = sc >= 70 ? '#9B7BFA' : sc >= 40 ? '#F59E0B' : '#EF4444'
    const scoreLabel = sc >= 70 ? 'Good' : sc >= 40 ? 'Needs Work' : 'At Risk'
    const now = new Date(result.scannedAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })

    const issueHTML = result.issues.map(iss => {
      const sevColor = iss.sev==='High' ? '#EF4444' : iss.sev==='Medium' ? '#F59E0B' : '#818CF8'
      const sevBg    = iss.sev==='High' ? '#FEE2E2' : iss.sev==='Medium' ? '#FEF3C7' : '#EDE9FE'
      return `<tr>
        <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;vertical-align:top;width:80px">
          <span style="background:${sevBg};color:${sevColor};padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap">${iss.sev}</span>
        </td>
        <td style="padding:12px 14px;border-bottom:1px solid #e5e7eb;vertical-align:top">
          <div style="color:#0D0D1E;font-weight:600;font-size:13px;margin-bottom:3px">${iss.title}</div>
          <div style="color:#6B7280;font-size:12px;line-height:1.55;margin-bottom:5px">${iss.desc}</div>
          <span style="background:#D1FAE5;color:#065F46;font-size:10px;padding:2px 8px;border-radius:4px">${iss.reg}</span>
        </td>
      </tr>`
    }).join('')

    const checksObj = {
      'HTTPS encryption':        result.checks.https,
      'Privacy policy':          result.checks.privacyPolicy,
      'Cookie consent banner':   result.checks.cookieBanner,
      'Cookie reject option':    result.checks.cookieReject,
      'Terms of service':        result.checks.termsOfService,
      'Lawful basis stated':     result.checks.lawfulBasis,
      'Data subject rights':     result.checks.dataRights,
      'Trackers disclosed':      result.checks.trackersDisclosed,
      'Retention period stated': result.checks.retentionPolicy,
      'DSAR contact provided':   result.checks.dsarContact,
    }
    const checksHTML = Object.entries(checksObj).map(([label, passed]) =>
      `<tr>
        <td style="padding:9px 14px;border-bottom:1px solid #f3f4f6;color:#374151;font-size:13px">${label}</td>
        <td style="padding:9px 14px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:14px">${passed ? '✅' : '❌'}</td>
      </tr>`
    ).join('')

    const circumference = 2 * Math.PI * 45
    const dashOffset = circumference - (sc / 100) * circumference

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>GDPR Compliance Report — ${result.url}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#0D0D1E; font-size:13px; }
    @page { margin:20mm 18mm; size:A4; }
    @media print {
      .no-print { display:none !important; }
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    }
    .header { background:linear-gradient(135deg,#9B7BFA,#7C3AED); color:white; padding:28px 32px; border-radius:0 0 16px 16px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; }
    .logo { display:flex; align-items:center; gap:10px; }
    .logo-icon { width:36px; height:36px; background:linear-gradient(135deg,#9B7BFA,#C084FC); border-radius:8px; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:14px; }
    .logo-text { color:#9B7BFA; font-weight:800; font-size:18px; }
    .header-right { text-align:right; }
    .header-right h1 { font-size:20px; font-weight:700; color:#0F172A; margin-bottom:4px; }
    .header-right p { font-size:12px; color:#94A3B8; }
    .score-section { display:flex; align-items:center; gap:28px; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:14px; padding:20px 24px; margin-bottom:20px; }
    .score-ring { flex-shrink:0; }
    .score-info h2 { font-size:22px; font-weight:800; color:${scoreColor}; margin-bottom:4px; }
    .score-info .label { display:inline-block; background:${scoreColor}20; color:${scoreColor}; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700; margin-bottom:8px; }
    .score-info p { font-size:13px; color:#6B7280; line-height:1.5; }
    h2.section-title { font-size:15px; font-weight:700; color:#0D0D1E; margin-bottom:10px; padding-bottom:6px; border-bottom:2px solid #E5E7EB; }
    table { width:100%; border-collapse:collapse; border:1px solid #E5E7EB; border-radius:10px; overflow:hidden; margin-bottom:20px; }
    th { background:#F3F4F6; color:#374151; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; padding:10px 14px; text-align:left; }
    .cta { background:linear-gradient(135deg,#065F46,#047857); color:white; border-radius:12px; padding:20px 24px; margin-top:20px; text-align:center; }
    .cta h3 { font-size:16px; font-weight:700; margin-bottom:6px; }
    .cta p { font-size:12px; color:rgba(255,255,255,.8); margin-bottom:14px; line-height:1.5; }
    .cta a { background:white; color:#065F46; font-weight:700; font-size:13px; padding:10px 24px; border-radius:8px; text-decoration:none; display:inline-block; }
    .footer { text-align:center; margin-top:24px; color:#9CA3AF; font-size:10px; line-height:1.6; border-top:1px solid #E5E7EB; padding-top:14px; }
    .print-btn { position:fixed; top:20px; right:20px; background:#9B7BFA; color:#06060F; border:none; padding:12px 24px; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; }
  </style>
</head>
<body>
  <button class="no-print print-btn" onclick="window.print()">⬇ Save as PDF</button>

  <div class="header">
    <div class="logo">
      <div class="logo-icon">AG</div>
      <span class="logo-text">AlgoGrass</span>
    </div>
    <div class="header-right">
      <h1>GDPR Compliance Report</h1>
      <p>${result.url} &nbsp;·&nbsp; ${now}</p>
    </div>
  </div>

  <!-- Score -->
  <div class="score-section">
    <div class="score-ring">
      <svg width="90" height="90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" stroke-width="10"/>
        <circle cx="50" cy="50" r="45" fill="none" stroke="${scoreColor}" stroke-width="10"
          stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
          stroke-linecap="round" transform="rotate(-90 50 50)"/>
        <text x="50" y="50" text-anchor="middle" dominant-baseline="central" 
          font-size="20" font-weight="800" fill="${scoreColor}">${sc}</text>
      </svg>
    </div>
    <div class="score-info">
      <div class="label">${scoreLabel}</div>
      <h2>Compliance Score: ${sc}/100</h2>
      <p>
        ${result.issues.length} issue${result.issues.length!==1?'s':''} found across GDPR, UK DPA 2018, and ePrivacy checks
        ${result.trackers.length > 0 ? '<br>Tracking scripts detected: ' + result.trackers.join(', ') : ''}
      </p>
    </div>
  </div>

  <!-- Issues -->
  <h2 class="section-title">${result.issues.length === 0 ? '✅ No Issues Found' : `Compliance Issues (${result.issues.length})`}</h2>
  ${result.issues.length === 0
    ? '<p style="background:#D1FAE5;color:#065F46;padding:14px 18px;border-radius:10px;font-weight:500">This website passed all our compliance checks.</p>'
    : `<table><thead><tr><th>Severity</th><th>Issue &amp; Regulation</th></tr></thead><tbody>${issueHTML}</tbody></table>`
  }

  <!-- Checks -->
  <h2 class="section-title">Compliance Checklist</h2>
  <table><thead><tr><th>Check</th><th style="text-align:right">Result</th></tr></thead>
  <tbody>${checksHTML}</tbody></table>

  <!-- CTA -->
  <div class="cta">
    <h3>Fix your compliance issues with AlgoGrass</h3>
    <p>Generate a tailored privacy policy, cookie notice, and data processing agreements — automatically, based on your scan results.</p>
    <a href="https://algograss.com/signup">Create your free account →</a>
  </div>

  <div class="footer">
    Generated by AlgoGrass · algograss.com · GDPR, UK DPA 2018, ePrivacy Regulations<br>
    This report reflects compliance indicators identified on the live website at time of scan. It does not constitute legal advice.
  </div>

  <script>
    // Auto-open print dialog after a short delay for cleaner experience
    setTimeout(() => window.print(), 500)
  </script>
</body>
</html>`)
    printWindow.document.close()
  }

  const sc     = result?.score
  const scCol  = sc >= 70 ? 'var(--green)' : sc >= 40 ? 'var(--amber-text)' : 'var(--red-text)'
  const scLabel = sc >= 70 ? 'Good' : sc >= 40 ? 'Needs Work' : 'At Risk'

  return (
    <div style={{minHeight:'90vh'}}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={{background:'var(--bg2)',padding:'56px 0 48px',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap" style={{maxWidth:700,textAlign:'center'}}>
          <span style={{fontSize:11,fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--accent)',display:'block',marginBottom:12}}>Free compliance scanner</span>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3.5vw,44px)',fontWeight:800,color:'var(--ink)',marginBottom:12,lineHeight:1.1}}>Scan your website for GDPR risks</h1>
          <p style={{fontSize:16,color:'var(--ink2)',marginBottom:32,fontWeight:300,lineHeight:1.7}}>Enter your URL. We check for the most common GDPR compliance issues in seconds — free, no account needed.</p>
          <div style={{maxWidth:560,margin:'0 auto 10px',textAlign:'left'}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--ink2)',letterSpacing:'.06em',textTransform:'uppercase'}}>Your website URL</label>
          </div>
          <form onSubmit={e=>{e.preventDefault();runScan()}} className="scan-form" style={{display:'flex',gap:8,background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(139,92,246,0.35)',borderRadius:12,padding:'6px 6px 6px 18px',maxWidth:560,margin:'0 auto'}}>
            <span style={{fontSize:14,color:'var(--ink2)',alignSelf:'center',flexShrink:0,opacity:.5}}>https://</span>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="yourwebsite.co.uk" disabled={status==='scanning'}
              autoFocus
              style={{flex:1,border:'none',background:'transparent',fontSize:15,color:'var(--ink)',outline:'none',minWidth:0}}/>
            <button type="submit" className="btn btn-primary" style={{padding:'11px 24px',borderRadius:9,flexShrink:0}} disabled={status==='scanning'}>
              {status==='scanning'?'Scanning…':'Scan now →'}
            </button>
          </form>
          <p style={{fontSize:11,color:'var(--ink2)',marginTop:12}}>Checks: HTTPS · Cookie consent · Privacy policy · Trackers · Data rights · Retention · DSAR</p>
        </div>
      </section>

      {/* ── Scanning spinner ─────────────────────────────────── */}
      {status==='scanning' && (
        <section style={{padding:'64px 0',textAlign:'center'}}>
          <div className="wrap">
            <div style={{width:56,height:56,border:'4px solid rgba(139,92,246,0.2)',borderTop:'4px solid var(--accent)',borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 20px'}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{fontSize:16,color:'var(--ink2)',fontWeight:300}}>Scanning <strong style={{color:'var(--ink)'}}>{url}</strong>…</p>
            <p style={{fontSize:12,color:'var(--ink2)',marginTop:8,opacity:.6}}>Fetching your site and running compliance checks — usually under 5 seconds</p>
          </div>
        </section>
      )}

      {/* ── Error ────────────────────────────────────────────── */}
      {status==='error' && (
        <section style={{padding:'48px 0'}}>
          <div className="wrap" style={{maxWidth:580}}>
            <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:14,padding:'24px 28px',textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:10}}>⚠️</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:600,color:'var(--red-text)',marginBottom:8}}>Scan failed</h3>
              <p style={{fontSize:14,color:'var(--ink2)',marginBottom:16,lineHeight:1.6}}>{error}</p>
              <button onClick={()=>setStatus('idle')} className="btn btn-primary btn-sm">Try again</button>
            </div>
          </div>
        </section>
      )}

      {/* ── Results ──────────────────────────────────────────── */}
      {status==='done' && result && (
        <section style={{padding:'36px 0 80px',background:'var(--bg)'}}>
          <div className="wrap">

            {/* Score bar */}
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:18,padding:'24px 28px',marginBottom:20,display:'flex',flexWrap:'wrap',gap:20,alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:20}}>
                {/* Ring */}
                <div style={{position:'relative',width:80,height:80,flexShrink:0}}>
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth="8"/>
                    <circle cx="40" cy="40" r="34" fill="none" stroke={scCol} strokeWidth="8"
                      strokeDasharray={`${2*Math.PI*34}`}
                      strokeDashoffset={`${2*Math.PI*34*(1-sc/100)}`}
                      strokeLinecap="round" transform="rotate(-90 40 40)" style={{transition:'stroke-dashoffset 1s ease'}}/>
                  </svg>
                  <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                    <span style={{fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:20,color:scCol,lineHeight:1}}>{sc}</span>
                    <span style={{fontSize:9,color:'var(--ink2)',marginTop:1}}>/ 100</span>
                  </div>
                </div>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5}}>
                    <span style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'var(--ink)'}}>Compliance Score</span>
                    <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:100,background:sc>=70?'rgba(139,92,246,0.12)':sc>=40?'rgba(245,158,11,0.12)':'rgba(239,68,68,0.12)',color:scCol}}>{scLabel}</span>
                  </div>
                  <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.5}}>
                    Scanned <strong style={{color:'var(--ink)'}}>{result.url}</strong> · {result.issues.length} issue{result.issues.length!==1?'s':''} found
                    {result.trackers.length>0&&<> · Trackers: {result.trackers.join(', ')}</>}
                  </p>
                </div>
              </div>
              {/* Action buttons */}
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <button onClick={downloadPDF} className="btn btn-secondary" style={{display:'flex',alignItems:'center',gap:6,fontSize:13}}>
                  <span>⬇</span> Download PDF
                </button>
                <button onClick={()=>setStatus('idle')} className="btn btn-secondary" style={{fontSize:13}}>Scan another site</button>
                <a href="/signup" className="btn btn-primary" style={{fontSize:13}}>Fix issues →</a>
              </div>
            </div>

            {/* Issues + Checks grid */}
            <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:20,marginBottom:20}}>
              {/* Issues */}
              <div>
                <h2 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:14}}>
                  {result.issues.length===0 ? '🎉 No issues found!' : `${result.issues.length} compliance issue${result.issues.length!==1?'s':''} found`}
                </h2>
                {result.issues.length===0 ? (
                  <div style={{background:'rgba(139,92,246,0.08)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:14,padding:24,textAlign:'center'}}>
                    <p style={{fontSize:14,color:'var(--accent)',fontWeight:500}}>This website passed all our compliance checks.</p>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {result.issues.map((iss,i)=>{
                      const sevColor = iss.sev==='High'?'var(--red-text)':iss.sev==='Medium'?'var(--amber-text)':'#818CF8'
                      return (
                        <div key={i} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px',display:'grid',gridTemplateColumns:'74px 1fr',gap:12,alignItems:'start'}}>
                          <span style={{display:'block',padding:'4px 0',borderRadius:6,textAlign:'center',fontSize:11,fontWeight:700,background:iss.sev==='High'?'rgba(239,68,68,0.12)':iss.sev==='Medium'?'rgba(245,158,11,0.12)':'rgba(129,140,248,0.12)',color:sevColor}}>{iss.sev}</span>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:4}}>{iss.title}</div>
                            <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.55,marginBottom:6}}>{iss.desc}</div>
                            <span style={{fontSize:10,background:'rgba(139,92,246,0.1)',color:'var(--accent)',padding:'2px 8px',borderRadius:4}}>{iss.reg}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Checks panel */}
              <div>
                <h2 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:14}}>What we checked</h2>
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
                  {Object.entries({'HTTPS encryption':result.checks.https,'Privacy policy':result.checks.privacyPolicy,'Cookie banner':result.checks.cookieBanner,'Cookie reject option':result.checks.cookieReject,'Terms of service':result.checks.termsOfService,'Lawful basis stated':result.checks.lawfulBasis,'Data subject rights':result.checks.dataRights,'Trackers disclosed':result.checks.trackersDisclosed,'Retention period':result.checks.retentionPolicy,'DSAR contact':result.checks.dsarContact}).map(([label,passed])=>(
                    <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:12,color:'var(--ink)'}}>{label}</span>
                      <span style={{fontSize:14}}>{passed?'✅':'❌'}</span>
                    </div>
                  ))}
                </div>

                {/* Email report box */}
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 16px'}}>
                  <p style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:600,color:'var(--ink)',marginBottom:4}}>📧 Email this report</p>
                  <p style={{fontSize:11,color:'var(--ink2)',marginBottom:12,lineHeight:1.5}}>Get a professionally formatted copy sent to your inbox</p>
                  {emailStatus==='sent' ? (
                    <div style={{background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
                      <p style={{fontSize:13,color:'var(--accent)',fontWeight:600}}>✓ Report sent to {email}</p>
                    </div>
                  ) : (
                    <>
                      <div style={{display:'flex',gap:6}}>
                        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="your@email.com"
                          style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',fontSize:12,color:'var(--ink)',outline:'none',minWidth:0}}/>
                        <button onClick={sendEmail} disabled={emailStatus==='sending'} className="btn btn-primary btn-sm" style={{flexShrink:0,fontSize:12}}>
                          {emailStatus==='sending'?'Sending…':'Send'}
                        </button>
                      </div>
                      {emailStatus==='error'&&<p style={{fontSize:11,color:'var(--red-text)',marginTop:6}}>{emailError}</p>}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div style={{background:'rgba(139,92,246,0.05)',border:'1px solid rgba(139,92,246,0.15)',borderRadius:10,padding:'12px 16px',fontSize:12,color:'var(--ink2)',lineHeight:1.65}}>
              <strong style={{color:'var(--accent)'}}>About this scan:</strong> AlgoGrass analyses your website against GDPR, UK DPA 2018, ePrivacy Regulations, and ICO guidance. Results reflect real compliance indicators identified on your live site. This does not constitute legal advice.
            </div>
          </div>
        </section>
      )}

      {/* ── Idle state — what we check ───────────────────────── */}
      {status==='idle' && (
        <section style={{padding:'56px 0 80px'}}>
          <div className="wrap">
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:700,textAlign:'center',marginBottom:8,color:'var(--ink)'}}>What we check</h2>
            <p style={{textAlign:'center',fontSize:14,color:'var(--ink2)',marginBottom:16}}>Try these examples to see live results:</p>
            <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:44}}>
              {['bbc.co.uk','tesco.com','amazon.co.uk','gov.uk'].map(eg=>(
                <button key={eg} onClick={()=>{setUrl(eg);setTimeout(()=>runScan(eg),50)}} style={{fontSize:12,padding:'7px 14px',borderRadius:20,border:'1px solid rgba(139,92,246,0.25)',background:'rgba(139,92,246,0.06)',color:'var(--accent)',cursor:'pointer'}}>
                  Try {eg}
                </button>
              ))}
            </div>
            <div className="grid-4col" style={{gap:16}}>
              {[
                {icon:'🔒',title:'HTTPS',desc:'Verifies HTTPS encryption is active across the entire site — required by GDPR Art. 32.'},
                {icon:'🍪',title:'Cookie consent',desc:'Checks for a cookie banner with both accept and reject options, per ICO 2023 guidance.'},
                {icon:'📄',title:'Privacy policy',desc:'Confirms a privacy policy exists and checks for GDPR Art. 13 required information.'},
                {icon:'🔍',title:'Trackers',desc:'Detects Google Analytics, Meta Pixel, Hotjar, LinkedIn, HubSpot and other scripts.'},
                {icon:'📝',title:'Contact forms',desc:'Identifies data collection forms and checks for privacy notices at point of collection.'},
                {icon:'⚖️',title:'Lawful basis',desc:'Checks whether your privacy policy states the lawful basis for each type of processing.'},
                {icon:'👤',title:'Data rights',desc:'Verifies your privacy policy explains all eight data subject rights (GDPR Art. 15–22).'},
                {icon:'🕐',title:'Retention period',desc:'Checks that your privacy policy states how long personal data is kept (GDPR Art. 13(2)(a)).'},
              ].map(({icon,title,desc})=>(
                <div key={title} className="card card-hover" style={{padding:'18px 16px'}}>
                  <div style={{fontSize:24,marginBottom:10}}>{icon}</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:6}}>{title}</div>
                  <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.6}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}

import { Suspense } from 'react'

export default function ScanPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, color: 'var(--ink2)', textAlign: 'center' }}>Loading…</div>}>
      <ScanPageInner />
    </Suspense>
  )
}
