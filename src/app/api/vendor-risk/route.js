import { cookies } from 'next/headers'
import { getCollection } from '@/lib/dbHelpers'

function getUser() {
  try {
    const c = cookies().get('algograss_user')
    if (!c) return null
    return JSON.parse(Buffer.from(c.value, 'base64').toString())
  } catch { return null }
}

function scoreVendor(vendor) {
  let score = 0
  const dataRisk = { 'Health/medical':4,'Financial/payment':4,'Children\'s data':4,'Biometric':4,'Criminal records':4,'Location':3,'Special category':3,'Contact details':2,'Names':1,'Business data':1 }
  const cats = vendor.dataCategories || []
  cats.forEach(c => { score += dataRisk[c] || 1 })
  if (vendor.transfersOutsideUK === 'Yes') score += 3
  if (vendor.dpaSigned !== 'Yes') score += 4
  if (vendor.lastAudit === 'Never' || !vendor.lastAudit) score += 2
  if (vendor.isoOrSoc2 === 'Neither') score += 2
  const level = score >= 10 ? 'High' : score >= 5 ? 'Medium' : 'Low'
  return { score, level }
}

export async function GET() {
  const user = getUser()
  const col  = await getCollection('vendors')
  if (!col || !user) return Response.json({ vendors: [] })
  const vendors = await col.find({ userEmail: user.email }).sort({ createdAt: -1 }).toArray()
  return Response.json({ vendors })
}

export async function POST(req) {
  const body = await req.json()
  const { action, vendor, vendorId } = body
  const user = getUser()
  const col  = await getCollection('vendors')

  if (action === 'delete') {
    if (col && user && vendorId) {
      const { ObjectId } = await import('mongodb')
      await col.deleteOne({ _id: new ObjectId(vendorId), userEmail: user.email })
    }
    return Response.json({ success: true })
  }

  if (action === 'update_dpa') {
    if (col && user && vendorId) {
      const { ObjectId } = await import('mongodb')
      await col.updateOne({ _id: new ObjectId(vendorId), userEmail: user.email }, { $set: { dpaSigned: body.dpaSigned, dpaSignedDate: body.dpaSignedDate, updatedAt: new Date() } })
    }
    return Response.json({ success: true })
  }

  // Create vendor
  const risk = scoreVendor(vendor)
  const doc = { ...vendor, ...risk, userEmail: user?.email || 'anonymous', createdAt: new Date() }
  if (col && user) await col.insertOne(doc)
  return Response.json({ success: true, vendor: doc })
}
