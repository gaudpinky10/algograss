'use client'
import { useState } from 'react'

const RISK_TIERS = {
  unacceptable: {
    label:'Unacceptable Risk — PROHIBITED',
    color:'#EF4444',
    bg:'rgba(239,68,68,0.1)',
    border:'rgba(239,68,68,0.3)',
    icon:'🚫',
    summary:'Your AI system falls under Article 5 prohibited practices. These are banned in the EU from 2 February 2025.',
    requirements:[
      'This system CANNOT be placed on the EU market or used in the EU',
      'No conformity assessment can make a prohibited system compliant',
      'Prohibited systems include: subliminal manipulation, exploitation of vulnerabilities, social scoring by public authorities, real-time remote biometric identification in public spaces (with narrow exceptions)',
      'Review your system architecture — redesign or withdraw from EU market',
    ]
  },
  high: {
    label:'High Risk (Annex III)',
    color:'#F59E0B',
    bg:'rgba(245,158,11,0.1)',
    border:'rgba(245,158,11,0.3)',
    icon:'⚠',
    summary:'Your system is classified as high-risk under Annex III. Full conformity obligations apply from 2 August 2026.',
    requirements:[
      'Establish a quality management system (QMS) — Art. 17',
      'Technical documentation must be drawn up and kept up to date — Art. 11 + Annex IV',
      'Conformity assessment before market placement — Art. 43',
      'EU Declaration of Conformity — Art. 47',
      'CE marking required for EU market — Art. 48',
      'Register in the EU AI database — Art. 49',
      'Post-market monitoring plan — Art. 72',
      'Incident reporting to market surveillance authorities — Art. 73',
      'Human oversight measures — Art. 14',
      'Fundamental rights impact assessment for deployers in public sector or high-risk contexts — Art. 27',
      'Log retention for traceability — Art. 12',
      'Transparency to users — Art. 13',
    ]
  },
  limited: {
    label:'Limited Risk',
    color:'#F59E0B',
    bg:'rgba(245,158,11,0.07)',
    border:'rgba(245,158,11,0.2)',
    icon:'ℹ',
    summary:'Your system has specific transparency obligations but not full high-risk obligations.',
    requirements:[
      'Chatbots / conversational AI: users must be informed they are interacting with AI — Art. 50(1)',
      'Deepfake images/video/audio: must be labelled as AI-generated — Art. 50(4)',
      'Emotion recognition systems: users must be informed — Art. 50(2)',
      'Biometric categorisation: users must be informed — Art. 50(2)',
      'AI-generated text on matters of public interest: must be machine-readable labelled — Art. 50(3)',
      'Codes of Practice for general-purpose AI — recommended voluntary compliance',
    ]
  },
  minimal: {
    label:'Minimal Risk',
    color:'var(--accent)',
    bg:'rgba(0,212,170,0.07)',
    border:'rgba(0,212,170,0.2)',
    icon:'✅',
    summary:'Your AI system carries minimal risk and has no mandatory EU AI Act obligations beyond general law (GDPR, consumer protection).',
    requirements:[
      'No specific EU AI Act obligations apply',
      'GDPR still applies if personal data is processed by or fed into the AI system',
      'Voluntary codes of conduct are encouraged — Art. 95',
      'Maintain an internal register of AI tools used in your business (best practice)',
      'Review annually as new guidance and delegated acts may reclassify systems',
    ]
  }
}

const QUESTIONS = [
  { id:'q1', text:'Does your AI system use subliminal manipulation techniques, exploit vulnerabilities of specific groups, or perform real-time remote biometric identification of people in publicly accessible spaces?', yes:'unacceptable', no:null },
  { id:'q2', text:'Is your AI system used in any of these areas: biometric identification, critical infrastructure management, education/vocational training (access decisions), employment/HR (CV screening, promotion), essential services (credit, benefits, insurance), law enforcement, migration/asylum, or administration of justice?', yes:'high', no:null },
  { id:'q3', text:'Is your AI system a chatbot, virtual assistant, emotion recognition system, deepfake generator, or AI-generated content tool that interacts with or creates content for the public?', yes:'limited', no:'minimal' },
]

