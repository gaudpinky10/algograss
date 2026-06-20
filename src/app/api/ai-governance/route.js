export async function POST(request) {
  const { toolName, purpose, dataTypes, hasPersonalData, sharesWithThirdParty, businessName } = await request.json()

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!apiKey) return Response.json({ error: 'AI not configured.' }, { status: 500 })

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: 'You are an AI Governance specialist for AlgoGrass. Assess AI tool usage for GDPR and UK data protection compliance. Be practical and specific. End with disclaimer.' }] },
          contents: [{ role: 'user', parts: [{ text: `Assess this AI tool usage for GDPR compliance:\nBusiness: ${businessName || 'Unknown'}\nAI Tool: ${toolName}\nPurpose: ${purpose}\nData types entered into tool: ${dataTypes}\nContains personal data: ${hasPersonalData ? 'Yes' : 'No'}\nData shared with third party: ${sharesWithThirdParty ? 'Yes' : 'No'}\n\nProvide:\n1. Overall risk rating (High/Medium/Low) with explanation\n2. GDPR issues identified (specific articles)\n3. Legal basis assessment (is there a valid basis?)\n4. Data processor agreement needed? (Yes/No + why)\n5. DPIA required? (Yes/No + why)\n6. Recommended actions (numbered list)\n7. What to add to privacy policy\n8. Monitoring and review recommendations` }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
        }),
      }
    )
    const data = await res.json()
    if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
    const assessment = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Assessment failed.'
    return Response.json({ assessment, generatedAt: new Date().toISOString() })
  } catch (err) {
    return Response.json({ error: 'Failed: ' + err.message }, { status: 500 })
  }
}
