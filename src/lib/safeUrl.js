// Stops the scanner from being pointed at addresses inside our own hosting
// (localhost, private networks, cloud metadata services). Only public
// http(s) websites can be scanned.
import { lookup } from 'dns/promises'
import { isIP } from 'net'

const BLOCKED_HOST = /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.lan|metadata\.google\.internal)$/i

export function isPrivateIp(ip) {
  if (!ip) return true
  let a = String(ip).toLowerCase()
  if (a.startsWith('::ffff:')) a = a.slice(7) // IPv4-mapped IPv6
  if (isIP(a) === 4) {
    const [p, q] = a.split('.').map(Number)
    return p === 10 || p === 127 || p === 0 ||
      (p === 169 && q === 254) ||           // link-local, cloud metadata
      (p === 172 && q >= 16 && q <= 31) ||
      (p === 192 && q === 168) ||
      (p === 100 && q >= 64 && q <= 127) ||  // carrier-grade NAT
      (p === 192 && q === 0) || p >= 224    // reserved, multicast
  }
  if (isIP(a) === 6) {
    return a === '::1' || a === '::' || a.startsWith('fc') || a.startsWith('fd') || a.startsWith('fe8') || a.startsWith('fe9') || a.startsWith('fea') || a.startsWith('feb')
  }
  return true
}

// Quick check without DNS (for URLs requested inside the browser)
export function isBlockedHostname(hostname) {
  const h = String(hostname || '').replace(/^\[|\]$/g, '')
  if (!h || BLOCKED_HOST.test(h)) return true
  return isIP(h) ? isPrivateIp(h) : false
}

// Full check: scheme, hostname and every address it resolves to
export async function isPublicHttpUrl(url) {
  let u
  try { u = new URL(url) } catch { return false }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
  if (u.username || u.password) return false
  if (isBlockedHostname(u.hostname)) return false
  if (isIP(u.hostname.replace(/^\[|\]$/g, ''))) return true
  try {
    const addrs = await lookup(u.hostname, { all: true, verbatim: true })
    return addrs.length > 0 && addrs.every(a => !isPrivateIp(a.address))
  } catch {
    return true // DNS failure: the fetch itself will fail and report "could not reach"
  }
}
