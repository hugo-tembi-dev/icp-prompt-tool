import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

export async function runPrompt(systemIcp, websiteData) {
  const prompt = {
    ...websiteData,
    system_icp: systemIcp
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are analyzing website data based on ICP (Ideal Customer Profile) questions. Provide detailed, actionable insights.'
      },
      {
        role: 'user',
        content: JSON.stringify(prompt, null, 2)
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  })

  return response.choices[0].message.content
}
