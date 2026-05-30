import { cookies } from 'next/headers'

export async function POST(request) {
  const { email, password } = await request.json()
  if (!email || !password) return Response.json({ error: 'Email and password required' }, { status: 400 })

  // Check if user cookie exists already
  const existing = cookies().get('algograss_user')
  if (existing) {
    try {
      const user = JSON.parse(Buffer.from(existing.value, 'base64').toString())
      if (user.email === email) return Response.json({ success: true, user })
    } catch {}
  }

  // Demo login - in production this would check a database
  const user = { name: email.split('@')[0], email, plan: 'growth', createdAt: new Date().toISOString() }
  const encoded = Buffer.from(JSON.stringify(user)).toString('base64')

  cookies().set('algograss_user', encoded, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })

  return Response.json({ success: true, user })
}
