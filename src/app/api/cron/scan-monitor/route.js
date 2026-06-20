/**
 * Vercel Cron Job — runs every Monday at 8am UTC
 * Schedule: "0 8 * * 1"  (defined in vercel.json)
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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.algograss.co.uk';

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

    // Only scan users who have a website on their profile
    const usersToScan = await users.find({
      website: { $exists: true, $ne: '' },
    }).toArray();

    for (const user of usersToScan) {
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
          signal: AbortSignal.timeout(45000),
        });

        if (!scanRes.ok) {
          results.errors.push(`${user.email}: scan API returned ${scanRes.status}`);
          continue;
        }

        const scanResult = await scanRes.json();
        if (!scanResult.score && scanResult.score !== 0) {
          results.errors.push(`${user.email}: no score in scan result`);
          continue;
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

        if (shouldEmail && process.env.RESEND_API_KEY) {
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

        // Small delay between scans to avoid hammering external sites
        await new Promise(r => setTimeout(r, 2000));

      } catch (userErr) {
        results.errors.push(`${user.email}: ${userErr.message}`);
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
