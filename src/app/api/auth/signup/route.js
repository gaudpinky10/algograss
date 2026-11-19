import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection, hashPassword, trackActivity, createSessionValue, sessionCookieOptions, SESSION_COOKIE } from '@/lib/dbHelpers';
import { creditReferral } from '@/lib/referral';
import { sendWelcomeEmail } from '@/lib/emails';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan, website, refCode } = body;
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
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

    // These run before the response is sent: on Vercel, work left running after
    // the response can be stopped part-way, so the email or credit could be lost.
    // Neither can fail the sign-up.
    if (process.env.RESEND_API_KEY) {
      await sendWelcomeEmail(name, email.toLowerCase(), plan || 'free').catch(err => console.error('Welcome email failed:', err.message));
    }
    if (refCode) await creditReferral(email.toLowerCase(), refCode).catch(err => console.error('Referral credit failed:', err.message));

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    console.error('Signup error:', err.message);
    return NextResponse.json({ error: 'Sign-up failed. Please try again.' }, { status: 500 });
  }
}
