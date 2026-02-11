import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function runPrompt(systemPrompt, questions, websiteData) {
  // Build user message with website data + questions
  const userMessage = `## Website Data
${JSON.stringify(websiteData, null, 2)}

## Questions to Answer
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userMessage
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  })

  return response.choices[0].message.content
}
