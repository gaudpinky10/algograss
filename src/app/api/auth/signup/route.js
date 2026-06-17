import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection, hashPassword, trackActivity } from '@/lib/dbHelpers';

export async function POST(request) {
  try {
    const { name, email, password, plan, website } = await request.json();
    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();
    const userData = { name, email: email.toLowerCase(), plan: plan || 'free', website: website || '', isAdmin };

    const users = await getCollection('users');
    if (users) {
      const existing = await users.findOne({ email: email.toLowerCase() });
      if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      const result = await users.insertOne({ ...userData, password: hashPassword(password), createdAt: new Date() });
      userData.id = result.insertedId.toString();
    }

    cookies().set('algograss_user', Buffer.from(JSON.stringify(userData)).toString('base64'), {
      httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*30, path: '/'
    });

    await trackActivity({ userEmail: email.toLowerCase(), tool: 'auth', action: 'signup', detail: `New signup — plan: ${plan || 'free'}`, meta: { plan: plan || 'free', website: website || '' } });

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    return NextResponse.json({ error: 'Signup failed: ' + err.message }, { status: 500 });
  }
}
