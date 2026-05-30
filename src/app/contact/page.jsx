'use client'
import { useState } from 'react'
export default function ContactPage() {
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''})
  const [status,setStatus]=useState('idle')
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}))
  async function submit(e){e.preventDefault();setStatus('loading');await new Promise(r=>setTimeout(r,900));setStatus('sent')}
  return (
    <section className="section">
      <div className="wrap" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:72}}>
        <div>
          <span className="eyebrow">Contact Us</span>
          <h1 className="heading" style={{fontSize:'clamp(28px,3vw,44px)',marginBottom:14}}>Get in touch</h1>
          <p className="subtext" style={{marginBottom:40}}>Have a question about compliance, our product, or pricing? We respond within one business day.</p>
          <div style={{display:'flex',flexDirection:'column',gap:20,marginBottom:36}}>
            {[{icon:'✉',label:'Email',val:'hello@algograss.ltd',href:'mailto:hello@algograss.ltd'},{icon:'📍',label:'Location',val:'United Kingdom'},{icon:'🕐',label:'Support hours',val:'Mon–Fri, 9am–6pm GMT'}].map(({icon,label,val,href})=>(
              <div key={label} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:40,height:40,borderRadius:10,background:'var(--green-p)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{icon}</div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--ink2)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>{label}</div>
                  {href?<a href={href} style={{fontSize:14,color:'var(--green)'}}>{val}</a>:<div style={{fontSize:14,color:'var(--ink)'}}>{val}</div>}
                </div>
              </div>
            ))}
          </div>
          <div style={{background:'var(--green-p)',border:'1px solid var(--green-m)',borderRadius:14,padding:'20px 22px'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:14,fontWeight:600,color:'var(--green)',marginBottom:6}}>Looking for pricing?</div>
            <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.6,marginBottom:14}}>Plans start at £29/month. Your first scan is completely free — no card needed.</p>
            <a href="/pricing" className="btn btn-primary btn-sm">See pricing →</a>
          </div>
        </div>
        <div className="card" style={{padding:36}}>
          {status==='sent'?(
            <div style={{textAlign:'center',padding:'52px 0'}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'var(--green-p)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,margin:'0 auto 18px'}}>✓</div>
              <h3 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--green)',marginBottom:9}}>Message sent!</h3>
              <p style={{fontSize:14,color:'var(--ink2)',marginBottom:24,lineHeight:1.6}}>We will get back to you within one business day.</p>
              <button onClick={()=>{setStatus('idle');setForm({name:'',email:'',subject:'',message:''})}} className="btn btn-secondary btn-sm">Send another message</button>
            </div>
          ):(
            <form onSubmit={submit}>
              <h2 style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:700,color:'var(--ink)',marginBottom:22}}>Send a message</h2>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                <div><label className="field-label">Your name *</label><input className="field-input" placeholder="Jane Smith" value={form.name} onChange={set('name')} required/></div>
                <div><label className="field-label">Email address *</label><input className="field-input" type="email" placeholder="jane@company.com" value={form.email} onChange={set('email')} required/></div>
              </div>
              <div className="field-wrap">
                <label className="field-label">Subject *</label>
                <select className="field-input" value={form.subject} onChange={set('subject')} required>
                  <option value="">Select a topic...</option>
                  <option>General enquiry</option><option>Sales and pricing</option><option>Technical support</option><option>Partnership</option><option>Press and media</option>
                </select>
              </div>
              <div className="field-wrap">
                <label className="field-label">Message *</label>
                <textarea className="field-input" rows={5} placeholder="How can we help?" value={form.message} onChange={set('message')} required style={{resize:'vertical'}}/>
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={status==='loading'}>{status==='loading'?'Sending...':'Send message →'}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
