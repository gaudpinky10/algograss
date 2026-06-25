import { NextResponse } from 'next/server';
import { getCollection, hashPassword, checkPassword } from '@/lib/dbHelpers';
import { cookies } from 'next/headers';

function getUser() {
  try {
    const c = cookies().get('algograss_user');
    return c ? JSON.parse(Buffer.from(c.value, 'base64').toString()) : null;
  } catch { return null; }
}

export async function GET() {
  const user = getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const col = await getCollection('users');
  if (!col) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });
  const u = await col.findOne({ email: user.email }, { projection: { password: 0 } });
  return NextResponse.json({ settings: u || user });
}

export async function PATCH(request) {
  const user = getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const body = await request.json();
  const { name, website, brandName, brandLogo, brandColor, removeBranding, notifications, action, currentPassword, newPassword } = body;

  const col = await getCollection('users');
  if (!col) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

  if (action === 'change-password') {
    const u = await col.findOne({ email: user.email });
    if (!u || !checkPassword(currentPassword, u.password)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }
    if (!newPassword || newPassword.length < 8) return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    await col.updateOne({ email: user.email }, { $set: { password: hashPassword(newPassword), passwordChangedAt: new Date() } });
    return NextResponse.json({ success: true });
  }

  const update = { updatedAt: new Date() };
  if (name !== undefined) update.name = name;
  if (website !== undefined) update.website = website;
  if (brandName !== undefined) update.brandName = brandName;
  if (brandLogo !== undefined) update.brandLogo = brandLogo;
  if (brandColor !== undefined) update.brandColor = brandColor;
  if (removeBranding !== undefined) update.removeBranding = removeBranding;
  if (notifications !== undefined) update.notifications = notifications;

  await col.updateOne({ email: user.email }, { $set: update });
  return NextResponse.json({ success: true });
}
