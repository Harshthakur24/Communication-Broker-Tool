import { VectorStore, VectorSearchResult } from './vector-store';
import { Document, DocumentChunk } from '@prisma/client';

export interface RetrievalContext {
  query: string;
  userId: string;
  sessionId?: string;
  filters?: {
    category?: string;
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
    documentTypes?: string[];
  };
  options?: {
    topK?: number;
    minScore?: number;
    includeMetadata?: boolean;
  };
}

export interface RetrievedDocument {
  id: string;
  title: string;
  content: string;
  type: string;
  category?: string;
  tags: string[];
  relevanceScore: number;
  chunks: RetrievedChunk[];
  metadata: {
    uploadedAt: Date;
    uploadedBy: string;
    wordCount: number;
    pageCount?: number;
  };
}

export interface RetrievedChunk {
  id: string;
  content: string;
  chunkIndex: number;
  relevanceScore: number;
  metadata: {
    section?: string;
    pageNumber?: number;
    position: {
      start: number;
      end: number;
    };
  };
}

export class DocumentRetriever {
  private vectorStore: VectorStore;
  private db: any; // Prisma client

  constructor(vectorStore: VectorStore, db: any) {
    this.vectorStore = vectorStore;
    this.db = db;
  }

  /**
   * Retrieve relevant documents based on query
   */
  async retrieveDocuments(context: RetrievalContext): Promise<RetrievedDocument[]> {
    try {
      // Perform vector search
      const vectorResults = await this.vectorStore.searchByText(context.query, {
        topK: context.options?.topK || 20,
        filter: this.buildFilter(context.filters),
        category: context.filters?.category,
        tags: context.filters?.tags,
      });

      // Filter by minimum score
      const filteredResults = vectorResults.filter(
        result => result.score >= (context.options?.minScore || 0.5)
      );

      // Group results by document
      const documentGroups = this.groupResultsByDocument(filteredResults);

      // Fetch full document data
      const retrievedDocuments = await this.fetchDocumentData(documentGroups);

      // Apply additional filters
      const filteredDocuments = this.applyFilters(retrievedDocuments, context.filters);

      // Sort by relevance
      return this.sortByRelevance(filteredDocuments);
    } catch (error) {
      console.error('Document retrieval failed:', error);
      throw new Error('Failed to retrieve documents');
    }
  }

  /**
   * Retrieve specific document by ID
   */
  async retrieveDocumentById(
    documentId: string,
    userId: string
  ): Promise<RetrievedDocument | null> {
    try {
      const document = await this.db.document.findUnique({
        where: { id: documentId },
        include: {
          chunks: true,
          user: {
            select: { name: true, email: true }
          }
        }
      });

      if (!document) {
        return null;
      }

      // Check user permissions
      if (!await this.hasDocumentAccess(document, userId)) {
        throw new Error('Access denied to document');
      }

      return this.mapDocumentToRetrieved(document);
    } catch (error) {
      console.error('Failed to retrieve document by ID:', error);
      throw new Error('Failed to retrieve document');
    }
  }

  /**
   * Search within a specific document
   */
  async searchWithinDocument(
    documentId: string,
    query: string,
    userId: string,
    options: { topK?: number; minScore?: number } = {}
  ): Promise<RetrievedChunk[]> {
    try {
      // Verify document access
      const document = await this.db.document.findUnique({
        where: { id: documentId },
        include: { chunks: true }
      });

      if (!document || !await this.hasDocumentAccess(document, userId)) {
        throw new Error('Access denied to document');
      }

      // Search within document chunks
      const vectorResults = await this.vectorStore.searchByText(query, {
        topK: options.topK || 10,
        filter: { documentId },
      });

      // Filter by minimum score
      const filteredResults = vectorResults.filter(
        result => result.score >= (options.minScore || 0.5)
      );

      // Map to RetrievedChunk format
      return filteredResults.map(result => ({
        id: result.id,
        content: result.metadata.content,
        chunkIndex: result.metadata.chunkIndex,
        relevanceScore: result.score,
        metadata: {
          section: result.metadata.category,
          position: {
            start: 0, // Would need to be calculated from chunk data
            end: result.metadata.content.length,
          },
        },
      }));
    } catch (error) {
      console.error('Document search failed:', error);
      throw new Error('Failed to search within document');
    }
  }

