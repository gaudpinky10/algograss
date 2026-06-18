import { NextResponse } from 'next/server'
import { getCollection, hashPassword } from '@/lib/dbHelpers'

export async function POST(request) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const resets = await getCollection('password_resets')
    if (!resets) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

    const record = await resets.findOne({ token })
    if (!record) return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 })
    if (new Date() > new Date(record.expires)) {
      await resets.deleteOne({ token })
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 })
    }

    // Update the password
    const users = await getCollection('users')
    await users.updateOne(
      { email: record.email },
      { $set: { password: hashPassword(password), updatedAt: new Date() } }
    )

    // Delete used token
    await resets.deleteOne({ token })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err.message)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
