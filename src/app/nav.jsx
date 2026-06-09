'use client'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

const TOOLS = [
  { href: '/scan', label: '🔍 Website Scanner', desc: 'GDPR compliance scan of any website' },
  { href: '/data-audit', label: '🗂️ Data Audit', desc: 'CRM, HR, email & vendor compliance' },
  { href: '/complaint', label: '📨 Complaint Classifier', desc: 'Email, WhatsApp, social — any channel' },
  { href: '/dsar', label: '📋 DSAR Handler', desc: 'Respond to Subject Access Requests' },
  { href: '/ai-governance', label: '🤖 AI Governance', desc: 'AI use case approval & register' },
  { href: '/grc', label: '🏛️ GRC Platform', desc: 'Risk, policies & incident management' },
  { href: '/reminders', label: '🔔 Review Reminders', desc: 'Never miss a compliance deadline' },
]

export default function Nav() {
  const path = usePathname()
  const [toolsOpen, setToolsOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close dropdown on route change
  useEffect(() => { setToolsOpen(false) }, [path])

  return (
    <nav className="nav" style={{ position: 'relative', zIndex: 100 }}>
      <a href="/" style={{ textDecoration: 'none' }}>
        <span className="nav-logo">
          <svg width="24" height="27" viewBox="0 0 32 36" fill="none">
            <path d="M16 0 L32 6 L32 20 Q32 30 16 36 Q0 30 0 20 L0 6 Z" fill="#3D6B52" />
            <path d="M10 18 L14 22 L22 14" stroke="#B8D96A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          AlgoGrass
        </span>
      </a>
      <ul className="nav-menu">
        <li ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setToolsOpen(o => !o)}
            style={{
              background: toolsOpen ? 'var(--green-p)' : 'none',
              border: 'none', cursor: 'pointer', fontSize: 14,
              color: toolsOpen ? 'var(--green)' : 'var(--ink2)',
              fontWeight: 500, padding: '6px 12px', borderRadius: 7,
              display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s'
            }}>
            Tools
            <span style={{ fontSize: 10, transition: 'transform .2s', display: 'inline-block', transform: toolsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
          </button>

          {toolsOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,.12)',
              width: 310, zIndex: 200
            }}>
              {TOOLS.map(t => (
                <a key={t.href} href={t.href}
                  onClick={() => setToolsOpen(false)}
                  style={{
                    display: 'block', padding: '10px 12px', borderRadius: 8,
                    textDecoration: 'none',
                    background: path === t.href ? 'var(--green-p)' : 'transparent',
                    transition: 'background .15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--green-p)'}
                  onMouseLeave={e => e.currentTarget.style.background = path === t.href ? 'var(--green-p)' : 'transparent'}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{t.desc}</div>
                </a>
              ))}
            </div>
          )}
        </li>

        {[{ href: '/pricing', label: 'Pricing' }, { href: '/about', label: 'About' }, { href: '/blog', label: 'Blog' }, { href: '/contact', label: 'Contact' }].map(l => (
          <li key={l.href}><a href={l.href} className={`nav-link ${path === l.href ? 'active' : ''}`}>{l.label}</a></li>
        ))}
        <li style={{ marginLeft: 8 }}><a href="/login" className="nav-link">Log in</a></li>
        <li style={{ marginLeft: 6 }}><a href="/signup" className="btn btn-primary btn-sm">Sign up free</a></li>
      </ul>
    </nav>
  )
}
