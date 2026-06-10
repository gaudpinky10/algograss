import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection, checkPassword } from '@/lib/dbHelpers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();
    let userData = null;

    const users = await getCollection('users');
    if (users) {
      const user = await users.findOne({ email: email.toLowerCase() });
      if (!user) return NextResponse.json({ error: 'No account found with this email' }, { status: 401 });
      if (!checkPassword(password, user.password)) return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      userData = { id: user._id.toString(), name: user.name, email: user.email, plan: user.plan, website: user.website || '', isAdmin: user.isAdmin };
    } else {
      // No DB — cookie-only fallback
      userData = { name: email.split('@')[0], email: email.toLowerCase(), plan: isAdmin ? 'agency' : 'growth', isAdmin };
    }

    cookies().set('algograss_user', Buffer.from(JSON.stringify(userData)).toString('base64'), {
      httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*30, path: '/'
    });

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    return NextResponse.json({ error: 'Login failed: ' + err.message }, { status: 500 });
  }
}
