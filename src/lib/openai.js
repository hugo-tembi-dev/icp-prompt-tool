import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function runPrompt(systemPrompt, questions, websiteData, model = 'gpt-4o-mini') {
  // Build user message with user context + website data + questions
  const userContextSection = websiteData.userContext
    ? `## User Context
${JSON.stringify(websiteData.userContext, null, 2)}

`
    : ''

  const userMessage = `${userContextSection}## Website Data
${JSON.stringify({ domainURL: websiteData.domainURL, entries: websiteData.entries }, null, 2)}

## Questions to Answer
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`

  // Debug: Log what we're sending to OpenAI
  console.log('=== OPENAI RESPONSES API REQUEST ===')
  console.log('Model:', model)
  console.log('Instructions:', systemPrompt)
  console.log('Input:', userMessage)
  console.log('=====================================')

  const response = await openai.responses.create({
    model,
    instructions: systemPrompt,
    input: userMessage,
    temperature: 0.7,
    max_output_tokens: 2000
  })

  return response.output_text
}
