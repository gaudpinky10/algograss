import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
// Run on every request: a build-time copy would reuse one OAuth state for every visitor
export const dynamic = 'force-dynamic'

export async function GET(request) {
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
  // Keep a referral code through the Google round trip, so the referrer is credited
  const ref = new URL(request.url).searchParams.get('ref')
  if (ref && ref.length < 400) res.cookies.set('ag_ref', ref, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return res
}
