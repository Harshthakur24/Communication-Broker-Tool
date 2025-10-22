// Gemini-based LLM utilities
import { GoogleGenAI } from "@google/genai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

// Generate embeddings for text (single)
export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text])
  return embedding
}

// Generate embeddings for multiple texts using Gemini text-embedding-004
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  const model = 'text-embedding-004'
  
  // Process texts in batches of 100 (Gemini limit)
  const batchSize = 100
  const allEmbeddings: number[][] = []
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:batchEmbedContents?key=${GEMINI_API_KEY}`

    const body = {
      requests: batch.map((t) => ({
        model: `models/${model}`,
        content: { parts: [{ text: t }] },
      })),
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errTxt = await res.text()
        throw new Error(`Gemini embeddings error: ${res.status} ${errTxt}`)
      }

      const json = await res.json() as { embeddings: Array<{ values: number[] }> }
      const batchEmbeddings = (json.embeddings || []).map((e) => e.values)
      allEmbeddings.push(...batchEmbeddings)
    } catch (error) {
      console.error(`Error generating embeddings for batch ${i}-${i + batchSize} (Gemini):`, error)
      // Add empty embeddings for failed batch
      allEmbeddings.push(...batch.map(() => []))
    }
  }
  
  return allEmbeddings
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Generate AI response using RAG
export async function generateRAGResponse(
  userMessage: string,
  contextDocuments: Array<{
    content: string
    title: string
    source: string
  }>
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set')
  }

  try {
    const contextText = contextDocuments
      .map(doc => `Title: ${doc.title}\nContent: ${doc.content}\nSource: ${doc.source}`)
      .join('\n\n---\n\n')

    const systemInstruction = `You are a knowledgeable colleague helping with company information. You have access to our internal documents and should provide helpful, accurate responses.\n\nGuidelines:\n1) Respond naturally and professionally, like a helpful team member\n2) Base responses on the provided documents; if information isn't available, say so directly\n3) Be confident and direct in your responses\n4) Avoid AI-like disclaimers or overly formal language\n5) Use "our company" or "our team" when referring to the organization\n6) Keep responses conversational but professional\n\nContext Documents:\n${contextText}`

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const prompt = systemInstruction + '\n\n' + userMessage

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    })

    return response.text || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Error generating RAG response (Gemini):', error)
    throw new Error('Failed to generate AI response')
  }
}

// Generate a simple AI response without RAG (fallback)
export async function generateSimpleResponse(userMessage: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return 'I need to check our system configuration. Please contact IT support.'
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    
    const systemPrompt = `You are a helpful colleague at our company. Respond naturally and professionally. Avoid AI-like language or disclaimers. Be direct and confident in your responses.`

    const response = await ai.models.generateContent({
      model,
      contents: `${systemPrompt}\n\nUser: ${userMessage}`,
    })

    return response.text || 'I don\'t have that information available right now.'
  } catch (error) {
    console.error('Error generating simple response (Gemini):', error)
    return 'I\'m having trouble accessing our systems right now. Please try again in a moment.'
  }
}
