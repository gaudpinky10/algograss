/**
 * Vercel Cron Job — runs every day at 8am UTC, scanning each user about once a week
 * Schedule: "0 8 * * *"  (defined in vercel.json)
 *
 * What it does:
 *  1. Fetches all users who have a website set
 *  2. Runs a fresh GDPR scan on each website
 *  3. Compares with their last scan
 *  4. Emails the user if score dropped 5+ points OR new High issue found
 *  5. Always emails if they have no prior scan (first automated scan)
 *  6. Saves result to scan-history
 */

import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/dbHelpers';
import { sendScanMonitorEmail } from '@/lib/emails';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.algograss.com';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes — plenty for sequential scans

export async function GET(request) {
  // Vercel sends this header automatically for cron jobs
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { scanned: 0, emailed: 0, errors: [] };

  try {
    const users = await getCollection('users');
    const scanHistory = await getCollection('scanHistory');
    if (!users) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 });

    // Users with a website, the longest-waiting first. Each scan can take up to
    // a minute, so each run covers a batch, three at a time, within the time
    // limit; the rest are picked up next run.
    // Runs daily; each user is scanned about once a week
    const weekAgo = new Date(Date.now() - 6.5 * 864e5);
    const usersToScan = await users.find({
      website: { $exists: true, $ne: '' },
      $or: [{ lastMonitorScanAt: { $exists: false } }, { lastMonitorScanAt: { $lt: weekAgo } }],
    }).sort({ lastMonitorScanAt: 1 }).limit(12).toArray();
    const integrations = await getCollection('integrations');
    const startedAt = Date.now();

    const scanOne = async (user) => {
      try {
        const website = user.website?.startsWith('http') ? user.website : `https://${user.website}`;

        // Get their most recent scan result
        let previousScore = null;
        let previousHighCount = 0;
        if (scanHistory) {
          const lastScan = await scanHistory.findOne(
            { userEmail: user.email },
            { sort: { scannedAt: -1 } }
          );
          if (lastScan) {
            previousScore = lastScan.score;
            previousHighCount = (lastScan.issues || []).filter(i => i.sev === 'High').length;
          }
        }

        // Run a fresh scan by calling our own API
        const scanRes = await fetch(`${BASE_URL}/api/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-cron-job': 'true' },
          body: JSON.stringify({ url: website }),
          signal: AbortSignal.timeout(62000),
        });
        await users.updateOne({ _id: user._id }, { $set: { lastMonitorScanAt: new Date() } });

        if (!scanRes.ok) {
          results.errors.push(`${user.email}: scan API returned ${scanRes.status}`);
          return;
        }

        const scanResult = await scanRes.json();
        if (!scanResult.score && scanResult.score !== 0) {
          results.errors.push(`${user.email}: no score in scan result`);
          return;
        }

        results.scanned++;

        // Save to history
        if (scanHistory) {
          await scanHistory.insertOne({
            userEmail: user.email,
            url: website,
            score: scanResult.score,
            issues: scanResult.issues || [],
            checks: scanResult.checks || {},
            trackers: scanResult.trackers || [],
            scannedAt: new Date(),
            source: 'cron',
          });
        }

        // Decide whether to email:
        const currentHighCount = (scanResult.issues || []).filter(i => i.sev === 'High').length;
        const scoreDrop = previousScore !== null ? previousScore - scanResult.score : 0;
        const newHighIssues = previousScore !== null && currentHighCount > previousHighCount;
        const firstScan = previousScore === null;
        const significantDrop = scoreDrop >= 5;

        const shouldEmail = firstScan || significantDrop || newHighIssues;
        // Respect the email choices in Settings
        const wantsEmail = user.notifications?.weeklyReport !== false && user.notifications?.scoreDrop !== false;

        // Slack alert, if they connected a channel
        if (shouldEmail && integrations) {
          try {
            const slack = await integrations.findOne({ userEmail: user.email, type: 'slack' });
            if (slack?.webhookUrl?.startsWith('https://hooks.slack.com/')) {
              const high = (scanResult.issues || []).filter(i => i.sev === 'High').map(i => `• ${i.title}`).slice(0, 5).join('\n');
              const headline = firstScan ? `First weekly scan of ${website}: *${scanResult.score}/100*`
                : significantDrop ? `Score for ${website} dropped from ${previousScore} to *${scanResult.score}/100*`
                : `New serious issue on ${website} (score *${scanResult.score}/100*)`;
              await fetch(slack.webhookUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: `🛡️ AlgoGrass: ${headline}${high ? `\nHigh-severity issues:\n${high}` : ''}\n<https://www.algograss.com/dashboard|Open your dashboard>` }),
                signal: AbortSignal.timeout(8000),
              });
              results.slack = (results.slack || 0) + 1;
            }
          } catch (e) { results.errors.push(`${user.email}: slack failed — ${e.message}`); }
        }

        if (shouldEmail && wantsEmail && process.env.RESEND_API_KEY) {
          try {
            await sendScanMonitorEmail(
              user.name || 'there',
              user.email,
              website,
              scanResult,
              previousScore
            );
            results.emailed++;
          } catch (emailErr) {
            results.errors.push(`${user.email}: email failed — ${emailErr.message}`);
          }
        }

      } catch (userErr) {
        results.errors.push(`${user.email}: ${userErr.message}`);
      }
    };

    // Three at a time; stop starting new scans when time is running out
    const queue = [...usersToScan];
    await Promise.all([0, 1, 2].map(async () => {
      while (queue.length && Date.now() - startedAt < 220000) await scanOne(queue.shift());
    }));
    results.remaining = queue.length;

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...results,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