export default function AiGovernancePage() {
  const [step, setStep]     = useState(0)  // 0=intro, 1-3=questions, 4=result
  const [answers, setAnswers] = useState({})
  const [result, setResult]   = useState(null)
  const [aiSystem, setAiSystem] = useState({ name:'', description:'', vendor:'', useCase:'' })
  const [checklist, setChecklist] = useState({})

  function answer(q, val) {
    const newAnswers = { ...answers, [q.id]: val }
    setAnswers(newAnswers)
    const tier = val==='yes' ? q.yes : q.no
    if (tier) { setResult(tier); setStep(4) }
    else if (step < QUESTIONS.length) setStep(step+1)
    else { setResult('minimal'); setStep(4) }
  }

  const currentQ = QUESTIONS[step-1]
  const tier = result ? RISK_TIERS[result] : null

  return (
    <div style={{minHeight:'90vh',background:'var(--bg)'}}>
      <section style={{background:'var(--bg2)',padding:'48px 0 36px',borderBottom:'1px solid var(--border)'}}>
        <div className="wrap">
          <span style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'var(--accent)',display:'block',marginBottom:10}}>EU AI Act 2024/1689</span>
          <h1 style={{fontFamily:'Syne,sans-serif',fontSize:'clamp(24px,3vw,38px)',fontWeight:800,color:'var(--ink)',marginBottom:8}}>AI Governance & EU AI Act Readiness</h1>
          <p style={{fontSize:14,color:'var(--ink2)',maxWidth:580}}>Classify your AI systems under the EU AI Act risk tiers and get the exact compliance requirements for your use case.</p>
        </div>
      </section>

      <section style={{padding:'40px 0 80px'}}>
        <div className="wrap" style={{maxWidth:700}}>

          {step===0&&(
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:32}}>
                {Object.entries(RISK_TIERS).map(([key,t])=>(
                  <div key={key} style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:14,padding:'18px 20px'}}>
                    <div style={{fontSize:24,marginBottom:8}}>{t.icon}</div>
                    <div style={{fontSize:13,fontWeight:700,color:t.color,marginBottom:4}}>{t.label}</div>
                    <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.6}}>{t.summary.slice(0,90)}…</div>
                  </div>
                ))}
              </div>

              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:'24px 28px',marginBottom:24}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:16}}>Your AI system</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                  {[['name','System name','e.g. Customer chatbot'],['vendor','Vendor','e.g. OpenAI, internal']].map(([k,lbl,ph])=>(
                    <div key={k}>
                      <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>{lbl}</label>
                      <input value={aiSystem[k]} onChange={e=>setAiSystem(s=>({...s,[k]:e.target.value}))} placeholder={ph} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',fontSize:13,color:'var(--ink)',outline:'none'}}/>
                    </div>
                  ))}
                </div>
                <div style={{marginBottom:12}}>
                  <label style={{display:'block',fontSize:11,fontWeight:700,color:'var(--ink)',marginBottom:5,textTransform:'uppercase',letterSpacing:'.05em'}}>What does it do?</label>
                  <textarea value={aiSystem.description} onChange={e=>setAiSystem(s=>({...s,description:e.target.value}))} placeholder="Brief description of the AI system's purpose and how it works..." rows={2} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:8,padding:'9px 12px',fontSize:13,color:'var(--ink)',outline:'none',resize:'vertical'}}/>
                </div>
              </div>

              <button onClick={()=>setStep(1)} className="btn btn-primary" style={{width:'100%',padding:'14px'}}>Start EU AI Act classification →</button>
            </>
          )}

          {step>=1&&step<=3&&currentQ&&(
            <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:18,padding:'32px'}}>
              <div style={{display:'flex',gap:6,marginBottom:24}}>
                {QUESTIONS.map((_,i)=>(
                  <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<step?'var(--accent)':'rgba(255,255,255,0.1)'}}/>
                ))}
              </div>
              <div style={{fontSize:11,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:12}}>Question {step} of {QUESTIONS.length}</div>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:700,color:'var(--ink)',lineHeight:1.5,marginBottom:32}}>{currentQ.text}</h2>
              <div style={{display:'flex',gap:14}}>
                <button onClick={()=>answer(currentQ,'no')} style={{flex:1,padding:'16px',background:'rgba(255,255,255,0.04)',border:'1px solid var(--border)',borderRadius:12,fontSize:15,fontWeight:700,color:'var(--ink)',cursor:'pointer'}}>No</button>
                <button onClick={()=>answer(currentQ,'yes')} style={{flex:1,padding:'16px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:12,fontSize:15,fontWeight:700,color:'#EF4444',cursor:'pointer'}}>Yes</button>
              </div>
              {step>1&&<button onClick={()=>setStep(step-1)} style={{marginTop:16,background:'none',border:'none',color:'var(--ink2)',fontSize:12,cursor:'pointer'}}>← Back</button>}
            </div>
          )}

          {step===4&&tier&&(
            <>
              <div style={{background:tier.bg,border:`2px solid ${tier.border}`,borderRadius:18,padding:'28px 32px',marginBottom:24}}>
                <div style={{fontSize:36,marginBottom:12}}>{tier.icon}</div>
                <h2 style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800,color:tier.color,marginBottom:10}}>{tier.label}</h2>
                {aiSystem.name&&<p style={{fontSize:13,color:'var(--ink2)',marginBottom:8}}>System: <strong style={{color:'var(--ink)'}}>{aiSystem.name}</strong></p>}
                <p style={{fontSize:14,color:'var(--ink)',lineHeight:1.7,margin:0}}>{tier.summary}</p>
              </div>

              <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:16,padding:'24px 28px',marginBottom:20}}>
                <h3 style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:16}}>Your compliance requirements</h3>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {tier.requirements.map((r,i)=>{
                    const done = checklist[i]
                    return (
                      <label key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 14px',background:done?'rgba(0,212,170,0.06)':'rgba(255,255,255,0.02)',border:`1px solid ${done?'rgba(0,212,170,0.2)':'var(--border)'}`,borderRadius:9,cursor:'pointer'}}>
                        <input type="checkbox" checked={!!done} onChange={()=>setChecklist(c=>({...c,[i]:!c[i]}))} style={{accentColor:'var(--accent)',marginTop:2,flexShrink:0}}/>
                        <span style={{fontSize:13,color:done?'var(--ink2)':'var(--ink)',lineHeight:1.6,textDecoration:done?'line-through':'none'}}>{r}</span>
                      </label>
                    )
                  })}
                </div>
                <div style={{marginTop:16,fontSize:12,color:'var(--ink2)'}}>
                  {Object.values(checklist).filter(Boolean).length} / {tier.requirements.length} requirements acknowledged
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px'}}>
                  <h4 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:8}}>Key EU AI Act dates</h4>
                  {[['2 Feb 2025','Prohibited AI banned (Art.5)'],['2 Aug 2025','GPAI model obligations'],['2 Aug 2026','High-risk AI obligations fully apply'],['2 Aug 2027','High-risk AI in existing products']].map(([d,t])=>(
                    <div key={d} style={{display:'flex',gap:10,marginBottom:6}}>
                      <span style={{fontSize:11,color:'var(--accent)',fontWeight:700,minWidth:76,flexShrink:0}}>{d}</span>
                      <span style={{fontSize:11,color:'var(--ink2)'}}>{t}</span>
                    </div>
                  ))}
                </div>
                <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:'18px 20px'}}>
                  <h4 style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:700,color:'var(--ink)',marginBottom:8}}>GDPR intersection</h4>
                  <p style={{fontSize:12,color:'var(--ink2)',lineHeight:1.7,margin:0}}>If your AI processes personal data, GDPR also applies. You may need a DPIA (Art.35), lawful basis for training data, and ensure individuals are not subject to solely automated decisions with significant effects without human review (Art.22 GDPR).</p>
                </div>
              </div>

              <div style={{display:'flex',gap:12}}>
                <button onClick={()=>{setStep(0);setResult(null);setAnswers({});setChecklist({})}} className="btn btn-secondary">Classify another system</button>
                <button onClick={()=>{
                  const lines=['EU AI Act Assessment — AlgoGrass','','System: '+(aiSystem.name||'Unnamed'),'Vendor: '+(aiSystem.vendor||'Unknown'),'Classification: '+tier.label,'Date: '+new Date().toLocaleDateString('en-GB'),'','Requirements:']
                  tier.requirements.forEach((r,i)=>lines.push((checklist[i]?'[x] ':'[ ] ')+r))
                  const blob=new Blob([lines.join('\n')],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ai-act-assessment.txt';a.click()
                }} className="btn btn-primary">Download assessment</button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
