const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

async function probe(url) {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 6000)
    const res = await fetch(url, {
      method: 'HEAD',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      redirect: 'follow',
      cache: 'no-store',
    })
    clearTimeout(t)
    // 2xx, 3xx (after redirect), or 405 Method Not Allowed all mean the site exists
    if (res.status < 500 && res.status !== 404) {
      return res.url || url
    }
  } catch {}
  return null
}

export async function POST(request) {
  const { input } = await request.json()
  if (!input?.trim()) return Response.json({ error: 'Input required' }, { status: 400 })

  // Normalise: strip protocol & leading www & trailing slash/path
  let clean = input.trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]   // drop any path
    .split('?')[0]   // drop query string
    .toLowerCase()

  let candidates = []

  if (clean.includes('.')) {
    // Already has a TLD — just try www and non-www
    candidates = [
      `https://www.${clean}`,
      `https://${clean}`,
      `http://www.${clean}`,
      `http://${clean}`,
    ]
  } else {
    // Just a brand name — try the most popular TLDs in priority order
    const tlds = ['.com', '.co.uk', '.co', '.org', '.net', '.io', '.app', '.ai', '.uk', '.com.au']
    candidates = tlds.flatMap(tld => [
      `https://www.${clean}${tld}`,
      `https://${clean}${tld}`,
    ])
  }

  // Try candidates in parallel batches of 4
  for (let i = 0; i < candidates.length; i += 4) {
    const batch = candidates.slice(i, i + 4)
    const results = await Promise.all(batch.map(probe))
    const found = results.find(Boolean)
    if (found) return Response.json({ resolved: found })
  }

  // Fallback: return the most likely candidate even if probe failed
  return Response.json({ resolved: candidates[0], fallback: true })
}
