// API keys for the scan endpoint. A request with "Authorization: Bearer ag_..."
// must carry a valid, active key; it is counted against the key owner's daily
// limit and the scan is saved to their history. Requests without a key work
// like the free scanner on the website.
import { createHash } from 'crypto'
import { getCollection } from './dbHelpers'

export const API_LIMITS = {
  free:    { perDay: 10,   keys: 1 },
  pro:     { perDay: 100,  keys: 3 }, // free trial
  starter: { perDay: 100,  keys: 3 },
  growth:  { perDay: 1000, keys: 10 },
  agency:  { perDay: 1000, keys: 10 },
}
export const limitsFor = plan => API_LIMITS[plan] || API_LIMITS.free

export async function checkApiKey(request) {
  const auth = request?.headers?.get?.('authorization') || ''
  if (!auth) return { none: true }
  const m = auth.match(/^Bearer\s+(ag_[a-f0-9]{64})\s*$/i)
  if (!m) return { error: 'Invalid API key. Use the header "Authorization: Bearer ag_...".', status: 401 }
  const [keys, users, usage] = await Promise.all([getCollection('apikeys'), getCollection('users'), getCollection('api_usage')])
  if (!keys || !usage) return { error: 'The API is temporarily unavailable. Please try again shortly.', status: 503 }
  const key = await keys.findOne({ keyHash: createHash('sha256').update(m[1].toLowerCase()).digest('hex'), isActive: true })
  if (!key) return { error: 'This API key is not valid or has been revoked.', status: 401 }
  const owner = users ? await users.findOne({ email: key.userEmail }, { projection: { plan: 1, name: 1 } }) : null
  const plan = owner?.plan || 'free'
  const { perDay } = limitsFor(plan)
  const now = new Date()
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const used = await usage.countDocuments({ userEmail: key.userEmail, createdAt: { $gte: dayStart } })
  if (used >= perDay) return { error: `Daily API limit reached (${perDay} scans a day on your plan). It resets at midnight UTC.`, status: 429 }
  await usage.insertOne({ userEmail: key.userEmail, keyId: key._id, createdAt: now })
  keys.updateOne({ _id: key._id }, { $inc: { usageCount: 1 }, $set: { lastUsedAt: now } }).catch(() => {})
  return { ok: true, userEmail: key.userEmail, plan, perDay, used: used + 1 }
}
