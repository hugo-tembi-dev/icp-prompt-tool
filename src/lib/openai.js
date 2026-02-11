import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function runPrompt(systemIcp, websiteData) {
  // Build system prompt with ICP questions as instructions
  const systemPrompt = `You are an ICP (Ideal Customer Profile) analyst. Analyze the provided website/company data and answer the following questions thoroughly:

${systemIcp.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Provide detailed, actionable insights for each question based on the data provided. Structure your response clearly with each question addressed.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: JSON.stringify(websiteData, null, 2)
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  })

  return response.choices[0].message.content
}
