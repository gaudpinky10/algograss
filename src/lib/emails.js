/**
 * AlgoGrass — Branded Email Templates
 * Used by all cron jobs and automated notifications.
 */

import { Resend } from 'resend';

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_ADDRESS = 'AlgoGrass <hello@algograss.com>';
const REPORTS_ADDRESS = 'AlgoGrass Reports <reports@algograss.com>';

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function layout(body, previewText = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;">${previewText}</div>` : ''}
</head>
<body style="margin:0;padding:0;background:#060B14;font-family:'Segoe UI',Arial,sans-serif">
<div style="max-width:640px;margin:0 auto;background:#060B14">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0D1525 0%,#0a1628 100%);padding:28px 40px;border-bottom:1px solid #1e2d45">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:30px;height:30px;background:linear-gradient(135deg,#00D4AA,#7C9EFF);border-radius:8px;display:inline-flex;align-items:center;justify-content:center">
        <span style="color:white;font-weight:800;font-size:13px">AG</span>
      </div>
      <span style="color:#00D4AA;font-weight:800;font-size:17px;vertical-align:middle">AlgoGrass</span>
    </div>
  </div>

  <!-- Body -->
  ${body}

  <!-- Footer -->
  <div style="padding:20px 40px;border-top:1px solid #1e2d45;text-align:center">
    <p style="color:#475569;font-size:11px;margin:0;line-height:1.7">
      AlgoGrass · Automated GDPR Compliance · <a href="https://algograss.co.uk" style="color:#00D4AA;text-decoration:none">algograss.co.uk</a><br>
      You're receiving this because you have an AlgoGrass account.
    </p>
  </div>

</div>
</body>
</html>`;
}

// ─── Button helper ─────────────────────────────────────────────────────────────
function btn(label, href) {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#00D4AA,#00A882);color:#06111E;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">${label}</a>`;
}

