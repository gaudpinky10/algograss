'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Fires on every page view — sends visitor data to /api/track
// Lightweight: ~1kb, deferred 1.5s after load so it never blocks rendering
export default function VisitorTracker() {
  const pathname    = usePathname()
  const sessionRef  = useRef(null)
  const sentRef     = useRef(new Set())

  // Stable session ID for this browser tab session
  function getSessionId() {
    if (sessionRef.current) return sessionRef.current
    try {
      let sid = sessionStorage.getItem('ag_sid')
      if (!sid) {
        sid = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8)
        sessionStorage.setItem('ag_sid', sid)
      }
      sessionRef.current = sid
      return sid
    } catch { return 'no_session' }
  }

  // Stable visitor ID (persists across sessions in localStorage)
  function getVisitorId() {
    try {
      let vid = localStorage.getItem('ag_vid')
      if (!vid) {
        vid = 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,10)
        localStorage.setItem('ag_vid', vid)
      }
      return vid
    } catch { return 'no_visitor' }
  }

  useEffect(() => {
    const key = pathname + '_' + Date.now().toString().slice(0,-3) // dedupe within same second
    if (sentRef.current.has(pathname)) return
    sentRef.current.add(pathname)

    const timer = setTimeout(() => {
      const payload = {
        page:      pathname,
        referrer:  document.referrer || '',
        title:     document.title || '',
        sessionId: getSessionId(),
        visitorId: getVisitorId(),
        screen:    `${window.screen.width}x${window.screen.height}`,
        lang:      navigator.language || '',
        tz:        Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        ua:        navigator.userAgent,
      }

      // Use sendBeacon so it survives page unload too
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', JSON.stringify(payload))
      } else {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {})
      }
    }, 1500) // defer 1.5s — never blocks first render

    return () => clearTimeout(timer)
  }, [pathname])

  return null // renders nothing
}
