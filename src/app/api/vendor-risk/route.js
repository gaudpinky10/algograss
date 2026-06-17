import { cookies } from 'next/headers'
import { getCollection, trackActivity, parseUserCookie } from '@/lib/dbHelpers'

function getUser(cookieStore) {
  try {
    const c = cookieStore.get('algograss_user')
    return c ? parseUserCookie(c.value) : null
  } catch { return null }
}

function scoreVendor(vendor) {
  let score = 0
  const dataRisk = { 'Health/medical':4,'Financial/payment':4,"Children's data":4,'Biometric':4,'Criminal records':4,'Location':3,'Special category':3,'Contact details':2,'Names':1,'Business data':1 }
  ;(vendor.dataCategories || []).forEach(c => { score += dataRisk[c] || 1 })
  if (vendor.transfersOutsideUK === 'Yes') score += 3
  if (vendor.dpaSigned !== 'Yes') score += 4
  if (!vendor.lastAudit || vendor.lastAudit === 'Never') score += 2
  if (vendor.isoOrSoc2 === 'Neither') score += 2
  return { score, level: score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low' }
}

export async function GET() {
  const user = getUser(cookies())
  const col  = await getCollection('vendors')
  if (!col || !user) return Response.json({ vendors: [] })
  const vendors = await col.find({ userEmail: user.email }).sort({ createdAt: -1 }).toArray()
  return Response.json({ vendors })
}

export async function POST(req) {
  const body = await req.json()
  const { action, vendor, vendorId } = body
  const user = getUser(cookies())
  const col  = await getCollection('vendors')

  if (action === 'delete') {
    if (col && user && vendorId) {
      const { ObjectId } = await import('mongodb')
      await col.deleteOne({ _id: new ObjectId(vendorId), userEmail: user.email })
      await trackActivity({ userEmail: user?.email, tool: 'vendor-risk', action: 'vendor_deleted', detail: vendorId })
    }
    return Response.json({ success: true })
  }

  if (action === 'update_dpa') {
    if (col && user && vendorId) {
      const { ObjectId } = await import('mongodb')
      await col.updateOne({ _id: new ObjectId(vendorId), userEmail: user.email }, { $set: { dpaSigned: body.dpaSigned, dpaSignedDate: body.dpaSignedDate, updatedAt: new Date() } })
      await trackActivity({ userEmail: user?.email, tool: 'vendor-risk', action: 'dpa_updated', detail: vendorId, meta: { dpaSigned: body.dpaSigned } })
    }
    return Response.json({ success: true })
  }

  // Create vendor
  const risk = scoreVendor(vendor)
  const doc  = { ...vendor, ...risk, userEmail: user?.email || 'anonymous', createdAt: new Date() }
  if (col && user) await col.insertOne(doc)
  await trackActivity({ userEmail: user?.email, tool: 'vendor-risk', action: 'vendor_added', detail: vendor.name, meta: { riskLevel: risk.level, type: vendor.type } })
  return Response.json({ success: true, vendor: doc })
}
