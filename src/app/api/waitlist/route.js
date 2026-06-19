import { getCollection, trackActivity } from '@/lib/dbHelpers'

export async function POST(request) {
  const { email, source, name, website } = await request.json()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  // ── Save to MongoDB waitlist collection ──────────────────
  try {
    const col = await getCollection('waitlist')
    if (col) {
      // upsert — don't error if email already exists
      await col.updateOne(
        { email: email.toLowerCase() },
        {
          $setOnInsert: {
            email:     email.toLowerCase(),
            name:      name || '',
            source:    source || 'homepage',
            website:   website || '',
            createdAt: new Date(),
          },
          $set: { updatedAt: new Date() },
        },
        { upsert: true }
      )
    }
    await trackActivity({
      userEmail: email.toLowerCase(),
      tool:      'waitlist',
      action:    'waitlist_signup',
      detail:    source || 'homepage',
      meta:      { name: name || '', website: website || '', source: source || 'homepage' },
    })
  } catch (dbErr) {
    console.error('Waitlist DB error (non-fatal):', dbErr.message)
  }

  // ── Also notify via Formspree (email alert to owner) ────
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
          name:    name    || 'Not provided',
          source:  source  || 'homepage',
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
