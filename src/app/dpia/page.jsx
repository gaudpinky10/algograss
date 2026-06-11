'use client'
import { useState } from 'react'

const STEPS = [
  { id:1, title:'Project Details',       icon:'📋', desc:'Describe the processing activity' },
  { id:2, title:'Data Mapping',          icon:'🗺️', desc:'What data, why, and how long' },
  { id:3, title:'Necessity Check',       icon:'⚖️', desc:'Is the processing proportionate?' },
  { id:4, title:'Risk Identification',   icon:'⚠️', desc:'Identify privacy risks' },
  { id:5, title:'Risk Mitigation',       icon:'🛡️', desc:'Controls and safeguards' },
  { id:6, title:'Review & Generate',     icon:'✅', desc:'Generate your DPIA document' },
]

const RISK_ITEMS = [
  'Unauthorised access to personal data',
  'Data used beyond original purpose',
  'Inaccurate or incomplete data',
  'Data retention beyond necessary period',
  'Data transferred without adequate safeguards',
  'Individuals unable to exercise their rights',
  'Automated decision-making without human oversight',
  'Re-identification of anonymised data',
  'Third-party processor breach',
  'Loss or destruction of data',
]

const MITIGATIONS = [
  'Encryption at rest and in transit',
  'Access controls and role-based permissions',
  'Staff training on data protection',
  'Data minimisation — only collect what is needed',
  'Regular security testing and penetration tests',
  'Data Processing Agreements with all processors',
  'Privacy by design implemented in system',
  'Anonymisation or pseudonymisation where possible',
  'Regular data audits and deletion schedules',
  'Incident response plan in place',
  'Consent management platform deployed',
  'Data subject rights fulfilment process documented',
]

const field = (label, val, onChange, placeholder='', type='text', required=false) => (
  <div style={{marginBottom:18}}>
    <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--ink)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}{required&&<span style={{color:'var(--red-text)',marginLeft:3}}>*</span>}</label>
    {type==='textarea'
      ? <textarea value={val} onChange={onChange} placeholder={placeholder} rows={3}
          style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px',fontSize:14,color:'var(--ink)',outline:'none',resize:'vertical',fontFamily:'inherit'}}/>
      : <input type={type} value={val} onChange={onChange} placeholder={placeholder}
          style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px',fontSize:14,color:'var(--ink)',outline:'none'}}/>
    }
  </div>
)

