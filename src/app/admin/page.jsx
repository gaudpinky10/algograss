'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function getUser() {
  try { const c=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('algograss_user=')); return c?JSON.parse(atob(c.split('=')[1])):null } catch { return null }
}

export default function AdminHub() {
  const router=useRouter()
  const user=typeof window!=='undefined'?getUser():null

  useEffect(()=>{
    const u=getUser()
    if(!u){router.push('/login');return}
    // Auto-redirect based on role
    if(u.role==='founder'){router.push('/admin/founder');return}
    if(u.role==='developer'||u.isAdmin){router.push('/admin/developer');return}
    router.push('/dashboard')
  },[])

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:28}}>
      <h1 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,color:'var(--ink)'}}>AlgoGrass Admin</h1>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16,maxWidth:700,width:'100%',padding:'0 20px',gridAutoRows:'1fr'}}>
        {[
          {href:'/admin/developer',  label:'Developer',  icon:'⚙️',desc:'DB health, errors, API logs, env vars',color:'#818CF8'},
          {href:'/admin/founder',    label:'Founder',    icon:'📈',desc:'User growth, revenue, tool usage, KPIs',color:'#F59E0B'},
          {href:'/admin/co-founder', label:'Co-Founder', icon:'🤝',desc:'Business overview, users, activity',color:'#EC4899'},
          {href:'/admin/database',   label:'Database',   icon:'🗄️',desc:'Collections, indexes, schema, initialize DB',color:'#34D399'},
          {href:'/admin/visitors',   label:'Visitors',   icon:'👁️',desc:'Live visitor intelligence — pages, countries, devices',color:'#7C9EFF'},
          {href:'/dashboard',        label:'User',       icon:'🛡️',desc:'Personal compliance tools and history',color:'var(--accent)'},
        ].map(p=>(
          <a key={p.href} href={p.href} style={{background:'var(--bg2)',border:`1px solid ${p.color}30`,borderRadius:16,padding:'24px 20px',textDecoration:'none',textAlign:'center',transition:'border-color .2s'}}>
            <div style={{fontSize:32,marginBottom:12}}>{p.icon}</div>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:16,fontWeight:700,color:p.color,marginBottom:6}}>{p.label}</div>
            <div style={{fontSize:12,color:'var(--ink2)',lineHeight:1.5}}>{p.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
