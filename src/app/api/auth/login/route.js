import { cookies } from 'next/headers'

export async function POST(request) {
  const { email, password } = await request.json()
  if (!email || !password) return Response.json({ error: 'Email and password required' }, { status: 400 })

  const isAdmin = email === (process.env.ADMIN_EMAIL || 'gaudpinky10@gmail.com')

  // Check existing cookie
  const existing = cookies().get('algograss_user')
  if (existing) {
    try {
      const user = JSON.parse(Buffer.from(existing.value, 'base64').toString())
      if (user.email === email) {
        const updated = { ...user, isAdmin }
        cookies().set('algograss_user', Buffer.from(JSON.stringify(updated)).toString('base64'), {
          httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*30, path: '/'
        })
        return Response.json({ success: true, user: updated })
      }
    } catch {}
  }

  const user = { name: email.split('@')[0], email, plan: isAdmin ? 'agency' : 'growth', isAdmin, createdAt: new Date().toISOString() }
  cookies().set('algograss_user', Buffer.from(JSON.stringify(user)).toString('base64'), {
    httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*30, path: '/'
  })
  return Response.json({ success: true, user })
}
