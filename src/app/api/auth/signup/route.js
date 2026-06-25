import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection, hashPassword, trackActivity } from '@/lib/dbHelpers';
import { sendWelcomeEmail } from '@/lib/emails';

export async function POST(request) {
  try {
    const { name, email, password, plan, website, refCode } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();

    // 60-day free Pro trial for ALL signups (launch promotion)
    const trialEndsAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const userData = { name, email: email.toLowerCase(), plan: 'pro', website: website || '', isAdmin };

    const users = await getCollection('users');
    if (users) {
      const existing = await users.findOne({ email: email.toLowerCase() });
      if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      const result = await users.insertOne({
        ...userData,
        password: hashPassword(password),
        createdAt: new Date(),
        trialEndsAt,
        trialPlan: plan || 'free', // original plan they chose; restore after trial
        launchPromo: true,
      });
      userData.id = result.insertedId.toString();
    }

    cookies().set('algograss_user', Buffer.from(JSON.stringify(userData)).toString('base64'), {
      httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*30, path: '/'
    });

    await trackActivity({ userEmail: email.toLowerCase(), tool: 'auth', action: 'signup', detail: `New signup — plan: ${plan || 'free'}`, meta: { plan: plan || 'free', website: website || '' } });

    // Send welcome email (non-blocking — don't fail signup if email fails)
    if (process.env.RESEND_API_KEY) {
      sendWelcomeEmail(name, email.toLowerCase(), plan || 'free').catch(err =>
        console.error('Welcome email failed:', err.message)
      );
    }

    // Apply referral code (non-blocking)
    if (refCode) {
      fetch(new URL('/api/referral', request.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUserEmail: email.toLowerCase(), refCode }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    return NextResponse.json({ error: 'Signup failed: ' + err.message }, { status: 500 });
  }
}
