'use client'
import { usePathname } from 'next/navigation'

const LINKS = [
  {href:'/',label:'Home'},
  {href:'/scan',label:'🔍 Free scan'},
  {href:'/pricing',label:'Pricing'},
  {href:'/about',label:'About'},
  {href:'/blog',label:'Blog'},
  {href:'/contact',label:'Contact'},
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="nav">
      <a href="/" style={{textDecoration:'none'}}>
        <span className="nav-logo">
          <svg width="24" height="27" viewBox="0 0 32 36" fill="none">
            <path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52"/>
            <path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          AlgoGrass
        </span>
      </a>
      <ul className="nav-menu">
        {LINKS.map(l=>(
          <li key={l.href}>
            <a href={l.href} className={`nav-link ${path===l.href?'active':''}`}>{l.label}</a>
          </li>
        ))}
        <li style={{marginLeft:8}}><a href="/login" className="nav-link">Log in</a></li>
        <li style={{marginLeft:6}}><a href="/signup" className="btn btn-primary btn-sm">Sign up free</a></li>
      </ul>
    </nav>
  )
}
