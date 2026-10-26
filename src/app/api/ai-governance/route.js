import { askClaude } from '@/lib/ai'
import { toolSystem } from '@/lib/ukDataFacts'
import { currentUser, allowAiUse, tooMany, aiFailed } from '@/lib/toolGuard'

export async function POST(request) {
  const user = currentUser()
  const { toolName, purpose, dataTypes, hasPersonalData, sharesWithThirdParty, businessName } = await request.json()
  if (!toolName && !purpose) return Response.json({ error: 'Please name the AI tool and what you use it for.' }, { status: 400 })
  if (!(await allowAiUse('ai-governance', user, user ? 40 : 5))) return tooMany()
  try {
    const assessment = await askClaude({
      system: toolSystem('You are the AlgoGrass AI governance assistant. You help UK small businesses use AI tools in line with UK GDPR, and the EU AI Act where it applies to them.'),
      prompt: `Assess this use of an AI tool by a UK organisation.
Organisation: ${businessName || 'not stated'}
AI tool: ${toolName || 'not stated'}
What it is used for: ${purpose || 'not stated'}
Data entered into it: ${dataTypes || 'not stated'}
Includes personal data: ${hasPersonalData ? 'Yes' : 'No'}
Data shared with the tool's provider or other third parties: ${sharesWithThirdParty ? 'Yes' : 'No'}

Give, with short headings: 1) Overall risk (High/Medium/Low) and why. 2) UK GDPR points: lawful basis, transparency, the provider's role (processor or controller) and contract, international transfers, retention and whether inputs are used to train the provider's models, and automated decision-making (UK GDPR Arts. 22A-22D) if decisions about people are made. 3) Whether a DPIA is needed. 4) EU AI Act: only if they place AI on the EU market or its output is used in the EU; give the likely category and the dates that apply. 5) Practical steps, in order. End with a one-line note that this is guidance, not legal advice.`,
      maxTokens: 2000,
    })
    return Response.json({ assessment, generatedAt: new Date().toISOString() })
  } catch (e) {
    return aiFailed(e.status === 503 ? 503 : 502)
  }
}
