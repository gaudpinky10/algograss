import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/dbHelpers';
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
  const col = await getCollection('integrations');
  if (!col) return NextResponse.json({ webhookUrl: null });
  const doc = await col.findOne({ userEmail: user.email, type: 'slack' });
  return NextResponse.json({ configured: !!doc, webhookUrl: doc ? '••••••••' + doc.webhookUrl.slice(-20) : null });
}

export async function POST(request) {
  const user = getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { webhookUrl, test } = await request.json();

  if (!webhookUrl || !webhookUrl.startsWith('https://hooks.slack.com/')) {
    return NextResponse.json({ error: 'Invalid Slack webhook URL. Must start with https://hooks.slack.com/' }, { status: 400 });
  }

  if (test) {
    try {
      const r = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: '✅ *AlgoGrass Slack integration is working!*\nYou will receive weekly compliance scan reports and alerts in this channel.',
          blocks: [{ type: 'section', text: { type: 'mrkdwn', text: '✅ *AlgoGrass Slack integration is working!*\n\nYou\'ll receive:\n• Weekly GDPR compliance scan reports\n• Score drop alerts\n• Regulatory change digests\n\nVisit <https://algograss.co.uk/dashboard|your dashboard> to manage settings.' } }],
        }),
      });
      if (!r.ok) throw new Error('Slack returned an error');
    } catch (err) {
      return NextResponse.json({ error: 'Could not send test message: ' + err.message }, { status: 400 });
    }
  }

  const col = await getCollection('integrations');
  if (col) {
    await col.updateOne(
      { userEmail: user.email, type: 'slack' },
      { $set: { userEmail: user.email, type: 'slack', webhookUrl, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true, message: test ? 'Test message sent to Slack!' : 'Slack integration saved.' });
}
