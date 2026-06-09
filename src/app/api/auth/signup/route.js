import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { name, email, password, plan, website } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const isAdmin = email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase();

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      plan: plan || 'free',
      website: website || '',
      isAdmin,
    });

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      plan: user.plan,
      website: user.website,
      isAdmin: user.isAdmin,
    };

    cookies().set('algograss_user', Buffer.from(JSON.stringify(userData)).toString('base64'), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    // Notify owner via Formspree
    if (process.env.FORMSPREE_ID) {
      try {
        await fetch(`https://formspree.io/f/${process.env.FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _replyto: email,
            _subject: `New AlgoGrass signup: ${name} (${plan || 'free'} plan)`,
            message: `New account created!\n\nName: ${name}\nEmail: ${email}\nPlan: ${plan || 'free'}\nWebsite: ${website || 'Not provided'}\nTime: ${new Date().toLocaleString('en-GB')}`,
          }),
        });
      } catch {}
    }

    return NextResponse.json({ success: true, user: userData });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
  }
}
