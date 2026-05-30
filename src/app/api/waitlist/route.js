export async function POST(request) {
  const { email, source } = await request.json()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL

  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: source || 'homepage',
          signedUpAt: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || '',
        }),
      })
    } catch (err) {
      console.error('Sheets webhook failed:', err.message)
    }
  }

  return Response.json({ success: true, message: 'You are on the list!' })
}
