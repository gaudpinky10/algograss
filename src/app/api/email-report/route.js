import { Resend } from 'resend'

export async function POST(request) {
  const { email, result } = await request.json()
  if (!email || !result) return Response.json({ error: 'Missing email or result' }, { status: 400 })
  if (!process.env.RESEND_API_KEY) return Response.json({ error: 'Email service not configured. Please add RESEND_API_KEY to your environment variables.' }, { status: 503 })

  const resend = new Resend(process.env.RESEND_API_KEY)
  const sc = result.score
  const scoreColor = sc >= 70 ? '#0EA5E9' : sc >= 40 ? '#F59E0B' : '#EF4444'
  const scoreLabel = sc >= 70 ? 'Good' : sc >= 40 ? 'Needs Work' : 'At Risk'

  const highIssues   = result.issues.filter(i => i.sev === 'High')
  const medIssues    = result.issues.filter(i => i.sev === 'Medium')
  const lowIssues    = result.issues.filter(i => i.sev === 'Low')

  const issueRow = (iss) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1e2d45;vertical-align:top;width:80px">
        <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
          background:${iss.sev==='High'?'rgba(239,68,68,0.15)':iss.sev==='Medium'?'rgba(245,158,11,0.15)':'rgba(99,102,241,0.15)'};
          color:${iss.sev==='High'?'#EF4444':iss.sev==='Medium'?'#F59E0B':'#818CF8'}">
          ${iss.sev}
        </span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #1e2d45;vertical-align:top">
        <div style="color:#0F172A;font-weight:600;font-size:13px;margin-bottom:4px">${iss.title}</div>
        <div style="color:#94A3B8;font-size:12px;line-height:1.5;margin-bottom:6px">${iss.desc}</div>
        <span style="background:rgba(14,165,233,0.1);color:#0EA5E9;font-size:10px;padding:2px 8px;border-radius:4px">${iss.reg}</span>
      </td>
    </tr>`

  const checkRow = (label, passed) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #1e2d45;color:#CBD5E1;font-size:13px">${label}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #1e2d45;text-align:right;font-size:15px">${passed ? '✅' : '❌'}</td>
    </tr>`

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#060B14;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:640px;margin:0 auto;background:#060B14">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0D1525 0%,#0a1628 100%);padding:32px 40px;border-bottom:1px solid #1e2d45">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#0EA5E9,#7C9EFF);border-radius:8px;display:flex;align-items:center;justify-content:center">
          <span style="color:white;font-weight:800;font-size:14px">AG</span>
        </div>
        <span style="color:#0EA5E9;font-weight:800;font-size:18px">AlgoGrass</span>
      </div>
      <h1 style="color:#0F172A;font-size:22px;font-weight:700;margin:16px 0 6px">GDPR Compliance Report</h1>
      <p style="color:#64748B;font-size:13px;margin:0">${result.url} · Scanned ${new Date(result.scannedAt).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</p>
    </div>

    <!-- Score -->
    <div style="padding:32px 40px;background:#0D1525;border-bottom:1px solid #1e2d45;text-align:center">
      <div style="display:inline-block;width:100px;height:100px;border-radius:50%;background:conic-gradient(${scoreColor} ${sc*3.6}deg,rgba(15,23,42,0.05) ${sc*3.6}deg);position:relative;margin-bottom:16px">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:74px;height:74px;background:#0D1525;border-radius:50%;display:flex;align-items:center;justify-content:center">
          <span style="font-size:26px;font-weight:800;color:${scoreColor}">${sc}</span>
        </div>
      </div>
      <div style="margin-top:8px">
        <span style="display:inline-block;padding:4px 16px;border-radius:20px;font-size:12px;font-weight:700;background:${scoreColor}20;color:${scoreColor}">${scoreLabel}</span>
      </div>
      <p style="color:#94A3B8;font-size:13px;margin:12px 0 0">
        ${result.issues.length} issue${result.issues.length!==1?'s':''} found
        ${result.trackers.length > 0 ? ' · Trackers: ' + result.trackers.join(', ') : ''}
      </p>
    </div>

    <!-- Issues -->
    ${result.issues.length > 0 ? `
    <div style="padding:28px 40px 0;background:#060B14">
      <h2 style="color:#0F172A;font-size:16px;font-weight:700;margin:0 0 16px">Compliance Issues</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e2d45;border-radius:12px;overflow:hidden;background:#0D1525">
        <tbody>
          ${highIssues.map(issueRow).join('')}
          ${medIssues.map(issueRow).join('')}
          ${lowIssues.map(issueRow).join('')}
        </tbody>
      </table>
    </div>` : `
    <div style="padding:28px 40px;background:#060B14;text-align:center">
      <div style="background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);border-radius:12px;padding:24px">
        <p style="color:#0EA5E9;font-size:15px;font-weight:600;margin:0">🎉 No compliance issues found!</p>
      </div>
    </div>`}

    <!-- Checks -->
    <div style="padding:28px 40px 0;background:#060B14">
      <h2 style="color:#0F172A;font-size:16px;font-weight:700;margin:0 0 16px">What We Checked</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1e2d45;border-radius:12px;overflow:hidden;background:#0D1525">
        <tbody>
          ${checkRow('HTTPS encryption',          result.checks.https)}
          ${checkRow('Privacy policy',            result.checks.privacyPolicy)}
          ${checkRow('Cookie consent banner',     result.checks.cookieBanner)}
          ${checkRow('Cookie reject option',      result.checks.cookieReject)}
          ${checkRow('Terms of service',          result.checks.termsOfService)}
          ${checkRow('Lawful basis stated',       result.checks.lawfulBasis)}
          ${checkRow('Data subject rights',       result.checks.dataRights)}
          ${checkRow('Trackers disclosed',        result.checks.trackersDisclosed)}
          ${checkRow('Retention period stated',   result.checks.retentionPolicy)}
          ${checkRow('DSAR contact provided',     result.checks.dsarContact)}
        </tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="padding:32px 40px;background:#060B14;text-align:center">
      <div style="background:linear-gradient(135deg,rgba(14,165,233,0.1),rgba(124,158,255,0.1));border:1px solid rgba(14,165,233,0.2);border-radius:16px;padding:28px 32px">
        <h3 style="color:#0F172A;font-size:18px;font-weight:700;margin:0 0 8px">Fix your compliance issues</h3>
        <p style="color:#94A3B8;font-size:13px;margin:0 0 20px;line-height:1.6">AlgoGrass generates your privacy policy, cookie notice, and data processing agreements automatically — based on your actual scan results.</p>
        <a href="https://algograss.com/signup" style="display:inline-block;background:linear-gradient(135deg,#0EA5E9,#0284C7);color:#FFFFFF;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;text-decoration:none">Create free account →</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid #1e2d45;text-align:center">
      <p style="color:#475569;font-size:11px;margin:0;line-height:1.6">
        This report was generated by AlgoGrass · algograss.com<br>
        Results reflect compliance indicators identified on your live website at time of scan.
      </p>
    </div>
  </div>
</body>
</html>`

  try {
    await resend.emails.send({
      from: 'AlgoGrass Reports <reports@algograss.com>',
      to: email,
      subject: `GDPR Compliance Report: ${result.url} — Score ${sc}/100`,
      html,
    })
    return Response.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    return Response.json({ error: 'Failed to send email: ' + (err.message || 'unknown error') }, { status: 500 })
  }
}
