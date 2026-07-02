'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const RISK_TIERS = {
  unacceptable: { label:'Unacceptable Risk — PROHIBITED', color:'#EF4444', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.3)', icon:'🚫', summary:'Your AI system falls under Article 5 prohibited practices. These are banned in the EU from 2 February 2025.', requirements:['This system CANNOT be placed on the EU market or used in the EU','No conformity assessment can make a prohibited system compliant','Prohibited: subliminal manipulation, exploitation of vulnerabilities, social scoring by public authorities, real-time remote biometric identification in public spaces','Review your system architecture — redesign or withdraw from EU market immediately'] },
  high: { label:'High Risk (Annex III)', color:'#F59E0B', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)', icon:'⚠️', summary:'Your system is classified as high-risk under Annex III. Full conformity obligations apply from 2 August 2026.', requirements:['Quality Management System (QMS) — Art. 17','Technical documentation — Art. 11 + Annex IV','Conformity assessment before market placement — Art. 43','EU Declaration of Conformity — Art. 47','CE marking required','Register in EU AI database — Art. 49','Post-market monitoring plan — Art. 72','Incident reporting to authorities — Art. 73'] },
  limited: { label:'Limited Risk', color:'#818CF8', bg:'rgba(99,102,241,0.1)', border:'rgba(99,102,241,0.3)', icon:'ℹ️', summary:'Your system has limited risk obligations — primarily transparency requirements.', requirements:['Inform users when they interact with an AI system','Disclose AI-generated or manipulated content (deepfakes etc.)','Ensure emotion recognition and biometric categorisation systems disclose their nature','No conformity assessment required but document your transparency measures'] },
  minimal: { label:'Minimal Risk', color:'#00D4AA', bg:'rgba(0,212,170,0.1)', border:'rgba(0,212,170,0.3)', icon:'✅', summary:'Your system poses minimal risk. No mandatory EU AI Act obligations apply, but best practice documentation is recommended.', requirements:['No mandatory EU AI Act obligations apply','Consider voluntary codes of conduct','Document the AI system in your AI governance register','Maintain basic transparency with users about AI use','Review periodically as regulations evolve'] },
}

const QUESTIONS = [
  { id:'prohibited', text:'Does your AI system do any of the following?', options:['Social scoring of individuals by public authorities','Subliminal manipulation of behaviour causing harm','Exploitation of vulnerabilities (age, disability, economic situation)','Real-time remote biometric identification in public spaces','Emotion recognition in workplace or educational settings (not safety)','None of the above'], prohibited:['Social scoring of individuals by public authorities','Subliminal manipulation of behaviour causing harm','Exploitation of vulnerabilities (age, disability, economic situation)','Real-time remote biometric identification in public spaces'] },
  { id:'highRiskSector', text:'Is your AI system used in any of these high-risk sectors (Annex III)?', options:['Biometric identification or categorisation','Critical infrastructure (energy, water, transport, digital)','Education and vocational training (access/assessment)','Employment, recruitment, or performance management','Essential private/public services (credit scoring, emergency services, benefits)','Law enforcement or border control','Administration of justice or democratic processes','None of the above'] },
  { id:'transparency', text:'Does your system interact directly with natural persons?', options:['Yes — chatbot, virtual assistant, or other conversational AI','Yes — generates text/images/video (deepfakes, synthetic content)','Yes — emotion recognition or biometric categorisation','No — backend processing only','No — purely B2B with no public-facing element'] },
]

