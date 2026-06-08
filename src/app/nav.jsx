'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
        <li style={{ position: 'relative' }}>
          <button
            onMouseEnter={() => setToolsOpen(true)}
            onMouseLeave={() => setToolsOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--ink2)', fontWeight: 500, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            Tools ▾
          </button>
          {toolsOpen && (
            <div
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
              style={{ position: 'absolute', top: '100%', left: 0, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 14, padding: '8px', boxShadow: '0 8px 32px rgba(0,0,0,.12)', width: 300, marginTop: 8, zIndex: 200 }}>
              {TOOLS.map(t => (
                <a key={t.href} href={t.href}
                  style={{ display: 'block', padding: '10px 12px', borderRadius: 8, textDecoration: 'none', background: path === t.href ? 'var(--green-p)' : 'transparent', transition: 'background .15s' }}
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
