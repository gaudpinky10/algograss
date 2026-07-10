import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/dbHelpers'
import { randomBytes } from 'crypto'
import { Resend } from 'resend'

export async function POST(request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const users = await getCollection('users')
    if (!users) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

    const user = await users.findOne({ email: email.toLowerCase() })
    // Always return success even if email not found — security best practice
    if (!user) return NextResponse.json({ success: true })

    // Generate secure reset token
    const token   = randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in DB
    const resets = await getCollection('password_resets')
    await resets.deleteMany({ email: email.toLowerCase() }) // clear old tokens
    await resets.insertOne({ email: email.toLowerCase(), token, expires, createdAt: new Date() })

    // Send reset email via Resend
    const base = process.env.NEXT_PUBLIC_URL || 'https://www.algograss.com'
    const resetLink = `${base}/reset-password?token=${token}`

    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from:    'AlgoGrass <noreply@algograss.co.uk>',
      to:      email,
      subject: 'Reset your AlgoGrass password',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#060B14;color:#0F172A;padding:40px 32px;border-radius:16px">
          <div style="text-align:center;margin-bottom:28px">
            <span style="font-size:32px">🔒</span>
            <h1 style="font-size:22px;font-weight:800;color:#0EA5E9;margin:12px 0 4px">Password Reset</h1>
            <p style="font-size:13px;color:#64748B;margin:0">AlgoGrass Compliance Platform</p>
          </div>
          <p style="font-size:14px;color:#94A3B8;margin-bottom:8px">Hi ${user.name || email.split('@')[0]},</p>
          <p style="font-size:14px;color:#94A3B8;margin-bottom:24px">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong style="color:#0F172A">1 hour</strong>.</p>
          <div style="text-align:center;margin-bottom:24px">
            <a href="${resetLink}" style="display:inline-block;background:#0EA5E9;color:#060B14;font-weight:700;font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none">Reset my password →</a>
          </div>
          <p style="font-size:12px;color:#475569;margin-bottom:4px">Or paste this link into your browser:</p>
          <p style="font-size:11px;color:#475569;word-break:break-all;margin-bottom:24px">${resetLink}</p>
          <hr style="border:none;border-top:1px solid rgba(15,23,42,0.09);margin-bottom:20px"/>
          <p style="font-size:11px;color:#475569;margin:0">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err.message)
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
  }
}
