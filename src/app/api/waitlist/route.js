export async function POST(request) {
  const { email, source, name, website } = await request.json()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  const formspreeId = process.env.FORMSPREE_ID
  if (formspreeId) {
    try {
      await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: source || 'homepage', name: name || '', website: website || '' }),
      })
    } catch (err) {
      console.error('Formspree error:', err.message)
    }
  }

  return Response.json({ success: true })
}
