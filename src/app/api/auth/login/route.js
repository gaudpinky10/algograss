import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCollection, checkPassword, hashPassword, trackActivity } from '@/lib/dbHelpers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });

    const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();
    let userData = null;

    const users = await getCollection('users');
    if (users) {
      const user = await users.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Auto-create admin account on first login if ADMIN_EMAIL matches
        if (isAdmin) {
          const result = await users.insertOne({ name: 'Admin', email: email.toLowerCase(), password: hashPassword(password), plan: 'agency', isAdmin: true, createdAt: new Date() });
          userData = { id: result.insertedId.toString(), name: 'Admin', email: email.toLowerCase(), plan: 'agency', isAdmin: true };
        } else {
          return NextResponse.json({ error: 'No account found with this email. Please sign up first.' }, { status: 401 });
        }
      } else {
        if (!checkPassword(password, user.password)) {
          await trackActivity({ userEmail: email.toLowerCase(), tool: 'auth', action: 'login_failed', detail: 'Wrong password' });
          return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }
        userData = { id: user._id.toString(), name: user.name, email: user.email, plan: user.plan, website: user.website || '', isAdmin: user.isAdmin || isAdmin };
      }
    } else {
      // No DB — cookie-only fallback (works without MongoDB)
      userData = { name: email.split('@')[0], email: email.toLowerCase(), plan: isAdmin ? 'agency' : 'growth', isAdmin };
    }

    cookies().set('algograss_user', Buffer.from(JSON.stringify(userData)).toString('base64'), {
      httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 60*60*24*30, path: '/'
    });

    await trackActivity({ userEmail: userData.email, tool: 'auth', action: 'login', detail: 'Login successful', meta: { plan: userData.plan } });

    return NextResponse.json({ success: true, user: userData });
  } catch (err) {
    return NextResponse.json({ error: 'Login failed: ' + err.message }, { status: 500 });
  }
}
