import { NextResponse } from 'next/server';
import { getCollection, parseUserCookie } from '@/lib/dbHelpers';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function POST(request) {
  const { scanResult } = await request.json();
  if (!scanResult) return NextResponse.json({ error: 'scanResult required' }, { status: 400 });
  try {
    const col = await getCollection('sharedReports');
    if (!col) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });
    const cookieStore = cookies();
    const userCookie = cookieStore.get('algograss_user');
    const user = userCookie ? parseUserCookie(userCookie.value) : null;
    const token = randomBytes(18).toString('base64url'); // unguessable
    await col.insertOne({ token, scanResult, userEmail: user?.email || 'anonymous', createdAt: new Date(), viewCount: 0, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.algograss.com';
    return NextResponse.json({ token, shareUrl: `${base}/share/${token}` });
  } catch (err) {
    console.error('share:', err.message);
    return NextResponse.json({ error: 'Could not create a share link. Please try again.' }, { status: 500 });
  }
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });
  try {
    const col = await getCollection('sharedReports');
    if (!col) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const report = await col.findOneAndUpdate({ token, expiresAt: { $gt: new Date() } }, { $inc: { viewCount: 1 } }, { returnDocument: 'after' });
    if (!report) return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 });
    return NextResponse.json({ scanResult: report.scanResult, viewCount: report.viewCount, createdAt: report.createdAt });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
