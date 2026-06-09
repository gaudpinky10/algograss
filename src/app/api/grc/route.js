import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import GrcRisk from '@/models/GrcRisk';
import GrcIncident from '@/models/GrcIncident';
import GrcPolicy from '@/models/GrcPolicy';

export async function POST(request) {
  const { type, data } = await request.json()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your-key-here') {
    return Response.json({ error: 'AI not configured.' }, { status: 500 })
  }

  const prompts = {
    riskAssessment: `You are a GRC (Governance, Risk and Compliance) expert. Assess this business risk for a UK SME:
Risk: ${data.riskTitle}
Description: ${data.riskDesc}
Business area: ${data.area}

Provide:
1. Risk Rating: High/Medium/Low with justification
2. Likelihood (1-5) and Impact (1-5) scores
3. Relevant regulations (GDPR, UK DPA 2018, ISO 27001 etc.)
4. Top 3 mitigation actions
5. Residual risk after mitigation
6. Review frequency recommended
Be concise and practical.`,

    policyReview: `You are a GRC compliance expert. Review this policy for a UK SME:
Policy: ${data.policyName}
Content summary: ${data.policyContent}

Provide:
1. Overall quality rating (Good/Needs Work/Poor)
2. Key gaps identified
3. Regulatory requirements not addressed
4. Specific improvements needed
5. Suggested review frequency
6. Priority level for updating`,

    incidentAssessment: `You are a GDPR incident response expert. Assess this data incident:
Incident: ${data.incident}
Data affected: ${data.dataAffected}
Number of people affected: ${data.affected}

Provide:
1. Incident severity (Critical/High/Medium/Low)
2. Is ICO notification required? (Yes/No + reason)
3. 72-hour notification deadline (from now)
4. Is individual notification required?
5. Immediate actions to take (numbered list)
6. Evidence to document
7. Draft ICO notification summary`,
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: 'You are a GRC (Governance, Risk and Compliance) expert specialising in UK/EU data protection, GDPR, ISO 27001, and SME compliance. Give practical, actionable advice. End with a brief disclaimer.',
        messages: [{ role: 'user', content: prompts[type] }],
      }),
    })
    const result = await res.json()
    if (result.error) return Response.json({ error: result.error.message }, { status: 500 })
    const aiText = result.content[0].text

    // Save to DB
    try {
      const cookieStore = cookies();
      const userCookie = cookieStore.get('algograss_user');
      if (userCookie) {
        const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString());
        if (user?.id) {
          await connectDB();
          if (type === 'riskAssessment') {
            await GrcRisk.create({
              userId: user.id,
              userEmail: user.email,
              title: data.riskTitle || 'Untitled Risk',
              category: data.category,
              likelihood: data.likelihood,
              impact: data.impact,
              owner: data.owner,
              aiAssessment: { text: aiText },
            });
          } else if (type === 'incidentAssessment') {
            await GrcIncident.create({
              userId: user.id,
              userEmail: user.email,
              title: data.incidentTitle || 'Untitled Incident',
              description: data.description,
              severity: data.severity,
              dataTypes: data.dataTypes,
              affectedCount: data.affectedCount,
              discoveredDate: data.discoveredDate,
              aiAssessment: { text: aiText },
            });
          } else if (type === 'policyReview') {
            await GrcPolicy.create({
              userId: user.id,
              userEmail: user.email,
              name: data.policyName || 'Untitled Policy',
              owner: data.owner,
              lastReviewed: data.lastReviewed,
              nextReview: data.nextReview,
              aiReview: { text: aiText },
            });
          }
        }
      }
    } catch (dbErr) {
      console.error('DB save error (non-fatal):', dbErr);
    }

    return Response.json({ result: aiText, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
