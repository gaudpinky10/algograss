import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import ScanHistory from '@/models/ScanHistory';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('algograss_user');
    if (!userCookie) return Response.json({ scans: [] });

    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString());
    if (!user?.id) return Response.json({ scans: [] });

    await connectDB();
    const scans = await ScanHistory.find({ userId: user.id })
      .sort({ scannedAt: -1 })
      .limit(50);

    return Response.json({ scans });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const cookieStore = cookies();
    const userCookie = cookieStore.get('algograss_user');
    if (!userCookie) return Response.json({ error: 'Not logged in' }, { status: 401 });

    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString());
    await connectDB();
    await ScanHistory.deleteOne({ _id: id, userId: user.id });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
