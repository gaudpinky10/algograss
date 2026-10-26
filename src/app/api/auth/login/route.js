import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection, checkPassword, hashPassword, needsRehash, trackActivity, createSessionValue, sessionCookieOptions, SESSION_COOKIE } from '@/lib/dbHelpers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();

    // Accounts are only ever checked against the database. (There used to be a
    // fallback that logged anyone in when the database was down, and an admin
    // account was created on first login: both let a stranger in.)
    const users = await getCollection('users');
    if (!users) return NextResponse.json({ error: 'Login is temporarily unavailable. Please try again in a minute.' }, { status: 503 });

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user || !checkPassword(password, user.password)) {
      if (user) await trackActivity({ userEmail: email.toLowerCase(), tool: 'auth', action: 'login_failed', detail: 'Wrong password' });
      // Same message either way, so the form doesn't reveal which emails have accounts
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }
    // Older accounts: re-save the password with the stronger hash
    if (needsRehash(user.password)) await users.updateOne({ _id: user._id }, { $set: { password: hashPassword(password) } }).catch(() => {});

    const userData = { id: user._id.toString(), name: user.name, email: user.email, plan: user.plan, website: user.website || '', isAdmin: user.isAdmin || isAdmin };

    cookies().set(SESSION_COOKIE, createSessionValue(userData), sessionCookieOptions());

    await trackActivity({ userEmail: userData.email, tool: 'auth', action: 'login', detail: 'Login successful', meta: { plan: userData.plan } });

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    console.error('Login error:', err.message);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
