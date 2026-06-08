export async function POST(request) {
  const { email, source, name, website } = await request.json()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  // Send notification to AlgoGrass owner via Formspree
  const formspreeId = process.env.FORMSPREE_ID
  if (formspreeId) {
    try {
      await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _replyto: email,
          _subject: `New AlgoGrass signup: ${email}`,
          email,
          name: name || 'Not provided',
          source: source || 'homepage',
          website: website || 'Not provided',
          message: `New signup on AlgoGrass!\n\nEmail: ${email}\nName: ${name || 'Not provided'}\nSource: ${source || 'homepage'}\nWebsite: ${website || 'Not provided'}\nTime: ${new Date().toLocaleString('en-GB')}`,
        }),
      })
    } catch (err) {
      console.error('Formspree error:', err.message)
    }
  }

  return Response.json({ success: true })
}
