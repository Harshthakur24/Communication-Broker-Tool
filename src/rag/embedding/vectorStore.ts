import { SearchResult } from './embeddingService';

export interface VectorStore {
  store(id: string, embedding: number[], metadata: any): Promise<void>;
  searchSimilar(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]>;
  delete(id: string): Promise<void>;
  update(id: string, embedding: number[], metadata: any): Promise<void>;
}

export class PineconeVectorStore implements VectorStore {
  constructor(
    private apiKey: string,
    private environment: string,
    private indexName: string
  ) {}

  async store(id: string, embedding: number[], metadata: any): Promise<void> {
    try {
      const response = await fetch(`https://${this.indexName}-${this.environment}.svc.pinecone.io/vectors/upsert`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vectors: [{
            id,
            values: embedding,
            metadata
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Pinecone store error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Pinecone store error:', error);
      throw error;
    }
  }

  async searchSimilar(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://${this.indexName}-${this.environment}.svc.pinecone.io/query`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vector: embedding,
          topK: limit,
          includeMetadata: true,
          filter: filters
        })
      });

      if (!response.ok) {
        throw new Error(`Pinecone search error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.matches.map((match: any) => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata || {}
      }));
    } catch (error) {
      console.error('Pinecone search error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`https://${this.indexName}-${this.environment}.svc.pinecone.io/vectors/delete`, {
        method: 'POST',
        headers: {
          'Api-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: [id]
        })
      });

      if (!response.ok) {
        throw new Error(`Pinecone delete error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Pinecone delete error:', error);
      throw error;
    }
  }

  async update(id: string, embedding: number[], metadata: any): Promise<void> {
    // Pinecone doesn't have a separate update method, so we use upsert
    await this.store(id, embedding, metadata);
  }
}

export class FAISSVectorStore implements VectorStore {
  private index: any;
  private ids: string[] = [];
  private metadata: any[] = [];

  constructor() {
    // In production, you'd initialize FAISS here
    // For now, we'll use a simple in-memory store
  }

  async store(id: string, embedding: number[], metadata: any): Promise<void> {
    try {
      // In production, you'd add to FAISS index
      this.ids.push(id);
      this.metadata.push(metadata);
    } catch (error) {
      console.error('FAISS store error:', error);
      throw error;
    }
  }

  async searchSimilar(embedding: number[], limit: number, filters?: any): Promise<SearchResult[]> {
    try {
      // In production, you'd use FAISS to search
      // For now, we'll return mock results
      return this.ids.slice(0, limit).map((id, index) => ({
        id,
        score: Math.random(),
        metadata: this.metadata[index] || {}
      }));
    } catch (error) {
      console.error('FAISS search error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const index = this.ids.indexOf(id);
      if (index > -1) {
        this.ids.splice(index, 1);
        this.metadata.splice(index, 1);
      }
    } catch (error) {
      console.error('FAISS delete error:', error);
      throw error;
    }
  }

  async update(id: string, embedding: number[], metadata: any): Promise<void> {
    try {
      const index = this.ids.indexOf(id);
      if (index > -1) {
        this.metadata[index] = metadata;
      } else {
        await this.store(id, embedding, metadata);
      }
    } catch (error) {
      console.error('FAISS update error:', error);
      throw error;
    }
  }
}