  /**
   * Get similar documents
   */
  async getSimilarDocuments(
    documentId: string,
    userId: string,
    options: { topK?: number } = {}
  ): Promise<RetrievedDocument[]> {
    try {
      // Get document chunks
      const document = await this.db.document.findUnique({
        where: { id: documentId },
        include: { chunks: true }
      });

      if (!document || !await this.hasDocumentAccess(document, userId)) {
        throw new Error('Access denied to document');
      }

      // Use first chunk as query
      const firstChunk = document.chunks[0];
      if (!firstChunk) {
        return [];
      }

      // Search for similar documents
      const vectorResults = await this.vectorStore.searchByText(firstChunk.content, {
        topK: (options.topK || 5) + 1, // +1 to exclude the original document
        filter: { documentId: { $ne: documentId } }
      });

      // Group and fetch document data
      const documentGroups = this.groupResultsByDocument(vectorResults);
      const retrievedDocuments = await this.fetchDocumentData(documentGroups);

      return retrievedDocuments;
    } catch (error) {
      console.error('Similar documents retrieval failed:', error);
      throw new Error('Failed to retrieve similar documents');
    }
  }

  /**
   * Build filter object for vector search
   */
  private buildFilter(filters?: RetrievalContext['filters']): Record<string, any> {
    const filter: Record<string, any> = {};

    if (filters?.category) {
      filter.category = filters.category;
    }

    if (filters?.tags && filters.tags.length > 0) {
      filter.tags = { $in: filters.tags };
    }

    if (filters?.documentTypes && filters.documentTypes.length > 0) {
      filter.type = { $in: filters.documentTypes };
    }

    if (filters?.dateRange) {
      filter.createdAt = {
        $gte: filters.dateRange.start.toISOString(),
        $lte: filters.dateRange.end.toISOString(),
      };
    }

    return filter;
  }

  /**
   * Group search results by document
   */
  private groupResultsByDocument(results: VectorSearchResult[]): Map<string, VectorSearchResult[]> {
    const groups = new Map<string, VectorSearchResult[]>();

    results.forEach(result => {
      const documentId = result.metadata.documentId;
      if (!groups.has(documentId)) {
        groups.set(documentId, []);
      }
      groups.get(documentId)!.push(result);
    });

    return groups;
  }

  /**
   * Fetch full document data from database
   */
  private async fetchDocumentData(
    documentGroups: Map<string, VectorSearchResult[]>
  ): Promise<RetrievedDocument[]> {
    const documentIds = Array.from(documentGroups.keys());
    
    const documents = await this.db.document.findMany({
      where: { id: { in: documentIds } },
      include: {
        chunks: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return documents.map(doc => {
      const chunks = documentGroups.get(doc.id) || [];
      return this.mapDocumentToRetrieved(doc, chunks);
    });
  }

  /**
   * Map database document to RetrievedDocument format
   */
  private mapDocumentToRetrieved(
    document: any,
    chunks: VectorSearchResult[] = []
  ): RetrievedDocument {
    return {
      id: document.id,
      title: document.title,
      content: document.content,
      type: document.type,
      category: document.category,
      tags: document.tags,
      relevanceScore: chunks.length > 0 ? Math.max(...chunks.map(c => c.score)) : 0,
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.metadata.content,
        chunkIndex: chunk.metadata.chunkIndex,
        relevanceScore: chunk.score,
        metadata: {
          section: chunk.metadata.category,
          position: {
            start: 0,
            end: chunk.metadata.content.length,
          },
        },
      })),
      metadata: {
        uploadedAt: document.createdAt,
        uploadedBy: document.user.name,
        wordCount: document.content.split(/\s+/).length,
        pageCount: this.estimatePageCount(document.content),
      },
    };
  }

  /**
   * Apply additional filters to retrieved documents
   */
  private applyFilters(
    documents: RetrievedDocument[],
    filters?: RetrievalContext['filters']
  ): RetrievedDocument[] {
    if (!filters) return documents;

    return documents.filter(doc => {
      // Category filter
      if (filters.category && doc.category !== filters.category) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          doc.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Document type filter
      if (filters.documentTypes && filters.documentTypes.length > 0) {
        if (!filters.documentTypes.includes(doc.type)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange) {
        const docDate = new Date(doc.metadata.uploadedAt);
        if (docDate < filters.dateRange.start || docDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort documents by relevance score
   */
  private sortByRelevance(documents: RetrievedDocument[]): RetrievedDocument[] {
    return documents.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Check if user has access to document
   */
  private async hasDocumentAccess(document: any, userId: string): Promise<boolean> {
    // Check if document is public
    if (document.isPublic) {
      return true;
    }

    // Check if user is the uploader
    if (document.uploadedBy === userId) {
      return true;
    }

    // Check user permissions based on role
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { role: true, permissions: true }
    });

    if (!user) return false;

    // Admin and managers have access to all documents
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      return true;
    }

    // Check specific permissions
    if (user.permissions.includes('DOCUMENT_READ_ALL')) {
      return true;
    }

    return false;
  }

  /**
   * Estimate page count based on content length
   */
  private estimatePageCount(content: string): number {
    const wordsPerPage = 500;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerPage);
  }
}