// ─── Score badge helper ────────────────────────────────────────────────────────
function scoreBadge(score) {
  const color = score >= 70 ? '#00D4AA' : score >= 40 ? '#F59E0B' : '#EF4444';
  const label = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'At Risk';
  return { color, label };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. WELCOME EMAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(name, email, plan = 'free') {
  const resend = getResend();
  const html = layout(`
    <div style="padding:36px 40px;background:#0D1525;border-bottom:1px solid #1e2d45">
      <h1 style="color:#E8F0FE;font-size:24px;font-weight:700;margin:0 0 8px">Welcome to AlgoGrass, ${name.split(' ')[0]}! 🎉</h1>
      <p style="color:#94A3B8;font-size:14px;margin:0">Your GDPR compliance command centre is ready.</p>
    </div>

    <div style="padding:32px 40px;background:#060B14">
      <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 24px">
        Here's everything you can do right now to get GDPR-ready in minutes:
      </p>

      <div style="background:#0D1525;border:1px solid #1e2d45;border-radius:12px;overflow:hidden;margin-bottom:24px">
        ${[
          ['🔍', 'Scan your website', 'Get your real-time GDPR compliance score — instant results.', 'https://algograss.co.uk/scan'],
          ['📄', 'Generate documents', 'Auto-generate your Privacy Policy, Cookie Notice & DPA from your scan.', 'https://algograss.co.uk/generate'],
          ['🤖', 'Ask AlgoGrass AI', 'Get instant answers to any GDPR or UK data protection question.', 'https://algograss.co.uk/ai-chat'],
          ['📋', 'Set up your GRC', 'Build your GDPR compliance register and track your obligations.', 'https://algograss.co.uk/grc'],
        ].map(([icon, title, desc, link]) => `
          <div style="padding:16px 20px;border-bottom:1px solid #1e2d45">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td style="width:36px;vertical-align:top;padding-top:2px">
                <span style="font-size:20px">${icon}</span>
              </td>
              <td style="vertical-align:top;padding-left:12px">
                <a href="${link}" style="color:#00D4AA;font-weight:600;font-size:13px;text-decoration:none">${title} →</a>
                <p style="color:#64748B;font-size:12px;margin:3px 0 0;line-height:1.5">${desc}</p>
              </td>
            </tr></table>
          </div>`).join('')}
      </div>

      ${plan === 'free' ? `
      <div style="background:linear-gradient(135deg,rgba(0,212,170,0.08),rgba(124,158,255,0.08));border:1px solid rgba(0,212,170,0.2);border-radius:12px;padding:24px;text-align:center">
        <p style="color:#E8F0FE;font-size:14px;font-weight:600;margin:0 0 6px">Upgrade to Pro for full automation</p>
        <p style="color:#94A3B8;font-size:12px;margin:0 0 16px">Weekly scan monitoring, automated alerts, document vault, and more.</p>
        ${btn('Start 30-day free trial', 'https://algograss.co.uk/pricing')}
      </div>` : `
      <div style="background:linear-gradient(135deg,rgba(0,212,170,0.08),rgba(124,158,255,0.08));border:1px solid rgba(0,212,170,0.2);border-radius:12px;padding:24px;text-align:center">
        <p style="color:#00D4AA;font-size:14px;font-weight:600;margin:0 0 16px">✅ Pro plan active — all automations enabled</p>
        ${btn('Go to dashboard', 'https://algograss.co.uk/dashboard')}
      </div>`}
    </div>
  `, `Welcome to AlgoGrass, ${name.split(' ')[0]}!`);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `Welcome to AlgoGrass, ${name.split(' ')[0]}! Your GDPR compliance centre is ready`,
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WEEKLY SCAN REPORT (automated monitoring)
// ─────────────────────────────────────────────────────────────────────────────
export async function sendScanMonitorEmail(name, email, websiteUrl, currentResult, previousScore) {
  const resend = getResend();
  const sc = currentResult.score;
  const { color, label } = scoreBadge(sc);
  const dropped = previousScore !== null && sc < previousScore;
  const improved = previousScore !== null && sc > previousScore;
  const diff = previousScore !== null ? Math.abs(sc - previousScore) : null;

  const highIssues = (currentResult.issues || []).filter(i => i.sev === 'High');
  const medIssues = (currentResult.issues || []).filter(i => i.sev === 'Medium');

  const html = layout(`
    <div style="padding:28px 40px;background:#0D1525;border-bottom:1px solid #1e2d45">
      <p style="color:#64748B;font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Weekly Scan Report</p>
      <h1 style="color:#E8F0FE;font-size:22px;font-weight:700;margin:0 0 6px">
        ${dropped ? '⚠️ Your compliance score dropped' : improved ? '📈 Your compliance score improved' : '📊 Your weekly compliance report'}
      </h1>
      <p style="color:#64748B;font-size:13px;margin:0">${websiteUrl} · ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <!-- Score -->
    <div style="padding:28px 40px;background:#060B14;border-bottom:1px solid #1e2d45;text-align:center">
      <div style="font-size:56px;font-weight:800;color:${color};line-height:1">${sc}</div>
      <div style="margin:8px 0">
        <span style="display:inline-block;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:700;background:${color}20;color:${color}">${label}</span>
        ${diff !== null ? `<span style="margin-left:10px;font-size:13px;color:${dropped ? '#EF4444' : '#00D4AA'}">${dropped ? '▼' : '▲'} ${diff} pts from last week</span>` : ''}
      </div>
    </div>

    <div style="padding:28px 40px;background:#060B14">
      ${highIssues.length > 0 ? `
      <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="color:#EF4444;font-weight:700;font-size:13px;margin:0 0 12px">🚨 ${highIssues.length} High-severity issue${highIssues.length > 1 ? 's' : ''} require attention</p>
        ${highIssues.map(i => `<p style="color:#CBD5E1;font-size:13px;margin:0 0 6px">• <strong>${i.title}</strong> — ${i.desc}</p>`).join('')}
      </div>` : ''}

      ${medIssues.length > 0 ? `
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:20px;margin-bottom:20px">
        <p style="color:#F59E0B;font-weight:700;font-size:13px;margin:0 0 12px">⚠️ ${medIssues.length} Medium-severity issue${medIssues.length > 1 ? 's' : ''}</p>
        ${medIssues.map(i => `<p style="color:#CBD5E1;font-size:13px;margin:0 0 6px">• <strong>${i.title}</strong> — ${i.desc}</p>`).join('')}
      </div>` : ''}

      ${highIssues.length === 0 && medIssues.length === 0 ? `
      <div style="background:rgba(0,212,170,0.08);border:1px solid rgba(0,212,170,0.2);border-radius:12px;padding:20px;margin-bottom:20px;text-align:center">
        <p style="color:#00D4AA;font-size:14px;font-weight:600;margin:0">✅ No critical issues found this week — great work!</p>
      </div>` : ''}

      <div style="text-align:center;margin-top:24px">
        ${btn('View full report & fix issues', 'https://algograss.co.uk/scan')}
      </div>
    </div>
  `, `Your GDPR score: ${sc}/100 for ${websiteUrl}`);

  return resend.emails.send({
    from: REPORTS_ADDRESS,
    to: email,
    subject: `${dropped ? '⚠️ Score dropped' : '📊 Weekly report'}: ${websiteUrl} — ${sc}/100 (${label})`,
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TRIAL EXPIRY WARNING
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTrialWarningEmail(name, email, daysLeft) {
  const resend = getResend();
  const html = layout(`
    <div style="padding:32px 40px;background:#0D1525;border-bottom:1px solid #1e2d45">
      <h1 style="color:#F59E0B;font-size:22px;font-weight:700;margin:0 0 8px">⏰ Your free trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}</h1>
      <p style="color:#94A3B8;font-size:14px;margin:0">Don't lose access to your GDPR compliance tools.</p>
    </div>
    <div style="padding:32px 40px;background:#060B14">
      <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 24px">
        Hi ${name.split(' ')[0]}, your 30-day AlgoGrass Pro trial ends in <strong style="color:#F59E0B">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.
        After that, you'll lose access to:
      </p>
      <div style="background:#0D1525;border:1px solid #1e2d45;border-radius:12px;padding:20px;margin-bottom:24px">
        ${['🔄 Weekly automated compliance scans & alerts', '📄 Unlimited document generation (Privacy Policy, DPA, Cookie Notice)', '📊 Full GRC & risk register', '🤖 Unlimited GDPR AI assistant', '📋 DPIA wizard & AI register', '🏢 Vendor risk management'].map(f => `<p style="color:#CBD5E1;font-size:13px;margin:0 0 8px">${f}</p>`).join('')}
      </div>
      <div style="text-align:center">
        ${btn('Upgrade now — keep full access', 'https://algograss.co.uk/pricing')}
        <p style="color:#475569;font-size:12px;margin:16px 0 0">Cancel anytime. No hidden fees.</p>
      </div>
    </div>
  `, `Your AlgoGrass trial ends in ${daysLeft} days`);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `⏰ Your AlgoGrass trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''} — upgrade to keep access`,
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. TRIAL EXPIRED
// ─────────────────────────────────────────────────────────────────────────────
export async function sendTrialExpiredEmail(name, email) {
  const resend = getResend();
  const html = layout(`
    <div style="padding:32px 40px;background:#0D1525;border-bottom:1px solid #1e2d45">
      <h1 style="color:#EF4444;font-size:22px;font-weight:700;margin:0 0 8px">Your free trial has ended</h1>
      <p style="color:#94A3B8;font-size:14px;margin:0">Your AlgoGrass Pro access has expired.</p>
    </div>
    <div style="padding:32px 40px;background:#060B14">
      <p style="color:#CBD5E1;font-size:14px;line-height:1.7;margin:0 0 24px">
        Hi ${name.split(' ')[0]}, your 30-day free trial has ended. Your account has been switched to the free plan.
        You can still access basic features, but Pro tools are paused until you upgrade.
      </p>
      <div style="text-align:center">
        ${btn('Reactivate Pro — from £29/mo', 'https://algograss.co.uk/pricing')}
        <p style="color:#475569;font-size:12px;margin:16px 0 0">All your data is safe. Pick up exactly where you left off.</p>
      </div>
    </div>
  `, 'Your AlgoGrass trial has ended');

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Your AlgoGrass free trial has ended — reactivate to keep your data',
    html,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. REGULATORY ALERT DIGEST
// ─────────────────────────────────────────────────────────────────────────────
export async function sendRegulatoryAlertEmail(name, email, updates) {
  const resend = getResend();
  const html = layout(`
    <div style="padding:28px 40px;background:#0D1525;border-bottom:1px solid #1e2d45">
      <p style="color:#64748B;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px">Weekly Regulatory Digest</p>
      <h1 style="color:#E8F0FE;font-size:22px;font-weight:700;margin:0 0 6px">📰 ${updates.length} new GDPR update${updates.length > 1 ? 's' : ''} this week</h1>
      <p style="color:#64748B;font-size:13px;margin:0">${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    <div style="padding:28px 40px;background:#060B14">
      <p style="color:#94A3B8;font-size:13px;margin:0 0 20px">Hi ${name.split(' ')[0]}, here's what changed in UK/EU data protection this week:</p>

      <div style="background:#0D1525;border:1px solid #1e2d45;border-radius:12px;overflow:hidden;margin-bottom:24px">
        ${updates.map((u, i) => `
          <div style="padding:18px 20px;${i < updates.length - 1 ? 'border-bottom:1px solid #1e2d45' : ''}">
            <div style="display:flex;align-items:flex-start;gap:12px">
              <span style="background:rgba(0,212,170,0.12);color:#00D4AA;font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap;margin-top:2px">${u.type || 'UPDATE'}</span>
              <div>
                <p style="color:#E8F0FE;font-size:13px;font-weight:600;margin:0 0 4px">${u.title}</p>
                <p style="color:#64748B;font-size:12px;margin:0 0 8px;line-height:1.5">${u.summary || u.content?.slice(0, 150) + '...'}</p>
                ${u.url ? `<a href="${u.url}" style="color:#7C9EFF;font-size:12px;text-decoration:none">Read more →</a>` : ''}
              </div>
            </div>
          </div>`).join('')}
      </div>

      <div style="text-align:center">
        ${btn('View full regulatory monitor', 'https://algograss.co.uk/regulatory')}
      </div>
    </div>
  `, `${updates.length} new GDPR updates this week`);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `📰 Weekly GDPR digest: ${updates.length} new update${updates.length > 1 ? 's' : ''} — ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`,
    html,
  });
}
