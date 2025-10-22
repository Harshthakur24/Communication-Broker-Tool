import { Document, SearchResult, SearchFilters } from './types';
import { EmbeddingService } from '../embedding/embeddingService';
import { VectorStore } from '../embedding/vectorStore';

export interface DocumentRetriever {
  retrieveDocuments(query: string, filters?: SearchFilters): Promise<Document[]>;
  searchSemantic(query: string, limit?: number): Promise<SearchResult[]>;
  rankDocuments(documents: Document[], query: string): Promise<RankedDocument[]>;
}

export interface RankedDocument extends Document {
  relevanceScore: number;
  confidence: number;
}

export class DocumentRetrieverImpl implements DocumentRetriever {
  constructor(
    private embeddingService: EmbeddingService,
    private vectorStore: VectorStore
  ) {}

  async retrieveDocuments(query: string, filters?: SearchFilters): Promise<Document[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      // Search vector store
      const searchResults = await this.vectorStore.searchSimilar(
        queryEmbedding,
        filters?.limit || 10,
        filters
      );

      // Convert to documents
      const documents = await this.convertSearchResultsToDocuments(searchResults);
      
      // Rank documents by relevance
      const rankedDocuments = await this.rankDocuments(documents, query);
      
      return rankedDocuments;
    } catch (error) {
      console.error('Document retrieval error:', error);
      throw error;
    }
  }

  async searchSemantic(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      // Search vector store
      const searchResults = await this.vectorStore.searchSimilar(
        queryEmbedding,
        limit
      );

      return searchResults;
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  async rankDocuments(documents: Document[], query: string): Promise<RankedDocument[]> {
    try {
      const rankedDocuments: RankedDocument[] = [];

      for (const doc of documents) {
        // Calculate relevance score
        const relevanceScore = await this.calculateRelevanceScore(doc, query);
        
        // Calculate confidence based on multiple factors
        const confidence = this.calculateConfidence(doc, query, relevanceScore);
        
        rankedDocuments.push({
          ...doc,
          relevanceScore,
          confidence
        });
      }

      // Sort by relevance score (highest first)
      return rankedDocuments.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Document ranking error:', error);
      throw error;
    }
  }

  private async convertSearchResultsToDocuments(searchResults: SearchResult[]): Promise<Document[]> {
    const documents: Document[] = [];

    for (const result of searchResults) {
      try {
        // Fetch document from database
        const document = await this.fetchDocumentFromDatabase(result.id);
        if (document) {
          documents.push(document);
        }
      } catch (error) {
        console.error(`Error fetching document ${result.id}:`, error);
      }
    }

    return documents;
  }

  private async fetchDocumentFromDatabase(documentId: string): Promise<Document | null> {
    try {
      // This would typically use Prisma to fetch from database
      // For now, we'll simulate the fetch
      const { prisma } = await import('@/lib/database');
      
      const doc = await prisma.document.findUnique({
        where: { id: documentId },
        include: { chunks: true }
      });

      if (!doc) return null;

      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        type: doc.type,
        category: doc.category,
        tags: doc.tags,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        source: doc.source,
        sourceId: doc.sourceId,
        version: doc.version,
        metadata: doc.metadata as Record<string, any> || {},
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      };
    } catch (error) {
      console.error('Database fetch error:', error);
      return null;
    }
  }

  private async calculateRelevanceScore(document: Document, query: string): Promise<number> {
    let score = 0;

    // Title relevance (40% weight)
    const titleScore = this.calculateTextSimilarity(document.title, query);
    score += titleScore * 0.4;

    // Content relevance (50% weight)
    const contentScore = this.calculateTextSimilarity(document.content, query);
    score += contentScore * 0.5;

    // Tag relevance (10% weight)
    const tagScore = this.calculateTagRelevance(document.tags, query);
    score += tagScore * 0.1;

    return Math.min(score, 1.0);
  }

  private calculateTextSimilarity(text: string, query: string): number {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // Exact match
    if (textLower.includes(queryLower)) {
      return 1.0;
    }

    // Word overlap
    const textWords = textLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    const commonWords = queryWords.filter(word => textWords.includes(word));
    
    if (queryWords.length === 0) return 0;
    
    return commonWords.length / queryWords.length;
  }

  private calculateTagRelevance(tags: string[], query: string): number {
    if (tags.length === 0) return 0;
    
    const queryLower = query.toLowerCase();
    const matchingTags = tags.filter(tag => 
      tag.toLowerCase().includes(queryLower)
    );
    
    return matchingTags.length / tags.length;
  }

  private calculateConfidence(document: Document, query: string, relevanceScore: number): number {
    let confidence = relevanceScore;

    // Boost confidence for exact matches
    if (document.title.toLowerCase().includes(query.toLowerCase())) {
      confidence += 0.2;
    }

    // Boost confidence for recent documents
    const daysSinceUpdate = (Date.now() - document.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      confidence += 0.1;
    }

    // Boost confidence for documents with more content
    if (document.content.length > 1000) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }
}