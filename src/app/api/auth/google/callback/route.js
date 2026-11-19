import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCollection, trackActivity, createSessionValue, sessionCookieOptions, SESSION_COOKIE } from '@/lib/dbHelpers'
import { timingSafeEqual } from 'crypto'
import { creditReferral } from '@/lib/referral'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.algograss.com'

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`)
  }

  // The state must match the one set when the login started
  const state = searchParams.get('state') || ''
  const expected = cookies().get('ag_oauth_state')?.value || ''
  const refCookie = cookies().get('ag_ref')?.value || '' // read before it is cleared below
  cookies().set('ag_oauth_state', '', { maxAge: 0, path: '/' })
  cookies().set('ag_ref', '', { maxAge: 0, path: '/' })
  if (!state || !expected || state.length !== expected.length || !timingSafeEqual(Buffer.from(state), Buffer.from(expected))) {
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`)
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri  = `${appUrl}/api/auth/google/callback`

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/login?error=google_not_configured`)
  }

  try {
    // ── 1. Exchange code for tokens ───────────────────────────
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })
    const tokens = await tokenRes.json()
    if (tokens.error) throw new Error(tokens.error_description || tokens.error)

    // ── 2. Get user info from Google ──────────────────────────
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const googleUser = await infoRes.json()
    if (!googleUser.email) throw new Error('Could not retrieve email from Google')
    if (googleUser.verified_email === false) throw new Error('Google account email is not verified')

    const email = googleUser.email.toLowerCase()
    const name  = googleUser.name || googleUser.email.split('@')[0]
    const avatar = googleUser.picture || ''

    // ── 3. Find or create user in MongoDB ────────────────────
    let userData = { name, email, plan: 'free', isAdmin: false, avatar }

    try {
      const users = await getCollection('users')
      if (users) {
        const existing = await users.findOne({ email })
        if (existing) {
          // Existing user — update Google avatar if not set
          await users.updateOne({ email }, { $set: { avatar, lastGoogleLogin: new Date() } })
          userData = {
            id:      existing._id.toString(),
            name:    existing.name || name,
            email:   existing.email,
            plan:    existing.plan || 'free',
            isAdmin: existing.isAdmin || false,
            avatar,
          }
        } else {
          // New user — create account
          const isAdmin = email === (process.env.ADMIN_EMAIL || '').toLowerCase()
          // Same 60-day free Pro trial as email signups (launch promotion)
          const trialEndsAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
          const result  = await users.insertOne({
            name, email,
            password:    null, // Google users have no password
            plan:        'pro',
            trialEndsAt,
            trialPlan:   'free',
            isAdmin,
            avatar,
            googleId:    googleUser.id,
            createdAt:   new Date(),
            signupMethod: 'google',
          })
          userData = { id: result.insertedId.toString(), name, email, plan: 'pro', isAdmin, avatar }
          await trackActivity({ userEmail: email, tool: 'auth', action: 'signup', detail: 'New signup via Google', meta: { method: 'google' } })
          // Awaited: work left running after the response can be stopped on Vercel
          if (process.env.RESEND_API_KEY) {
            const { sendWelcomeEmail } = await import('@/lib/emails')
            await sendWelcomeEmail(name, email, 'pro').catch(e => console.error('Welcome email failed:', e.message))
          }
          if (refCookie) await creditReferral(email, refCookie).catch(e => console.error('Referral credit failed:', e.message))
        }
      }
    } catch (dbErr) {
      console.error('DB error in Google callback:', dbErr.message)
      // Continue without DB — still set cookie
    }

    // ── 4. Set session cookie ─────────────────────────────────
    cookies().set(SESSION_COOKIE, createSessionValue(userData), sessionCookieOptions())

    await trackActivity({ userEmail: email, tool: 'auth', action: 'login', detail: 'Login via Google OAuth', meta: { method: 'google' } })

    return NextResponse.redirect(`${appUrl}/dashboard`)
  } catch (err) {
    console.error('Google OAuth error:', err.message)
    return NextResponse.redirect(`${appUrl}/login?error=google_failed`)
  }
}
