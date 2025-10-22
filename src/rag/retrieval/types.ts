export interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  category?: string;
  tags: string[];
  fileUrl?: string;
  fileSize?: number;
  source?: string;
  sourceId?: string;
  version: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

export interface SearchFilters {
  limit?: number;
  category?: string;
  tags?: string[];
  source?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minScore?: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  embedding?: number[];
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface RetrievalContext {
  query: string;
  documents: Document[];
  maxTokens: number;
  includeMetadata: boolean;
}