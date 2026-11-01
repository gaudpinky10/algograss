import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL || 'https://www.algograss.com'
  const redirectUri = `${appUrl}/api/auth/google/callback`

  if (!clientId) {
    const loginUrl = new URL('/login', appUrl)
    loginUrl.searchParams.set('error', 'google_not_configured')
    return NextResponse.redirect(loginUrl.toString())
  }

  const state = randomBytes(24).toString('base64url')
  const params = new URLSearchParams({
    state,
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  })

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  res.cookies.set('ag_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return res
}
