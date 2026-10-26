import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(request) {
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    : 'https://www.algograss.com/api/auth/google/callback'

  if (!clientId) {
    // Google OAuth not configured — redirect to signup with message
    return NextResponse.redirect(new URL('/signup?error=google_not_configured', redirectUri.replace('/api/auth/google/callback', '')))
  }

  // Start on the same host Google will send the visitor back to, so the
  // state cookie below is there when they return
  const back = new URL(redirectUri)
  if (request && new URL(request.url).host !== back.host) return NextResponse.redirect(new URL('/api/auth/google', back.origin))

  // A one-time value checked on the way back, so another site can't log a
  // visitor into an account that isn't theirs (OAuth "state")
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
  res.cookies.set('ag_oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/api/auth/google' })
  return res
}