const select = (label, val, onChange, options) => (
  <div style={{marginBottom:18}}>
    <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--ink)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</label>
    <select value={val} onChange={onChange} style={{width:'100%',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 14px',fontSize:14,color:'var(--ink)',outline:'none'}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
)

export default function DpiaPage() {
  const [step, setStep]   = useState(1)
  const [form, setForm]   = useState({
    businessName:'', projectName:'', description:'', dataController:'', dpo:'',
    dataTypes:[], otherDataType:'',
    legalBasis:'Consent', purpose:'', recipients:'', retention:'',
    necessity:'', proportionality:'', alternatives:'',
    risks:[], riskNotes:'',
    mitigations:[], residualRisk:'Low', dpoConsultation:'No', consultationNotes:'',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))
  const toggle = (key,val) => setForm(f=>({...f,[key]:f[key].includes(val)?f[key].filter(x=>x!==val):[...f[key],val]}))

  const DATA_TYPES = ['Names & contact details','Email addresses','Financial / payment data','Health or medical data','Biometric data','Location data','Children\'s data','Criminal records','Racial or ethnic origin','Political opinions','Religious beliefs','Sexual orientation','Trade union membership','Genetic data']

  async function generate() {
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/dpia', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          businessName: form.businessName,
          project:      form.projectName,
          purpose:      form.purpose,
          dataTypes:    [...form.dataTypes, form.otherDataType].filter(Boolean).join(', '),
          legalBasis:   form.legalBasis,
          recipients:   form.recipients,
          retention:    form.retention,
          risks:        form.risks.join(', '),
        })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setResult(data.result)
    } catch { setError('Failed to generate DPIA. Please try again.') }
    setLoading(false)
  }

  function downloadDPIA() {
    const blob = new Blob([result], { type:'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `DPIA-${form.projectName||'report'}-${new Date().toISOString().slice(0,10)}.txt`
    a.click(); URL.revokeObjectURL(url)
  }

  const canNext = () => {
    if (step===1) return form.businessName && form.projectName && form.description
    if (step===2) return form.purpose && form.legalBasis
    if (step===3) return form.necessity
    if (step===4) return form.risks.length > 0
    if (step===5) return form.mitigations.length > 0
    return true
  }

  return (
    <div style={{minHeight:'90vh',background:'var(--bg)'}}>
      {/* Header */}
      <section style={{background:'var(--bg2)',padding:'48px 0 36px',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap" style={{maxWidth:800}}>
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--accent)',display:'block',marginBottom:10}}>GDPR Art. 35</span>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(26px,3vw,40px)',fontWeight:800,color:'var(--ink)',marginBottom:10}}>DPIA & Risk Assessment</h1>
          <p style={{fontSize:15,color:'var(--ink2)',lineHeight:1.6}}>Data Protection Impact Assessment wizard — required for high-risk processing under GDPR Article 35. AI-generated, ICO-compliant output.</p>
        </div>
      </section>

      <section style={{padding:'36px 0 80px'}}>
        <div className="wrap" style={{maxWidth:800}}>

          {/* Step indicators */}
          <div style={{display:'flex',gap:0,marginBottom:32,overflowX:'auto',paddingBottom:4}}>
            {STEPS.map((s,i)=>(
              <div key={s.id} style={{display:'flex',alignItems:'center',flex:1,minWidth:80}}>
                <div onClick={()=>s.id<step&&setStep(s.id)} style={{
                  display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 4px',cursor:s.id<step?'pointer':'default',
                  opacity:s.id>step?0.35:1,transition:'opacity .2s',flex:1,
                }}>
                  <div style={{
                    width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,
                    background:s.id<step?'var(--accent)':s.id===step?'rgba(0,212,170,0.15)':'rgba(255,255,255,0.04)',
                    border:s.id===step?'2px solid var(--accent)':'2px solid transparent',
                    color:s.id<step?'#06111E':'var(--ink)',transition:'all .2s',
                  }}>{s.id<step?'✓':s.icon}</div>
                  <span style={{fontSize:10,fontWeight:600,color:s.id===step?'var(--accent)':'var(--ink2)',textAlign:'center',lineHeight:1.3}}>{s.title}</span>
                </div>
                {i<STEPS.length-1&&<div style={{width:20,height:2,background:s.id<step?'var(--accent)':'rgba(255,255,255,0.08)',flexShrink:0,marginBottom:16}}/>}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:18,padding:'32px 36px',marginBottom:20}}>

            {/* Step 1 */}
            {step===1 && <>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:6}}>📋 Project Details</h2>
              <p style={{fontSize:13,color:'var(--ink2)',marginBottom:24}}>Identify the processing activity and who is responsible.</p>
              {field('Business / Organisation name', form.businessName, set('businessName'), 'e.g. Acme Ltd', 'text', true)}
              {field('Project / System name', form.projectName, set('projectName'), 'e.g. Customer CRM Migration', 'text', true)}
              {field('Description of processing activity', form.description, set('description'), 'Describe what personal data will be processed, how, and by whom...', 'textarea', true)}
              {field('Data Controller', form.dataController, set('dataController'), 'Name of the data controller')}
              {field('Data Protection Officer (if applicable)', form.dpo, set('dpo'), 'Name or email of DPO')}
            </>}

            {/* Step 2 */}
            {step===2 && <>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:6}}>🗺️ Data Mapping</h2>
              <p style={{fontSize:13,color:'var(--ink2)',marginBottom:24}}>Map the personal data involved in this processing activity.</p>
              <div style={{marginBottom:18}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'var(--ink)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>Categories of personal data <span style={{color:'var(--red-text)'}}>*</span></label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {DATA_TYPES.map(t=>(
                    <label key={t} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:form.dataTypes.includes(t)?'rgba(0,212,170,0.1)':'rgba(255,255,255,0.02)',border:`1px solid ${form.dataTypes.includes(t)?'rgba(0,212,170,0.4)':'var(--border)'}`,borderRadius:8,cursor:'pointer',transition:'all .15s'}}>
                      <input type="checkbox" checked={form.dataTypes.includes(t)} onChange={()=>toggle('dataTypes',t)} style={{accentColor:'var(--accent)'}}/>
                      <span style={{fontSize:12,color:'var(--ink)'}}>{t}</span>
                    </label>
                  ))}
                </div>
                {field('Other data type (if not listed)', form.otherDataType, set('otherDataType'), 'Describe any other personal data...')}
              </div>
              {select('Lawful basis for processing', form.legalBasis, set('legalBasis'), ['Consent','Contract','Legal obligation','Vital interests','Public task','Legitimate interests'])}
              {field('Purpose of processing', form.purpose, set('purpose'), 'Why is this data being processed?', 'textarea', true)}
              {field('Data recipients / processors', form.recipients, set('recipients'), 'Who will have access to or receive this data?', 'textarea')}
              {field('Retention period', form.retention, set('retention'), 'How long will data be kept? e.g. 6 years, until consent withdrawn')}
            </>}

            {/* Step 3 */}
            {step===3 && <>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:6}}>⚖️ Necessity & Proportionality</h2>
              <p style={{fontSize:13,color:'var(--ink2)',marginBottom:24}}>Assess whether the processing is necessary and proportionate to the purpose.</p>
              {field('Why is this processing necessary?', form.necessity, set('necessity'), 'Explain why the processing is needed to achieve the stated purpose...', 'textarea', true)}
              {field('Is the processing proportionate to the purpose?', form.proportionality, set('proportionality'), 'Could a less privacy-intrusive approach achieve the same result?', 'textarea')}
              {field('Have less privacy-intrusive alternatives been considered?', form.alternatives, set('alternatives'), 'Describe any alternatives that were considered and why they were rejected...', 'textarea')}
              <div style={{background:'rgba(0,212,170,0.07)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:12,padding:'14px 18px',marginTop:8}}>
                <p style={{fontSize:12,color:'var(--accent)',margin:0,lineHeight:1.6}}><strong>ICO guidance:</strong> Processing is proportionate if it is adequate, relevant, and limited to what is necessary in relation to the purposes for which it is processed (GDPR Art. 5(1)(c)).</p>
              </div>
            </>}

            {/* Step 4 */}
            {step===4 && <>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:6}}>⚠️ Risk Identification</h2>
              <p style={{fontSize:13,color:'var(--ink2)',marginBottom:24}}>Identify all privacy risks that could arise from this processing activity.</p>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                {RISK_ITEMS.map(r=>(
                  <label key={r} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:form.risks.includes(r)?'rgba(239,68,68,0.08)':'rgba(255,255,255,0.02)',border:`1px solid ${form.risks.includes(r)?'rgba(239,68,68,0.3)':'var(--border)'}`,borderRadius:10,cursor:'pointer',transition:'all .15s'}}>
                    <input type="checkbox" checked={form.risks.includes(r)} onChange={()=>toggle('risks',r)} style={{accentColor:'#EF4444',flexShrink:0}}/>
                    <span style={{fontSize:13,color:'var(--ink)'}}>{r}</span>
                  </label>
                ))}
              </div>
              {field('Additional risk notes', form.riskNotes, set('riskNotes'), 'Describe any other risks specific to this processing activity...', 'textarea')}
              {form.risks.length>0&&<div style={{background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:10,padding:'12px 16px'}}>
                <p style={{fontSize:12,color:'var(--amber-text)',margin:0}}><strong>{form.risks.length} risk{form.risks.length!==1?'s':''} identified.</strong> You will address these with mitigation controls in the next step.</p>
              </div>}
            </>}

            {/* Step 5 */}
            {step===5 && <>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:6}}>🛡️ Risk Mitigation</h2>
              <p style={{fontSize:13,color:'var(--ink2)',marginBottom:24}}>Select the controls and safeguards you will implement to address the identified risks.</p>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
                {MITIGATIONS.map(m=>(
                  <label key={m} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:form.mitigations.includes(m)?'rgba(0,212,170,0.08)':'rgba(255,255,255,0.02)',border:`1px solid ${form.mitigations.includes(m)?'rgba(0,212,170,0.3)':'var(--border)'}`,borderRadius:10,cursor:'pointer',transition:'all .15s'}}>
                    <input type="checkbox" checked={form.mitigations.includes(m)} onChange={()=>toggle('mitigations',m)} style={{accentColor:'var(--accent)',flexShrink:0}}/>
                    <span style={{fontSize:13,color:'var(--ink)'}}>{m}</span>
                  </label>
                ))}
              </div>
              {select('Residual risk level (after controls)', form.residualRisk, set('residualRisk'), ['Low','Medium','High'])}
              {select('DPO consultation required?', form.dpoConsultation, set('dpoConsultation'), ['No','Yes — DPO consulted','Yes — DPO consultation pending'])}
              {form.dpoConsultation!=='No'&&field('DPO consultation notes', form.consultationNotes, set('consultationNotes'), 'Summary of DPO advice or recommendations...', 'textarea')}
            </>}

            {/* Step 6 */}
            {step===6 && <>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:6}}>✅ Review & Generate DPIA</h2>
              <p style={{fontSize:13,color:'var(--ink2)',marginBottom:24}}>Review your inputs and generate the complete AI-written DPIA document.</p>

              {/* Summary */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
                {[
                  ['Project',      form.projectName],
                  ['Organisation', form.businessName],
                  ['Legal basis',  form.legalBasis],
                  ['Data types',   form.dataTypes.length + (form.otherDataType?' + 1':'') + ' categories'],
                  ['Risks found',  form.risks.length + ' identified'],
                  ['Controls',     form.mitigations.length + ' selected'],
                  ['Residual risk',form.residualRisk],
                  ['DPO consult',  form.dpoConsultation],
                ].map(([k,v])=>(
                  <div key={k} style={{background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px'}}>
                    <div style={{fontSize:10,fontWeight:700,color:'var(--ink2)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{k}</div>
                    <div style={{fontSize:13,color:'var(--ink)',fontWeight:500}}>{v||'—'}</div>
                  </div>
                ))}
              </div>

              {form.residualRisk==='High'&&(
                <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,padding:'14px 18px',marginBottom:20}}>
                  <p style={{fontSize:13,color:'var(--red-text)',margin:0,fontWeight:600}}>⚠️ High residual risk — ICO prior consultation required</p>
                  <p style={{fontSize:12,color:'var(--red-text)',margin:'4px 0 0',opacity:.8}}>Under GDPR Article 36, you must consult the ICO before proceeding with this processing if residual risk remains high.</p>
                </div>
              )}

              {!result ? (
                <button onClick={generate} disabled={loading} className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:15,fontWeight:700}}>
                  {loading?'Generating DPIA document…':'Generate DPIA Document →'}
                </button>
              ) : (
                <div>
                  <div style={{background:'rgba(0,212,170,0.06)',border:'1px solid rgba(0,212,170,0.2)',borderRadius:12,padding:'20px',marginBottom:16,maxHeight:320,overflowY:'auto'}}>
                    <pre style={{fontSize:12,color:'var(--ink2)',lineHeight:1.7,whiteSpace:'pre-wrap',fontFamily:'inherit'}}>{result}</pre>
                  </div>
                  <div style={{display:'flex',gap:10}}>
                    <button onClick={downloadDPIA} className="btn btn-primary" style={{flex:1,fontSize:14}}>⬇ Download DPIA (.txt)</button>
                    <button onClick={()=>setResult(null)} className="btn btn-secondary" style={{fontSize:14}}>Regenerate</button>
                  </div>
                </div>
              )}
              {error&&<p style={{fontSize:13,color:'var(--red-text)',marginTop:12,textAlign:'center'}}>{error}</p>}
            </>}
          </div>

          {/* Nav buttons */}
          <div style={{display:'flex',justifyContent:'space-between',gap:12}}>
            <button onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1} className="btn btn-secondary" style={{opacity:step===1?.3:1}}>← Back</button>
            {step<6
              ? <button onClick={()=>setStep(s=>s+1)} disabled={!canNext()} className="btn btn-primary" style={{opacity:canNext()?1:.35}}>Next step →</button>
              : null
            }
          </div>
        </div>
      </section>
    </div>
  )
}
