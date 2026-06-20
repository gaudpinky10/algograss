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
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  let aiAssessment = null
  if (apiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: 'You are a GDPR AI Act compliance expert. Return ONLY valid JSON with no markdown: {"gdprRisk":"High|Medium|Low","aiActCategory":"High-Risk|Limited-Risk|Minimal-Risk","keyRisks":["risk1","risk2"],"recommendations":["rec1","rec2"],"dpiaNeeded":true}' }] },
            contents: [{ role: 'user', parts: [{ text: `AI System: ${systemName}\nPurpose: ${purpose}\nData types: ${dataTypes}\nVendor: ${vendor}\nRisk level: ${riskLevel}\nDPIA flagged: ${dpiaRequired}` }] }],
            generationConfig: { maxOutputTokens: 800, temperature: 0.1 },
          }),
        }
      )
      const data = await res.json()
      if (!data.error) {
        let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        aiAssessment = JSON.parse(rawText)
      }
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
