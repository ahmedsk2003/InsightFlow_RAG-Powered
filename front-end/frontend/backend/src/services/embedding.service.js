import OpenAI from 'openai'

const openaiApiKey = process.env.OPENAI_API_KEY
const embeddingModel = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'

const client = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

export async function embedText(text) {
  if (!text || !text.trim()) return []

  if (client) {
    const response = await client.embeddings.create({
      model: embeddingModel,
      input: text,
    })
    return response.data[0]?.embedding || []
  }

  // fallback: deterministic pseudo-embedding so we can rank locally
  return pseudoEmbed(text)
}

function pseudoEmbed(str) {
  const vector = new Array(32).fill(0)
  for (let i = 0; i < str.length; i++) {
    vector[i % vector.length] += str.charCodeAt(i) / 255
  }
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1
  return vector.map((v) => v / norm)
}

