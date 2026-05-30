export async function POST(request) {
  const { email, source, name, website } = await request.json()
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 })
  }

  const notionKey = process.env.NOTION_API_KEY
  const notionDb = process.env.NOTION_DATABASE_ID

  if (notionKey && notionDb) {
    try {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionKey}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: notionDb },
          properties: {
            Email:    { title: [{ text: { content: email } }] },
            Source:   { rich_text: [{ text: { content: source || 'homepage' } }] },
            Name:     { rich_text: [{ text: { content: name || '' } }] },
            Website:  { rich_text: [{ text: { content: website || '' } }] },
            'Signed Up': { date: { start: new Date().toISOString() } },
          },
        }),
      })
    } catch (err) {
      console.error('Notion error:', err.message)
    }
  }

  return Response.json({ success: true })
}
