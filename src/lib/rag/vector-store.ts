import { Pinecone } from '@pinecone-database/pinecone';

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: {
    documentId: string;
    chunkIndex: number;
    content: string;
    title: string;
    category?: string;
    tags: string[];
  };
}

export interface VectorStoreConfig {
  apiKey: string;
  environment: string;
  indexName: string;
}

export class VectorStore {
  private pinecone: Pinecone;
  private index: any;

  constructor(config: VectorStoreConfig) {
    this.pinecone = new Pinecone({
      apiKey: config.apiKey,
      environment: config.environment,
    });
  }

  /**
   * Initialize the vector store
   */
  async initialize(): Promise<void> {
    try {
      this.index = this.pinecone.index(process.env.PINECONE_INDEX_NAME || 'ai-communication-hub');
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw new Error('Vector store initialization failed');
    }
  }

  /**
   * Add vectors to the index
   */
  async addVectors(vectors: Array<{
    id: string;
    values: number[];
    metadata: {
      documentId: string;
      chunkIndex: number;
      content: string;
      title: string;
      category?: string;
      tags: string[];
      createdAt: string;
    };
  }>): Promise<void> {
    try {
      await this.index.upsert(vectors);
      console.log(`Added ${vectors.length} vectors to index`);
    } catch (error) {
      console.error('Failed to add vectors:', error);
      throw new Error('Failed to add vectors to index');
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryVector: number[],
    options: {
      topK?: number;
      filter?: Record<string, any>;
      includeMetadata?: boolean;
    } = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const {
        topK = 10,
        filter = {},
        includeMetadata = true
      } = options;

      const searchResponse = await this.index.query({
        vector: queryVector,
        topK,
        filter,
        includeMetadata,
      });

      return searchResponse.matches.map((match: any) => ({
        id: match.id,
        score: match.score,
        metadata: {
          documentId: match.metadata.documentId,
          chunkIndex: match.metadata.chunkIndex,
          content: match.metadata.content,
          title: match.metadata.title,
          category: match.metadata.category,
          tags: match.metadata.tags || [],
        },
      }));
    } catch (error) {
      console.error('Vector search failed:', error);
      throw new Error('Vector search failed');
    }
  }

  /**
   * Search with text query (requires embedding generation)
   */
  async searchByText(
    query: string,
    options: {
      topK?: number;
      filter?: Record<string, any>;
      category?: string;
      tags?: string[];
    } = {}
  ): Promise<VectorSearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Build filter
      const filter: Record<string, any> = {};
      if (options.category) {
        filter.category = options.category;
      }
      if (options.tags && options.tags.length > 0) {
        filter.tags = { $in: options.tags };
      }

      return await this.search(queryEmbedding, {
        topK: options.topK || 10,
        filter,
        includeMetadata: true,
      });
    } catch (error) {
      console.error('Text search failed:', error);
      throw new Error('Text search failed');
    }
  }

  /**
   * Update vector metadata
   */
  async updateMetadata(
    vectorId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await this.index.update({
        id: vectorId,
        metadata,
      });
      console.log(`Updated metadata for vector ${vectorId}`);
    } catch (error) {
      console.error('Failed to update vector metadata:', error);
      throw new Error('Failed to update vector metadata');
    }
  }

  /**
   * Delete vectors by document ID
   */
  async deleteByDocumentId(documentId: string): Promise<void> {
    try {
      await this.index.deleteMany({
        filter: { documentId }
      });
      console.log(`Deleted vectors for document ${documentId}`);
    } catch (error) {
      console.error('Failed to delete vectors:', error);
      throw new Error('Failed to delete vectors');
    }
  }

  /**
   * Get vector statistics
   */
  async getStats(): Promise<{
    totalVectors: number;
    dimension: number;
    indexFullness: number;
  }> {
    try {
      const stats = await this.index.describeIndexStats();
      return {
        totalVectors: stats.totalVectorCount || 0,
        dimension: stats.dimension || 0,
        indexFullness: stats.indexFullness || 0,
      };
    } catch (error) {
      console.error('Failed to get vector stats:', error);
      throw new Error('Failed to get vector statistics');
    }
  }

  /**
   * Generate embedding for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate embedding');
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Batch generate embeddings
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch('/api/embeddings/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate embeddings');
      }

      const data = await response.json();
      return data.embeddings;
    } catch (error) {
      console.error('Failed to generate batch embeddings:', error);
      throw new Error('Failed to generate batch embeddings');
    }
  }

  /**
   * Search with hybrid approach (vector + keyword)
   */
  async hybridSearch(
    query: string,
    options: {
      topK?: number;
      category?: string;
      tags?: string[];
      alpha?: number; // Weight for vector search (0-1)
    } = {}
  ): Promise<VectorSearchResult[]> {
    try {
      const { alpha = 0.7, ...searchOptions } = options;
      
      // Perform vector search
      const vectorResults = await this.searchByText(query, searchOptions);
      
      // Perform keyword search (simplified)
      const keywordResults = await this.keywordSearch(query, searchOptions);
      
      // Combine results using hybrid scoring
      const combinedResults = this.combineSearchResults(
        vectorResults,
        keywordResults,
        alpha
      );
      
      return combinedResults.slice(0, searchOptions.topK || 10);
    } catch (error) {
      console.error('Hybrid search failed:', error);
      throw new Error('Hybrid search failed');
    }
  }

  /**
   * Simple keyword search implementation
   */
  private async keywordSearch(
    query: string,
    options: {
      topK?: number;
      category?: string;
      tags?: string[];
    } = {}
  ): Promise<VectorSearchResult[]> {
    // This is a simplified implementation
    // In production, you would use a proper text search engine like Elasticsearch
    const queryTerms = query.toLowerCase().split(/\s+/);
    
    // For now, return empty results
    // In a real implementation, you would search through your document database
    return [];
  }

  /**
   * Combine vector and keyword search results
   */
  private combineSearchResults(
    vectorResults: VectorSearchResult[],
    keywordResults: VectorSearchResult[],
    alpha: number
  ): VectorSearchResult[] {
    const combinedMap = new Map<string, VectorSearchResult>();
    
    // Add vector results
    vectorResults.forEach(result => {
      combinedMap.set(result.id, {
        ...result,
        score: result.score * alpha,
      });
    });
    
    // Add keyword results
    keywordResults.forEach(result => {
      const existing = combinedMap.get(result.id);
      if (existing) {
        existing.score += result.score * (1 - alpha);
      } else {
        combinedMap.set(result.id, {
          ...result,
          score: result.score * (1 - alpha),
        });
      }
    });
    
    // Sort by combined score
    return Array.from(combinedMap.values())
      .sort((a, b) => b.score - a.score);
  }
}