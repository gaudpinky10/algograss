import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection, hashPassword, trackActivity, createSessionValue, sessionCookieOptions, SESSION_COOKIE } from '@/lib/dbHelpers';

export async function POST(request) {
  try {
    const { name, email, password, plan, website, refCode } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });

    const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();

    // 60-day free Pro trial for ALL signups (launch promotion)
    const trialEndsAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    const userData = { name, email: email.toLowerCase(), plan: 'pro', website: website || '', isAdmin };

    const users = await getCollection('users');
    // No account can be created without the database (it would not exist at next login)
    if (!users) return NextResponse.json({ error: 'Sign-up is temporarily unavailable. Please try again in a minute.' }, { status: 503 });
    {
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

    cookies().set(SESSION_COOKIE, createSessionValue(userData), sessionCookieOptions());

    await trackActivity({ userEmail: email.toLowerCase(), tool: 'auth', action: 'signup', detail: `New signup — plan: ${plan || 'free'}`, meta: { plan: plan || 'free', website: website || '' } });

    // Send welcome email (non-blocking — don't fail signup if email/Resend fails)
    if (process.env.RESEND_API_KEY) {
      import('@/lib/emails').then(({ sendWelcomeEmail }) =>
        sendWelcomeEmail(name, email.toLowerCase(), plan || 'free')
      ).catch(err => console.error('Welcome email failed:', err.message));
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
    console.error('Signup error:', err.message);
    return NextResponse.json({ error: 'Sign-up failed. Please try again.' }, { status: 500 });
  }
}
