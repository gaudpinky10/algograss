import { cookies } from 'next/headers'
import { trackActivity, parseUserCookie } from '@/lib/dbHelpers'

export async function POST(request) {
  const { controlId, controlName, status, category } = await request.json()
  if (!controlId) return Response.json({ error: 'controlId required' }, { status: 400 })

  const userCookie = cookies().get('algograss_user')
  const user = userCookie ? parseUserCookie(userCookie.value) : null

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ suggestion: getFallbackSuggestion(controlId, controlName, status) })
  }

  try {
    const { Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `You are a UK GDPR and GRC compliance expert. A user's compliance control is "${status}".

Control: ${controlName}
Category: ${category}
Status: ${status}

Give a practical, concise action plan (3-5 bullet points) for what they should do RIGHT NOW to fix or improve this control. Focus on UK GDPR, ICO guidance, and UK government standards. Each bullet should be one concrete action. Keep it under 200 words. Format as plain bullet points starting with •`
      }]
    })
    const suggestion = msg.content[0]?.text || getFallbackSuggestion(controlId, controlName, status)
    await trackActivity({ userEmail: user?.email, tool: 'grc', action: 'ai_suggestion', detail: controlName, meta: { status, category } })
    return Response.json({ suggestion })
  } catch (err) {
    return Response.json({ suggestion: getFallbackSuggestion(controlId, controlName, status) })
  }
}

function getFallbackSuggestion(id, name, status) {
  const suggestions = {
    'privacy-notice': '• Draft a GDPR-compliant privacy notice covering lawful basis, data categories, retention, and rights\n• Publish at /privacy-policy and link from your website footer\n• Review against ICO template: ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/\n• Update whenever processing activities change\n• Register with ICO at ico.org.uk/about-the-ico/what-we-do/register-with-the-ico/',
    'dsar-process': '• Create a documented DSAR intake process (email/form)\n• Appoint a named person responsible for responding\n• Set up a 30-day response tracker\n• Draft template response letters\n• Log all SARs received in a register',
    'consent-records': '• Implement a consent management platform (CookieYes, Cookiebot, or OneTrust)\n• Store timestamped consent records linked to user ID\n• Provide easy opt-out on every marketing email\n• Review consent every 12 months\n• Document consent mechanism in privacy notice',
    'data-breach': '• Create a Data Breach Response Policy document\n• Designate a breach reporting lead\n• Set up ICO 72-hour reporting workflow at ico.org.uk/for-organisations/report-a-breach/\n• Run a tabletop breach simulation exercise\n• Add breach notification clause to all vendor contracts',
  }
  return suggestions[id] || `• Document current state of "${name}" control\n• Assign an owner responsible for this control\n• Set a target completion date within 30 days\n• Review ICO guidance at ico.org.uk relevant to this area\n• Schedule a follow-up review in 90 days`
}
