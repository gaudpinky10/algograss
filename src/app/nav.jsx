'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const TOOLS = [
  { href: '/scan',          label: 'Website Scanner',     icon: '🔍', desc: 'GDPR compliance scan of any website' },
  { href: '/data-audit',    label: 'Data Audit',          icon: '🗂️', desc: 'CRM, HR, email & vendor compliance' },
  { href: '/complaint',     label: 'Complaint Classifier',icon: '📨', desc: 'Email, WhatsApp, social — any channel' },
  { href: '/dsar',          label: 'DSAR Handler',        icon: '📋', desc: 'Respond to Subject Access Requests' },
  { href: '/ai-governance', label: 'AI Governance',       icon: '🤖', desc: 'AI use case approval & register' },
  { href: '/grc',           label: 'GRC Platform',        icon: '🏛️', desc: 'Risk, policies & incident management' },
  { href: '/reminders',     label: 'Review Reminders',    icon: '🔔', desc: 'Never miss a compliance deadline' },
]
const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/about',   label: 'About' },
  { href: '/blog',    label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const path = usePathname()
  const [toolsOpen, setToolsOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setToolsOpen(false)
    }
    function handleScroll() { setScrolled(window.scrollY > 20) }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('scroll', handleScroll)
    return () => { document.removeEventListener('mousedown', handleClick); window.removeEventListener('scroll', handleScroll) }
  }, [])

  // Close everything on route change
  useEffect(() => { setToolsOpen(false); setMobileOpen(false) }, [path])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <nav className="nav-root" style={{
        position:'fixed', inset:'0 0 auto', zIndex:999,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        height:64,
        background: scrolled ? 'rgba(6,11,20,0.97)' : 'rgba(6,11,20,0.75)',
        backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        transition:'background 0.3s',
        padding:'0 48px',
      }}>
        {/* Logo */}
        <a href="/" style={{textDecoration:'none',flexShrink:0}}>
          <span style={{
            fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20,
            background:'linear-gradient(135deg,#00D4AA,#7C9EFF)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            backgroundClip:'text', display:'flex', alignItems:'center', gap:9,
          }}>
            <svg width="26" height="30" viewBox="0 0 32 36" fill="none">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00D4AA"/><stop offset="100%" stopColor="#7C9EFF"/>
                </linearGradient>
              </defs>
              <path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="url(#lg)" opacity="0.9"/>
              <path d="M10 18 L14 22 L22 14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            AlgoGrass
          </span>
        </a>

        {/* Desktop links */}
        <ul className="nav-links" style={{display:'flex', alignItems:'center', gap:4, listStyle:'none', margin:0, padding:0}}>
          {/* Tools dropdown */}
          <li ref={menuRef} style={{position:'relative'}}>
            <button onClick={()=>setToolsOpen(o=>!o)} style={{
              background:toolsOpen?'rgba(0,212,170,0.1)':'none',
              border:'1px solid', borderColor:toolsOpen?'rgba(0,212,170,0.3)':'transparent',
              cursor:'pointer', fontSize:14, color:toolsOpen?'#00D4AA':'rgba(232,240,254,0.6)',
              fontWeight:500, padding:'6px 12px', borderRadius:8,
              display:'flex', alignItems:'center', gap:5, transition:'all .15s',
              fontFamily:'Space Grotesk,sans-serif',
            }}>
              Tools
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
                style={{transition:'transform .2s', transform:toolsOpen?'rotate(180deg)':'none'}}>
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
            </button>
            {toolsOpen && (
              <div style={{
                position:'absolute', top:'calc(100% + 8px)', left:0,
                background:'rgba(13,21,37,0.97)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:16, padding:'8px',
                boxShadow:'0 16px 48px rgba(0,0,0,.5), 0 0 0 1px rgba(0,212,170,0.1)',
                width:320, zIndex:200, backdropFilter:'blur(20px)',
              }}>
                {TOOLS.map(t=>(
                  <a key={t.href} href={t.href} onClick={()=>setToolsOpen(false)} style={{
                    display:'flex', alignItems:'flex-start', gap:12,
                    padding:'10px 12px', borderRadius:10, textDecoration:'none',
                    background:path===t.href?'rgba(0,212,170,0.08)':'transparent', transition:'background .15s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(0,212,170,0.08)'}
                    onMouseLeave={e=>e.currentTarget.style.background=path===t.href?'rgba(0,212,170,0.08)':'transparent'}>
                    <span style={{fontSize:16, lineHeight:1.4}}>{t.icon}</span>
                    <div>
                      <div style={{fontSize:13, fontWeight:600, color:'#E8F0FE', marginBottom:2}}>{t.label}</div>
                      <div style={{fontSize:11, color:'rgba(232,240,254,0.45)'}}>{t.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </li>

          {NAV_LINKS.map(l=>(
            <li key={l.href}>
              <a href={l.href} style={{
                fontSize:14, color:path===l.href?'#00D4AA':'rgba(232,240,254,0.6)',
                padding:'6px 12px', borderRadius:8, transition:'color .2s, background .2s',
                background:path===l.href?'rgba(0,212,170,0.08)':'transparent',
                fontWeight:path===l.href?500:400,
              }}
                onMouseEnter={e=>{e.currentTarget.style.color='#00D4AA';e.currentTarget.style.background='rgba(0,212,170,0.08)'}}
                onMouseLeave={e=>{e.currentTarget.style.color=path===l.href?'#00D4AA':'rgba(232,240,254,0.6)';e.currentTarget.style.background=path===l.href?'rgba(0,212,170,0.08)':'transparent'}}>
                {l.label}
              </a>
            </li>
          ))}

          <li style={{marginLeft:8}}>
            <a href="/login" style={{fontSize:14, color:'rgba(232,240,254,0.6)', padding:'6px 12px', borderRadius:8, transition:'color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#00D4AA'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(232,240,254,0.6)'}>
              Log in
            </a>
          </li>
          <li style={{marginLeft:4}}>
            <a href="/signup" style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'8px 18px', borderRadius:9, fontSize:13, fontWeight:600,
              background:'linear-gradient(135deg,#00D4AA,#00A882)',
              color:'#06111E', textDecoration:'none',
              boxShadow:'0 0 18px rgba(0,212,170,0.25)', transition:'all .2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 4px 24px rgba(0,212,170,0.4)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 0 18px rgba(0,212,170,0.25)'}}>
              Get started free →
            </a>
          </li>
        </ul>

        {/* Hamburger button — hidden on desktop via CSS */}
        <button
          className="nav-hamburger"
          onClick={()=>setMobileOpen(o=>!o)}
          style={{
            display:'none', /* shown by CSS on mobile */
            flexDirection:'column', justifyContent:'center', alignItems:'center',
            gap:5, background:'none', border:'none', cursor:'pointer', padding:8,
          }}
          aria-label="Toggle menu">
          <span style={{
            display:'block', width:22, height:2, background:'#E8F0FE', borderRadius:2,
            transition:'transform .3s, opacity .3s',
            transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
          }}/>
          <span style={{
            display:'block', width:22, height:2, background:'#E8F0FE', borderRadius:2,
            transition:'opacity .3s',
            opacity: mobileOpen ? 0 : 1,
          }}/>
          <span style={{
            display:'block', width:22, height:2, background:'#E8F0FE', borderRadius:2,
            transition:'transform .3s, opacity .3s',
            transform: mobileOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
          }}/>
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-drawer" onClick={e=>{if(e.target===e.currentTarget)setMobileOpen(false)}}>
          <div className="nav-drawer-divider">Tools</div>
          {TOOLS.map(t=>(
            <a key={t.href} href={t.href} className={`nav-drawer-link${path===t.href?' active':''}`}>
              <span style={{marginRight:10}}>{t.icon}</span>{t.label}
            </a>
          ))}

          <div className="nav-drawer-divider" style={{marginTop:8}}>Pages</div>
          {NAV_LINKS.map(l=>(
            <a key={l.href} href={l.href} className={`nav-drawer-link${path===l.href?' active':''}`}>{l.label}</a>
          ))}
          <a href="/login"  className="nav-drawer-link">Log in</a>
          <a href="/signup" className="nav-drawer-cta">Get started free →</a>
        </div>
      )}
    </>
  )
}