const READINESS_CHECKS = [
  { id:'register', cat:'Governance', label:'AI system registered in AI Governance Register', art:'Art. 49', desc:'Maintain an inventory of all AI systems with purpose, risk tier, data used, and responsible person.' },
  { id:'dpia', cat:'Governance', label:'DPIA completed for high-risk AI use', art:'Art. 35 UK GDPR', desc:'Data Protection Impact Assessment required for high-risk AI processing. Document risks and mitigations.' },
  { id:'lawful_basis', cat:'Data', label:'Lawful basis identified for AI training data', art:'Art. 6 GDPR', desc:'Document the lawful basis (consent, LI, contract, etc.) for all personal data used in AI training or inference.' },
  { id:'transparency_notice', cat:'Data', label:'AI use disclosed in privacy notice', art:'Art. 13-14 GDPR', desc:'Privacy notice updated to disclose AI/automated processing, logic involved, and significance of decisions.' },
  { id:'human_oversight', cat:'Operations', label:'Human oversight mechanism in place', art:'Art. 14 EU AI Act', desc:'For high-risk AI: documented process for human review and override of AI decisions.' },
  { id:'bias_testing', cat:'Operations', label:'Bias and fairness testing conducted', art:'Art. 9 EU AI Act', desc:'Risk management system addressing bias, accuracy, robustness, and cybersecurity for AI systems.' },
  { id:'data_minimisation', cat:'Data', label:'Data minimisation applied to AI training', art:'Art. 5(1)(c) GDPR', desc:'Only personal data that is adequate, relevant, and limited to what is necessary is used for AI training.' },
  { id:'automated_decisions', cat:'Operations', label:'Automated decision-making safeguards in place', art:'Art. 22 GDPR', desc:'If solely automated decisions have legal/significant effects: right to human review, explanation, and contest.' },
  { id:'gpai', cat:'Governance', label:'GPAI model obligations assessed (if applicable)', art:'Art. 53 EU AI Act', desc:'If using or building General Purpose AI models: technical documentation, copyright policy, training data summary.' },
  { id:'incident_reporting', cat:'Operations', label:'AI incident reporting process defined', art:'Art. 73 EU AI Act', desc:'Process to identify, assess, and report serious incidents from high-risk AI systems to national authorities.' },
  { id:'staff_training', cat:'Training', label:'Staff trained on AI governance and risks', art:'Art. 4 EU AI Act', desc:'All staff who deploy or manage AI systems have received appropriate AI literacy and governance training.' },
  { id:'supplier_checks', cat:'Governance', label:'AI supplier/provider obligations verified', art:'Art. 28 EU AI Act', desc:'Confirmed obligations between provider and deployer are clear, DPA in place, and technical documentation received.' },
]

const TIMELINE = [
  { date:'Feb 2025', label:'Prohibited AI practices banned', status:'active', color:'#EF4444' },
  { date:'Aug 2025', label:'GPAI model obligations apply', status:'active', color:'#F59E0B' },
  { date:'Aug 2026', label:'High-risk AI (Annex III) obligations', status:'upcoming', color:'#818CF8' },
  { date:'Aug 2027', label:'High-risk AI (Annex I) obligations', status:'future', color:'rgba(255,255,255,.3)' },
]


