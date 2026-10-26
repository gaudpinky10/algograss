import { NextResponse } from 'next/server';
import { getCollection, parseUserCookie } from '@/lib/dbHelpers';
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';
import { limitsFor } from '@/lib/apiKeys';

function getUser() {
  try {
    const c = cookies().get('algograss_user');
    return c ? parseUserCookie(c.value) : null;
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
  const users = await getCollection('users');
  const me = users ? await users.findOne({ email: user.email }, { projection: { plan: 1 } }) : null;
  const limit = limitsFor(me?.plan || user.plan).keys;
  if (existing >= limit) return NextResponse.json({ error: `Your plan allows up to ${limit} API key${limit > 1 ? 's' : ''}. Delete an existing key first.` }, { status: 400 });

  const key = `ag_${randomBytes(32).toString('hex')}`;
  const keyPreview = key.slice(-8);
  // Only a hash of the key is stored, like a password: a database leak doesn't leak keys
  await col.insertOne({ userEmail: user.email, keyName: name || `Key ${existing + 1}`, keyHash: createHash('sha256').update(key).digest('hex'), keyPreview, createdAt: new Date(), usageCount: 0, isActive: true });
  return NextResponse.json({ key, keyPreview, message: 'Copy this key now — it will not be shown again.' });
}

export async function DELETE(request) {
  const user = getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { keyId } = await request.json();
  const col = await getCollection('apikeys');
  if (!col) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });
  const { ObjectId } = await import('mongodb');
  if (!ObjectId.isValid(String(keyId))) return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  await col.updateOne({ _id: new ObjectId(String(keyId)), userEmail: user.email }, { $set: { isActive: false, revokedAt: new Date() } });
  return NextResponse.json({ success: true });
}
