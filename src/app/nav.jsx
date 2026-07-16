'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const TOOLS = [
  { href: '/scan',                 label: 'Website Scanner',        icon: '🔍', desc: 'GDPR compliance scan of any website' },
  { href: '/dpia',                 label: 'DPIA Automation',        icon: '📊', desc: 'Data Protection Impact Assessment wizard' },
  { href: '/vendor-risk',          label: 'Vendor Risk Reviews',    icon: '🏢', desc: 'Third-party processor risk & DPA tracking' },
  { href: '/regulatory-monitor',   label: 'Regulatory Monitor',     icon: '📡', desc: 'GDPR, UK GDPR & EU AI Act updates' },
  { href: '/grc',                  label: 'GRC Platform',           icon: '🏛️', desc: '20 core GDPR controls dashboard' },
  { href: '/ai-governance',        label: 'AI Governance',          icon: '🤖', desc: 'EU AI Act risk classification wizard' },
  { href: '/dsar',                 label: 'DSAR Handler',           icon: '📋', desc: 'Respond to Subject Access Requests' },
  { href: '/data-audit',           label: 'Data Audit',             icon: '🗂️', desc: 'CRM, HR, email & vendor compliance' },
  { href: '/complaint',            label: 'Complaint Classifier',   icon: '📨', desc: 'Email, WhatsApp, social — any channel' },
  { href: '/reminders',            label: 'Review Reminders',       icon: '🔔', desc: 'Never miss a compliance deadline' },
  { href: '/breach',               label: 'Breach Notification',    icon: '🚨', desc: '72-hour ICO breach notification tool' },
  { href: '/training',             label: 'GDPR Training',          icon: '🎓', desc: 'Staff awareness training & certificates' },
  { href: '/integrations',         label: 'Integrations',           icon: '🔗', desc: 'Slack, Zapier & third-party connections' },
  { href: '/api-access',           label: 'Developer API',          icon: '🔌', desc: 'API keys & documentation for developers' },
]
const NAV_LINKS = [
  { href: '/ai',          label: '✦ AI Assistant', highlight: true },
  { href: '/pricing',     label: 'Pricing' },
  { href: '/about',       label: 'About' },
  { href: '/blog',        label: 'Blog' },
  { href: '/contact',     label: 'Contact' },
  { href: '/referral',    label: '🎁 Refer & Earn' },
  { href: '/security',    label: 'Security' },
  { href: '/settings',    label: 'Settings' },
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
        background: scrolled ? 'rgba(6,6,15,0.97)' : 'rgba(6,6,15,0.75)',
        backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)',
        transition:'background 0.3s',
        padding:'0 48px',
      }}>
        {/* Logo */}
        <a href="/" style={{textDecoration:'none',flexShrink:0}}>
          <img src="/logo.png" alt="AlgoGrass" style={{height:36, width:'auto', display:'block'}} />
        </a>

        {/* Desktop links */}
        <ul className="nav-links" style={{display:'flex', alignItems:'center', gap:4, listStyle:'none', margin:0, padding:0}}>
          {/* Tools dropdown */}
          <li ref={menuRef} style={{position:'relative'}}>
            <button onClick={()=>setToolsOpen(o=>!o)} style={{
              background:toolsOpen?'rgba(139,92,246,0.1)':'none',
              border:'1px solid', borderColor:toolsOpen?'rgba(139,92,246,0.3)':'transparent',
              cursor:'pointer', fontSize:14, color:toolsOpen?'#9B7BFA':'#94A3B8',
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
                background:'rgba(9,9,20,0.97)', border:'1px solid rgba(255,255,255,0.09)',
                borderRadius:16, padding:'8px',
                boxShadow:'0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.12)',
                width:320, zIndex:200, backdropFilter:'blur(20px)',
              }}>
                {TOOLS.map(t=>(
                  <a key={t.href} href={t.href} onClick={()=>setToolsOpen(false)} style={{
                    display:'flex', alignItems:'flex-start', gap:12,
                    padding:'10px 12px', borderRadius:10, textDecoration:'none',
                    background:path===t.href?'rgba(139,92,246,0.08)':'transparent', transition:'background .15s',
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(139,92,246,0.08)'}
                    onMouseLeave={e=>e.currentTarget.style.background=path===t.href?'rgba(139,92,246,0.08)':'transparent'}>
                    <span style={{fontSize:16, lineHeight:1.4}}>{t.icon}</span>
                    <div>
                      <div style={{fontSize:13, fontWeight:600, color:'#FFFFFF', marginBottom:2}}>{t.label}</div>
                      <div style={{fontSize:11, color:'#64748B'}}>{t.desc}</div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </li>

          {NAV_LINKS.map(l=>(
            <li key={l.href}>
              <a href={l.href} style={{
                fontSize:14,
                color: l.highlight ? '#9B7BFA' : path===l.href?'#9B7BFA':'#94A3B8',
                padding:'6px 12px', borderRadius:8, transition:'color .2s, background .2s',
                background: l.highlight ? 'rgba(139,92,246,0.08)' : path===l.href?'rgba(139,92,246,0.08)':'transparent',
                border: l.highlight ? '1px solid rgba(139,92,246,0.25)' : '1px solid transparent',
                fontWeight: l.highlight ? 600 : 400,
                fontWeight:path===l.href?500:400,
              }}
                onMouseEnter={e=>{e.currentTarget.style.color='#9B7BFA';e.currentTarget.style.background='rgba(139,92,246,0.08)'}}
                onMouseLeave={e=>{e.currentTarget.style.color=path===l.href?'#9B7BFA':'#94A3B8';e.currentTarget.style.background=path===l.href?'rgba(139,92,246,0.08)':'transparent'}}>
                {l.label}
              </a>
            </li>
          ))}

          <li style={{marginLeft:8}}>
            <a href="/login" style={{fontSize:14, color:'#94A3B8', padding:'6px 12px', borderRadius:8, transition:'color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#9B7BFA'}
              onMouseLeave={e=>e.currentTarget.style.color='#94A3B8'}>
              Log in
            </a>
          </li>
          <li style={{marginLeft:4}}>
            <a href="/signup" style={{
              display:'inline-flex', alignItems:'center', gap:6,
              padding:'8px 18px', borderRadius:9, fontSize:13, fontWeight:600,
              background:'linear-gradient(135deg,#9B7BFA,#7C3AED)',
              color:'#FFFFFF', textDecoration:'none',
              boxShadow:'0 0 18px rgba(139,92,246,0.25)', transition:'all .2s',
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 4px 24px rgba(139,92,246,0.4)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 0 18px rgba(139,92,246,0.25)'}}>
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
            display:'block', width:22, height:2, background:'#FFFFFF', borderRadius:2,
            transition:'transform .3s, opacity .3s',
            transform: mobileOpen ? 'translateY(7px) rotate(45deg)' : 'none',
          }}/>
          <span style={{
            display:'block', width:22, height:2, background:'#FFFFFF', borderRadius:2,
            transition:'opacity .3s',
            opacity: mobileOpen ? 0 : 1,
          }}/>
          <span style={{
            display:'block', width:22, height:2, background:'#FFFFFF', borderRadius:2,
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
