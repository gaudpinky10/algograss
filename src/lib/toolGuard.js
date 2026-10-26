// Who is using an AI tool, and a limit on how often, so the tools can't be
// used to run up AI costs. Call only from route handlers.
import { cookies, headers } from 'next/headers'
import { getSessionUser, getCollection } from './dbHelpers'

export const currentUser = () => getSessionUser(cookies())

let indexed = false
// true if this person (or, when logged out, this visitor) has used AI tools
// fewer than `limit` times in the last hour. The chat assistants have their
// own allowance ("chat"); all other tools share one ("tools"). If the
// database is down, allow.
export async function allowAiUse(tool, user, limit = 40) {
  const pool = tool === 'chat' ? 'chat' : 'tools'
  try {
    const col = await getCollection('ai_usage')
    if (!col) return true
    if (!indexed) { indexed = true; col.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }).catch(() => {}) }
    const ip = (headers().get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    const who = user?.email ? 'u:' + user.email : 'ip:' + ip
    const n = await col.countDocuments({ who, pool, createdAt: { $gt: new Date(Date.now() - 3600e3) } })
    if (n >= limit) return false
    await col.insertOne({ who, pool, tool, createdAt: new Date() })
    return true
  } catch { return true }
}

export const loginRequired = () => Response.json({ error: 'Please log in to use this tool.' }, { status: 401 })
export const tooMany = user => Response.json({ error: user
  ? "You've used AlgoGrass's AI tools a lot in the last hour. Please try again a little later."
  : "You've reached the hourly limit for using AlgoGrass's AI tools without an account. Log in or sign up free to keep going, or try again in an hour." }, { status: 429 })
// A message safe to show users (no internal error text)
export const aiFailed = (status = 502) => Response.json({ error: "The AI couldn't finish this just now. Please try again in a minute." }, { status })
