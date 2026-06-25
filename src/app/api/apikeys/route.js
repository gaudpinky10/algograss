import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/dbHelpers';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

function getUser() {
  try {
    const c = cookies().get('algograss_user');
    return c ? JSON.parse(Buffer.from(c.value, 'base64').toString()) : null;
  } catch { return null; }
}

export async function GET() {
  const user = getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const col = await getCollection('apikeys');
  if (!col) return NextResponse.json({ keys: [] });
  const keys = await col.find({ userEmail: user.email, isActive: true }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({ keys: keys.map(k => ({ ...k, key: undefined, preview: `••••••••${k.keyPreview}` })) });
}

export async function POST(request) {
  const user = getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { name } = await request.json().catch(() => ({}));
  const col = await getCollection('apikeys');
  if (!col) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

  const existing = await col.countDocuments({ userEmail: user.email, isActive: true });
  const limit = user.plan === 'pro' ? 10 : user.plan === 'starter' ? 3 : 1;
  if (existing >= limit) return NextResponse.json({ error: `Your plan allows up to ${limit} API key${limit > 1 ? 's' : ''}. Delete an existing key first.` }, { status: 400 });

  const key = `ag_${randomBytes(32).toString('hex')}`;
  const keyPreview = key.slice(-8);
  await col.insertOne({ userEmail: user.email, keyName: name || `Key ${existing + 1}`, key, keyPreview, createdAt: new Date(), usageCount: 0, isActive: true });
  return NextResponse.json({ key, keyPreview, message: 'Copy this key now — it will not be shown again.' });
}

export async function DELETE(request) {
  const user = getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { keyId } = await request.json();
  const col = await getCollection('apikeys');
  if (!col) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });
  const { ObjectId } = await import('mongodb');
  await col.updateOne({ _id: new ObjectId(keyId), userEmail: user.email }, { $set: { isActive: false, revokedAt: new Date() } });
  return NextResponse.json({ success: true });
}
