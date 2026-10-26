import { askClaude } from '@/lib/ai'
import { toolSystem } from '@/lib/ukDataFacts'
import { trackActivity } from '@/lib/dbHelpers'
import { currentUser, allowAiUse } from '@/lib/toolGuard'

export async function POST(request) {
  const { controlId, controlName, status, category } = await request.json()
  if (!controlId) return Response.json({ error: 'controlId required' }, { status: 400 })

  const user = currentUser()
  // Logged-out visitors, or heavy use, get the checked standard advice
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || !user || !(await allowAiUse('grc-suggest', user))) {
    return Response.json({ suggestion: getFallbackSuggestion(controlId, controlName, status) })
  }

  try {
    const suggestion = await askClaude({
      system: toolSystem('You are the AlgoGrass compliance assistant. Give practical, concise action plans for UK small businesses.'),
      prompt: `A compliance control is marked "${status}".\n\nControl: ${controlName}\nCategory: ${category}\n\nGive a practical action plan of 3-5 bullet points for what to do now to fix or improve this control, based on UK GDPR, PECR and ICO guidance. One concrete action per bullet, under 200 words, plain bullet points starting with •. Don't include web addresses unless you are sure they are correct.`,
      maxTokens: 600,
    })
    await trackActivity({ userEmail: user?.email, tool: 'grc', action: 'ai_suggestion', detail: controlName, meta: { status, category } })
    return Response.json({ suggestion })
  } catch (err) {
    return Response.json({ suggestion: getFallbackSuggestion(controlId, controlName, status) })
  }
}

function getFallbackSuggestion(id, name, status) {
  const suggestions = {
    'privacy-notice': '• Write a privacy notice covering who you are, what data you collect, why and on what lawful basis, who you share it with, how long you keep it, people\'s rights and how to complain\n• Publish it on your website and link it from the footer and every form that collects data\n• Use the ICO\'s privacy notice guidance and checklist at ico.org.uk to check it\n• Update it whenever your use of data changes\n• Check whether you need to pay the ICO data protection fee (ico.org.uk/for-organisations/data-protection-fee/)',
    'dsar-process': '• Write down how requests reach you (any channel counts, including verbal requests and social media)\n• Name the person responsible for responding\n• Track each request\'s deadline: one calendar month from receipt, moved to the next working day if it falls on a weekend or bank holiday\n• Prepare template acknowledgement and response letters\n• Keep a log of every request and what you sent',
    'consent-records': '• Use a cookie consent tool that blocks non-essential cookies until people agree, with Reject as easy as Accept\n• Keep records of who consented, when, how and to what\n• Include an easy unsubscribe in every marketing message\n• Refresh consents periodically, and stop if someone withdraws\n• Explain how consent works in your privacy notice',
    'data-breach': '• Write a short breach response plan\n• Name a breach lead and a deputy\n• Plan how to report within 72 hours of becoming aware, using the ICO\'s online form (ico.org.uk/for-organisations/report-a-breach/)\n• Keep a breach log, including breaches you don\'t report\n• Make sure supplier contracts require them to tell you about breaches without delay',
  }
  return suggestions[id] || `• Document current state of "${name}" control\n• Assign an owner responsible for this control\n• Set a target completion date within 30 days\n• Review ICO guidance at ico.org.uk relevant to this area\n• Schedule a follow-up review in 90 days`
}
