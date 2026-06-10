import { cookies } from 'next/headers';
import { getCollection } from '@/lib/dbHelpers';

async function getUserEmail() {
  try {
    const userCookie = cookies().get('algograss_user')
    if (!userCookie) return null
    const user = JSON.parse(Buffer.from(userCookie.value, 'base64').toString())
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
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}

export async function POST(request) {
  const email = await getUserEmail()
  if (!email) return Response.json({ error: 'Not authenticated' }, { status: 401 })
  const body = await request.json()
  const { systemName, purpose, dataTypes, riskLevel, vendor, internalOwner, dpiaRequired } = body
  if (!systemName) return Response.json({ error: 'System name required' }, { status: 400 })
  const apiKey = process.env.ANTHROPIC_API_KEY
  let aiAssessment = null
  if (apiKey && apiKey !== 'your-key-here') {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 800, system: 'You are a GDPR AI Act compliance expert. Return JSON: {"gdprRisk":"High|Medium|Low","aiActCategory":"High-Risk|Limited-Risk|Minimal-Risk","keyRisks":["risk1","risk2"],"recommendations":["rec1","rec2"],"dpiaNeeded":bool}', messages: [{ role: 'user', content: `AI System: ${systemName}\nPurpose: ${purpose}\nData types: ${dataTypes}\nVendor: ${vendor}\nRisk level: ${riskLevel}\nDPIA flagged: ${dpiaRequired}` }] }),
      })
      const data = await res.json()
      if (!data.error) aiAssessment = JSON.parse(data.content[0].text)
    } catch (e) { console.error('AI assessment failed (non-fatal):', e) }
  }
  try {
    const col = await getCollection('ai_register')
    if (!col) return Response.json({ error: 'DB unavailable' }, { status: 503 })
    const result = await col.insertOne({ userEmail: email, systemName, purpose: purpose || '', dataTypes: dataTypes || '', riskLevel: riskLevel || 'Low', vendor: vendor || '', internalOwner: internalOwner || '', dpiaRequired: !!dpiaRequired, aiAssessment, createdAt: new Date() })
    return Response.json({ success: true, id: result.insertedId, aiAssessment })
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
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
  } catch (err) { return Response.json({ error: err.message }, { status: 500 }) }
}
