export async function POST(request) {
  const { email, reminders } = await request.json()
  if (!email || !reminders?.length) return Response.json({ error: 'Email and reminders required' }, { status: 400 })

  const formspreeId = process.env.FORMSPREE_ID
  if (!formspreeId) return Response.json({ error: 'Email not configured.' }, { status: 500 })

  const upcoming = reminders.filter(r => {
    const days = Math.ceil((new Date(r.date) - new Date()) / (1000*60*60*24))
    return days >= 0 && days <= 30
  })

  const message = `AlgoGrass Compliance Review Reminders\n\nUpcoming reviews for ${email}:\n\n${reminders.map(r => {
    const days = Math.ceil((new Date(r.date) - new Date()) / (1000*60*60*24))
    const status = days < 0 ? '⚠️ OVERDUE' : days === 0 ? '🔴 DUE TODAY' : days <= 7 ? `🟡 Due in ${days} days` : `🟢 Due in ${days} days`
    return `${status} — ${r.title} (${r.type})\nDue: ${new Date(r.date).toLocaleDateString('en-GB')}\nOwner: ${r.owner || 'Unassigned'}`
  }).join('\n\n')}\n\nLog in to AlgoGrass to manage your reviews: https://www.algograss.co.uk/grc`

  try {
    await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `AlgoGrass: ${upcoming.length} compliance review${upcoming.length !== 1 ? 's' : ''} coming up`,
        _replyto: email,
        email,
        message,
      }),
    })
    return Response.json({ success: true, sent: reminders.length })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
