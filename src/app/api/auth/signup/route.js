import { cookies } from 'next/headers'

export async function POST(request) {
  const { name, email, password, plan, website } = await request.json()
  if (!name || !email || !password) return Response.json({ error: 'All fields required' }, { status: 400 })
  if (password.length < 8) return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const user = { name, email, plan: plan || 'growth', website: website || '', createdAt: new Date().toISOString() }
  const encoded = Buffer.from(JSON.stringify(user)).toString('base64')

  cookies().set('algograss_user', encoded, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })

  // Save to waitlist/Formspree
  if (process.env.FORMSPREE_ID) {
    try {
      await fetch(`https://formspree.io/f/${process.env.FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, plan, website, source: 'signup' }),
      })
    } catch {}
  }

  return Response.json({ success: true, user })
}
