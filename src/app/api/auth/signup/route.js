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

  // Notify owner via Formspree
  const formspreeId = process.env.FORMSPREE_ID
  if (formspreeId) {
    try {
      await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _replyto: email,
          _subject: `New AlgoGrass account: ${name} (${plan || 'growth'} plan)`,
          message: `New account created!\n\nName: ${name}\nEmail: ${email}\nPlan: ${plan || 'growth'}\nWebsite: ${website || 'Not provided'}\nTime: ${new Date().toLocaleString('en-GB')}`,
        }),
      })
    } catch {}
  }

  return Response.json({ success: true, user })
}
