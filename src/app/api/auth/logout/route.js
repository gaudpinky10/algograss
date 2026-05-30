import { cookies } from 'next/headers'

export async function POST() {
  cookies().delete('algograss_user')
  return Response.json({ success: true })
}
