/**
 * Vercel Cron Job — runs every day at 7am UTC
 * Schedule: "0 7 * * *"  (defined in vercel.json)
 *
 * What it does:
 *  1. Finds users whose trial expires in exactly 3 days → sends warning email
 *  2. Finds users whose trial expired today → sends expired email + downgrades plan to 'free'
 */

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/dbHelpers';
import { sendTrialWarningEmail, sendTrialExpiredEmail } from '@/lib/emails';

export const runtime = 'nodejs';

export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { warned: 0, expired: 0, errors: [] };

  try {
    const users = await getCollection('users');
    if (!users) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    // Warning: trial ends in 3 days
    const warnStart = new Date(todayStart); warnStart.setDate(warnStart.getDate() + 3);
    const warnEnd = new Date(todayEnd); warnEnd.setDate(warnEnd.getDate() + 3);

    // ── 3-day warning ──────────────────────────────────────────────────────────
    const soonExpiring = await users.find({
      plan: { $in: ['pro', 'trial'] },
      trialEndsAt: { $gte: warnStart, $lte: warnEnd },
      trialWarningSent: { $ne: true },
    }).toArray();

    for (const user of soonExpiring) {
      try {
        if (process.env.RESEND_API_KEY) {
          await sendTrialWarningEmail(user.name || 'there', user.email, 3);
          results.warned++;
        }
        await users.updateOne({ _id: user._id }, { $set: { trialWarningSent: true } });
      } catch (err) {
        results.errors.push(`warn ${user.email}: ${err.message}`);
      }
    }

    // ── Trial expired today ────────────────────────────────────────────────────
    const justExpired = await users.find({
      plan: { $in: ['pro', 'trial'] },
      trialEndsAt: { $gte: todayStart, $lte: todayEnd },
    }).toArray();

    for (const user of justExpired) {
      try {
        // Restore to their original plan (trialPlan) or free
        const restoredPlan = user.trialPlan || 'free';
        await users.updateOne(
          { _id: user._id },
          { $set: { plan: restoredPlan, trialExpiredAt: new Date() } }
        );
        if (process.env.RESEND_API_KEY) {
          await sendTrialExpiredEmail(user.name || 'there', user.email);
          results.expired++;
        }
      } catch (err) {
        results.errors.push(`expire ${user.email}: ${err.message}`);
      }
    }

    // ── Also check users on 'pro' with no trialEndsAt — they signed up before
    //    this field existed. Gracefully skip them (don't downgrade).
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...results,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
