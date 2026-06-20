/**
 * Vercel Cron Job — runs every Friday at 9am UTC
 * Schedule: "0 9 * * 5"  (defined in vercel.json)
 *
 * What it does:
 *  1. Pulls knowledge base entries added in the last 7 days
 *  2. If any new entries exist, emails all Pro users a weekly digest
 */

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/dbHelpers';
import { sendRegulatoryAlertEmail } from '@/lib/emails';

export const runtime = 'nodejs';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { updatesFound: 0, emailed: 0, errors: [] };

  try {
    const kb = await getCollection('knowledgeBase');
    const users = await getCollection('users');
    if (!kb || !users) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    // Fetch updates from the past 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentUpdates = await kb.find({
      createdAt: { $gte: oneWeekAgo },
    }).sort({ createdAt: -1 }).limit(10).toArray();

    results.updatesFound = recentUpdates.length;

    // Only send if there are new updates
    if (recentUpdates.length === 0) {
      return NextResponse.json({ ok: true, message: 'No new updates this week', ...results });
    }

    // Format updates for the email
    const updates = recentUpdates.map(u => ({
      title: u.title || u.question || 'New regulatory update',
      summary: u.summary || u.answer?.slice(0, 200) || u.content?.slice(0, 200) || '',
      type: u.type || u.category || 'UPDATE',
      url: u.url || u.source || null,
    }));

    // Get all Pro users who haven't opted out of regulatory alerts
    const proUsers = await users.find({
      plan: { $in: ['pro', 'starter'] },
      regulatoryAlertsOptOut: { $ne: true },
    }).toArray();

    for (const user of proUsers) {
      try {
        if (process.env.RESEND_API_KEY) {
          await sendRegulatoryAlertEmail(user.name || 'there', user.email, updates);
          results.emailed++;
        }
        // Small delay to avoid hitting Resend rate limits
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        results.errors.push(`${user.email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...results,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