function getUser() {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim())
    const cookie = cookies.find(c => c.startsWith('algograss_user='))
    if (!cookie) return null
    return JSON.parse(atob(cookie.split('=')[1]))
  } catch { return null }
}
export default function AIGovernancePage() {
  const [tab, setTab]           = useState('classifier')
  const [step, setStep]         = useState(0)
  const [answers, setAnswers]   = useState({})
  const [tier, setTier]         = useState(null)
  const [checks, setChecks]     = useState({})
  const [systemName, setSystemName] = useState('')
  const router = useRouter()
  useEffect(() => {
    const u = getUser()
    if (!u) { router.push('/login'); return }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function answer(qId, value) {
    const newAnswers = { ...answers, [qId]: value }
    setAnswers(newAnswers)
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      // Calculate tier
      const q0 = newAnswers['prohibited']
      const q1 = newAnswers['highRiskSector']
      const q2 = newAnswers['transparency']
      const prohibited = QUESTIONS[0].options.slice(0, 4)
      if (q0 && prohibited.includes(q0)) { setTier('unacceptable'); return }
      if (q1 && q1 !== 'None of the above') { setTier('high'); return }
      if (q2 && (q2.startsWith('Yes'))) { setTier('limited'); return }
      setTier('minimal')
    }
  }

  function reset() { setStep(0); setAnswers({}); setTier(null); setSystemName('') }

  const completedChecks = Object.values(checks).filter(Boolean).length
  const checksPct = Math.round((completedChecks / READINESS_CHECKS.length) * 100)
  const checksByCat = READINESS_CHECKS.reduce((acc, c) => { if (!acc[c.cat]) acc[c.cat] = []; acc[c.cat].push(c); return acc }, {})

  return (
    <div style={{ minHeight:'90vh', background:'var(--bg)' }}>

      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg,var(--bg) 0%,var(--bg2) 100%)', padding:'52px 0 36px', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap">
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(124,158,255,.1)', border:'1px solid rgba(124,158,255,.25)', padding:'5px 13px', borderRadius:100, marginBottom:16, fontSize:11, fontWeight:600, color:'#7C9EFF', letterSpacing:'.08em', textTransform:'uppercase' }}>
            🤖 EU AI Act · UK AI Governance
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(26px,3vw,42px)', fontWeight:800, color:'#fff', marginBottom:12 }}>AI Governance &amp; EU AI Act Readiness</h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', maxWidth:620, lineHeight:1.7 }}>Classify your AI systems under the EU AI Act, check your readiness against key obligations, and build your AI governance register.</p>
        </div>
      </section>

      {/* TABS */}
      <div style={{ background:'rgba(13,21,37,0.8)', borderBottom:'1px solid var(--border)' }}>
        <div className="wrap" style={{ display:'flex' }}>
          {[['classifier','🔍 Risk Classifier'],['readiness','✅ Readiness Checklist'],['timeline','📅 EU AI Act Timeline'],['register','📋 AI Register']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding:'14px 20px', border:'none', background:'transparent', fontSize:13, fontWeight:600, cursor:'pointer', color: tab===id ? '#00D4AA' : 'rgba(255,255,255,.45)', borderBottom: tab===id ? '2px solid #00D4AA' : '2px solid transparent', transition:'all .15s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap" style={{ padding:'36px 0', maxWidth:900 }}>

        {/* CLASSIFIER TAB */}
        {tab === 'classifier' && (
          <div>
            {!tier ? (
              <div style={{ maxWidth:680 }}>
                <div style={{ background:'rgba(13,21,37,0.8)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'28px 32px', marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                    <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'#fff' }}>EU AI Act Risk Classifier</h2>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,.35)' }}>Question {step + 1} of {QUESTIONS.length}</span>
                  </div>
                  <div style={{ height:4, background:'rgba(255,255,255,.08)', borderRadius:4, marginBottom:24, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${((step) / QUESTIONS.length) * 100}%`, background:'linear-gradient(90deg,#00D4AA,#7C9EFF)', borderRadius:4, transition:'width .3s' }} />
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <input value={systemName} onChange={e => setSystemName(e.target.value)} placeholder="AI system name (optional)"
                      style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#fff', outline:'none', marginBottom:20, boxSizing:'border-box' }} />
                  </div>

                  <p style={{ fontSize:16, fontWeight:600, color:'#fff', marginBottom:18, lineHeight:1.5 }}>{QUESTIONS[step].text}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {QUESTIONS[step].options.map(opt => (
                      <button key={opt} onClick={() => answer(QUESTIONS[step].id, opt)}
                        style={{ textAlign:'left', padding:'13px 16px', borderRadius:10, border:'1px solid rgba(255,255,255,.1)', background: answers[QUESTIONS[step].id] === opt ? 'rgba(0,212,170,.12)' : 'rgba(255,255,255,.04)', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all .15s', lineHeight:1.5 }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {step > 0 && <button onClick={() => setStep(step - 1)} style={{ fontSize:12, color:'rgba(255,255,255,.4)', background:'transparent', border:'none', cursor:'pointer' }}>← Back</button>}
              </div>
            ) : (
              <div style={{ maxWidth:700 }}>
                {/* Result */}
                <div style={{ background:RISK_TIERS[tier].bg, border:`1px solid ${RISK_TIERS[tier].border}`, borderRadius:16, padding:'28px 32px', marginBottom:20 }}>
                  <div style={{ display:'flex', gap:16, alignItems:'flex-start', marginBottom:16 }}>
                    <span style={{ fontSize:40 }}>{RISK_TIERS[tier].icon}</span>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:RISK_TIERS[tier].color, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>EU AI Act Classification</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:800, color:RISK_TIERS[tier].color }}>{RISK_TIERS[tier].label}</div>
                      {systemName && <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginTop:4 }}>System: {systemName}</div>}
                    </div>
                  </div>
                  <p style={{ fontSize:14, color:'rgba(255,255,255,.7)', lineHeight:1.7, marginBottom:0 }}>{RISK_TIERS[tier].summary}</p>
                </div>

                <div style={{ background:'rgba(13,21,37,0.8)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'22px 24px', marginBottom:16 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:16 }}>Required Actions</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {RISK_TIERS[tier].requirements.map((req, i) => (
                      <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                        <span style={{ fontSize:14, color:RISK_TIERS[tier].color, marginTop:1, flexShrink:0 }}>{tier === 'unacceptable' ? '🚫' : tier === 'high' ? '📋' : tier === 'limited' ? 'ℹ️' : '✅'}</span>
                        <span style={{ fontSize:13, color:'rgba(255,255,255,.7)', lineHeight:1.6 }}>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={reset} style={{ fontSize:13, padding:'10px 20px', borderRadius:8, border:'1px solid rgba(255,255,255,.15)', background:'transparent', color:'#fff', cursor:'pointer', fontWeight:500 }}>Classify another system</button>
                  <button onClick={() => setTab('readiness')} style={{ fontSize:13, padding:'10px 20px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#00D4AA,#00A882)', color:'#fff', cursor:'pointer', fontWeight:700 }}>Check your readiness →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* READINESS CHECKLIST */}
        {tab === 'readiness' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#fff', marginBottom:4 }}>AI Governance Readiness</h2>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.45)' }}>{completedChecks} of {READINESS_CHECKS.length} checks completed</p>
              </div>
              <div style={{ textAlign:'center', background:'rgba(13,21,37,0.8)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:'14px 20px' }}>
                <div style={{ fontSize:28, fontWeight:800, color: checksPct >= 75 ? '#00D4AA' : checksPct >= 40 ? '#F59E0B' : '#EF4444' }}>{checksPct}%</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>Ready</div>
              </div>
            </div>

            <div style={{ height:6, background:'rgba(255,255,255,.07)', borderRadius:6, marginBottom:28, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${checksPct}%`, background:`linear-gradient(90deg,${checksPct>=75?'#00D4AA':checksPct>=40?'#F59E0B':'#EF4444'},${checksPct>=75?'#00A882':checksPct>=40?'#D97706':'#DC2626'})`, borderRadius:6, transition:'width .4s' }} />
            </div>

            {Object.entries(checksByCat).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.5)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>{cat}</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {items.map(c => (
                    <div key={c.id} onClick={() => setChecks(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                      style={{ display:'flex', gap:14, alignItems:'flex-start', background: checks[c.id] ? 'rgba(0,212,170,.06)' : 'rgba(13,21,37,0.7)', border:`1px solid ${checks[c.id] ? 'rgba(0,212,170,.25)' : 'rgba(255,255,255,.06)'}`, borderRadius:12, padding:'14px 16px', cursor:'pointer', transition:'all .15s' }}>
                      <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${checks[c.id] ? '#00D4AA' : 'rgba(255,255,255,.2)'}`, background: checks[c.id] ? '#00D4AA' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                        {checks[c.id] && <span style={{ fontSize:11, color:'#000', fontWeight:900 }}>✓</span>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                          <span style={{ fontSize:13, fontWeight:600, color: checks[c.id] ? '#00D4AA' : '#fff' }}>{c.label}</span>
                          <span style={{ fontSize:10, color:'rgba(255,255,255,.3)', background:'rgba(255,255,255,.05)', padding:'2px 7px', borderRadius:20 }}>{c.art}</span>
                        </div>
                        <p style={{ fontSize:12, color:'rgba(255,255,255,.45)', lineHeight:1.5, margin:0 }}>{c.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TIMELINE TAB */}
        {tab === 'timeline' && (
          <div style={{ maxWidth:740 }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#fff', marginBottom:8 }}>EU AI Act Implementation Timeline</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginBottom:32, lineHeight:1.7 }}>The EU AI Act (Regulation 2024/1689) entered into force on 1 August 2024. Obligations roll out over 36 months.</p>

            <div style={{ position:'relative', paddingLeft:32 }}>
              <div style={{ position:'absolute', left:8, top:0, bottom:0, width:2, background:'rgba(255,255,255,.08)' }} />
              {[
                { date:'1 Aug 2024', label:'EU AI Act enters into force', status:'done', color:'#00D4AA', detail:'The Act was published in the Official Journal. 24-month implementation clock started for most obligations.' },
                { date:'2 Feb 2025', label:'Prohibited AI practices ban', status:'done', color:'#EF4444', detail:'All prohibited AI systems under Article 5 must be discontinued. Includes social scoring, subliminal manipulation, exploitation of vulnerabilities, and (with narrow exceptions) real-time remote biometric ID.' },
                { date:'2 Aug 2025', label:'GPAI model obligations', status:'done', color:'#F59E0B', detail:'General Purpose AI model providers must: maintain technical documentation, publish training data summaries, implement copyright policies, report serious incidents to EU AI Office.' },
                { date:'2 Aug 2026', label:'High-risk AI obligations (Annex III)', status:'upcoming', color:'#818CF8', detail:'Full conformity obligations for high-risk AI systems in: biometrics, critical infrastructure, education, employment, essential services, law enforcement, border control, justice. Includes QMS, conformity assessments, CE marking, EU database registration.' },
                { date:'2 Aug 2026', label:'Notified body requirements', status:'upcoming', color:'#818CF8', detail:'Conformity assessment bodies must be designated and notified. Third-party conformity assessments required for certain high-risk AI systems.' },
                { date:'2 Aug 2027', label:'High-risk AI obligations (Annex I)', status:'future', color:'rgba(255,255,255,.3)', detail:'AI systems used as safety components in products covered by existing EU legislation (machinery, medical devices, vehicles etc.) must comply.' },
              ].map((item, i) => (
                <div key={i} style={{ position:'relative', marginBottom:28, paddingLeft:20 }}>
                  <div style={{ position:'absolute', left:-24, top:4, width:14, height:14, borderRadius:'50%', background: item.status==='done' ? item.color : item.status==='upcoming' ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.06)', border:`2px solid ${item.color}` }} />
                  <div style={{ background:'rgba(13,21,37,0.8)', border:`1px solid ${item.status==='done' ? `${item.color}33` : 'rgba(255,255,255,.06)'}`, borderRadius:12, padding:'16px 20px' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:12, fontWeight:700, color:item.color }}>{item.date}</span>
                      <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background: item.status==='done'?'rgba(0,212,170,.1)':item.status==='upcoming'?'rgba(99,102,241,.1)':'rgba(255,255,255,.05)', color: item.status==='done'?'#00D4AA':item.status==='upcoming'?'#818CF8':'rgba(255,255,255,.35)', fontWeight:600 }}>{item.status==='done'?'IN FORCE':item.status==='upcoming'?'UPCOMING':'FUTURE'}</span>
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:8 }}>{item.label}</div>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.7, margin:0 }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:'rgba(124,158,255,.08)', border:'1px solid rgba(124,158,255,.2)', borderRadius:14, padding:'20px 22px', marginTop:8 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#7C9EFF', marginBottom:8 }}>UK Position</div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.6)', lineHeight:1.7, margin:0 }}>The UK is not bound by the EU AI Act post-Brexit, but UK businesses selling AI into the EU must comply. The UK government published a Pro-Innovation AI Regulation White Paper in 2023 and is taking a principles-based approach through existing regulators (ICO, FCA, CMA, Ofcom). A standalone UK AI Act is not currently planned.</p>
            </div>
          </div>
        )}

        {/* AI REGISTER TAB */}
        {tab === 'register' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700, color:'#fff', marginBottom:4 }}>AI Systems Register</h2>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.45)' }}>Log all AI systems your organisation uses or deploys — required for EU AI Act high-risk systems.</p>
              </div>
            </div>

            <div style={{ background:'rgba(13,21,37,0.8)', border:'1px solid rgba(255,255,255,.08)', borderRadius:16, padding:'28px 32px', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
              <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:8 }}>AI Register</h3>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.45)', marginBottom:20, lineHeight:1.7, maxWidth:480, margin:'0 auto 20px' }}>Use the Risk Classifier to assess each AI system, then your classifications are stored here. Run the classifier for each AI tool your organisation uses.</p>
              <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={() => { setTab('classifier'); reset() }} style={{ padding:'10px 22px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#00D4AA,#00A882)', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>+ Classify a new AI system</button>
                <a href="/ai" style={{ padding:'10px 22px', borderRadius:8, border:'1px solid rgba(255,255,255,.15)', color:'#fff', fontWeight:600, fontSize:13, textDecoration:'none' }}>Ask AlgoGrass AI →</a>
              </div>

              <div style={{ marginTop:32, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, textAlign:'left' }}>
                {[['📊','Track all AI systems','Maintain an inventory with risk tiers, data processed, and responsible owner'],['⚖️','EU AI Act compliance','Know exactly which obligations apply to each system and when'],['🔔','Stay audit-ready','Document your AI governance for ICO, investors, and enterprise customers']].map(([icon, title, desc]) => (
                  <div key={title} style={{ background:'rgba(255,255,255,.03)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:'16px' }}>
                    <div style={{ fontSize:24, marginBottom:8 }}>{icon}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:6 }}>{title}</div>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.6, margin:0 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
