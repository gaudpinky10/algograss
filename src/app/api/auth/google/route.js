import { NextResponse } from 'next/server'

export async function GET() {
  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    : 'https://algograss.co.uk/api/auth/google/callback'

  if (!clientId) {
    // Google OAuth not configured — redirect to signup with message
    return NextResponse.redirect(new URL('/signup?error=google_not_configured', redirectUri.replace('/api/auth/google/callback', '')))
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'online',
    prompt:        'select_account',
  })

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
