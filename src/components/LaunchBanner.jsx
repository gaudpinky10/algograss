'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { b64utf8 } from '@/lib/clientSession'

// Sign-up offer strip under the navigation bar. Not shown to people who are
// already logged in, or on pages that already make the same offer.
const HIDDEN_ON = ['/pricing', '/signup', '/login', '/dashboard', '/forgot-password', '/reset-password']

function loggedIn() {
  try {
    const c = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('algograss_user='))
    if (!c) return false
    const u = JSON.parse(b64utf8(decodeURIComponent(c.slice(c.indexOf('=') + 1))))
    return !!u?.email && !(typeof u.exp === 'number' && Date.now() > u.exp)
  } catch { return false }
}

export default function LaunchBanner() {
  const path = usePathname()
  const [show, setShow] = useState(false)
  useEffect(() => { setShow(!loggedIn() && !HIDDEN_ON.some(p => path === p || path.startsWith(p + '/'))) }, [path])
  if (!show) return null
  return (
    <div style={{ background: 'linear-gradient(90deg,rgba(139,92,246,0.15),rgba(124,158,255,0.1))', borderBottom: '1px solid rgba(139,92,246,0.2)', padding: '9px 16px', textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: '#FFFFFF', letterSpacing: '.01em', margin: 0, fontWeight: 500 }}>
        🚀 <span style={{ color: '#9B7BFA', fontWeight: 700 }}>Launch offer:</span> Sign up free and get <strong>60 days full Pro access</strong>. No credit card needed.{' '}
        <a href="/signup" style={{ color: '#C084FC', fontWeight: 700, textDecoration: 'none' }}>Claim it →</a>
      </p>
    </div>
  )
}
