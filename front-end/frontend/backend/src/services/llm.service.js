import OpenAI from 'openai'

const chatModel = process.env.CHAT_MODEL || 'gpt-4o-mini'
const openaiApiKey = process.env.OPENAI_API_KEY
const client = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

const SYSTEM_PROMPT = `
You are an AI business analyst for startup founders.
Given business documents and metrics:
- Summarize insights clearly
- Produce 3 actionable recommendations
- Keep language non-technical
- Assume the user is a CEO
`

export async function runLLM({ query, context, fallback }) {
  if (!client) {
    return fallbackResponse(query, context, fallback)
  }

  try {
    const prompt = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `User query: ${query}\nContext:\n${context || 'No context available.'}`,
      },
    ]
    const completion = await client.chat.completions.create({
      model: chatModel,
      messages: prompt,
      temperature: 0.3,
    })
    return completion.choices[0]?.message?.content || fallbackResponse(query, context, fallback)
  } catch (err) {
    console.error('LLM call failed', err)
    return fallbackResponse(query, context, fallback)
  }
}

function fallbackResponse(query, context, fallback) {
  if (fallback) return fallback
  return `Insight based on your query: "${query}". Context length: ${context?.length || 0}.`
}

