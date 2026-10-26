import { askClaude } from '@/lib/ai'
import { toolSystem, extractJson } from '@/lib/ukDataFacts'
import { cookies } from 'next/headers';
import { getCollection, parseUserCookie } from '@/lib/dbHelpers';

async function getUserEmail() {
  try {
    const userCookie = cookies().get('algograss_user')
    if (!userCookie) return null
    const user = parseUserCookie(userCookie.value)
    return user?.email || null
  } catch { return null }
}

export async function GET() {
  const email = await getUserEmail()
  if (!email) return Response.json({ entries: [] })
  try {
    const col = await getCollection('ai_register')
    if (!col) return Response.json({ entries: [] })
    const entries = await col.find({ userEmail: email }).sort({ createdAt: -1 }).toArray()
    return Response.json({ entries })
  } catch (err) { return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 }) }
}

export async function POST(request) {
  const email = await getUserEmail()
  if (!email) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  const body = await request.json()
  const { systemName, purpose, dataTypes, riskLevel, vendor, internalOwner, dpiaRequired } = body
  if (!systemName) return Response.json({ error: 'System name required' }, { status: 400 })
  let aiAssessment = null
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const raw = await askClaude({
        system: toolSystem('You are the AlgoGrass AI register assistant. You give a short, careful first view of an AI system\'s data protection and EU AI Act position.'),
        prompt: `AI system: ${systemName}\nPurpose: ${purpose || 'not stated'}\nData used: ${dataTypes || 'not stated'}\nVendor: ${vendor || 'not stated'}\nRisk level they chose: ${riskLevel || 'not stated'}\nDPIA flagged: ${dpiaRequired ? 'yes' : 'no'}\n\nReply with JSON only, in this shape (values are descriptions): {"gdprRisk": "High" | "Medium" | "Low", "aiActCategory": "Prohibited" | "High-Risk" | "Transparency duties" | "Minimal-Risk" | "Depends on EU use", "keyRisks": ["short risk"], "recommendations": ["short action"], "dpiaNeeded": true or false}`,
        maxTokens: 800,
      })
      const j = extractJson(raw)
      if (j) aiAssessment = {
        gdprRisk: ['High', 'Medium', 'Low'].includes(j.gdprRisk) ? j.gdprRisk : 'Medium',
        aiActCategory: String(j.aiActCategory || 'Depends on EU use'),
        keyRisks: (Array.isArray(j.keyRisks) ? j.keyRisks : []).map(String).slice(0, 6),
        recommendations: (Array.isArray(j.recommendations) ? j.recommendations : []).map(String).slice(0, 6),
        dpiaNeeded: !!j.dpiaNeeded,
      }
    } catch (e) { console.error('AI assessment failed (non-fatal):', e?.message) }
  }
  try {
    const col = await getCollection('ai_register')
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 })
    const result = await col.insertOne({ userEmail: email, systemName, purpose: purpose || '', dataTypes: dataTypes || '', riskLevel: riskLevel || 'Low', vendor: vendor || '', internalOwner: internalOwner || '', dpiaRequired: !!dpiaRequired, aiAssessment, createdAt: new Date() })
    return Response.json({ success: true, id: result.insertedId, aiAssessment })
  } catch (err) { return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 }) }
}

export async function DELETE(request) {
  const email = await getUserEmail()
  if (!email) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  const { id } = await request.json()
  try {
    const { ObjectId } = await import('mongodb')
    const col = await getCollection('ai_register')
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 })
    await col.deleteOne({ _id: new ObjectId(id), userEmail: email })
    return Response.json({ success: true })
  } catch (err) { return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 }) }
}
