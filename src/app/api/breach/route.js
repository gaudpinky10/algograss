import { NextResponse } from 'next/server';
import { getCollection, trackActivity } from '@/lib/dbHelpers';
import { cookies } from 'next/headers';

export async function POST(request) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const body = await request.json();
  const { breachDescription, dataTypes, individualsAffected, consequences, measuresTaken, controllerName, dpoContact, breachDate } = body;

  if (!breachDescription) return NextResponse.json({ error: 'Breach description required' }, { status: 400 });

  const prompt = `Generate a formal Data Breach Notification letter to the UK Information Commissioner's Office (ICO) under Article 33 of UK GDPR.

Details:
- Controller: ${controllerName || 'The Organisation'}
- DPO/Contact: ${dpoContact || 'Not specified'}
- Breach occurred: ${breachDate || 'Date not specified'}
- Description: ${breachDescription}
- Data types affected: ${Array.isArray(dataTypes) ? dataTypes.join(', ') : dataTypes || 'Not specified'}
- Number of individuals affected: ${individualsAffected || 'Unknown'}
- Likely consequences: ${consequences || 'Under assessment'}
- Measures taken: ${measuresTaken || 'Investigation ongoing'}

Write a complete, formal ICO breach notification letter. Include:
1. Nature of the personal data breach
2. Categories and approximate number of data subjects concerned
3. Categories and approximate number of personal data records concerned
4. Name and contact details of the DPO or other contact point
5. Likely consequences of the breach
6. Measures taken or proposed to address the breach, including mitigation measures

Use formal UK GDPR legal language. Reference the relevant Articles (Article 33, Article 34 if applicable). Include a reference number placeholder [REF-YYYY-MM-DD]. Make it ready to submit to the ICO.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are a senior UK data protection solicitor specialising in GDPR breach notifications. Write formal, legally precise letters.' }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.2 },
        }),
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    const letter = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Save to DB
    try {
      const col = await getCollection('breaches');
      if (col) {
        const cookieStore = cookies();
        const userCookie = cookieStore.get('algograss_user');
        const user = userCookie ? JSON.parse(Buffer.from(userCookie.value, 'base64').toString()) : null;
        await col.insertOne({ controllerName, breachDate, dataTypes, individualsAffected, userEmail: user?.email || 'anonymous', createdAt: new Date() });
        if (user?.email) await trackActivity({ userEmail: user.email, tool: 'breach', action: 'notification_generated', detail: `Breach notification for ${controllerName}` });
      }
    } catch {}

    return NextResponse.json({ letter });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
