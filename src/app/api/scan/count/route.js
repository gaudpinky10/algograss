import { NextResponse } from 'next/server'
import { getCollection } from '@/lib/dbHelpers'

export const runtime = 'nodejs'
// Run on every request: a build-time copy would show a frozen count
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const col = await getCollection('scans')
    const count = col ? await col.countDocuments({}) : 0
    return NextResponse.json({ count }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' }
    })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
