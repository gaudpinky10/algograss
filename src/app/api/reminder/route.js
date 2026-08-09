export async function POST(request) {
  const { email, reminders } = await request.json()
  if (!email || !reminders?.length) return Response.json({ error: 'Email and reminders required' }, { status: 400 })

  const formspreeId = process.env.FORMSPREE_ID
  if (!formspreeId) return Response.json({ error: 'Reminders not configured.' }, { status: 500 })

  const reminderList = reminders.map((r, i) => `${i+1}. ${r.title} — Due: ${r.date} (${r.type})`).join('\n')

  try {
    await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _replyto: email,
        _subject: `AlgoGrass Compliance Reminders Set — ${reminders.length} reminder${reminders.length > 1 ? 's' : ''}`,
        message: `Your AlgoGrass compliance reminders have been set!\n\nReminders:\n${reminderList}\n\nYou will receive reminder emails at: ${email}\n\nManage your reminders at: https://www.algograss.co.uk/grc\n\n— AlgoGrass Compliance Platform`,
      }),
    })

    // Also notify admin
    await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: `New reminders set by ${email}`,
        message: `${email} set ${reminders.length} compliance reminders:\n${reminderList}`,
      }),
    })

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
