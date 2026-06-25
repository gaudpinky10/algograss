import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/dbHelpers';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { name, completedAt } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  try {
    const col = await getCollection('certificates');
    const cookieStore = cookies();
    const userCookie = cookieStore.get('algograss_user');
    const user = userCookie ? JSON.parse(Buffer.from(userCookie.value, 'base64').toString()) : null;
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    if (col) await col.insertOne({ certificateId, name, userEmail: user?.email || 'anonymous', completedAt: completedAt || new Date().toISOString(), issuedAt: new Date(), type: 'GDPR Staff Awareness Training', modulesCompleted: 5 });
    return NextResponse.json({ success: true, certificateId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
