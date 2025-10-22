import { VectorStore } from './vectorStore';

export interface EmbeddingService {
  generateEmbedding(text: string): Promise<number[]>;
  storeEmbedding(id: string, embedding: number[], metadata: any): Promise<void>;
  searchSimilar(embedding: number[], limit: number): Promise<SearchResult[]>;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

export class EmbeddingServiceImpl implements EmbeddingService {
  constructor(
    private vectorStore: VectorStore,
    private apiKey: string,
    private model: string = 'text-embedding-ada-002'
  ) {}

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Clean and prepare text
      const cleanedText = this.cleanText(text);
      
      // Check if we have a cached embedding
      const cached = await this.getCachedEmbedding(cleanedText);
      if (cached) {
        return cached;
      }

      // Generate new embedding
      const embedding = await this.callEmbeddingAPI(cleanedText);
      
      // Cache the embedding
      await this.cacheEmbedding(cleanedText, embedding);
      
      return embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }

  async storeEmbedding(id: string, embedding: number[], metadata: any): Promise<void> {
    try {
      await this.vectorStore.store(id, embedding, metadata);
    } catch (error) {
      console.error('Embedding storage error:', error);
      throw error;
    }
  }

  async searchSimilar(embedding: number[], limit: number): Promise<SearchResult[]> {
    try {
      return await this.vectorStore.searchSimilar(embedding, limit);
    } catch (error) {
      console.error('Similarity search error:', error);
      throw error;
    }
  }

  private cleanText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 8000); // OpenAI has a token limit
  }

  private async getCachedEmbedding(text: string): Promise<number[] | null> {
    try {
      // In production, you'd use Redis or similar for caching
      // For now, we'll skip caching
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  private async cacheEmbedding(text: string, embedding: number[]): Promise<void> {
    try {
      // In production, you'd cache the embedding
      // For now, we'll skip caching
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  private async callEmbeddingAPI(text: string): Promise<number[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: text,
          model: this.model
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Embedding API call error:', error);
      throw error;
    }
  }
}