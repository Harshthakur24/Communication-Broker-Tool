import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
})

export interface EmbeddingResponse {
  embedding: number[]
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export interface ChatCompletionResponse {
  content: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw new Error('Failed to generate embedding')
  }
}

// Generate embeddings for multiple texts
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    })
    
    return response.data.map(item => item.embedding)
  } catch (error) {
    console.error('Error generating embeddings:', error)
    throw new Error('Failed to generate embeddings')
  }
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
  try {
    const contextText = contextDocuments
      .map(doc => `Title: ${doc.title}\nContent: ${doc.content}\nSource: ${doc.source}`)
      .join('\n\n---\n\n')
    
    const systemPrompt = `You are an AI assistant for a company's internal communication hub. You have access to the company's knowledge base and should provide accurate, helpful responses based on the available information.

Guidelines:
1. Always base your responses on the provided context documents
2. If the information is not available in the context, clearly state that
3. Be concise but comprehensive
4. Cite sources when referencing specific documents
5. Maintain a professional and helpful tone
6. If asked about company policies, procedures, or information not in the context, suggest contacting the relevant department

Context Documents:
${contextText}`

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })
    
    return response.choices[0].message.content || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Error generating RAG response:', error)
    throw new Error('Failed to generate AI response')
  }
}

// Generate a simple AI response without RAG (fallback)
export async function generateSimpleResponse(userMessage: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for a company\'s internal communication hub. Provide helpful and professional responses.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    })
    
    return response.choices[0].message.content || 'I apologize, but I could not generate a response.'
  } catch (error) {
    console.error('Error generating simple response:', error)
    return 'I apologize, but I\'m currently unable to process your request. Please try again later.'
  }
}
